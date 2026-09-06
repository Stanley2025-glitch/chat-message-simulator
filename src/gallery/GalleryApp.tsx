import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Download, Expand, Loader2, PanelTop, Sparkles, XCircle } from "lucide-react"
import { rendererGalleryRegistry, type RendererGalleryEntry } from "@/artifacts/registry"
import type { ChatExampleData } from "@/artifacts/ChatExampleRenderer"
import type { ArtifactData } from "@/artifacts/types"
import type { LayoutId, ThemeId } from "@/types/layout"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { exportNodeToImage } from "@/utils/export"

type GalleryData = RendererGalleryEntry["exampleData"]

type GalleryDraft = {
  text?: string
  template_data?: ArtifactData
  chat?: {
    platform?: string
    contact?: { name?: string; relationship?: string }
    messages?: Array<{ sender?: string; text?: string }>
  }
  repaired?: boolean
  model?: string
  first_pass_audit?: Record<string, unknown> | null
  second_pass_audit?: Record<string, unknown> | null
}

type GalleryGenerationResult = {
  template_id?: string
  template_variant?: string | null
  contact_id?: string | null
  contact?: { name?: string; relationship?: string; platform?: string } | null
  schema?: unknown
  draft?: GalleryDraft
  prompt?: { system?: string; user?: string }
  render?: { type?: string; images?: number; width?: number; height?: number }
}

type GalleryRun = {
  status: "running" | "success" | "error"
  result?: GalleryGenerationResult
  error?: string
  diagnostics?: {
    firstPassAudit?: Record<string, unknown> | null
    secondPassAudit?: Record<string, unknown> | null
    localReview?: { hard?: Array<{ code?: string }> } | null
    schema?: unknown
    prompt?: { system?: string; user?: string }
    draft?: GalleryDraft
  }
}

type ExtensionBrowser = {
  runtime?: { sendMessage?: (message: unknown) => Promise<unknown> }
}

type GalleryContact = {
  id: string
  name: string
  relationship: string
  platforms: string[]
  adult_only?: boolean
}

const getExtensionBrowser = () =>
  (globalThis as typeof globalThis & { browser?: ExtensionBrowser }).browser

const galleryExportSettings = (entry: RendererGalleryEntry, variant?: string) => ({
  presetId: `gallery-${entry.id}${variant ? `-${variant}` : ""}`,
  width: entry.width,
  height: entry.height,
  scale: 2,
  format: "png" as const,
  quality: 1,
  captureMode: "viewport" as const,
})

const downloadPng = (dataUrl: string, entry: RendererGalleryEntry, variant?: string) => {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = `xcs-${entry.id}${variant ? `-${variant}` : ""}-example.png`
  link.click()
}

const galleryScale = (entry: RendererGalleryEntry, maximumWidth: number, maximumHeight: number) =>
  Math.min(maximumWidth / entry.width, maximumHeight / entry.height, 1)

const chatLayoutFor = (platform: string): LayoutId => {
  if (platform === "telegram") return "messenger"
  if (platform === "sms") return "imessage"
  return platform as LayoutId
}

const chatThemeFor = (platform: string): ThemeId =>
  platform === "instagram" || platform === "snapchat" ? "dark" : "light"

const chatPreviewData = (chat: GalleryDraft["chat"], fallbackPlatform: string): ChatExampleData => {
  const platform = String(chat?.platform || fallbackPlatform || "whatsapp").trim().toLowerCase()
  const contactName = String(chat?.contact?.name || "Kontakt").trim()
  const messages = Array.isArray(chat?.messages) ? chat.messages : []
  // Keep the fictional chronology live: every message stays on today's local
  // date and the last one is slightly before the current minute.
  const base = Date.now() - Math.max(1, messages.length) * 120000
  return {
    conversation: {
      id: `gallery-${platform}-${base.toString(36)}`,
      participants: [
        { id: "self", name: "Czarek", status: "offline", color: "#1e3a5f" },
        { id: "contact", name: contactName, status: "online", color: "#64748b" },
      ],
      messages: messages.map((message, index) => ({
        id: `gallery-message-${index + 1}`,
        senderId: String(message?.sender || "contact").toLowerCase() === "czarek" ? "self" : "contact",
        content: String(message?.text || "").trim(),
        timestamp: new Date(base + index * 120000).toISOString(),
        type: "text" as const,
        status: "read" as const,
      })),
      metadata: {
        createdAt: new Date(base).toISOString(),
        updatedAt: new Date(base + Math.max(0, messages.length - 1) * 120000).toISOString(),
      },
    },
    layoutId: chatLayoutFor(platform),
    themeId: chatThemeFor(platform),
    activeParticipantId: "self",
  }
}

const jsonPreview = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return "Nie udało się pokazać danych JSON."
  }
}

