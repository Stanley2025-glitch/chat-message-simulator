import { useEffect, useMemo, useRef, useState } from "react"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { layoutConfigs } from "@/constants/layouts"
import { exportNodeToImageSequence } from "@/utils/export"
import type { Conversation } from "@/types/conversation"
import type { LayoutId, ThemeId } from "@/types/layout"
import type { ExportCaptureMode, ExportFormat, ExportSettings } from "@/store/conversationStore"

type RuntimeMessage = {
  type?: string
  requestId?: string
  request?: RenderRequest
}

export interface RenderRequest {
  requestId: string
  conversation: Conversation
  layoutId?: LayoutId
  themeId?: ThemeId
  activeParticipantId?: string
  showChrome?: boolean
  backgroundImageUrl?: string
  backgroundImageOpacity?: number
  backgroundColor?: string
  exportSettings?: Partial<ExportSettings>
}

type RendererImage = {
  name: string
  mimeType: string
  buffer: ArrayBuffer
}

type ExtensionBrowser = {
  runtime?: {
    onMessage?: {
      addListener: (listener: (message: RuntimeMessage) => void) => void
      removeListener?: (listener: (message: RuntimeMessage) => void) => void
    }
    sendMessage?: (message: unknown) => Promise<unknown>
  }
}

const getExtensionBrowser = () =>
  (globalThis as typeof globalThis & { browser?: ExtensionBrowser }).browser

const defaultExportSettings: ExportSettings = {
  presetId: "iphone-14-pro",
  width: 393,
  height: 852,
  scale: 2,
  format: "png",
  quality: 0.95,
  captureMode: "viewport",
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  })

const dataUrlToArrayBuffer = async (dataUrl: string) => {
  const response = await fetch(dataUrl)
  return response.arrayBuffer()
}

const getScreenScrollTops = (viewportHeight: number, contentHeight: number) => {
  if (!viewportHeight || !contentHeight) return [0]
  const maxScroll = Math.max(0, contentHeight - viewportHeight)
  if (!maxScroll) return [0]

  const positions: number[] = []
  for (let top = 0; top < maxScroll; top += viewportHeight) positions.push(top)
  if (positions[positions.length - 1] !== maxScroll) positions.push(maxScroll)
  return positions
}

const fileNameFor = (format: ExportFormat, index: number, count: number) => {
  const extension = format === "jpeg" ? "jpg" : "png"
  return count > 1
    ? `nikodem-chat-${String(index + 1).padStart(2, "0")}.${extension}`
    : `nikodem-chat.${extension}`
}

const sendRuntimeMessage = async (message: unknown) => {
  const runtime = getExtensionBrowser()?.runtime
  if (runtime?.sendMessage) {
    await runtime.sendMessage(message)
    return
  }
  window.parent.postMessage(message, "*")
}

