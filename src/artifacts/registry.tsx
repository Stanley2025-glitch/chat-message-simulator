import { ArtifactCanvas } from "@/artifacts/ArtifactCanvas"
import { ChatExampleRenderer, type ChatExampleData } from "@/artifacts/ChatExampleRenderer"
import { visualVariants } from "@/artifacts/visualVariants"
import type {
  ActivityFeedArtifactData,
  ArtifactData,
  ArtifactDefinition,
  ArtifactRenderPayload,
  ArtifactType,
  CalendarArtifactData,
  ChartArtifactData,
  ContractArtifactData,
  CourseSlideArtifactData,
  InvoiceArtifactData,
  InvestmentMemoArtifactData,
  KanbanArtifactData,
  NotesArtifactData,
  PollArtifactData,
  PropertyListingArtifactData,
  ReviewArtifactData,
  ReceiptArtifactData,
  SpreadsheetArtifactData,
  TodoArtifactData,
  DashboardArtifactData,
  CrmContactArtifactData,
  DueDiligenceArtifactData,
} from "@/artifacts/types"
import type { LayoutId, ThemeId } from "@/types/layout"

const calendarExample: CalendarArtifactData = {
  date: "2026-09-04",
  events: [
    { time: "08:00", title: "Dentysta", color: "#4f46e5" },
    { time: "09:15", title: "Due diligence gabinetu", color: "#0ea5e9" },
    { time: "14:00", title: "Odebrać syna", color: "#10b981" },
    { time: "14:00", title: "Call z właścicielem parkingu", color: "#f59e0b" },
  ],
}

const invoiceExample: InvoiceArtifactData = {
  merchant: "<line color=\"navy\">NORTHSTAR ADVISORY</line>",
  merchantAddress: "ul. Wspólna <line color=\"navy\">14</line>\n<line color=\"navy\">00-001</line> Warszawa\nNIP <line color=\"navy\">521-000-00-01</line>",
  invoiceNumber: "FV/09/2026/041",
  issueDate: "2026-09-04",
  dueDate: "2026-09-11",
  billTo: "<line color=\"navy\">Ventures & Assets sp. z o.o.</line>\nul. Marszałkowska <line color=\"navy\">10</line>\n<line color=\"navy\">00-590</line> Warszawa",
  items: [
    { name: "Audyt procesów sprzedażowych", quantity: 1, unitPrice: 8500 },
    { name: "Warsztat strategiczny", quantity: 2, unitPrice: 2400 },
  ],
  notes: "Prosimy o płatność przelewem w terminie wskazanym na fakturze.",
}

const receiptExample: ReceiptArtifactData = {
  merchant: "<line color=\"graphite\">HOTEL BUSINESS PARK</line>",
  address: "ul. Sienna <line color=\"graphite\">12</line> · Warszawa",
  date: "04.09.2026 · 10:24",
  items: [
    { name: "Espresso", price: 19 },
    { name: "Parking", price: 80 },
  ],
  paymentMethod: "Karta •••• <line color=\"graphite\">4412</line>",
}

const chartExample: ChartArtifactData = {
  title: "Przychód miesięczny",
  subtitle: "Segment parkingów · tys. PLN",
  unit: "k",
  target: 180,
  series: [
    { label: "Maj", value: 92 },
    { label: "Cze", value: 118 },
    { label: "Lip", value: 144 },
    { label: "Sie", value: 171 },
    { label: "Wrz", value: 196, color: "#f59e0b" },
  ],
}

const pollExample: PollArtifactData = {
  question: "Co najbardziej podnosi marżę w małej firmie?",
  options: [
    { label: "Podwyżka ceny", votes: 86 },
    { label: "Lepszy proces sprzedaży", votes: 214 },
    { label: "Zakup dostawcy", votes: 157 },
  ],
  totalVotes: 457,
  closesAt: "Zamyka się jutro o 18:00",
}

