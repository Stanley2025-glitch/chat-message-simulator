import { ChatLayout } from "@/components/layout/ChatLayout"
import { getLayoutConfig } from "@/constants/layouts"
import type { Conversation } from "@/types/conversation"
import type { LayoutId, ThemeId } from "@/types/layout"

export interface ChatExampleData {
  conversation: Conversation
  layoutId: LayoutId
  themeId: ThemeId
  activeParticipantId: string
}

export const ChatExampleRenderer = ({ data }: { data: ChatExampleData }) => {
  const layout = getLayoutConfig(data.layoutId)
  const theme = layout.themes.find((entry) => entry.id === data.themeId) ?? layout.themes[0]
  return <ChatLayout conversation={data.conversation} layout={layout} theme={theme} showChrome activeParticipantId={data.activeParticipantId} backgroundImageUrl="" backgroundImageOpacity={0.35} backgroundColor="" />
}
