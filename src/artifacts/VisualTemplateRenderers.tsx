import { useEffect, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import type {
  ActivityFeedArtifactData,
  ArtifactVariant,
  CrmContactArtifactData,
  DashboardArtifactData,
  DueDiligenceArtifactData,
  InvestmentMemoArtifactData,
  KanbanArtifactData,
  MiniChartData,
  NotesArtifactData,
  PropertyImageSource,
  PropertyListingArtifactData,
  ReviewArtifactData,
  SpreadsheetArtifactData,
  TradeResultArtifactData,
  TodoArtifactData,
} from "@/artifacts/types";
import { PrivacyText } from "@/artifacts/PrivacyMask";
import propertyListingPreview from "@/assets/property-listing-preview.webp";

type TemplateProps<T> = {
  data: T;
  variant: ArtifactVariant;
  autoHeight?: boolean;
  minHeight?: number;
};

const shadowFor = (value: ArtifactVariant["tokens"]["shadow"]) =>
  value === "elevated"
    ? "0 24px 64px rgb(15 23 42 / 0.18)"
    : value === "subtle"
      ? "0 8px 24px rgb(15 23 42 / 0.08)"
      : "none";

const Frame = ({
  children,
  variant,
  autoHeight = false,
  minHeight,
}: {
  children: React.ReactNode;
  variant: ArtifactVariant;
  autoHeight?: boolean;
  minHeight?: number;
}) => {
  const tokens = variant.tokens;
  return (
    <div
      data-xcs-artifact-content={autoHeight ? "true" : undefined}
      className={`${autoHeight ? "" : "h-full"} w-full overflow-hidden`}
      style={{
        background: tokens.background,
        color: tokens.text,
        fontFamily: tokens.fontBody,
        ...(autoHeight && minHeight ? { minHeight } : {}),
      }}
    >
      {children}
    </div>
  );
};

const Surface = ({
  children,
  variant,
  className = "",
}: {
  children: React.ReactNode;
  variant: ArtifactVariant;
  className?: string;
}) => (
  <div
    className={className}
    style={{
      background: variant.tokens.surface,
      border: `1px solid ${variant.tokens.border}`,
      borderRadius: variant.tokens.borderRadius,
      boxShadow: shadowFor(variant.tokens.shadow),
    }}
  >
    {children}
  </div>
);

const Label = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: ArtifactVariant;
}) => (
  <div
    className="text-[19px] font-bold uppercase tracking-[0.16em]"
    style={{ color: variant.tokens.textMuted }}
  >
    {children}
  </div>
);

const Value = ({
  children,
  variant,
  className = "",
}: {
  children: React.ReactNode;
  variant: ArtifactVariant;
  className?: string;
}) => (
  <div
    className={`font-bold tabular-nums ${className}`}
    style={{ color: variant.tokens.text, fontFamily: variant.tokens.fontMono }}
  >
    {children}
  </div>
);

const formatNumber = (value: string | number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("pl-PL").format(value)
    : value;

const formatCell = (
  value: string | number,
  format?: "text" | "currency" | "percentage",
) => {
  if (format === "currency" && typeof value === "number")
    return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value)} zł`;
  if (format === "percentage" && typeof value === "number")
    return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(value < 1 ? value * 100 : value)}%`;
  return formatNumber(value);
};

