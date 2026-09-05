const polishMonths = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
]

const polishWeekdays = [
  "niedziela",
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
]

const pad = (value: number) => String(value).padStart(2, "0")

export const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const localDateNumeric = (date = new Date()) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`

export const localDateLong = (date = new Date()) =>
  `${date.getDate()} ${polishMonths[date.getMonth()]} ${date.getFullYear()}`

export const localDateShortLabel = (date = new Date()) =>
  `${polishWeekdays[date.getDay()].replace(/^(.)/, (letter) => letter.toUpperCase())}, ${date.getDate()} ${polishMonths[date.getMonth()]}`

export const localMonthYear = (date = new Date()) => {
  const month = new Intl.DateTimeFormat("pl-PL", { month: "long" }).format(date)
  return `${month.replace(/^(.)/, (letter) => letter.toUpperCase())} ${date.getFullYear()}`
}

export const localTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

export const localDateTime = (date = new Date()) => `${localDateNumeric(date)} · ${localTime(date)}`

export const dateAtOffset = (days: number, from = new Date()) => {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  return date
}

export const timeBeforeCurrentHour = (index: number, now = new Date()) => {
  const currentHour = now.getHours()
  if (currentHour <= 0) return "00:00"
  const minutes = Math.max(0, (currentHour - 1) * 60 + 50 - Math.max(0, index) * 17)
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}