const auditCodes = (run?: GalleryRun) => {
  const codes = [
    ...(run?.diagnostics?.firstPassAudit?.codes as string[] | undefined || []),
    ...(run?.diagnostics?.secondPassAudit?.codes as string[] | undefined || []),
    ...(run?.diagnostics?.localReview?.hard || []).map((item) => String(item?.code || "")),
  ]
  return [...new Set(codes.filter(Boolean))]
}

export const GalleryApp = () => {
  const canvasRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fullPreviewRef = useRef<HTMLDivElement | null>(null)
  const [selected, setSelected] = useState<RendererGalleryEntry | null>(null)
  const [variantByEntry, setVariantByEntry] = useState<Record<string, string>>({})
  const [generatedDataByEntry, setGeneratedDataByEntry] = useState<Record<string, GalleryData>>({})
  const [runByEntry, setRunByEntry] = useState<Record<string, GalleryRun>>({})
  const [contactsByPlatform, setContactsByPlatform] = useState<Record<string, GalleryContact[]>>({})
  const [contactIdByEntry, setContactIdByEntry] = useState<Record<string, string>>({})
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    const sendMessage = getExtensionBrowser()?.runtime?.sendMessage
    if (!sendMessage) return
    let cancelled = false
    void sendMessage({ type: "GET_GALLERY_CHAT_CONTACTS" }).then((response) => {
      const contacts = (response as { ok?: boolean; contacts?: GalleryContact[] })?.contacts
      if (cancelled || !Array.isArray(contacts)) return
      const grouped = contacts.reduce<Record<string, GalleryContact[]>>((groups, contact) => {
        for (const platform of contact.platforms || []) {
          groups[platform] = [...(groups[platform] || []), contact]
        }
        return groups
      }, {})
      setContactsByPlatform(grouped)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const activeVariantFor = (entry: RendererGalleryEntry) =>
    variantByEntry[entry.id] || entry.defaultVariant || entry.variants?.[0]?.id

  const activeDataFor = (entry: RendererGalleryEntry) =>
    generatedDataByEntry[entry.id] || entry.exampleData

  const contactOptionsFor = (entry: RendererGalleryEntry, variant?: string) =>
    entry.templateId === "chat_screenshot" ? contactsByPlatform[variant || "whatsapp"] || [] : []

  const contactKeyFor = (entry: RendererGalleryEntry, variant?: string) =>
    `${entry.id}:${variant || "default"}`

  const activeContactIdFor = (entry: RendererGalleryEntry, variant?: string) => {
    const options = contactOptionsFor(entry, variant)
    return contactIdByEntry[contactKeyFor(entry, variant)] || options[0]?.id || ""
  }

  const exportEntry = async (entry: RendererGalleryEntry, node: HTMLDivElement | null, variant?: string) => {
    if (!node) return
    setExportError(null)
    const exportKey = `${entry.id}:${variant || "default"}`
    setExportingId(exportKey)
    try {
      const dataUrl = await exportNodeToImage(node, galleryExportSettings(entry, variant))
      downloadPng(dataUrl, entry, variant)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Nie udało się wyeksportować PNG.")
    } finally {
      setExportingId(null)
    }
  }

  const generateEntry = async (entry: RendererGalleryEntry) => {
    if (!entry.templateId) return
    const activeVariant = activeVariantFor(entry)
    const activeContactId = activeContactIdFor(entry, activeVariant)
    setRunByEntry((current) => ({ ...current, [entry.id]: { status: "running" } }))
    try {
      const runtime = getExtensionBrowser()?.runtime
      if (!runtime?.sendMessage) throw new Error("Generowanie LLM działa po otwarciu galerii z rozszerzenia.")
      const response = await runtime.sendMessage({
        type: "GENERATE_GALLERY_TEMPLATE",
        templateId: entry.templateId,
        variant: activeVariant,
        ...(entry.templateId === "chat_screenshot" ? { contactId: activeContactId } : {}),
      }) as { ok?: boolean; error?: string; result?: GalleryGenerationResult; diagnostics?: GalleryRun["diagnostics"] }
      if (!response?.ok || !response.result?.draft) {
        setRunByEntry((current) => ({
          ...current,
          [entry.id]: { status: "error", error: response?.error || "Generowanie szablonu nie powiodło się.", diagnostics: response?.diagnostics },
        }))
        return
      }
      const draft = response.result.draft
      const generatedData: GalleryData = entry.templateId === "chat_screenshot"
        ? chatPreviewData(draft.chat, activeVariant || "whatsapp")
        : draft.template_data as ArtifactData
      if (!generatedData) throw new Error("LLM nie zwrócił template_data.")
      setGeneratedDataByEntry((current) => ({ ...current, [entry.id]: generatedData }))
      setRunByEntry((current) => ({ ...current, [entry.id]: { status: "success", result: response.result } }))
    } catch (error) {
      setRunByEntry((current) => ({
        ...current,
        [entry.id]: { status: "error", error: error instanceof Error ? error.message : "Generowanie szablonu nie powiodło się." },
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-4 py-7 text-slate-900 sm:px-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white bg-white/80 px-6 py-6 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600"><PanelTop className="h-4 w-4" /> X Content Studio</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Renderery i przykłady</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Żywy katalog rendererów. „Generuj tekst + obraz” uruchamia tę samą ścieżkę writera, walidacji i renderowania, którą wykorzystuje wtyczka po harvestcie.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200"><strong className="text-white">{rendererGalleryRegistry.length}</strong> rendererów · LLM smoke test · PNG</div>
        </header>

        {exportError ? <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Eksport nie powiódł się: {exportError}</div> : null}

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rendererGalleryRegistry.map((entry) => {
            const scale = galleryScale(entry, 330, 290)
            const activeVariant = activeVariantFor(entry)
            const run = runByEntry[entry.id]
            const isExporting = exportingId === `${entry.id}:${activeVariant || "default"}`
            const data = activeDataFor(entry)
            const generatable = Boolean(entry.templateId)
            return (
              <article key={entry.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <button type="button" className="flex w-full cursor-zoom-in items-center justify-center overflow-hidden bg-slate-100 p-5 text-left" onClick={() => setSelected(entry)} aria-label={`Otwórz pełny podgląd ${entry.label}`}>
                  <div style={{ width: entry.width * scale, height: entry.height * scale }}>
                    <div style={{ width: entry.width, height: entry.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                      <div ref={(node) => { canvasRefs.current[entry.id] = node }} style={{ width: entry.width, height: entry.height }}>
                        {entry.render(data, activeVariant)}
                      </div>
                    </div>
                  </div>
                </button>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold">{entry.label}</h2>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{entry.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-700">{entry.category}</span>
                  </div>
                  {entry.variants?.length ? (
                    <div className="flex flex-wrap gap-1.5" aria-label={`Style ${entry.label}`}>
                      {entry.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setVariantByEntry((current) => ({ ...current, [entry.id]: variant.id }))}
                          title={variant.description}
                          className={activeVariant === variant.id ? "rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white" : "rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-400"}
                        >
                          {variant.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {entry.templateId === "chat_screenshot" ? (() => {
                    const contactOptions = contactOptionsFor(entry, activeVariant)
                    const activeContactId = activeContactIdFor(entry, activeVariant)
                    return (
                      <label className="block text-xs font-semibold text-slate-600">
                        Kontakt testowy
                        <select
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          value={activeContactId}
                          onChange={(event) => setContactIdByEntry((current) => ({ ...current, [contactKeyFor(entry, activeVariant)]: event.target.value }))}
                          disabled={!contactOptions.length || run?.status === "running"}
                        >
                          {!contactOptions.length ? <option value="">Ładowanie kontaktów…</option> : null}
                          {contactOptions.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                              {contact.name} · {contact.relationship}{contact.adult_only ? " · 21+" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    )
                  })() : null}
                  {run ? (
                    <div className={run.status === "error" ? "rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700" : "rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"} role={run.status === "error" ? "alert" : "status"}>
                      <div className="flex items-center gap-2 font-bold">
                        {run.status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : run.status === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {run.status === "running" ? "LLM generuje tekst + obraz…" : run.status === "success" ? `OK · ${run.result?.render?.type || "renderer"} · ${run.result?.render?.width || 0}×${run.result?.render?.height || 0}` : "LLM / schema odrzucone"}
                      </div>
                      {run.error ? <p className="mt-1 break-words">{run.error}</p> : null}
                      {run.status === "success" && run.result?.draft?.text ? <p className="mt-2 line-clamp-3 text-emerald-950">„{run.result.draft.text}”</p> : null}
                      {auditCodes(run).length ? <p className="mt-2 break-words font-mono text-[10px]">{auditCodes(run).join(" · ")}</p> : null}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(entry)}><Expand className="h-4 w-4" /> Pełny podgląd</Button>
                    {generatable ? <Button size="sm" onClick={() => void generateEntry(entry)} disabled={run?.status === "running" || exportingId !== null}><Sparkles className="h-4 w-4" /> Generuj tekst + obraz</Button> : null}
                    <Button variant="secondary" size="sm" onClick={() => void exportEntry(entry, canvasRefs.current[entry.id], activeVariant)} disabled={exportingId !== null}>
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      PNG
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-h-[94vh] w-[96vw] max-w-[1400px] overflow-auto">
          {selected ? (() => {
            const activeVariant = activeVariantFor(selected)
            const run = runByEntry[selected.id]
            const data = activeDataFor(selected)
            const isExporting = exportingId === `${selected.id}:${activeVariant || "default"}`
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{selected.label}</DialogTitle>
                  <DialogDescription>{selected.category} · {selected.width} × {selected.height} · real renderer preview</DialogDescription>
                </DialogHeader>
                {selected.templateId === "chat_screenshot" ? (
                  <label className="block max-w-xl text-xs font-semibold text-slate-600">
                    Kontakt testowy
                    <select
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      value={activeContactIdFor(selected, activeVariant)}
                      onChange={(event) => setContactIdByEntry((current) => ({ ...current, [contactKeyFor(selected, activeVariant)]: event.target.value }))}
                      disabled={!contactOptionsFor(selected, activeVariant).length || run?.status === "running"}
                    >
                      {!contactOptionsFor(selected, activeVariant).length ? <option value="">Ładowanie kontaktów…</option> : null}
                      {contactOptionsFor(selected, activeVariant).map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} · {contact.relationship}{contact.adult_only ? " · 21+" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="flex min-w-fit justify-center rounded-2xl bg-slate-100 p-5">
                  <div ref={fullPreviewRef} style={{ width: selected.width, height: selected.height }}>
                    {selected.render(data, activeVariant)}
                  </div>
                </div>
                {run?.status === "success" && run.result?.draft ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                      <div className="font-bold text-emerald-900">Wynik LLM</div>
                      <p className="mt-2 whitespace-pre-wrap text-emerald-950">{run.result.draft.text || "Brak captionu"}</p>
                      <details className="mt-3">
                        <summary className="cursor-pointer font-semibold">template_data</summary>
                        <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-white/80 p-3 text-[11px]">{jsonPreview(run.result.draft.template_data || run.result.draft.chat)}</pre>
                      </details>
                      <details className="mt-3">
                        <summary className="cursor-pointer font-semibold">Prompt i pełny schema wysłane do LLM</summary>
                        <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-white/80 p-3 text-[10px]">{jsonPreview(run.result.prompt)}</pre>
                      </details>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                      <div className="font-bold text-slate-900">Raport testu</div>
                      <p className="mt-2 text-slate-600">Status: <strong className="text-emerald-700">OK</strong> · renderer: <code>{run.result.render?.type || "—"}</code> · obrazów: <code>{run.result.render?.images || 0}</code></p>
                      <p className="mt-1 text-slate-600">Rozmiar: <code>{run.result.render?.width || 0} × {run.result.render?.height || 0}</code>{run.result.contact ? <> · kontakt: <code>{run.result.contact.name}</code></> : null}</p>
                      <p className="mt-1 text-slate-600">Audyt lokalny: <strong className={auditCodes(run).length ? "text-amber-700" : "text-emerald-700"}>{auditCodes(run).length ? auditCodes(run).join(" · ") : "brak twardych błędów"}</strong></p>
                      <div className="mt-4 font-bold text-slate-900">Kontrakt danych</div>
                      <p className="mt-2 text-slate-600">Typ: <code>{run.result.template_id}</code> · wariant: <code>{run.result.template_variant || "brak"}</code></p>
                      <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-white p-3 text-[10px]">{jsonPreview(run.result.schema)}</pre>
                    </div>
                  </div>
                ) : null}
                {run?.status === "error" ? (
                  <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <div className="font-bold">Generowanie odrzucone</div>
                    <p className="mt-1">{run.error}</p>
                    {auditCodes(run).length ? <p className="mt-2 break-words font-mono text-xs">{auditCodes(run).join(" · ")}</p> : null}
                    {run.diagnostics?.firstPassAudit?.template_data ? <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-white/80 p-3 text-[10px]">{jsonPreview(run.diagnostics.firstPassAudit.template_data)}</pre> : null}
                    {run.diagnostics?.draft?.template_data ? <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-white/80 p-3 text-[10px]">{jsonPreview(run.diagnostics.draft.template_data)}</pre> : null}
                    {run.diagnostics?.prompt ? <details className="mt-3"><summary className="cursor-pointer font-semibold">Prompt użyty w próbie</summary><pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-white/80 p-3 text-[10px]">{jsonPreview(run.diagnostics.prompt)}</pre></details> : null}
                    {run.diagnostics?.schema ? <details className="mt-3"><summary className="cursor-pointer font-semibold">Schema typu</summary><pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-white/80 p-3 text-[10px]">{jsonPreview(run.diagnostics.schema)}</pre></details> : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap justify-end gap-2">
                  {selected.templateId ? <Button onClick={() => void generateEntry(selected)} disabled={run?.status === "running" || exportingId !== null}><Sparkles className="h-4 w-4" /> Generuj tekst + obraz</Button> : null}
                  <Button variant="outline" onClick={() => void exportEntry(selected, fullPreviewRef.current, activeVariant)} disabled={exportingId !== null}>
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Pobierz PNG
                  </Button>
                </div>
              </>
            )
          })() : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