const contractExample: ContractArtifactData = {
  documentType: "Letter of Intent",
  title: "List intencyjny dotyczący nabycia udziałów",
  parties: ["<line color=\"ink\">Northstar Capital sp. z o.o.</line>", "<line color=\"ink\">Business Park Holdings sp. z o.o.</line>"],
  effectiveDate: "2026-09-04",
  terms: [
    { heading: "Przedmiot rozmów", body: "Strony rozpoczynają wyłączne rozmowy dotyczące nabycia 100% udziałów w <line color=\"ink\">Business Park Holdings sp. z o.o.</line>" },
    { heading: "Poufność", body: "Informacje przekazane w toku badania due diligence pozostają poufne przez 24 miesiące." },
    { heading: "Harmonogram", body: "Strony zakładają podpisanie dokumentów transakcyjnych do 30 września 2026 r." },
  ],
  signatureLabel: "Podpis osoby uprawnionej",
}

const courseSlideExample: CourseSlideArtifactData = {
  module: 12,
  title: "REDUKCJA KOSZTÓW",
  headline: "Nie negocjuj ceny.\nKup sprzedawcę.",
  body: "Największa dźwignia kosztowa pojawia się wtedy, gdy przestajesz być tylko klientem.",
  footer: "Program mentoringowy 49 997 PLN netto",
}

const notesExample: NotesArtifactData = {
  title: "Notatka po spotkaniu z właścicielem parkingu",
  body: "Parking ma stabilny cashflow, ale właściciel nadal sprzedaje wyłącznie abonamenty. Sprawdzić umowy najmu, liczbę miejsc i możliwość dołożenia ładowarek.",
  date: "04 września 2026",
  tags: ["parking", "acquisition", "follow-up"],
}

const todoExample: TodoArtifactData = {
  title: "Piątek · operacje",
  date: "04.09.2026",
  tasks: [
    { text: "Dentysta", completed: true, priority: "normal", time: "08:00", tag: "DONE" },
    { text: "Due diligence gabinetu", completed: false, priority: "high", time: "09:15", tag: "HIGH" },
    { text: "Call z bankiem", completed: false, priority: "normal", time: "12:00", tag: "TODAY" },
    { text: "Odebrać syna", completed: false, priority: "normal", time: "14:00", tag: "DELEGATED" },
    { text: "Closing parkingu", completed: false, priority: "high", time: "14:00", tag: "WAITING" },
  ],
}

const spreadsheetExample: SpreadsheetArtifactData = {
  title: "Urodziny syna — P&L",
  subtitle: "Rozliczenie jednorazowego projektu rodzinnego · PLN",
  columns: [{ label: "Plan", format: "currency" }, { label: "Wynik", format: "currency" }, { label: "Odchylenie", format: "currency" }],
  rows: [
    { label: "Przychód", values: [0, 0, 0], tone: "neutral" },
    { label: "Animator", values: [-700, -900, -200], tone: "negative" },
    { label: "Tort", values: [-350, -420, -70], tone: "negative" },
    { label: "Sala", values: [-1800, -2100, -300], tone: "negative" },
    { label: "EBITDA", values: [-2850, -3420, -570], tone: "negative", total: true },
  ],
  summary: [{ label: "Przychód", value: 0, format: "currency" }, { label: "Koszty", value: -3420, format: "currency", tone: "negative" }, { label: "EBITDA", value: -3420, format: "currency", tone: "negative" }],
}

const dashboardExample: DashboardArtifactData = {
  title: "Portfolio Czarka",
  period: "Wrzesień 2026",
  metrics: [
    { label: "Aktywa", value: 4812, change: 4.8, trend: "up" },
    { label: "Miesięczny cashflow", value: "1,84 mln PLN", change: 12.4, trend: "up" },
    { label: "Nowe przejęcia", value: 12, change: 2, trend: "up" },
    { label: "Obiady z rodziną", value: 1, change: 0, trend: "flat" },
  ],
  chart: { type: "bar", labels: ["Maj", "Cze", "Lip", "Sie", "Wrz"], values: [1180, 1310, 1460, 1630, 1840] },
}