export const ExtensionRendererApp = () => {
  const [request, setRequest] = useState<RenderRequest | null>(null)
  const [error, setError] = useState("")
  const renderRef = useRef<HTMLDivElement | null>(null)
  const probeRef = useRef<HTMLDivElement | null>(null)
  const probeScrollRef = useRef<HTMLDivElement | null>(null)
  const probeContentRef = useRef<HTMLDivElement | null>(null)

  const settings = useMemo<ExportSettings>(
    () => ({ ...defaultExportSettings, ...(request?.exportSettings || {}) }),
    [request],
  )
  const layout = layoutConfigs.find((entry) => entry.id === (request?.layoutId || "whatsapp")) ?? layoutConfigs[0]
  const theme = layout.themes.find((entry) => entry.id === (request?.themeId || "light")) ?? layout.themes[0]
  const conversation = request?.conversation
  const activeParticipantId = request?.activeParticipantId || conversation?.participants[0]?.id || ""
  const captureMode: ExportCaptureMode = settings.captureMode

  useEffect(() => {
    const listener = (message: RuntimeMessage) => {
      if (message.type !== "XCS_RENDER_CHAT" || !message.request) return
      setError("")
      setRequest(message.request)
    }
    const windowListener = (event: MessageEvent<RuntimeMessage>) => {
      if (event.data?.type === "XCS_RENDER_CHAT" && event.data.request) listener(event.data)
    }
    const runtime = getExtensionBrowser()?.runtime
    runtime?.onMessage?.addListener(listener)
    window.addEventListener("message", windowListener)
    void sendRuntimeMessage({ type: "XCS_RENDERER_READY" })
    return () => {
      runtime?.onMessage?.removeListener?.(listener)
      window.removeEventListener("message", windowListener)
    }
  }, [])

  useEffect(() => {
    if (!request || !conversation) return
    let cancelled = false

    const render = async () => {
      try {
        await document.fonts?.ready
        await nextFrame()
        if (cancelled || !renderRef.current) return

        const probeScroll = probeScrollRef.current
        const probeContent = probeContentRef.current
        const probeHeight = probeRef.current?.clientHeight || settings.height
        const contentHeight = probeContent?.scrollHeight || settings.height
        const viewportHeight = probeScroll?.clientHeight || settings.height
        const chromeHeight = Math.max(0, probeHeight - viewportHeight)
        const fullHeight = Math.max(settings.height, Math.ceil(chromeHeight + contentHeight))
        const resolvedHeight = captureMode === "full" ? fullHeight : settings.height
        const resolvedSettings = { ...settings, height: resolvedHeight }
        const screenScrollTops = getScreenScrollTops(viewportHeight, contentHeight)
        const renderOptions =
          captureMode === "screens"
            ? screenScrollTops.map((top) => ({ scrollRootOverrides: [{ top }] }))
            : [{ offset: { x: 0, y: 0 } }]

        // Keep the live target at the measured full height before cloning it.
        // This lets h-full children reflow exactly like the exported copy.
        renderRef.current.style.height = `${resolvedHeight}px`
        await nextFrame()

        const dataUrls = await exportNodeToImageSequence(
          renderRef.current,
          resolvedSettings,
          renderOptions,
        )
        if (cancelled) return

        const images: RendererImage[] = []
        for (const [index, dataUrl] of dataUrls.entries()) {
          images.push({
            name: fileNameFor(settings.format, index, dataUrls.length),
            mimeType: settings.format === "jpeg" ? "image/jpeg" : "image/png",
            buffer: await dataUrlToArrayBuffer(dataUrl),
          })
        }

        await sendRuntimeMessage({
          type: "XCS_RENDER_RESULT",
          requestId: request.requestId,
          images,
          width: resolvedSettings.width,
          height: resolvedSettings.height,
        })
      } catch (renderError) {
        const message = renderError instanceof Error ? renderError.message : String(renderError)
        setError(message)
        await sendRuntimeMessage({
          type: "XCS_RENDER_RESULT",
          requestId: request.requestId,
          error: message,
        })
      }
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [captureMode, conversation, request, settings])

  if (!conversation) {
    return <div data-xcs-renderer-state="ready">{error}</div>
  }

  const commonProps = {
    conversation,
    layout,
    theme,
    showChrome: request.showChrome !== false,
    activeParticipantId,
    backgroundImageUrl: request.backgroundImageUrl || "",
    backgroundImageOpacity: request.backgroundImageOpacity ?? 0.35,
    backgroundColor: request.backgroundColor || "",
  }

  return (
    <>
      <div
        ref={probeRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: settings.width,
          height: settings.height,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <ChatLayout
          {...commonProps}
          conversationMode="scroll"
          conversationContainerRef={probeScrollRef}
          conversationContentRef={probeContentRef}
        />
      </div>
      <div
        ref={renderRef}
        data-xcs-render-target="true"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: settings.width,
          height: settings.height,
        }}
      >
        <ChatLayout
          {...commonProps}
          conversationMode={captureMode === "full" ? "expanded" : "scroll"}
        />
      </div>
    </>
  )
}