const MiniChart = ({
  data,
  variant,
  compact = false,
}: {
  data?: MiniChartData;
  variant: ArtifactVariant;
  compact?: boolean;
}) => {
  if (!data?.values.length) return null;
  const max = Math.max(...data.values, 1);
  return (
    <div
      className={`flex items-end border-b ${compact ? "h-28 gap-2 pt-2" : "h-44 gap-3 pt-4"}`}
      style={{ borderColor: variant.tokens.border }}
    >
      {data.values.map((value, index) => (
        <div
          key={`${data.labels[index]}-${value}`}
          className="flex h-full flex-1 flex-col justify-end gap-2"
        >
          <div
            className={`text-center font-semibold tabular-nums ${compact ? "text-[15px]" : "text-[18px]"}`}
            style={{ color: variant.tokens.textMuted }}
          >
            {formatNumber(value)}
          </div>
          <div
            className="min-h-2 rounded-t-sm"
            style={{
              height: `${Math.max(8, (value / max) * 100)}%`,
              background: variant.tokens.accent,
            }}
          />
          <div
            className={`truncate text-center ${compact ? "mb-[-22px] text-[13px]" : "mb-[-28px] text-[16px]"}`}
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.labels[index]} />
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusPill = ({
  label,
  tone,
  variant,
}: {
  label: string;
  tone: "positive" | "negative" | "warning" | "neutral";
  variant: ArtifactVariant;
}) => {
  const color =
    tone === "positive"
      ? variant.tokens.positive
      : tone === "negative"
        ? variant.tokens.negative
        : tone === "warning"
          ? variant.tokens.warning
          : variant.tokens.textMuted;
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-[17px] font-bold uppercase tracking-wide"
      style={{ color, background: `${color}1c` }}
    >
      <PrivacyText value={label} />
    </span>
  );
};

export const NotesRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<NotesArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col p-16`}
      >
        <div className="flex items-start justify-between gap-8">
          <Label variant={variant}>Private note</Label>
          <div
            className="shrink-0 text-[22px]"
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.date} />
          </div>
        </div>
        <h1
          className="mt-9 max-w-4xl text-[62px] font-bold leading-[1.04] tracking-tight"
          style={{ fontFamily: variant.tokens.fontHeading }}
        >
          <PrivacyText value={data.title} />
        </h1>
        <div
          className="mt-9 h-px"
          style={{ background: variant.tokens.accent }}
        />
        <p
          className={`mt-10 ${autoHeight ? "" : "flex-1"} whitespace-pre-wrap text-[32px] leading-[1.58]`}
          style={{ color: variant.tokens.text }}
        >
          <PrivacyText value={data.body} />
        </p>
        <div
          className="flex flex-wrap gap-3 border-t pt-8"
          style={{ borderColor: variant.tokens.border }}
        >
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-4 py-2 text-[19px] font-semibold"
              style={{
                background: variant.tokens.surfaceSecondary,
                color: variant.tokens.accent,
              }}
            >
              #<PrivacyText value={tag} />
            </span>
          ))}
        </div>
      </Surface>
    </div>
  </Frame>
);

export const TodoRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<TodoArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col p-14`}
      >
        <div
          className="flex items-end justify-between border-b pb-9"
          style={{ borderColor: variant.tokens.border }}
        >
          <div>
            <Label variant={variant}>Plan dnia</Label>
            <h1
              className="mt-3 text-[58px] font-bold tracking-tight"
              style={{ fontFamily: variant.tokens.fontHeading }}
            >
              <PrivacyText value={data.title} />
            </h1>
          </div>
          <div
            className="text-[23px]"
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.date} />
          </div>
        </div>
        <div
          className={autoHeight ? "mt-8 space-y-3" : "mt-8 flex-1 space-y-3"}
        >
          {data.tasks.map((task, index) => (
            <div
              key={`${task.text}-${index}`}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-5 border-b py-5"
              style={{ borderColor: variant.tokens.border }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center border-2"
                style={{
                  borderColor: task.completed
                    ? variant.tokens.positive
                    : variant.tokens.accent,
                  borderRadius: variant.tokens.borderRadius,
                  background: task.completed
                    ? variant.tokens.positive
                    : "transparent",
                  color: "white",
                }}
              >
                {task.completed ? (
                  <Check className="h-6 w-6" strokeWidth={3} />
                ) : null}
              </div>
              <div className="min-w-0">
                <div
                  className={`truncate text-[29px] font-semibold ${task.completed ? "line-through opacity-50" : ""}`}
                >
                  <PrivacyText value={task.text} />
                </div>
                {task.tag ? (
                  <div className="mt-2">
                    <StatusPill
                      label={task.tag}
                      tone={task.priority === "high" ? "warning" : "neutral"}
                      variant={variant}
                    />
                  </div>
                ) : null}
              </div>
              <div
                className="text-right text-[20px] tabular-nums"
                style={{ color: variant.tokens.textMuted }}
              >
                <PrivacyText value={task.time || "—"} />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  </Frame>
);

export const SpreadsheetRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<SpreadsheetArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col ${autoHeight ? "" : "overflow-hidden"} p-12`}
      >
        <div
          className="border-b pb-8"
          style={{ borderColor: variant.tokens.border }}
        >
          <Label variant={variant}>P&amp;L / raport</Label>
          <h1
            className="mt-3 text-[56px] font-bold"
            style={{ fontFamily: variant.tokens.fontHeading }}
          >
            <PrivacyText value={data.title} />
          </h1>
          {data.subtitle ? (
            <p
              className="mt-2 text-[25px]"
              style={{ color: variant.tokens.textMuted }}
            >
              <PrivacyText value={data.subtitle} />
            </p>
          ) : null}
        </div>
        <div className={autoHeight ? "mt-9" : "mt-9 flex-1 overflow-hidden"}>
          <table className="w-full table-fixed border-collapse text-[23px]">
            <thead style={{ background: variant.tokens.surfaceSecondary }}>
              <tr>
                <th className="w-[34%] px-4 py-4 text-left font-bold">
                  Pozycja
                </th>
                {data.columns.map((column) => (
                  <th
                    key={column.label}
                    className="px-3 py-4 text-right font-bold"
                    style={{ color: variant.tokens.textMuted }}
                  >
                    <PrivacyText value={column.label} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr
                  key={row.label}
                  style={{
                    borderBottom: `1px solid ${variant.tokens.border}`,
                    fontWeight: row.total ? 700 : 500,
                  }}
                >
                  <td className="truncate px-4 py-5">
                    <PrivacyText value={row.label} />
                  </td>
                  {row.values.map((value, index) => {
                    const format = data.columns[index]?.format;
                    const color =
                      row.tone === "positive"
                        ? variant.tokens.positive
                        : row.tone === "negative"
                          ? variant.tokens.negative
                          : variant.tokens.text;
                    return (
                      <td
                        key={`${row.label}-${index}`}
                        className="px-3 py-5 text-right tabular-nums"
                        style={{ color, fontFamily: variant.tokens.fontMono }}
                      >
                        <PrivacyText value={formatCell(value, format)} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-5">
          {data.summary.map((item) => (
            <div
              key={item.label}
              className="border-t pt-4"
              style={{ borderColor: variant.tokens.accent }}
            >
              <Label variant={variant}>
                <PrivacyText value={item.label} />
              </Label>
              <Value variant={variant} className="mt-2 text-[31px]">
                <PrivacyText value={formatCell(item.value, item.format)} />
              </Value>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  </Frame>
);

export const DashboardRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<DashboardArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className="h-full p-16">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div>
            <Label variant={variant}>KPI dashboard</Label>
            <h1
              className="mt-3 text-[60px] font-bold tracking-tight"
              style={{ fontFamily: variant.tokens.fontHeading }}
            >
              <PrivacyText value={data.title} />
            </h1>
          </div>
          <div
            className="text-[23px]"
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.period} />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6">
          {data.metrics.slice(0, 4).map((metric) => {
            const positive =
              metric.trend === "up" ? metric.change >= 0 : metric.change < 0;
            return (
              <Surface key={metric.label} variant={variant} className="p-8">
                <Label variant={variant}>
                  <PrivacyText value={metric.label} />
                </Label>
                <Value
                  variant={variant}
                  className="mt-5 text-[53px] leading-none"
                >
                  <PrivacyText value={formatNumber(metric.value)} />
                </Value>
                <div
                  className="mt-5 text-[21px] font-semibold"
                  style={{
                    color:
                      metric.trend === "flat"
                        ? variant.tokens.textMuted
                        : positive
                          ? variant.tokens.positive
                          : variant.tokens.negative,
                  }}
                >
                  {metric.trend === "up"
                    ? "↑"
                    : metric.trend === "down"
                      ? "↓"
                      : "•"}{" "}
                  {Math.abs(metric.change).toFixed(1)}% vs poprzedni okres
                </div>
              </Surface>
            );
          })}
        </div>
        <Surface variant={variant} className="mt-7 flex-1 p-9">
          <div className="flex items-center justify-between">
            <div className="text-[30px] font-bold">Trend operacyjny</div>
            <StatusPill label="Live" tone="positive" variant={variant} />
          </div>
          <MiniChart data={data.chart} variant={variant} />
        </Surface>
      </div>
    </div>
  </Frame>
);

export const CrmContactRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<CrmContactArtifactData>) => {
  const initials = data.name
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
      <div className={`${autoHeight ? "" : "h-full"} p-16`}>
        <Surface
          variant={variant}
          className={`flex ${autoHeight ? "" : "h-full"} flex-col p-12`}
        >
          <div
            className="flex gap-7 border-b pb-8"
            style={{ borderColor: variant.tokens.border }}
          >
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-[35px] font-bold text-white"
              style={{ background: variant.tokens.accent }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <Label variant={variant}>Relationship</Label>
              <h1
                className="truncate text-[55px] font-bold"
                style={{ fontFamily: variant.tokens.fontHeading }}
              >
                <PrivacyText value={data.name} />
              </h1>
              <p
                className="mt-1 text-[25px]"
                style={{ color: variant.tokens.textMuted }}
              >
                <PrivacyText value={data.role} /> ·{" "}
                <PrivacyText value={data.company} />
              </p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-4 py-2 text-[18px] font-bold"
                style={{
                  background: variant.tokens.surfaceSecondary,
                  color: variant.tokens.accent,
                }}
              >
                <PrivacyText value={tag} />
              </span>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5 text-[22px]">
            <div className="flex items-center gap-3">
              <Phone
                className="h-5 w-5"
                style={{ color: variant.tokens.accent }}
              />
              <PrivacyText value={data.phone || "Brak telefonu"} />
            </div>
            <div className="flex items-center gap-3 truncate">
              <Mail
                className="h-5 w-5"
                style={{ color: variant.tokens.accent }}
              />
              <PrivacyText value={data.email || "Brak e-maila"} />
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6">
            {data.metrics.map((metric) => (
              <div
                key={metric.label}
                className="border-t pt-4"
                style={{ borderColor: variant.tokens.border }}
              >
                <Label variant={variant}>
                  <PrivacyText value={metric.label} />
                </Label>
                <Value variant={variant} className="mt-2 text-[30px]">
                  <PrivacyText value={metric.value} />
                </Value>
              </div>
            ))}
          </div>
          <div className="mt-9 space-y-6 text-[25px]">
            <div>
              <Label variant={variant}>Last contact</Label>
              <p className="mt-2 font-semibold">
                <PrivacyText value={data.lastContact} />
              </p>
            </div>
            <div>
              <Label variant={variant}>Next move</Label>
              <p
                className="mt-2 font-semibold"
                style={{ color: variant.tokens.accent }}
              >
                <PrivacyText value={data.nextAction} />
              </p>
            </div>
            <div>
              <Label variant={variant}>Notes</Label>
              <p
                className="mt-2 leading-relaxed"
                style={{ color: variant.tokens.textMuted }}
              >
                <PrivacyText value={data.notes} />
              </p>
            </div>
          </div>
        </Surface>
      </div>
    </Frame>
  );
};

const diligenceTone = (
  status: string,
): "positive" | "negative" | "warning" | "neutral" =>
  status === "passed"
    ? "positive"
    : status === "failed"
      ? "negative"
      : status === "warning"
        ? "warning"
        : "neutral";

export const DueDiligenceRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<DueDiligenceArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col p-12`}
      >
        <div
          className="flex items-end justify-between border-b pb-8"
          style={{ borderColor: variant.tokens.border }}
        >
          <div>
            <Label variant={variant}>Due diligence</Label>
            <h1
              className="mt-3 text-[55px] font-bold"
              style={{ fontFamily: variant.tokens.fontHeading }}
            >
              <PrivacyText value={data.target} />
            </h1>
          </div>
          <StatusPill label={data.status} tone="warning" variant={variant} />
        </div>
        <div
          className={
            autoHeight
              ? "mt-8 space-y-7"
              : "mt-8 flex-1 space-y-7 overflow-hidden"
          }
        >
          {data.sections.map((section, sectionIndex) => (
            <section key={section.title}>
              <div className="mb-3 text-[27px] font-bold">
                <span className="mr-3" style={{ color: variant.tokens.accent }}>
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <PrivacyText value={section.title} />
              </div>
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[1fr_auto] gap-4 border-t py-4"
                  style={{ borderColor: variant.tokens.border }}
                >
                  <div>
                    <div className="text-[25px] font-semibold">
                      <PrivacyText value={item.label} />
                    </div>
                    {item.note ? (
                      <div
                        className="mt-1 text-[20px]"
                        style={{ color: variant.tokens.textMuted }}
                      >
                        <PrivacyText value={item.note} />
                      </div>
                    ) : null}
                  </div>
                  <StatusPill
                    label={item.status === "warning" ? "Review" : item.status}
                    tone={diligenceTone(item.status)}
                    variant={variant}
                  />
                </div>
              ))}
            </section>
          ))}
        </div>
      </Surface>
    </div>
  </Frame>
);

