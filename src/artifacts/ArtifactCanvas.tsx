import {
  CalendarRenderer,
  ChartRenderer,
  ContractRenderer,
  CourseSlideRenderer,
  IPhoneNotificationRenderer,
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
  TradeResultRenderer,
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
  TradeResultArtifactData,
  TodoArtifactData,
  DashboardArtifactData,
  CrmContactArtifactData,
  DueDiligenceArtifactData,
  IPhoneNotificationArtifactData,
} from "@/artifacts/types"

export const ArtifactCanvas = ({ type, data, variant: variantId, maskSeed, autoHeight = false, minHeight }: { type: ArtifactType; data: ArtifactData; variant?: string; maskSeed?: string; autoHeight?: boolean; minHeight?: number }) => {
  const variant = getArtifactVariant(type, variantId)
  const renderer = (() => {
    switch (type) {
    case "calendar":
      return <CalendarRenderer data={data as CalendarArtifactData} autoHeight={autoHeight} minHeight={minHeight} />
    case "invoice":
      return <InvoiceRenderer data={data as InvoiceArtifactData} autoHeight={autoHeight} minHeight={minHeight} />
    case "receipt":
      return <ReceiptRenderer data={data as ReceiptArtifactData} autoHeight={autoHeight} minHeight={minHeight} />
    case "chart":
      return <ChartRenderer data={data as ChartArtifactData} autoHeight={autoHeight} minHeight={minHeight} />
    case "poll":
      return <PollRenderer data={data as PollArtifactData} autoHeight={autoHeight} minHeight={minHeight} />
    case "contract":
      return <ContractRenderer data={data as ContractArtifactData} autoHeight={autoHeight} minHeight={minHeight} />
    case "course-slide":
      return <CourseSlideRenderer data={data as CourseSlideArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "iphone-notification":
      return <IPhoneNotificationRenderer data={data as IPhoneNotificationArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "notes":
      return <NotesRenderer data={data as NotesArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "todo":
      return <TodoRenderer data={data as TodoArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "spreadsheet":
      return <SpreadsheetRenderer data={data as SpreadsheetArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "dashboard":
      return <DashboardRenderer data={data as DashboardArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "crm-contact":
      return <CrmContactRenderer data={data as CrmContactArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "due-diligence":
      return <DueDiligenceRenderer data={data as DueDiligenceArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "investment-memo":
      return <InvestmentMemoRenderer data={data as InvestmentMemoArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "kanban":
      return <KanbanRenderer data={data as KanbanArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "review":
      return <ReviewRenderer data={data as ReviewArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "activity-feed":
      return <ActivityFeedRenderer data={data as ActivityFeedArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "property-listing":
      return <PropertyListingRenderer data={data as PropertyListingArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    case "trade-result":
      return <TradeResultRenderer data={data as TradeResultArtifactData} variant={variant} autoHeight={autoHeight} minHeight={minHeight} />
    }
  })()

  return (
    <PrivacyMaskProvider seed={maskSeed || `${type}:${variant.id}`} color={getPrivacyMaskColor(data) || variant.tokens.accent}>
      {renderer}
    </PrivacyMaskProvider>
  )
}
