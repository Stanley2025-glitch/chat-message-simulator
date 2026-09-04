export type ArtifactType =
  | "calendar"
  | "invoice"
  | "receipt"
  | "chart"
  | "poll"
  | "contract"
  | "course-slide"
  | "notes"
  | "todo"
  | "spreadsheet"
  | "dashboard"
  | "crm-contact"
  | "due-diligence"
  | "investment-memo"
  | "kanban"
  | "review"
  | "activity-feed"
  | "property-listing"

export type ArtifactCategory =
  | "Personal"
  | "Finance"
  | "Deals"
  | "Operations"
  | "Content"
  | "Communication"

export interface ArtifactVariantTokens {
  background: string
  surface: string
  surfaceSecondary: string
  text: string
  textMuted: string
  accent: string
  positive: string
  negative: string
  warning: string
  border: string
  borderRadius: string
  fontHeading: string
  fontBody: string
  fontMono: string
  density: "comfortable" | "compact"
  shadow: "none" | "subtle" | "elevated"
}

export interface ArtifactVariant {
  id: string
  label: string
  description: string
  tokens: ArtifactVariantTokens
}

export interface CalendarArtifactData {
  date: string
  events: Array<{ time: string; title: string; color?: string }>
}

export interface InvoiceArtifactData {
  merchant: string
  merchantAddress: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  billTo: string
  items: Array<{ name: string; quantity: number; unitPrice: number }>
  notes?: string
}

export interface ReceiptArtifactData {
  merchant: string
  address?: string
  date?: string
  items: Array<{ name: string; price: number; quantity?: number }>
  paymentMethod?: string
}

export interface ChartArtifactData {
  title: string
  subtitle?: string
  unit?: string
  series: Array<{ label: string; value: number; color?: string }>
  target?: number
}

export interface PollArtifactData {
  question: string
  options: Array<{ label: string; votes: number }>
  totalVotes?: number
  closesAt?: string
}

export interface ContractArtifactData {
  documentType: string
  title: string
  parties: string[]
  effectiveDate: string
  terms: Array<{ heading: string; body: string }>
  signatureLabel?: string
}

export interface CourseSlideArtifactData {
  module: number
  title: string
  headline: string
  body: string
  footer: string
}

export interface NotesArtifactData {
  title: string
  body: string
  date: string
  tags: string[]
}

export interface TodoArtifactData {
  title: string
  date: string
  tasks: Array<{
    text: string
    completed: boolean
    priority: "normal" | "high"
    time?: string
    tag?: string
  }>
}

export interface SpreadsheetArtifactData {
  title: string
  subtitle?: string
  columns: Array<{ label: string; format?: "text" | "currency" | "percentage" }>
  rows: Array<{
    label: string
    values: Array<string | number>
    tone?: "positive" | "negative" | "neutral"
    total?: boolean
  }>
  summary: Array<{ label: string; value: string | number; format?: "currency" | "percentage" | "text"; tone?: "positive" | "negative" | "neutral" }>
}

export interface MiniChartData {
  type: "line" | "bar"
  labels: string[]
  values: number[]
}

export interface DashboardArtifactData {
  title: string
  period: string
  metrics: Array<{ label: string; value: string | number; change: number; trend: "up" | "down" | "flat" }>
  chart?: MiniChartData
}

export interface CrmContactArtifactData {
  name: string
  company: string
  role: string
  phone?: string
  email?: string
  tags: string[]
  notes: string
  lastContact: string
  nextAction: string
  metrics: Array<{ label: string; value: string }>
}

export interface DueDiligenceArtifactData {
  target: string
  status: string
  sections: Array<{
    title: string
    items: Array<{ label: string; status: "passed" | "warning" | "failed" | "pending"; note?: string }>
  }>
}

export interface InvestmentMemoArtifactData {
  target: string
  subtitle: string
  thesis: string
  metrics: Array<{ label: string; value: string }>
  pros: string[]
  risks: string[]
  recommendation: string
  date: string
  chart?: MiniChartData
}

export interface KanbanArtifactData {
  title: string
  columns: Array<{
    title: string
    cards: Array<{ title: string; subtitle: string; tag: string; value: string }>
  }>
}

export interface ReviewArtifactData {
  business: string
  reviewer: string
  rating: number
  date: string
  review: string
  ownerResponse: string
  verified: boolean
}

export interface ActivityFeedArtifactData {
  title: string
  balance: string
  items: Array<{
    time: string
    title: string
    subtitle: string
    amount: string
    direction: "in" | "out" | "neutral"
    category: string
  }>
}

export type PropertyImageSource = string | Blob | File

export interface PropertyListingArtifactData {
  title: string
  location: string
  price: string
  area: string
  pricePerMeter: string
  propertyType: string
  features: string[]
  description: string
  image?: PropertyImageSource
  metrics: Array<{ label: string; value: string }>
}

export type ArtifactData =
  | CalendarArtifactData
  | InvoiceArtifactData
  | ReceiptArtifactData
  | ChartArtifactData
  | PollArtifactData
  | ContractArtifactData
  | CourseSlideArtifactData
  | NotesArtifactData
  | TodoArtifactData
  | SpreadsheetArtifactData
  | DashboardArtifactData
  | CrmContactArtifactData
  | DueDiligenceArtifactData
  | InvestmentMemoArtifactData
  | KanbanArtifactData
  | ReviewArtifactData
  | ActivityFeedArtifactData
  | PropertyListingArtifactData

export interface ArtifactDefinition<T extends ArtifactData = ArtifactData> {
  type: ArtifactType
  label: string
  category: ArtifactCategory
  description: string
  width: number
  height: number
  variants?: ArtifactVariant[]
  defaultVariant?: string
  exampleData: T
}

export interface ArtifactRenderPayload {
  type: ArtifactType
  variant?: string
  /** Stable optional seed for unique, repeatable <line> privacy masks. */
  maskSeed?: string
  data: ArtifactData
}
