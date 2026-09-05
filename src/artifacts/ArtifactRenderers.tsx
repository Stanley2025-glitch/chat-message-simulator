import type {
  CalendarArtifactData,
  ChartArtifactData,
  ContractArtifactData,
  CourseSlideArtifactData,
  ArtifactVariant,
  InvoiceArtifactData,
  IPhoneNotificationArtifactData,
  IPhoneNotificationTone,
  PollArtifactData,
  ReceiptArtifactData,
} from "@/artifacts/types"
import { PrivacyText } from "@/artifacts/PrivacyMask"

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value)

const maskMarkup = /<(blur|line)([^>]*)>([\s\S]*?)<\/\1>/gi

const unmaskedText = (value: string) => value.replace(maskMarkup, "$3")

const formatDatePlain = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

const formatDate = (value: string) => {
  // Daty są zawsze jawne. Zdejmujemy również ewentualne stare znaczniki,
  // żeby renderer nigdy nie wyświetlił literalnego tekstu `<line>...</line>`.
  return formatDatePlain(unmaskedText(String(value || "")))
}

type ArtifactSizingProps = {
  autoHeight?: boolean
  minHeight?: number
}

const ArtifactFrame = ({
  children,
  className = "",
  autoHeight = false,
  minHeight,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
} & ArtifactSizingProps) => (
  <div
    data-xcs-artifact-content={autoHeight ? "true" : undefined}
    className={`${autoHeight ? "" : "h-full"} w-full overflow-hidden bg-white text-slate-900 ${className}`}
    style={{ ...style, ...(autoHeight && minHeight ? { minHeight } : {}) }}
  >
    {children}
  </div>
)