export const InvestmentMemoRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<InvestmentMemoArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col p-10`}
      >
        <div
          className="border-b pb-6"
          style={{ borderColor: variant.tokens.accent }}
        >
          <Label variant={variant}>
            Investment memo · <PrivacyText value={data.date} />
          </Label>
          <h1
            className="mt-2 text-[52px] font-bold"
            style={{ fontFamily: variant.tokens.fontHeading }}
          >
            <PrivacyText value={data.target} />
          </h1>
          <p
            className="mt-2 text-[22px]"
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.subtitle} />
          </p>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-4">
          {data.metrics.slice(0, 4).map((metric) => (
            <div
              key={metric.label}
              className="border-t pt-3"
              style={{ borderColor: variant.tokens.border }}
            >
              <Label variant={variant}>
                <PrivacyText value={metric.label} />
              </Label>
              <Value variant={variant} className="mt-1 text-[22px]">
                <PrivacyText value={metric.value} />
              </Value>
            </div>
          ))}
        </div>
        <section className="mt-6">
          <Label variant={variant}>Thesis</Label>
          <p className="mt-2 text-[24px] leading-relaxed">
            <PrivacyText value={data.thesis} />
          </p>
        </section>
        <MiniChart data={data.chart} variant={variant} compact />
        <div className="mt-7 grid grid-cols-2 gap-8">
          <section>
            <Label variant={variant}>Upside</Label>
            <ul className="mt-3 space-y-2 text-[19px]">
              {data.pros.map((item) => (
                <li key={item} className="flex gap-3">
                  <span style={{ color: variant.tokens.positive }}>+</span>
                  <span>
                    <PrivacyText value={item} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <Label variant={variant}>Risks</Label>
            <ul className="mt-3 space-y-2 text-[19px]">
              {data.risks.map((item) => (
                <li key={item} className="flex gap-3">
                  <span style={{ color: variant.tokens.negative }}>–</span>
                  <span>
                    <PrivacyText value={item} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div
          className={`${autoHeight ? "mt-8" : "mt-auto"} border-t pt-4`}
          style={{ borderColor: variant.tokens.border }}
        >
          <Label variant={variant}>Recommendation</Label>
          <p
            className="mt-1 text-[24px] font-bold leading-tight"
            style={{ color: variant.tokens.accent }}
          >
            <PrivacyText value={data.recommendation} />
          </p>
        </div>
      </Surface>
    </div>
  </Frame>
);

export const KanbanRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<KanbanArtifactData>) => {
  const columns = data.columns.slice(0, 4);
  const columnCount = Math.max(1, columns.length);
  return (
    <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
      <div className={`${autoHeight ? "" : "h-full"} p-16`}>
        <div className={`flex ${autoHeight ? "" : "h-full"} flex-col`}>
          <div className="flex items-end justify-between">
            <div>
              <Label variant={variant}>Pipeline</Label>
              <h1
                className="mt-2 text-[55px] font-bold"
                style={{ fontFamily: variant.tokens.fontHeading }}
              >
                <PrivacyText value={data.title} />
              </h1>
            </div>
            <div
              className="text-[21px]"
              style={{ color: variant.tokens.textMuted }}
            >
              {data.columns.reduce(
                (sum, column) => sum + column.cards.length,
                0,
              )}{" "}
              aktywnych spraw
            </div>
          </div>
          <div
            className={`mt-9 grid ${autoHeight ? "" : "flex-1 overflow-hidden"} gap-4`}
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((column) => (
              <div
                key={column.title}
                className="min-w-0 rounded-xl p-4"
                style={{
                  minHeight: autoHeight ? 320 : undefined,
                  background: variant.tokens.surfaceSecondary,
                  border: `1px solid ${variant.tokens.border}`,
                  borderRadius: variant.tokens.borderRadius,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-[20px] font-bold uppercase tracking-wide">
                    <PrivacyText value={column.title} />
                  </div>
                  <div
                    className="rounded-full px-2 py-1 text-[16px]"
                    style={{
                      background: variant.tokens.surface,
                      color: variant.tokens.textMuted,
                    }}
                  >
                    {column.cards.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {column.cards.map((card) => (
                    <Surface key={card.title} variant={variant} className="p-4">
                      <div className="line-clamp-2 text-[22px] font-bold leading-tight">
                        <PrivacyText value={card.title} />
                      </div>
                      <div
                        className="mt-2 line-clamp-2 text-[18px]"
                        style={{ color: variant.tokens.textMuted }}
                      >
                        <PrivacyText value={card.subtitle} />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span
                          className="truncate text-[16px] font-bold uppercase"
                          style={{ color: variant.tokens.accent }}
                        >
                          <PrivacyText value={card.tag} />
                        </span>
                        <span
                          className="text-[17px] tabular-nums"
                          style={{ fontFamily: variant.tokens.fontMono }}
                        >
                          <PrivacyText value={card.value} />
                        </span>
                      </div>
                    </Surface>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
};

export const ReviewRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<ReviewArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col p-12`}
      >
        <div
          className="flex items-start justify-between border-b pb-8"
          style={{ borderColor: variant.tokens.border }}
        >
          <div>
            <Label variant={variant}>Customer review</Label>
            <h1
              className="mt-3 text-[52px] font-bold"
              style={{ fontFamily: variant.tokens.fontHeading }}
            >
              <PrivacyText value={data.business} />
            </h1>
          </div>
          <div className="text-right">
            <div
              className="text-[44px] leading-none"
              style={{ color: variant.tokens.warning }}
            >
              {"★".repeat(Math.max(0, Math.min(5, data.rating)))}
            </div>
            <div
              className="mt-2 text-[20px]"
              style={{ color: variant.tokens.textMuted }}
            >
              {data.rating}/5
            </div>
          </div>
        </div>
        <div className="mt-9 flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-[21px] font-bold text-white"
            style={{ background: variant.tokens.accent }}
          >
            {data.reviewer
              .replace(/<[^>]+>/g, "")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div>
            <div className="text-[25px] font-bold">
              <PrivacyText value={data.reviewer} />{" "}
              {data.verified ? (
                <ShieldCheck
                  className="ml-1 inline h-5 w-5"
                  style={{ color: variant.tokens.accent }}
                />
              ) : null}
            </div>
            <div
              className="text-[20px]"
              style={{ color: variant.tokens.textMuted }}
            >
              <PrivacyText value={data.date} />
            </div>
          </div>
        </div>
        <p className="mt-8 text-[31px] leading-relaxed">
          “<PrivacyText value={data.review} />”
        </p>
        <div
          className={`${autoHeight ? "mt-8" : "mt-auto"} p-7`}
          style={{
            background: variant.tokens.surfaceSecondary,
            borderRadius: variant.tokens.borderRadius,
          }}
        >
          <Label variant={variant}>Odpowiedź właściciela · Czarek</Label>
          <p
            className="mt-3 text-[25px] leading-relaxed"
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.ownerResponse} />
          </p>
        </div>
      </Surface>
    </div>
  </Frame>
);

