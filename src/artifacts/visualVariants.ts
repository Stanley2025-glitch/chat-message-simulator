import type { ArtifactType, ArtifactVariant, ArtifactVariantTokens } from "@/artifacts/types"

const base: ArtifactVariantTokens = {
  background: "#f6f7f8",
  surface: "#ffffff",
  surfaceSecondary: "#f1f3f5",
  text: "#172033",
  textMuted: "#697386",
  accent: "#2762a8",
  accentText: "#ffffff",
  positive: "#218a5b",
  negative: "#c94f4f",
  warning: "#b97817",
  border: "#d9dfe7",
  borderRadius: "14px",
  fontHeading: "Georgia, 'Times New Roman', serif",
  fontBody: "'IBM Plex Sans', Arial, sans-serif",
  fontMono: "'IBM Plex Mono', 'Courier New', monospace",
  density: "comfortable",
  shadow: "subtle",
}

const visual = (id: string, label: string, description: string, tokens: Partial<ArtifactVariantTokens>): ArtifactVariant => ({
  id,
  label,
  description,
  tokens: { ...base, ...tokens },
})

export const visualVariants: Partial<Record<ArtifactType, ArtifactVariant[]>> = {
  "course-slide": [
    visual("midnight", "Midnight", "Mocny granat z bursztynowym akcentem.", { background: "#111827", surface: "#172033", text: "#f8fafc", textMuted: "#cbd5e1", accent: "#facc15", accentText: "#111827", positive: "#34d399", negative: "#d946ef", border: "#ffffff26", borderRadius: "0px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "none" }),
    visual("cobalt", "Cobalt", "Chłodny niebieski z jasnym cyjanem.", { background: "#0b1730", surface: "#122445", text: "#f4f8ff", textMuted: "#b9c9e2", accent: "#7dd3fc", accentText: "#082f49", positive: "#60a5fa", negative: "#a78bfa", border: "#93c5fd3d", borderRadius: "10px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "subtle" }),
    visual("paper", "Paper", "Jasny, editorialny slajd z granatowym akcentem.", { background: "#f4efe6", surface: "#fffdf7", text: "#182334", textMuted: "#536274", accent: "#173b67", accentText: "#ffffff", positive: "#2f855a", negative: "#a3413b", border: "#cbd5e1", borderRadius: "0px", fontHeading: "Georgia, 'Times New Roman', serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "none" }),
    visual("editorial", "Editorial", "Jasny minimalizm z terakotowym markerem.", { background: "#f2f4f7", surface: "#ffffff", text: "#18202b", textMuted: "#566273", accent: "#c2410c", accentText: "#ffffff", positive: "#2f855a", negative: "#b83280", border: "#d7dee7", borderRadius: "8px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "subtle" }),
    visual("forest", "Forest", "Głęboka zieleń z limonkowym światłem.", { background: "#0f211d", surface: "#162d27", text: "#f3faf5", textMuted: "#b7d0c5", accent: "#b8e36a", accentText: "#142112", positive: "#6ee7b7", negative: "#f0abfc", border: "#9fd6ba40", borderRadius: "10px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "none" }),
    visual("plum", "Plum", "Śliwkowy wieczór z różowym akcentem.", { background: "#20142b", surface: "#2c1d3b", text: "#fff7ff", textMuted: "#ddc9e8", accent: "#f3b1e1", accentText: "#341234", positive: "#86efac", negative: "#fb7185", border: "#e5c4e840", borderRadius: "14px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "subtle" }),
  ],
  notes: [
    visual("paper", "Paper", "Warm editorial note.", { background: "#f3efe5", surface: "#fbf8f1", text: "#202020", textMuted: "#79756c", accent: "#b48a4a", border: "#ded7c9", borderRadius: "4px", fontHeading: "Georgia, serif", shadow: "none" }),
    visual("minimal", "Minimal", "Quiet white writing space.", { background: "#ffffff", surface: "#ffffff", surfaceSecondary: "#fafafa", text: "#111111", textMuted: "#8b8b8b", accent: "#111111", border: "#e5e5e5", borderRadius: "0px", shadow: "none" }),
    visual("dark", "Dark", "Modern focused note app.", { background: "#101216", surface: "#181b20", surfaceSecondary: "#22262d", text: "#f4f5f7", textMuted: "#9197a1", accent: "#72a7ff", border: "#2e343d", borderRadius: "18px", fontHeading: "'Space Grotesk', Arial, sans-serif" }),
    visual("executive", "Executive", "Board-level editorial memo.", { background: "#eeede9", surface: "#ffffff", text: "#161616", accent: "#19324d", warning: "#b6925c", border: "#d9d7d1", borderRadius: "4px", fontHeading: "Georgia, serif" }),
  ],
  todo: [
    visual("clean", "Clean", "Crisp modern productivity.", { accent: "#2563eb", borderRadius: "16px", fontHeading: "'Space Grotesk', Arial, sans-serif" }),
    visual("executive", "Executive", "Ivory operating list.", { background: "#f5f0e5", surface: "#fffdf8", text: "#172c42", accent: "#a97d3d", border: "#ddd4c2", borderRadius: "4px", fontHeading: "Georgia, serif", shadow: "none" }),
    visual("dark-productivity", "Dark Productivity", "Night operator workspace.", { background: "#111318", surface: "#1c2027", surfaceSecondary: "#252b34", text: "#f3f5f7", textMuted: "#929baa", accent: "#5288ff", positive: "#4acb87", border: "#303845", borderRadius: "14px", density: "compact" }),
    visual("priority", "Priority", "Dense status-driven worklist.", { background: "#f8fafc", accent: "#7c3aed", warning: "#d97706", borderRadius: "10px", density: "compact", fontMono: "'IBM Plex Mono', monospace" }),
  ],
  spreadsheet: [
    visual("accountant", "Accountant", "Professional accounting report.", { background: "#f8fafc", surface: "#ffffff", surfaceSecondary: "#e9eef5", text: "#172033", accent: "#2762a8", border: "#cdd5df", borderRadius: "2px", shadow: "none" }),
    visual("spreadsheet", "Spreadsheet", "Neutral grid-focused analysis.", { background: "#f6f7f8", surface: "#ffffff", surfaceSecondary: "#f2f4f6", accent: "#2563eb", border: "#cfd6de", borderRadius: "0px", density: "compact", shadow: "none" }),
    visual("executive", "Executive", "Minimal board report.", { background: "#f7f6f2", surface: "#ffffff", text: "#15283b", accent: "#15283b", warning: "#b99a62", border: "#ddd9d0", borderRadius: "4px", fontHeading: "Georgia, serif", shadow: "none" }),
    visual("dark-finance", "Dark Finance", "Low-light financial monitor.", { background: "#0c1118", surface: "#131a23", surfaceSecondary: "#1a2430", text: "#ecf1f7", textMuted: "#9aa8b9", accent: "#5b8cff", positive: "#49c687", negative: "#e56565", border: "#28313d", borderRadius: "6px", density: "compact" }),
  ],
  dashboard: [
    visual("boardroom", "Boardroom", "Professional management report.", { background: "#f5f5f2", surface: "#ffffff", text: "#151515", textMuted: "#747474", accent: "#20374c", borderRadius: "12px" }),
    visual("midnight", "Midnight", "Deep-blue live operations view.", { background: "#0a1019", surface: "#121a26", surfaceSecondary: "#1a2534", text: "#f5f7fa", textMuted: "#8f9aaa", accent: "#5585ff", positive: "#48ca86", border: "#273343", borderRadius: "18px", fontHeading: "'Space Grotesk', Arial, sans-serif" }),
    visual("luxury", "Luxury", "Restrained premium performance view.", { background: "#121212", surface: "#191919", text: "#f5f0e8", textMuted: "#8b867d", accent: "#c3a469", border: "#302e2a", borderRadius: "10px", fontHeading: "Georgia, serif" }),
    visual("operator", "Operator", "Compact high-density control view.", { background: "#eef1f4", surface: "#f9fafb", accent: "#1d4ed8", borderRadius: "8px", density: "compact", fontHeading: "'IBM Plex Sans', Arial, sans-serif" }),
  ],
  "crm-contact": [
    visual("modern-crm", "Modern CRM", "Clear relationship workspace.", { accent: "#2563eb", borderRadius: "16px" }),
    visual("executive-network", "Executive Network", "Investor relationship dossier.", { background: "#1a1c1f", surface: "#24272b", surfaceSecondary: "#2d3035", text: "#f5efe3", textMuted: "#aaa39a", accent: "#c3a469", border: "#393c40", borderRadius: "8px", fontHeading: "Georgia, serif" }),
    visual("rolodex", "Rolodex", "Warm editorial contact card.", { background: "#e9e1d2", surface: "#fffaf0", text: "#2b2925", accent: "#855b37", border: "#cfc0a8", borderRadius: "2px", fontHeading: "Georgia, serif", shadow: "none" }),
  ],
  "due-diligence": [
    visual("deal-team", "Deal Team", "M&A workstream checklist.", { accent: "#183b5b", borderRadius: "6px", shadow: "none" }),
    visual("legal", "Legal", "Formal document review.", { background: "#f5f2eb", surface: "#fffdf8", text: "#202020", accent: "#273c50", border: "#d9d1c5", borderRadius: "0px", fontHeading: "Georgia, serif", shadow: "none" }),
    visual("dark-room", "Dark Room", "Internal deal dashboard.", { background: "#13171c", surface: "#1c2229", surfaceSecondary: "#262d35", text: "#f2f4f6", textMuted: "#a0aab5", accent: "#6d9cff", positive: "#4acb87", negative: "#e76a6a", border: "#343d47", borderRadius: "10px", density: "compact" }),
  ],
  "investment-memo": [
    visual("private-equity", "Private Equity", "Premium investment memo.", { background: "#f5f3ed", surface: "#fffefa", text: "#1a1a1a", accent: "#17324d", border: "#c8d0d8", borderRadius: "0px", fontHeading: "Georgia, serif", shadow: "none" }),
    visual("analyst", "Analyst", "Dense financial analysis.", { background: "#ffffff", surface: "#ffffff", surfaceSecondary: "#f3f5f7", accent: "#2762a8", borderRadius: "4px", density: "compact", shadow: "none" }),
    visual("black-book", "Black Book", "Private capital dossier.", { background: "#111111", surface: "#191919", surfaceSecondary: "#252525", text: "#f5f0e8", textMuted: "#a89f91", accent: "#c3a469", border: "#34312c", borderRadius: "4px", fontHeading: "Georgia, serif" }),
    visual("one-pager", "One-pager", "Fast investment decision view.", { background: "#edf2f7", surface: "#ffffff", accent: "#164e63", borderRadius: "14px", fontHeading: "'Space Grotesk', Arial, sans-serif" }),
  ],
  kanban: [
    visual("modern", "Modern", "Soft deal-flow board.", { background: "#edf0f3", surface: "#ffffff", accent: "#4f46e5", borderRadius: "18px" }),
    visual("dark", "Dark", "Compact midnight board.", { background: "#101419", surface: "#1a2028", surfaceSecondary: "#232b36", text: "#f4f7fa", textMuted: "#a0a9b5", accent: "#7791ff", border: "#303a47", borderRadius: "10px", density: "compact" }),
    visual("deal-flow", "Deal Flow", "Professional transaction pipeline.", { background: "#f7f7f4", surface: "#ffffff", text: "#1a2733", accent: "#1d4c6e", border: "#cfd6da", borderRadius: "4px", density: "compact", shadow: "none" }),
  ],
  review: [
    visual("clean-reviews", "Clean Reviews", "Warm, quiet customer feedback.", { background: "#faf9f6", surface: "#ffffff", accent: "#8b5e24", warning: "#e7a92d", borderRadius: "16px" }),
    visual("marketplace", "Marketplace", "Prominent public rating.", { background: "#eef1f4", surface: "#ffffff", accent: "#2563eb", warning: "#e7a92d", borderRadius: "12px" }),
    visual("dark-review", "Dark Review", "Dark social feedback card.", { background: "#171717", surface: "#222222", surfaceSecondary: "#2b2b2b", text: "#f6f0e5", textMuted: "#aaa39a", accent: "#c3a469", warning: "#e7a92d", border: "#393939", borderRadius: "16px" }),
  ],
  "activity-feed": [
    visual("finance-light", "Finance Light", "Calm financial activity view.", { accent: "#2762a8", borderRadius: "12px" }),
    visual("finance-dark", "Finance Dark", "Dark finance feed.", { background: "#0e1218", surface: "#171d26", surfaceSecondary: "#202834", text: "#f4f6f8", textMuted: "#9aa5b3", accent: "#568af4", positive: "#4acb87", negative: "#e76a6a", border: "#2e3845", borderRadius: "14px" }),
    visual("passive-income", "Passive Income", "Minimal incoming cashflow view.", { background: "#f7f9f7", surface: "#ffffff", accent: "#157a58", positive: "#157a58", borderRadius: "18px", fontHeading: "'Space Grotesk', Arial, sans-serif" }),
    visual("terminal", "Terminal", "Dense operator ledger.", { background: "#10151b", surface: "#151c24", surfaceSecondary: "#1c2630", text: "#dde7f1", textMuted: "#8191a1", accent: "#75a8ff", positive: "#65d39b", negative: "#ef7777", border: "#2d3945", borderRadius: "2px", fontHeading: "'IBM Plex Mono', monospace", fontBody: "'IBM Plex Mono', monospace", density: "compact", shadow: "none" }),
  ],
  "property-listing": [
    visual("marketplace", "Marketplace", "Modern listing card.", { accent: "#2563eb", borderRadius: "18px" }),
    visual("agency", "Agency", "Editorial real-estate brochure.", { background: "#f4f0e8", surface: "#fffdf8", text: "#172c42", accent: "#17324d", border: "#d9d0c1", borderRadius: "3px", fontHeading: "Georgia, serif", shadow: "none" }),
    visual("investor", "Investor", "Data-first property deal view.", { background: "#f3f6f8", surface: "#ffffff", accent: "#1d4e70", borderRadius: "8px", density: "compact", fontMono: "'IBM Plex Mono', monospace" }),
    visual("dark-property", "Dark Property", "Premium commercial listing.", { background: "#17191b", surface: "#222528", surfaceSecondary: "#2b2e31", text: "#f5f3ef", textMuted: "#aaa59c", accent: "#c3a469", border: "#3a3d40", borderRadius: "10px", fontHeading: "Georgia, serif" }),
  ],
  "trade-result": [
    visual("xtb-dark", "Dark Trading", "Anonymous closed-position result.", { background: "#0b1013", surface: "#151c20", surfaceSecondary: "#1d272c", text: "#f4f8f8", textMuted: "#91a3a7", accent: "#17b7a3", positive: "#2bd68f", negative: "#f2636e", border: "#2b383d", borderRadius: "8px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", fontMono: "'IBM Plex Mono', 'Courier New', monospace", density: "compact", shadow: "none" }),
    visual("xtb-light", "Light Trading", "Clean anonymous trading-result card.", { background: "#eef3f3", surface: "#ffffff", surfaceSecondary: "#e3ecec", text: "#152326", textMuted: "#6f8184", accent: "#078f81", positive: "#087f61", negative: "#d84b58", border: "#cbd8d8", borderRadius: "8px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", fontMono: "'IBM Plex Mono', 'Courier New', monospace", density: "compact", shadow: "subtle" }),
  ],
  "iphone-notification": [
    visual("ios-midnight", "iOS Midnight", "Ciemny, szklany ekran blokady iPhone'a.", { background: "#111d31", surface: "#26354b", surfaceSecondary: "#334862", text: "#f7fbff", textMuted: "#d1dae8", accent: "#78bdff", accentText: "#10233a", positive: "#6ee7b7", negative: "#ff8793", warning: "#ffd27a", border: "#ffffff2e", borderRadius: "30px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "elevated" }),
    visual("ios-sunrise", "iOS Sunrise", "Jasny ekran blokady z ciepłym światłem.", { background: "#e6d1c6", surface: "#fffaf7", surfaceSecondary: "#f5e2d8", text: "#172033", textMuted: "#667085", accent: "#ef765f", accentText: "#ffffff", positive: "#1f9965", negative: "#cf4f67", warning: "#b7791f", border: "#ffffff99", borderRadius: "30px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "elevated" }),
    visual("ios-graphite", "iOS Graphite", "Neutralny, minimalistyczny ekran powiadomień.", { background: "#282c36", surface: "#3b414e", surfaceSecondary: "#4a5261", text: "#fbfcff", textMuted: "#d4d8e0", accent: "#d7e0ff", accentText: "#283046", positive: "#75e0ac", negative: "#ff8e99", warning: "#ffcf70", border: "#ffffff2e", borderRadius: "30px", fontHeading: "'Space Grotesk', Arial, sans-serif", fontBody: "'IBM Plex Sans', Arial, sans-serif", shadow: "elevated" }),
  ],
}

export const getArtifactVariant = (type: ArtifactType, variant?: string) => {
  const variants = visualVariants[type] || []
  return variants.find((item) => item.id === variant) || variants[0] || visual("default", "Default", "Default artifact style.", {})
}
