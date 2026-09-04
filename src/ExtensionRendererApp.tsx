import { useEffect, useMemo, useRef, useState } from "react"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { ArtifactCanvas } from "@/artifacts/ArtifactCanvas"
import { getArtifactDefinition, isArtifactType } from "@/artifacts/registry"
import { layoutConfigs } from "@/constants/layouts"
import { exportNodeToImageSequence } from "@/utils/export"
import type { ArtifactData, ArtifactType } from "@/artifacts/types"
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
  conversation?: Conversation
  type?: ArtifactType
  variant?: string
  maskSeed?: string
  data?: ArtifactData
  layoutId?: LayoutId
  themeId?: ThemeId
  activeParticipantId?: string
  showChrome?: boolean
  backgroundImageUrl?: string
  backgroundImageOpacity?: number
  backgroundColor?: string
  exportSettings?: Partial<ExportSettings>
}

const isArtifactRenderRequest = (
  request: RenderRequest | null,
): request is RenderRequest & { type: ArtifactType; data: ArtifactData } =>
  Boolean(request && isArtifactType(request.type) && request.data && typeof request.data === "object")

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

const FONT_READY_TIMEOUT_MS = 3000
const RENDER_SETTLE_TIMEOUT_MS = 250

const waitForFonts = async () => {
  if (!document.fonts?.ready) return
  // Firefox can leave a background extension tab waiting on a font promise
  // longer than the renderer's transport timeout. System fallbacks are fine
  // for this local screenshot, so font readiness must remain best-effort.
  await Promise.race([
    document.fonts.ready.catch(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, FONT_READY_TIMEOUT_MS)),
  ])
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      resolve()
    }
    const timeoutId = window.setTimeout(finish, RENDER_SETTLE_TIMEOUT_MS)

    // requestAnimationFrame is useful while the tab is visible, but Firefox
    // may pause it completely for an inactive tab. The timeout above keeps
    // the render pipeline moving in both cases.
    if (typeof window.requestAnimationFrame !== "function") {
      finish()
      return
    }
    window.requestAnimationFrame(() => window.requestAnimationFrame(finish))
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

const fileNameFor = (format: ExportFormat, index: number, count: number, basename = "nikodem-chat") => {
  const extension = format === "jpeg" ? "jpg" : "png"
  return count > 1
    ? `${basename}-${String(index + 1).padStart(2, "0")}.${extension}`
    : `${basename}.${extension}`
}

const sendRuntimeMessage = async (message: unknown) => {
  const runtime = getExtensionBrowser()?.runtime
  if (runtime?.sendMessage) {
    await runtime.sendMessage(message)
    return
  }
  window.parent.postMessage(message, "*")
}

const rendererRequestIdFromUrl = () =>
  new URLSearchParams(window.location.search).get("request") || ""