export const ActivityFeedRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<ActivityFeedArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col p-11`}
      >
        <div
          className="border-b pb-8"
          style={{ borderColor: variant.tokens.border }}
        >
          <Label variant={variant}>
            <PrivacyText value={data.title} />
          </Label>
          <Value variant={variant} className="mt-4 text-[66px]">
            <PrivacyText value={data.balance} />
          </Value>
        </div>
        <div
          className={autoHeight ? "mt-6 divide-y" : "mt-6 flex-1 divide-y"}
          style={{ borderColor: variant.tokens.border }}
        >
          {data.items.map((item) => {
            const color =
              item.direction === "in"
                ? variant.tokens.positive
                : item.direction === "out"
                  ? variant.tokens.negative
                  : variant.tokens.textMuted;
            return (
              <div
                key={`${item.time}-${item.title}`}
                className="grid grid-cols-[58px_1fr_auto] items-center gap-5 py-5"
              >
                <div
                  className="text-[19px] tabular-nums"
                  style={{ color: variant.tokens.textMuted }}
                >
                  <PrivacyText value={item.time} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[26px] font-bold">
                    <PrivacyText value={item.title} />
                  </div>
                  <div
                    className="mt-1 truncate text-[19px]"
                    style={{ color: variant.tokens.textMuted }}
                  >
                    <PrivacyText value={item.subtitle} /> ·{" "}
                    <PrivacyText value={item.category} />
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 text-[25px] font-bold tabular-nums"
                  style={{ color, fontFamily: variant.tokens.fontMono }}
                >
                  {item.direction === "in" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : item.direction === "out" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : null}
                  <PrivacyText value={item.amount} />
                </div>
              </div>
            );
          })}
        </div>
      </Surface>
    </div>
  </Frame>
);

const tradeNumber = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatTradeMoney = (value: number, signed = false) =>
  `${value < 0 ? "−" : signed ? "+" : ""}${tradeNumber.format(Math.abs(value))} PLN`;

const formatTradePercent = (
  value: number,
  outcome: TradeResultArtifactData["outcome"],
) => {
  const absolute = tradeNumber.format(Math.abs(value));
  return `${outcome === "profit" ? "+" : "−"}${absolute}%`;
};

export const TradeResultRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<TradeResultArtifactData>) => {
  const isProfit = data.outcome === "profit";
  const resultColor = isProfit
    ? variant.tokens.positive
    : variant.tokens.negative;
  const positionLabel = data.position === "short" ? "SHORT" : "SPRZEDAŻ";
  const resultLabel = isProfit ? "ZYSK" : "STRATA";
  const resultPnl = isProfit ? Math.abs(data.pnl) : -Math.abs(data.pnl);
  const progress = Math.min(100, Math.max(18, Math.abs(data.returnPct) * 4));

  return (
    <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
      <div className={`${autoHeight ? "" : "h-full"} p-12`}>
        <Surface
          variant={variant}
          className={`flex ${autoHeight ? "" : "h-full"} flex-col overflow-hidden`}
        >
          <div
            className="flex items-center justify-between border-b px-10 py-7"
            style={{ borderColor: variant.tokens.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-md border"
                style={{ borderColor: variant.tokens.accent }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: variant.tokens.accent }}
                />
              </div>
              <div>
                <div className="text-[20px] font-bold tracking-tight">
                  Wynik transakcji
                </div>
                <div
                  className="text-[16px]"
                  style={{ color: variant.tokens.textMuted }}
                >
                  zamknięta pozycja
                </div>
              </div>
            </div>
            <div
              className="text-[14px] font-bold uppercase tracking-[0.14em]"
              style={{ color: variant.tokens.textMuted }}
            >
              PRO
            </div>
          </div>

          <div className="flex flex-1 flex-col p-10">
            <div className="flex items-end justify-between gap-8">
              <div>
                <Label variant={variant}>Wynik netto</Label>
                <div
                  className="mt-3 text-[76px] font-bold leading-none tracking-[-0.05em] tabular-nums"
                  style={{
                    color: resultColor,
                    fontFamily: variant.tokens.fontMono,
                  }}
                >
                  {formatTradeMoney(resultPnl, true)}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[64px] font-bold leading-none tracking-[-0.05em] tabular-nums"
                  style={{
                    color: resultColor,
                    fontFamily: variant.tokens.fontMono,
                  }}
                >
                  {formatTradePercent(data.returnPct, data.outcome)}
                </div>
                <div
                  className="mt-3 flex items-center justify-end gap-2 text-[18px] font-bold"
                  style={{ color: resultColor }}
                >
                  {isProfit ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                  {resultLabel}
                </div>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-4">
              <div
                className="rounded-md p-5"
                style={{ background: variant.tokens.surfaceSecondary }}
              >
                <Label variant={variant}>Kierunek</Label>
                <div
                  className="mt-3 flex items-center gap-3 text-[27px] font-bold"
                  style={{ color: variant.tokens.text }}
                >
                  {data.position === "short" ? (
                    <TrendingDown
                      className="h-7 w-7"
                      style={{ color: variant.tokens.accent }}
                    />
                  ) : (
                    <ArrowDownRight
                      className="h-7 w-7"
                      style={{ color: variant.tokens.accent }}
                    />
                  )}
                  {positionLabel}
                </div>
              </div>
              <div
                className="rounded-md p-5"
                style={{ background: variant.tokens.surfaceSecondary }}
              >
                <Label variant={variant}>Status</Label>
                <div
                  className="mt-3 flex items-center gap-3 text-[27px] font-bold"
                  style={{ color: resultColor }}
                >
                  <CheckCircle2 className="h-7 w-7" />
                  ZAMKNIĘTA
                </div>
              </div>
            </div>

            <div
              className="mt-9 rounded-md border p-6"
              style={{ borderColor: variant.tokens.border }}
            >
              <div className="flex items-center justify-between">
                <Label variant={variant}>Ruch pozycji</Label>
                <div
                  className="text-[16px] font-semibold"
                  style={{ color: resultColor }}
                >
                  {isProfit ? "powyżej planu" : "poniżej planu"}
                </div>
              </div>
              <div className="relative mt-6 h-8">
                <div
                  className="absolute left-0 right-0 top-3 h-2 rounded-full"
                  style={{ background: variant.tokens.surfaceSecondary }}
                />
                <div
                  className="absolute left-0 top-3 h-2 rounded-full"
                  style={{ width: `${progress}%`, background: resultColor }}
                />
                <div
                  className="absolute left-0 top-0 h-8 w-8 rounded-full border-4"
                  style={{
                    borderColor: variant.tokens.surface,
                    background: variant.tokens.textMuted,
                  }}
                />
                <div
                  className="absolute top-0 h-8 w-8 rounded-full border-4"
                  style={{
                    left: `calc(${progress}% - 16px)`,
                    borderColor: variant.tokens.surface,
                    background: resultColor,
                  }}
                />
              </div>
              <div
                className="mt-3 flex justify-between text-[16px] font-semibold"
                style={{ color: variant.tokens.textMuted }}
              >
                <span>wejście</span>
                <span>wyjście</span>
              </div>
            </div>

            <div
              className="mt-8 grid grid-cols-3 gap-4 border-y py-6"
              style={{ borderColor: variant.tokens.border }}
            >
              <div>
                <Label variant={variant}>Cena wejścia</Label>
                <Value variant={variant} className="mt-2 text-[25px]">
                  <PrivacyText value={tradeNumber.format(data.entryPrice)} />
                </Value>
              </div>
              <div>
                <Label variant={variant}>Cena wyjścia</Label>
                <Value variant={variant} className="mt-2 text-[25px]">
                  <PrivacyText value={tradeNumber.format(data.exitPrice)} />
                </Value>
              </div>
              <div>
                <Label variant={variant}>Czas trwania</Label>
                <Value variant={variant} className="mt-2 text-[25px]">
                  <PrivacyText value={data.duration} />
                </Value>
              </div>
            </div>

            <div
              className={`${autoHeight ? "mt-7" : "mt-auto"} grid grid-cols-3 gap-4 text-[18px]`}
            >
              <div>
                <Label variant={variant}>Zamknięto</Label>
                <div className="mt-2 font-semibold">
                  <PrivacyText value={data.closedAt} />
                </div>
              </div>
              <div>
                <Label variant={variant}>Opłaty</Label>
                <div
                  className="mt-2 font-semibold tabular-nums"
                  style={{ fontFamily: variant.tokens.fontMono }}
                >
                  {data.fees === undefined ? "—" : formatTradeMoney(data.fees)}
                </div>
              </div>
              <div>
                <Label variant={variant}>R:R</Label>
                <div
                  className="mt-2 font-semibold tabular-nums"
                  style={{ fontFamily: variant.tokens.fontMono }}
                >
                  <PrivacyText value={data.riskReward || "—"} />
                </div>
              </div>
            </div>

            <div
              className="mt-8 flex items-center justify-end border-t pt-5 text-[15px]"
              style={{
                borderColor: variant.tokens.border,
                color: variant.tokens.textMuted,
              }}
            >
              <span className="font-semibold uppercase tracking-[0.08em]">
                wynik zamkniętej pozycji
              </span>
            </div>
          </div>
        </Surface>
      </div>
    </Frame>
  );
};

const PropertyImage = ({
  source,
  className = "h-full w-full object-cover",
}: {
  source?: PropertyImageSource;
  className?: string;
}) => {
  const url = useMemo(
    () =>
      typeof source === "string"
        ? source
        : source
          ? URL.createObjectURL(source)
          : "",
    [source],
  );
  useEffect(() => {
    if (typeof source !== "string" && url)
      return () => URL.revokeObjectURL(url);
  }, [source, url]);
  return (
    <img
      src={url || propertyListingPreview}
      alt="Nieruchomość"
      className={className}
    />
  );
};

export const PropertyListingRenderer = ({
  data,
  variant,
  autoHeight,
  minHeight,
}: TemplateProps<PropertyListingArtifactData>) => (
  <Frame variant={variant} autoHeight={autoHeight} minHeight={minHeight}>
    <div className={`${autoHeight ? "" : "h-full"} p-16`}>
      <Surface
        variant={variant}
        className={`flex ${autoHeight ? "" : "h-full"} flex-col overflow-hidden`}
      >
        <div className="relative min-h-[470px] shrink-0 overflow-hidden text-white">
          <PropertyImage
            source={data.image}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgb(7 15 29 / 0.9) 0%, rgb(7 15 29 / 0.7) 48%, rgb(7 15 29 / 0.38) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full min-h-[470px] flex-col justify-end p-10">
            <div className="flex items-end justify-between gap-8">
              <div className="min-w-0">
                <div className="text-[19px] font-bold uppercase tracking-[0.16em] text-white/75">
                  <PrivacyText value={data.propertyType} />
                </div>
                <h1
                  className="mt-2 line-clamp-2 text-[50px] font-bold leading-tight text-white"
                  style={{ fontFamily: variant.tokens.fontHeading }}
                >
                  <PrivacyText value={data.title} />
                </h1>
                <p className="mt-2 text-[23px] text-white/80">
                  <PrivacyText value={data.location} />
                </p>
              </div>
              <div
                className="shrink-0 text-[35px] font-bold tabular-nums text-white"
                style={{ fontFamily: variant.tokens.fontMono }}
              >
                <PrivacyText value={data.price} />
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {data.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-white/50 bg-black/20 px-4 py-2 text-[18px] font-semibold text-white"
                >
                  <PrivacyText value={feature} />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={`flex ${autoHeight ? "" : "flex-1"} flex-col p-10`}>
          <div
            className="grid grid-cols-3 gap-4 border-y py-6"
            style={{ borderColor: variant.tokens.border }}
          >
            <div>
              <Label variant={variant}>Area</Label>
              <Value variant={variant} className="mt-1 text-[25px]">
                <PrivacyText value={data.area} />
              </Value>
            </div>
            <div>
              <Label variant={variant}>Price / m²</Label>
              <Value variant={variant} className="mt-1 text-[25px]">
                <PrivacyText value={data.pricePerMeter} />
              </Value>
            </div>
            {data.metrics.slice(0, 1).map((metric) => (
              <div key={metric.label}>
                <Label variant={variant}>
                  <PrivacyText value={metric.label} />
                </Label>
                <Value variant={variant} className="mt-1 text-[25px]">
                  <PrivacyText value={metric.value} />
                </Value>
              </div>
            ))}
          </div>
          <p
            className="mt-7 line-clamp-3 text-[23px] leading-relaxed"
            style={{ color: variant.tokens.textMuted }}
          >
            <PrivacyText value={data.description} />
          </p>
          <div
            className={`${autoHeight ? "mt-8" : "mt-auto"} grid grid-cols-3 gap-4 pt-6`}
          >
            {data.metrics.slice(1, 4).map((metric) => (
              <div key={metric.label}>
                <Label variant={variant}>
                  <PrivacyText value={metric.label} />
                </Label>
                <Value variant={variant} className="mt-1 text-[23px]">
                  <PrivacyText value={metric.value} />
                </Value>
              </div>
            ))}
          </div>
        </div>
      </Surface>
    </div>
  </Frame>
);