const crmContactExample: CrmContactArtifactData = {
  name: "Marta <blur>Kwiat</blur>kowska",
  company: "<line color=\"plum\">Business Park Holdings</line>",
  role: "Właścicielka i CEO",
  phone: "+48 <line color=\"plum\">500 114 220</line>",
  email: "<line color=\"plum\">marta@businesspark.example</line>",
  tags: ["seller", "parking", "warm"],
  notes: "Prowadzi rozmowy sama. Jest otwarta na earn-out, ale nie na długi okres wyłączności.",
  lastContact: "04.09 · przesłano list intencyjny",
  nextAction: "Zadzwonić po decyzję prawnika w poniedziałek o 09:00.",
  metrics: [{ label: "Relacja", value: "Warm" }, { label: "Potencjał", value: "18,4 mln PLN" }],
}

const diligenceExample: DueDiligenceArtifactData = {
  target: "<line color=\"ink\">Osiedlowa Myjnia</line>",
  status: "W toku",
  sections: [
    { title: "Ekonomia", items: [{ label: "Marża", status: "passed", note: "Powyżej planu." }, { label: "Recurring revenue", status: "passed", note: "61% klientów abonamentowych." }] },
    { title: "Ryzyka", items: [{ label: "Uzależnienie od CEO", status: "warning", note: "Właściciel odpowiada za wszystkie serwisy." }, { label: "Parking", status: "failed", note: "Umowa gruntu wygasa za 14 miesięcy." }, { label: "Żona poinformowana", status: "pending" }] },
  ],
}

const memoExample: InvestmentMemoArtifactData = {
  target: "<line color=\"ink\">Osiedlowa Myjnia</line>",
  subtitle: "Jednostka usługowa · Warszawa",
  thesis: "Ludzie nadal posiadają samochody. Lokalizacja przy parkingu tworzy prosty, odporny na cykl cashflow.",
  metrics: [{ label: "Cena", value: "4,2 mln PLN" }, { label: "EBITDA", value: "690 tys. PLN" }, { label: "Marża", value: "31%" }, { label: "Payback", value: "6,1 lat" }],
  pros: ["Powtarzalne wizyty", "Dostępne cross-sell", "Właściciel zostaje na 6 miesięcy"],
  risks: ["Najem terenu", "Jeden dostawca chemii", "Właściciel nie chce sprzedać"],
  recommendation: "Zwiększyć ofertę i rozpocząć wyłączność po potwierdzeniu najmu.",
  date: "04.09.2026",
  chart: { type: "bar", labels: ["2023", "2024", "2025", "2026E"], values: [410, 510, 610, 690] },
}

const kanbanExample: KanbanArtifactData = {
  title: "Deal flow · wrzesień",
  columns: [
    { title: "Ideas", cards: [{ title: "Gabinet stomatologiczny", subtitle: "Warszawa · 3 fotele", tag: "TARGET", value: "3,8 mln" }, { title: "Automaty vendingowe", subtitle: "Siedem lokalizacji", tag: "LEAD", value: "1,1 mln" }] },
    { title: "Due diligence", cards: [{ title: "<line color=\"ink\">Osiedlowa Myjnia</line>", subtitle: "Najem gruntu do sprawdzenia", tag: "REVIEW", value: "4,2 mln" }] },
    { title: "Closing", cards: [{ title: "Parking #12", subtitle: "Projekt umowy gotowy", tag: "SIGN", value: "2,6 mln" }] },
    { title: "Owned", cards: [{ title: "Lokal Mokotów", subtitle: "Rent roll +4,2%", tag: "CASHFLOW", value: "81 tys./m" }] },
  ],
}

const reviewExample: ReviewArtifactData = {
  business: "Hotel Business Park",
  reviewer: "Aleksandra <blur>M.</blur>",
  rating: 4,
  date: "03.09.2026",
  review: "Świetna lokalizacja i bardzo sprawna obsługa. Parking jest wygodny, ale espresso mogłoby być lepsze.",
  ownerResponse: "Dziękujemy za konkretną opinię. Przekazaliśmy uwagę o kawie operatorowi lobby i zapraszamy ponownie.",
  verified: true,
}

