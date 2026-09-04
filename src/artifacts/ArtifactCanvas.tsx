import {
  CalendarRenderer,
  ChartRenderer,
  ContractRenderer,
  CourseSlideRenderer,
  InvoiceRenderer,
  PollRenderer,
  ReceiptRenderer,
} from "@/artifacts/ArtifactRenderers"
import {
  ActivityFeedRenderer,
  CrmContactRenderer,
  DashboardRenderer,
  DueDiligenceRenderer,
  InvestmentMemoRenderer,
  KanbanRenderer,
  NotesRenderer,
  PropertyListingRenderer,
  ReviewRenderer,
  SpreadsheetRenderer,
  TodoRenderer,
} from "@/artifacts/VisualTemplateRenderers"
import { getArtifactVariant } from "@/artifacts/visualVariants"
import { PrivacyMaskProvider } from "@/artifacts/PrivacyMask"
import { getPrivacyMaskColor } from "@/artifacts/privacyMaskUtils"
import type {
  ActivityFeedArtifactData,
  ArtifactData,
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

export const ArtifactCanvas = ({ type, data, variant: variantId, maskSeed }: { type: ArtifactType; data: ArtifactData; variant?: string; maskSeed?: string }) => {
  const variant = getArtifactVariant(type, variantId)
  const renderer = (() => {
    switch (type) {
    case "calendar":
      return <CalendarRenderer data={data as CalendarArtifactData} />
    case "invoice":
      return <InvoiceRenderer data={data as InvoiceArtifactData} />
    case "receipt":
      return <ReceiptRenderer data={data as ReceiptArtifactData} />
    case "chart":
      return <ChartRenderer data={data as ChartArtifactData} />
    case "poll":
      return <PollRenderer data={data as PollArtifactData} />
    case "contract":
      return <ContractRenderer data={data as ContractArtifactData} />
    case "course-slide":
      return <CourseSlideRenderer data={data as CourseSlideArtifactData} />
    case "notes":
      return <NotesRenderer data={data as NotesArtifactData} variant={variant} />
    case "todo":
      return <TodoRenderer data={data as TodoArtifactData} variant={variant} />
    case "spreadsheet":
      return <SpreadsheetRenderer data={data as SpreadsheetArtifactData} variant={variant} />
    case "dashboard":
      return <DashboardRenderer data={data as DashboardArtifactData} variant={variant} />
    case "crm-contact":
      return <CrmContactRenderer data={data as CrmContactArtifactData} variant={variant} />
    case "due-diligence":
      return <DueDiligenceRenderer data={data as DueDiligenceArtifactData} variant={variant} />
    case "investment-memo":
      return <InvestmentMemoRenderer data={data as InvestmentMemoArtifactData} variant={variant} />
    case "kanban":
      return <KanbanRenderer data={data as KanbanArtifactData} variant={variant} />
    case "review":
      return <ReviewRenderer data={data as ReviewArtifactData} variant={variant} />
    case "activity-feed":
      return <ActivityFeedRenderer data={data as ActivityFeedArtifactData} variant={variant} />
    case "property-listing":
      return <PropertyListingRenderer data={data as PropertyListingArtifactData} variant={variant} />
    }
  })()

  return (
    <PrivacyMaskProvider seed={maskSeed || `${type}:${variant.id}`} color={getPrivacyMaskColor(data) || variant.tokens.accent}>
      {renderer}
    </PrivacyMaskProvider>
  )
}
