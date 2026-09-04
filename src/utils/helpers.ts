import { format } from "date-fns"
import { pl } from "date-fns/locale/pl"
import type { Conversation } from "@/types/conversation"

const formatPolishDate = (timestamp: string, pattern: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ""

  try {
    return format(date, pattern, { locale: pl })
  } catch {
    return ""
  }
}

export const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`
}

export const formatTimestamp = (timestamp: string) => {
  return formatPolishDate(timestamp, "HH:mm")
}

export const formatDateSeparator = (timestamp: string) => {
  return formatPolishDate(timestamp, "PP")
}

export const formatInstagramDateSeparator = (timestamp: string) => {
  return formatPolishDate(timestamp, "d MMM 'o' HH:mm").toUpperCase()
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const getConversationTitle = (conversation: Conversation) => {
  const names = conversation.participants.map((participant) => participant.name).filter(Boolean)
  if (conversation.participants.length > 2) {
    return conversation.groupName?.trim() || "Group Chat"
  }
  if (names.length === 0) return "New Chat"
  if (names.length === 1) return names[0]
  return `${names[0]} & ${names[1]}`
}

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
