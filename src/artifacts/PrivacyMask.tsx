import { createContext, useContext, useId, useMemo } from "react"

type PrivacyMaskContextValue = {
  color: string
  seed: string
}

const PrivacyMaskContext = createContext<PrivacyMaskContextValue>({
  color: "#1e293b",
  seed: "artifact",
})

const MASK_COLORS = ["#1e293b", "#312e81", "#713f12", "#3f1d4c", "#14532d", "#7f1d1d"]

const hash = (value: string) => {
  let output = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index)
    output = Math.imul(output, 16777619)
  }
  return output >>> 0
}

const randomFor = (seed: string) => {
  let state = hash(seed) || 1
  return () => {
    state = Math.imul(1664525, state) + 1013904223
    return ((state >>> 0) % 10000) / 10000
  }
}

export const PrivacyMaskProvider = ({
  children,
  seed,
  color,
}: {
  children: React.ReactNode
  seed: string
  color?: string
}) => {
  const value = useMemo(() => ({
    seed,
    color: color || MASK_COLORS[hash(seed) % MASK_COLORS.length],
  }), [color, seed])

  return <PrivacyMaskContext.Provider value={value}>{children}</PrivacyMaskContext.Provider>
}

type TextPart =
  | { type: "text"; value: string }
  | { type: "blur"; value: string }
  | { type: "line"; value: string }

const parseText = (value: string): TextPart[] => {
  const parts: TextPart[] = []
  const matcher = /<(blur|line)([^>]*)>([\s\S]*?)<\/\1>/gi
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = matcher.exec(value))) {
    if (match.index > cursor) parts.push({ type: "text", value: value.slice(cursor, match.index) })
    const type = match[1].toLowerCase() as "blur" | "line"
    parts.push({ type, value: match[3] })
    cursor = match.index + match[0].length
  }
  if (cursor < value.length) parts.push({ type: "text", value: value.slice(cursor) })
  return parts.length ? parts : [{ type: "text", value }]
}

/**
 * Supports serializable JSON text such as:
 * `Monika <blur>Kow</blur>alska` or `<line color="navy">123-45-67-890</line>`.
 * Line marks stay opaque; their shape is deterministic from maskSeed but distinct
 * for every rendered field, so repeated exports do not change unexpectedly.
 */
export const PrivacyText = ({ value }: { value: string | number }) => {
  const context = useContext(PrivacyMaskContext)
  const componentId = useId()
  const parts = useMemo(() => parseText(String(value)), [value])

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") return <span key={`${componentId}-${index}`}>{part.value}</span>
        if (part.type === "blur") {
          return <span key={`${componentId}-${index}`} aria-label="zamazane dane" className="inline-block select-none" style={{ filter: "blur(0.18em)" }}>{part.value}</span>
        }

        const random = randomFor(`${context.seed}:${componentId}:${part.value}:${index}`)
        const color = context.color
        const pathPoints = Array.from({ length: 5 }, (_, pointIndex) => {
          const start = pointIndex * 20 + 2
          const end = (pointIndex + 1) * 20 + 2
          const controlOne = Math.round(9 + random() * 5)
          const controlTwo = Math.round(9 + random() * 5)
          const endY = Math.round(9 + random() * 5)
          return `C ${start + 7} ${controlOne}, ${end - 7} ${controlTwo}, ${end} ${endY}`
        }).join(" ")
        return (
          <span
            key={`${componentId}-${index}`}
            aria-label="zamazane dane"
            className="relative inline-block select-none"
          >
            {part.value}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-0.14em] top-[0.3em] z-10 h-[0.72em] w-[calc(100%+0.28em)] overflow-visible"
              viewBox="0 0 104 24"
              preserveAspectRatio="none"
            >
              <path
                d={`M 2 ${Math.round(9 + random() * 5)} ${pathPoints}`}
                fill="none"
                stroke={color}
                strokeWidth={12 + Math.round(random() * 3)}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.97"
              />
            </svg>
          </span>
        )
      })}
    </>
  )
}
