const allowedColor = (value?: string) => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  const palette: Record<string, string> = {
    ink: "#1e293b",
    navy: "#1e3a8a",
    plum: "#581c87",
    forest: "#14532d",
    burgundy: "#7f1d1d",
    graphite: "#374151",
  }
  if (palette[normalized]) return palette[normalized]
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : undefined
}

const lineColorFromAttributes = (attributes: string) => {
  const match = attributes.match(/\bcolor\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
  return allowedColor(match?.[1] || match?.[2] || match?.[3])
}

/** Uses the first safe line color in JSON as the single opaque color for a canvas. */
export const getPrivacyMaskColor = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const match = value.match(/<line([^>]*)>/i)
    return match ? lineColorFromAttributes(match[1]) : undefined
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const color = getPrivacyMaskColor(item)
      if (color) return color
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const color = getPrivacyMaskColor(item)
      if (color) return color
    }
  }
  return undefined
}