export const CalendarRenderer = ({ data, autoHeight, minHeight }: { data: CalendarArtifactData } & ArtifactSizingProps) => {
  const rawDate = unmaskedText(String(data.date || ""))
  const parsedDate = new Date(`${rawDate}T12:00:00`)
  const dayName = Number.isNaN(parsedDate.getTime())
    ? ""
    : new Intl.DateTimeFormat("pl-PL", { weekday: "long" }).format(parsedDate)
  return (
    <ArtifactFrame className="bg-slate-50 p-16 font-sans" autoHeight={autoHeight} minHeight={minHeight}>
      <div className={`flex ${autoHeight ? "" : "h-full"} flex-col rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm`}>
        <div className="mb-7 flex items-start justify-between border-b border-slate-100 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Kalendarz</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950"><PrivacyText value={formatDate(data.date)} /></h1>
            {dayName ? <p className="mt-1 capitalize text-sm text-slate-500">{dayName}</p> : null}
          </div>
          <div className="rounded-2xl bg-indigo-600 px-4 py-3 text-center text-white">
            <div className="text-xs uppercase tracking-wide text-indigo-100">Wydarzenia</div>
            <div className="text-2xl font-bold">{data.events.length}</div>
          </div>
        </div>
        <div className={autoHeight ? "space-y-2" : "flex-1 space-y-2"}>
          {data.events.map((event, index) => (
            <div key={`${event.time}-${event.title}`} className="grid grid-cols-[74px_1fr] gap-4">
              <time className="pt-3 text-right text-sm font-semibold tabular-nums text-slate-400">{event.time}</time>
              <div className="relative min-h-14 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span
                  className="absolute bottom-2 left-0 top-2 w-1 rounded-full"
                  style={{ backgroundColor: event.color || ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b"][index % 4] }}
                />
                <span className="font-semibold text-slate-800"><PrivacyText value={event.title} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ArtifactFrame>
  )
}

export const InvoiceRenderer = ({ data, autoHeight, minHeight }: { data: InvoiceArtifactData } & ArtifactSizingProps) => {
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = subtotal * 0.23
  return (
    <ArtifactFrame className="p-16 font-sans" autoHeight={autoHeight} minHeight={minHeight}>
      <div className={`flex ${autoHeight ? "" : "h-full"} flex-col`}>
        <header className="flex items-start justify-between border-b-2 border-slate-900 pb-8">
          <div>
            <div className="text-3xl font-black tracking-tight"><PrivacyText value={data.merchant} /></div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500"><PrivacyText value={data.merchantAddress} /></p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black tracking-tight text-indigo-600">FAKTURA</div>
            <div className="mt-3 text-sm font-semibold"><PrivacyText value={data.invoiceNumber} /></div>
            <div className="mt-1 text-xs text-slate-500">Wystawiono: <PrivacyText value={formatDate(data.issueDate)} /></div>
          </div>
        </header>
        <section className="grid grid-cols-2 gap-8 py-8 text-sm">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Nabywca</div>
            <p className="mt-2 whitespace-pre-line font-semibold leading-6 text-slate-800"><PrivacyText value={data.billTo} /></p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Termin płatności</div>
            <p className="mt-2 font-semibold text-slate-800"><PrivacyText value={formatDate(data.dueDate)} /></p>
          </div>
        </section>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-900 text-left text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-3">Pozycja</th>
              <th className="px-4 py-3 text-right">Ilość</th>
              <th className="px-4 py-3 text-right">Cena netto</th>
              <th className="px-4 py-3 text-right">Suma</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.name} className="border-b border-slate-100">
                <td className="px-4 py-4 font-medium"><PrivacyText value={item.name} /></td>
                <td className="px-4 py-4 text-right tabular-nums">{item.quantity}</td>
                <td className="px-4 py-4 text-right tabular-nums">{formatMoney(item.unitPrice)}</td>
                <td className="px-4 py-4 text-right font-semibold tabular-nums">{formatMoney(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`${autoHeight ? "mt-8" : "mt-auto"} flex items-end justify-between border-t border-slate-200 pt-6`}>
          <p className="max-w-sm text-xs leading-5 text-slate-500"><PrivacyText value={data.notes || "Dziękujemy za terminową płatność."} /></p>
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500"><span>Netto</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>VAT 23%</span><span>{formatMoney(tax)}</span></div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-xl font-black"><span>Razem</span><span>{formatMoney(subtotal + tax)}</span></div>
          </div>
        </div>
      </div>
    </ArtifactFrame>
  )
}

export const ReceiptRenderer = ({ data, autoHeight, minHeight }: { data: ReceiptArtifactData } & ArtifactSizingProps) => {
  const total = data.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)
  return (
    <ArtifactFrame className="bg-stone-200 p-16 font-mono" autoHeight={autoHeight} minHeight={minHeight}>
      <div className={`mx-auto flex ${autoHeight ? "" : "h-full"} max-w-[460px] flex-col bg-[#fffef8] px-9 py-8 text-[15px] shadow-xl`}>
        <div className="text-center">
          <div className="mb-5 text-[18px] font-black uppercase tracking-[0.34em] text-stone-900">PARAGON</div>
          <div className="text-xl font-black tracking-wide"><PrivacyText value={data.merchant} /></div>
          {data.address ? <div className="mt-2 whitespace-pre-line text-xs leading-5 text-stone-500"><PrivacyText value={data.address} /></div> : null}
          <div className="mt-4 border-y border-dashed border-stone-400 py-3 text-xs"><PrivacyText value={data.date || "04.09.2026 · 10:24"} /></div>
        </div>
        <div className={autoHeight ? "py-6" : "flex-1 py-6"}>
          {data.items.map((item) => {
            const quantity = item.quantity ?? 1
            return (
              <div key={item.name} className="mb-4">
                <div className="flex justify-between gap-4 font-semibold"><span><PrivacyText value={item.name} /></span><span>{formatMoney(item.price * quantity)}</span></div>
                {quantity > 1 ? <div className="text-xs text-stone-500">{quantity} × {formatMoney(item.price)}</div> : null}
              </div>
            )
          })}
        </div>
        <div className="border-y border-dashed border-stone-400 py-4">
          <div className="flex justify-between text-lg font-black"><span>SUMA</span><span>{formatMoney(total)}</span></div>
          <div className="mt-2 flex justify-between text-xs text-stone-500"><span><PrivacyText value={data.paymentMethod || "Karta"} /></span><span>PLN</span></div>
        </div>
        <div className="pt-6 text-center text-xs text-stone-500">Dziękujemy i zapraszamy ponownie</div>
      </div>
    </ArtifactFrame>
  )
}

export const ChartRenderer = ({ data, autoHeight, minHeight }: { data: ChartArtifactData } & ArtifactSizingProps) => {
  const max = Math.max(data.target || 0, ...data.series.map((item) => item.value), 1)
  const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"]
  return (
    <ArtifactFrame className="bg-slate-950 p-16 font-sans text-white" autoHeight={autoHeight} minHeight={minHeight}>
      <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-slate-900 p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">Wynik</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight"><PrivacyText value={data.title} /></h1>
            {data.subtitle ? <p className="mt-2 text-sm text-slate-400"><PrivacyText value={data.subtitle} /></p> : null}
          </div>
          {data.target ? <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200">Cel: {data.target}{data.unit || ""}</div> : null}
        </div>
        <div className="mt-10 flex flex-1 items-end gap-5 border-b border-l border-white/20 px-5 pt-5">
          {data.series.map((item, index) => (
            <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-3">
              <div className="text-center text-sm font-bold">{item.value}{data.unit || ""}</div>
              <div
                className="min-h-3 rounded-t-xl transition-all"
                style={{ height: `${Math.max(8, (item.value / max) * 100)}%`, backgroundColor: item.color || colors[index % colors.length] }}
              />
              <div className="mb-[-34px] whitespace-nowrap text-center text-xs text-slate-400"><PrivacyText value={item.label} /></div>
            </div>
          ))}
        </div>
        <div className="mt-14 text-xs text-slate-500">Dane demonstracyjne · wartości w czasie rzeczywistym</div>
      </div>
    </ArtifactFrame>
  )
}

export const PollRenderer = ({ data, autoHeight, minHeight }: { data: PollArtifactData } & ArtifactSizingProps) => {
  const total = data.totalVotes || data.options.reduce((sum, option) => sum + option.votes, 0)
  return (
    <ArtifactFrame className="bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-950 p-16 font-sans text-white" autoHeight={autoHeight} minHeight={minHeight}>
      <div className="flex h-full flex-col rounded-[32px] border border-white/15 bg-white/10 p-9 shadow-2xl backdrop-blur">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200">Ankieta</div>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight"><PrivacyText value={data.question} /></h1>
        <div className="mt-10 space-y-4">
          {data.options.map((option) => {
            const percentage = total ? Math.round((option.votes / total) * 100) : 0
            return (
              <div key={option.label} className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                <div className="absolute inset-y-0 left-0 bg-white/15" style={{ width: `${percentage}%` }} />
                <div className="relative flex items-center justify-between gap-4"><span className="font-semibold"><PrivacyText value={option.label} /></span><span className="font-bold tabular-nums">{percentage}%</span></div>
              </div>
            )
          })}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-6 text-sm text-violet-100">
          <span>{new Intl.NumberFormat("pl-PL").format(total)} głosów</span>
          <span><PrivacyText value={data.closesAt || "Głosowanie aktywne"} /></span>
        </div>
      </div>
    </ArtifactFrame>
  )
}

export const ContractRenderer = ({ data, autoHeight, minHeight }: { data: ContractArtifactData } & ArtifactSizingProps) => (
  <ArtifactFrame className="bg-stone-100 p-16 font-serif" autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`flex ${autoHeight ? "" : "h-full"} flex-col border border-stone-300 bg-[#fffefa] px-12 py-10 shadow-sm`}>
      <header className="border-b border-stone-300 pb-6 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-stone-500"><PrivacyText value={data.documentType} /></div>
        <h1 className="mt-3 text-3xl font-bold text-stone-900"><PrivacyText value={data.title} /></h1>
        <p className="mt-3 text-sm text-stone-600">Data wejścia w życie: <PrivacyText value={formatDate(data.effectiveDate)} /></p>
      </header>
      <section className="grid grid-cols-2 gap-8 border-b border-stone-200 py-6 text-sm">
        {data.parties.map((party, index) => <div key={party}><div className="text-xs uppercase tracking-wider text-stone-400">Strona {index + 1}</div><p className="mt-2 font-semibold leading-5 text-stone-800"><PrivacyText value={party} /></p></div>)}
      </section>
      <section className={autoHeight ? "space-y-5 py-7" : "flex-1 space-y-5 py-7"}>
        {data.terms.map((term, index) => (
          <div key={term.heading}>
            <h2 className="text-base font-bold text-stone-900">{index + 1}. <PrivacyText value={term.heading} /></h2>
            <p className="mt-1 text-sm leading-6 text-stone-600"><PrivacyText value={term.body} /></p>
          </div>
        ))}
      </section>
      <footer className="grid grid-cols-2 gap-10 pt-6 text-center text-xs text-stone-500">
        {data.parties.slice(0, 2).map((party) => <div key={party} className="border-t border-stone-400 pt-3"><PrivacyText value={data.signatureLabel || "Podpis"} /><br /><span className="text-stone-700"><PrivacyText value={party} /></span></div>)}
      </footer>
    </div>
  </ArtifactFrame>
)

export const CourseSlideRenderer = ({ data, variant, autoHeight, minHeight }: { data: CourseSlideArtifactData; variant: ArtifactVariant } & ArtifactSizingProps) => {
  const tokens = variant.tokens
  return (
    <ArtifactFrame className="relative p-16" style={{ background: tokens.background, color: tokens.text, fontFamily: tokens.fontBody }} autoHeight={autoHeight} minHeight={minHeight}>
      <div className="absolute inset-0" style={{ background: tokens.background }} />
      <div className="absolute -right-24 -top-20 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: tokens.accent }} />
      <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: tokens.negative }} />
      <div className="relative z-10 flex h-full flex-col border p-14" style={{ borderColor: tokens.border, borderRadius: tokens.borderRadius }}>
        <div className="flex items-center justify-between text-[18px] font-bold uppercase tracking-[0.24em]" style={{ color: tokens.accent }}><span>Moduł {data.module}</span><span>Program mentoringowy</span></div>
        <div className="my-auto max-w-4xl">
          <div className="mb-6 text-[28px] font-semibold tracking-wide" style={{ color: tokens.textMuted }}><PrivacyText value={data.title} /></div>
          <h1 className="whitespace-pre-line text-[76px] font-black leading-[0.95] tracking-tight" style={{ color: tokens.text, fontFamily: tokens.fontHeading }}><PrivacyText value={data.headline} /></h1>
          <p className="mt-8 max-w-2xl text-[28px] leading-relaxed" style={{ color: tokens.textMuted }}><PrivacyText value={data.body} /></p>
        </div>
        <div className="border-t pt-6" style={{ borderColor: tokens.border }}><span className="inline-flex rounded-full px-5 py-3 text-[24px] font-black" style={{ backgroundColor: tokens.accent, color: tokens.accentText }}><PrivacyText value={data.footer} /></span></div>
      </div>
    </ArtifactFrame>
  )
}

const iphoneNotificationToneStyles: Record<IPhoneNotificationTone, { icon: string; background: string }> = {
  message: { icon: "•••", background: "#1687f8" },
  mail: { icon: "✉", background: "#4b8df8" },
  calendar: { icon: "25", background: "#f0445d" },
  system: { icon: "!", background: "#f59e0b" },
}

export const IPhoneNotificationRenderer = ({ data, variant, autoHeight, minHeight }: { data: IPhoneNotificationArtifactData; variant: ArtifactVariant } & ArtifactSizingProps) => {
  const tokens = variant.tokens
  const notifications = data.notifications.slice(0, 4)
  const cardShadow = variant.tokens.shadow === "none" ? "none" : "0 18px 36px rgba(9, 18, 36, 0.18)"
  return (
    <ArtifactFrame
      className="relative p-4 font-sans"
      style={{
        background: `radial-gradient(circle at 82% 8%, ${tokens.accent}66 0%, transparent 34%), linear-gradient(145deg, ${tokens.background} 0%, ${tokens.surfaceSecondary} 100%)`,
        color: tokens.text,
        fontFamily: tokens.fontBody,
      }}
      autoHeight={autoHeight}
      minHeight={minHeight}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between px-2 text-[13px] font-semibold" style={{ color: tokens.text }}>
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="tracking-[-0.24em]">▮▮▮</span>
            <span className="text-[14px]">⌁</span>
            <span className="rounded-[4px] border px-1 py-0.5" style={{ borderColor: tokens.border }}>100 ▮</span>
          </div>
        </div>

        <div className="mx-auto mt-3 h-5 w-32 rounded-full" style={{ backgroundColor: "rgba(0, 0, 0, 0.72)" }} />

        <div className="mt-9 text-center">
          <div className="text-[17px] font-medium tracking-wide" style={{ color: tokens.textMuted }}><PrivacyText value={data.date} /></div>
          <div className="mt-1 text-[78px] font-light leading-none tracking-[-0.07em]" style={{ color: tokens.text, fontFamily: tokens.fontHeading }}><PrivacyText value={data.time} /></div>
        </div>

        <section className="mt-9 flex-1 space-y-3" aria-label="Powiadomienia">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: tokens.textMuted }}>
            <span>Powiadomienia</span>
            <span>{notifications.length}</span>
          </div>
          {notifications.map((notification) => {
            const tone = iphoneNotificationToneStyles[notification.tone] || iphoneNotificationToneStyles.system
            return (
              <article
                key={`${notification.app}-${notification.time}-${notification.title}`}
                className="flex gap-3 rounded-[22px] border p-3.5"
                style={{ backgroundColor: tokens.surface, borderColor: tokens.border, boxShadow: cardShadow }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-[13px] font-bold text-white" style={{ backgroundColor: tone.background }}>
                  {tone.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate text-[13px] font-semibold"><PrivacyText value={notification.app} /></div>
                    <time className="shrink-0 text-[12px]" style={{ color: tokens.textMuted }}>{notification.time}</time>
                  </div>
                  <div className="mt-1 truncate text-[16px] font-semibold leading-5"><PrivacyText value={notification.title} /></div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-5" style={{ color: tokens.textMuted }}><PrivacyText value={notification.body} /></p>
                </div>
              </article>
            )
          })}
        </section>

        <div className="mt-auto flex items-end justify-between px-2 pb-1 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-[17px]" style={{ backgroundColor: "rgba(0, 0, 0, 0.32)", color: "#ffffff" }}>✦</div>
          <div className="pb-1 text-[11px] font-medium" style={{ color: tokens.textMuted }}>Przesuń w górę, aby otworzyć</div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-[16px]" style={{ backgroundColor: "rgba(0, 0, 0, 0.32)", color: "#ffffff" }}>◉</div>
        </div>
      </div>
    </ArtifactFrame>
  )
}