const activityFeedExample: ActivityFeedArtifactData = {
  title: "Aktywność finansowa",
  balance: "12 482,17 PLN",
  items: [
    { time: "08:12", title: "Parking #12", subtitle: "Abonament miesięczny", amount: "+18,00 PLN", direction: "in", category: "parking" },
    { time: "08:14", title: "Automat #441", subtitle: "Sprzedaż poranna", amount: "+7,50 PLN", direction: "in", category: "vending" },
    { time: "08:16", title: "Lokal <line color=\"forest\">Mokotów</line>", subtitle: "Czynsz netto", amount: "+6 800,00 PLN", direction: "in", category: "property" },
    { time: "08:17", title: "Kawa", subtitle: "Recepcja", amount: "-19,00 PLN", direction: "out", category: "operacje" },
  ],
}

const propertyExample: PropertyListingArtifactData = {
  title: "Lokal usługowy z parkingiem własnym",
  location: "<line color=\"burgundy\">Mokotów</line> · Warszawa",
  price: "6,8 mln PLN",
  area: "412 m²",
  pricePerMeter: "16 505 PLN",
  propertyType: "Commercial property",
  features: ["parter", "parking", "najemca"],
  description: "Stabilny lokal usługowy z ekspozycją na ulicę, umową najmu na kolejne 4 lata i możliwością podniesienia czynszu po rewizji indeksacji.",
  metrics: [{ label: "Rent", value: "52 tys. PLN/m" }, { label: "Yield", value: "9,2%" }, { label: "CAPEX", value: "niskie" }, { label: "Status", value: "off-market" }],
}

