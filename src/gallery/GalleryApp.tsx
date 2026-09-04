import { useRef, useState } from "react"
import { Download, Expand, Loader2, PanelTop } from "lucide-react"
import { rendererGalleryRegistry, type RendererGalleryEntry } from "@/artifacts/registry"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { exportNodeToImage } from "@/utils/export"

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

export const GalleryApp = () => {
  const canvasRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fullPreviewRef = useRef<HTMLDivElement | null>(null)
  const [selected, setSelected] = useState<RendererGalleryEntry | null>(null)
  const [variantByEntry, setVariantByEntry] = useState<Record<string, string>>({})
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const activeVariantFor = (entry: RendererGalleryEntry) =>
    variantByEntry[entry.id] || entry.defaultVariant || entry.variants?.[0]?.id

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-4 py-7 text-slate-900 sm:px-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-white bg-white/80 px-6 py-6 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600"><PanelTop className="h-4 w-4" /> X Content Studio</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Renderery i przykłady</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Żywy katalog rendererów. Każda karta używa prawdziwego komponentu i deterministycznych danych przykładowych.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200"><strong className="text-white">{rendererGalleryRegistry.length}</strong> rendererów · eksport PNG</div>
        </header>

        {exportError ? <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Eksport nie powiódł się: {exportError}</div> : null}

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rendererGalleryRegistry.map((entry) => {
            const scale = galleryScale(entry, 330, 290)
            const activeVariant = activeVariantFor(entry)
            const isExporting = exportingId === `${entry.id}:${activeVariant || "default"}`
            return (
              <article key={entry.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <button type="button" className="flex w-full cursor-zoom-in items-center justify-center overflow-hidden bg-slate-100 p-5 text-left" onClick={() => setSelected(entry)} aria-label={`Otwórz pełny podgląd ${entry.label}`}>
                  <div style={{ width: entry.width * scale, height: entry.height * scale }}>
                    <div style={{ width: entry.width, height: entry.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                      <div ref={(node) => { canvasRefs.current[entry.id] = node }} style={{ width: entry.width, height: entry.height }}>
                        {entry.render(entry.exampleData, activeVariant)}
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
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(entry)}><Expand className="h-4 w-4" /> Pełny podgląd</Button>
                    <Button size="sm" onClick={() => void exportEntry(entry, canvasRefs.current[entry.id], activeVariant)} disabled={exportingId !== null}>
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
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.label}</DialogTitle>
                <DialogDescription>{selected.category} · {selected.width} × {selected.height} · real renderer preview</DialogDescription>
              </DialogHeader>
              <div className="flex min-w-fit justify-center rounded-2xl bg-slate-100 p-5">
                <div ref={fullPreviewRef} style={{ width: selected.width, height: selected.height }}>
                  {selected.render(selected.exampleData, activeVariantFor(selected))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => void exportEntry(selected, fullPreviewRef.current, activeVariantFor(selected))} disabled={exportingId !== null}>
                  {exportingId === `${selected.id}:${activeVariantFor(selected) || "default"}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Pobierz PNG
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