export const ExtensionRendererApp = () => {
  const [request, setRequest] = useState<RenderRequest | null>(null)
  const [error, setError] = useState("")
  const renderRef = useRef<HTMLDivElement | null>(null)
  const probeRef = useRef<HTMLDivElement | null>(null)
  const probeScrollRef = useRef<HTMLDivElement | null>(null)
  const probeContentRef = useRef<HTMLDivElement | null>(null)

  const artifactRequest = isArtifactRenderRequest(request) ? request : null
  const artifactDefinition = artifactRequest ? getArtifactDefinition(artifactRequest.type) : undefined
  const settings = useMemo<ExportSettings>(() => {
    const artifactDefaults = artifactDefinition
      ? { width: artifactDefinition.width, height: artifactDefinition.height, format: "png" as const, captureMode: "viewport" as const }
      : {}
    return { ...defaultExportSettings, ...artifactDefaults, ...(request?.exportSettings || {}), ...(artifactDefinition ? { format: "png" as const, captureMode: "viewport" as const } : {}) }
  }, [artifactDefinition, request])
  const layout = layoutConfigs.find((entry) => entry.id === (request?.layoutId || "whatsapp")) ?? layoutConfigs[0]
  const theme = layout.themes.find((entry) => entry.id === (request?.themeId || "light")) ?? layout.themes[0]
  const conversation = artifactRequest ? undefined : request?.conversation
  const activeParticipantId = request?.activeParticipantId || conversation?.participants[0]?.id || ""
  const captureMode: ExportCaptureMode = settings.captureMode

  useEffect(() => {
    const listener = (message: RuntimeMessage) => {
      if ((message.type !== "XCS_RENDER_CHAT" && message.type !== "XCS_RENDER_ARTIFACT") || !message.request) return
      const rendererRequestId = rendererRequestIdFromUrl()
      if (rendererRequestId && message.request.requestId !== rendererRequestId) return
      setError("")
      setRequest(message.request)
      // tabs.sendMessage is used by the background page. Returning an ack is
      // important: without it Firefox may reject the sender promise after
      // delivering the message, causing the background to send a duplicate
      // request through runtime.sendMessage.
      return { ok: true }
    }
    const windowListener = (event: MessageEvent<RuntimeMessage>) => {
      if ((event.data?.type === "XCS_RENDER_CHAT" || event.data?.type === "XCS_RENDER_ARTIFACT") && event.data.request) listener(event.data)
    }
    const runtime = getExtensionBrowser()?.runtime
    runtime?.onMessage?.addListener(listener)
    window.addEventListener("message", windowListener)
    void sendRuntimeMessage({
      type: "XCS_RENDERER_READY",
      requestId: rendererRequestIdFromUrl(),
    })
    return () => {
      runtime?.onMessage?.removeListener?.(listener)
      window.removeEventListener("message", windowListener)
    }
  }, [])

  useEffect(() => {
    if (!request) return
    let cancelled = false

    const render = async () => {
      try {
        await waitForFonts()
        await nextFrame()
        if (cancelled || !renderRef.current) return

        const probeScroll = probeScrollRef.current
        const probeContent = probeContentRef.current
        const probeHeight = probeRef.current?.clientHeight || settings.height
        const contentHeight = probeContent?.scrollHeight || settings.height
        const viewportHeight = probeScroll?.clientHeight || settings.height
        const chromeHeight = Math.max(0, probeHeight - viewportHeight)
        const fullHeight = artifactRequest
          ? settings.height
          : Math.max(settings.height, Math.ceil(chromeHeight + contentHeight))
        const resolvedHeight = captureMode === "full" ? fullHeight : settings.height
        const resolvedSettings = { ...settings, height: resolvedHeight }
        const screenScrollTops = getScreenScrollTops(viewportHeight, contentHeight)
        const renderOptions =
          !artifactRequest && captureMode === "screens"
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
            name: fileNameFor(settings.format, index, dataUrls.length, artifactRequest?.variant ? `${artifactRequest.type}-${artifactRequest.variant}` : artifactRequest?.type || "nikodem-chat"),
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
  }, [artifactRequest, captureMode, request, settings])

  if (!request) {
    return <div data-xcs-renderer-state="ready">{error}</div>
  }

  const commonProps = conversation
    ? {
        conversation,
        layout,
        theme,
        showChrome: request.showChrome !== false,
        activeParticipantId,
        backgroundImageUrl: request.backgroundImageUrl || "",
        backgroundImageOpacity: request.backgroundImageOpacity ?? 0.35,
        backgroundColor: request.backgroundColor || "",
      }
    : null

  return (
    <>
      {conversation && commonProps ? (
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
      ) : null}
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
        {artifactRequest ? (
          <ArtifactCanvas type={artifactRequest.type} data={artifactRequest.data} variant={artifactRequest.variant} maskSeed={artifactRequest.maskSeed} />
        ) : conversation && commonProps ? (
          <ChatLayout
            {...commonProps}
            conversationMode={captureMode === "full" ? "expanded" : "scroll"}
          />
        ) : null}
      </div>
    </>
  )
}