export const artifactRegistry: ArtifactDefinition[] = [
  { type: "calendar", label: "Calendar", category: "Personal", description: "Daily schedule · square X/Twitter export.", width: 1080, height: 1080, exampleData: calendarExample },
  { type: "invoice", label: "Invoice", category: "Finance", description: "VAT invoice · square X/Twitter export.", width: 1080, height: 1080, exampleData: invoiceExample },
  { type: "receipt", label: "Receipt", category: "Finance", description: "Point-of-sale receipt · square X/Twitter export.", width: 1080, height: 1080, exampleData: receiptExample },
  { type: "chart", label: "Chart", category: "Finance", description: "Bar chart · square X/Twitter export.", width: 1080, height: 1080, exampleData: chartExample },
  { type: "poll", label: "Poll", category: "Content", description: "Voting card · square X/Twitter export.", width: 1080, height: 1080, exampleData: pollExample },
  { type: "contract", label: "Contract / LOI", category: "Deals", description: "Letter of intent · square X/Twitter export.", width: 1080, height: 1080, exampleData: contractExample },
  { type: "course-slide", label: "Course Slide", category: "Content", description: "Education slide · square X/Twitter export.", width: 1080, height: 1080, exampleData: courseSlideExample },
  { type: "notes", label: "Notes", category: "Personal", description: "Executive note · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants.notes, defaultVariant: "paper", exampleData: notesExample },
  { type: "todo", label: "Todo / Task List", category: "Personal", description: "Prioritized worklist · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants.todo, defaultVariant: "clean", exampleData: todoExample },
  { type: "spreadsheet", label: "P&L / Spreadsheet", category: "Finance", description: "Business report · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants.spreadsheet, defaultVariant: "accountant", exampleData: spreadsheetExample },
  { type: "dashboard", label: "KPI Dashboard", category: "Finance", description: "Portfolio metrics · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants.dashboard, defaultVariant: "boardroom", exampleData: dashboardExample },
  { type: "crm-contact", label: "CRM / Contact Card", category: "Deals", description: "Relationship dossier · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants["crm-contact"], defaultVariant: "modern-crm", exampleData: crmContactExample },
  { type: "due-diligence", label: "Due Diligence", category: "Deals", description: "Structured M&A checklist · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants["due-diligence"], defaultVariant: "deal-team", exampleData: diligenceExample },
  { type: "investment-memo", label: "Investment Memo", category: "Deals", description: "Decision-ready memo · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants["investment-memo"], defaultVariant: "private-equity", exampleData: memoExample },
  { type: "kanban", label: "Kanban", category: "Operations", description: "Deal flow board · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants.kanban, defaultVariant: "modern", exampleData: kanbanExample },
  { type: "review", label: "Review + Owner Response", category: "Content", description: "Fictional review · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants.review, defaultVariant: "clean-reviews", exampleData: reviewExample },
  { type: "activity-feed", label: "Transaction Feed", category: "Finance", description: "Financial ledger · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants["activity-feed"], defaultVariant: "finance-light", exampleData: activityFeedExample },
  { type: "property-listing", label: "Property Listing", category: "Operations", description: "Property deal card · square X/Twitter export.", width: 1080, height: 1080, variants: visualVariants["property-listing"], defaultVariant: "marketplace", exampleData: propertyExample },
]

export const getArtifactDefinition = (type: ArtifactType) =>
  artifactRegistry.find((definition) => definition.type === type)

export const isArtifactType = (value: unknown): value is ArtifactType =>
  typeof value === "string" && artifactRegistry.some((definition) => definition.type === value)

export const isArtifactRenderPayload = (value: unknown): value is ArtifactRenderPayload => {
  if (!value || typeof value !== "object") return false
  const candidate = value as { type?: unknown; data?: unknown }
  return isArtifactType(candidate.type) && Boolean(candidate.data) && typeof candidate.data === "object"
}

const chatExampleConversation = (id: string, firstName: string, secondName: string): ChatExampleData["conversation"] => ({
  id,
  participants: [
    { id: "self", name: firstName, status: "online", color: "#4f46e5" },
    { id: "contact", name: secondName, status: "online", color: "#0ea5e9" },
  ],
  messages: [
    { id: `${id}-1`, senderId: "contact", content: "Masz chwilę na szybki call?", timestamp: "2026-09-04T09:12:00.000Z", type: "text", status: "read" },
    { id: `${id}-2`, senderId: "self", content: "Jasne, jestem dostępny za 10 minut.", timestamp: "2026-09-04T09:13:00.000Z", type: "text", status: "read" },
    { id: `${id}-3`, senderId: "contact", content: "Super, podeślę zaproszenie.", timestamp: "2026-09-04T09:14:00.000Z", type: "text", status: "delivered" },
  ],
  metadata: { createdAt: "2026-09-04T09:12:00.000Z", updatedAt: "2026-09-04T09:14:00.000Z" },
})

const chatExample = (layoutId: LayoutId, label: string, themeId: ThemeId = "light"): ChatExampleData => ({
  conversation: chatExampleConversation(`example-${layoutId}`, "Alex", label),
  layoutId,
  themeId,
  activeParticipantId: "self",
})

export interface RendererGalleryEntry {
  id: string
  label: string
  category: string
  description: string
  width: number
  height: number
  variants?: NonNullable<ArtifactDefinition["variants"]>
  defaultVariant?: string
  exampleData: ArtifactData | ChatExampleData
  render: (data: ArtifactData | ChatExampleData, variant?: string) => React.ReactNode
}

const chatEntries: RendererGalleryEntry[] = [
  ["whatsapp", "WhatsApp", "light"],
  ["messenger", "Messenger", "light"],
  ["imessage", "iMessage / SMS", "light"],
  ["snapchat", "Snapchat", "dark"],
  ["instagram", "Instagram", "dark"],
  ["tinder", "Tinder", "light"],
].map(([layoutId, label, themeId]) => ({
  id: `chat-${layoutId}`,
  label,
  category: "Communicator",
  description: "Existing chat layout rendered with deterministic conversation data.",
  width: 393,
  height: 852,
  exampleData: chatExample(layoutId as LayoutId, label, themeId as ThemeId),
  render: (data) => <ChatExampleRenderer data={data as ChatExampleData} />,
}))

const artifactEntries: RendererGalleryEntry[] = artifactRegistry.map((definition) => ({
  id: definition.type,
  label: definition.label,
  category: definition.category,
  description: definition.description,
  width: definition.width,
  height: definition.height,
  variants: definition.variants,
  defaultVariant: definition.defaultVariant,
  exampleData: definition.exampleData,
  render: (data, variant) => <ArtifactCanvas type={definition.type} data={data as ArtifactData} variant={variant || definition.defaultVariant} />,
}))

export const rendererGalleryRegistry = [...chatEntries, ...artifactEntries]
