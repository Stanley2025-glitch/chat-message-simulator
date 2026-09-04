import { toJpeg, toPng } from "html-to-image"
import type { ExportSettings } from "../store/conversationStore"

const IMAGE_LOAD_TIMEOUT_MS = 3000
const DATA_URL_LOAD_TIMEOUT_MS = 5000
const EXPORT_TIMEOUT_MS = 20000
const CROP_TOP_PADDING_PX = 16
const CROP_BOTTOM_PADDING_PX = 24

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs)
    promise
      .then((value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      })
      .catch((error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      })
  })

interface ExportRenderOptions {
  offset?: { x: number; y: number }
  scrollRootOverrides?: Array<{
    index?: number
    top?: number
    left?: number
  }>
}

interface ExportCrop {
  x: number
  y: number
  width: number
  height: number
}

const waitForImages = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll("img"))
  await Promise.all(
    images.map((image) => {
      if (image.loading === "lazy") {
        image.loading = "eager"
      }
      image.decoding = "async"
      if (image.complete && image.naturalWidth > 0) {
        return Promise.resolve()
      }
      if (image.complete && !image.decode) {
        return Promise.resolve()
      }
      return new Promise<void>((resolve) => {
        let settled = false
        let timeoutId = 0
        const finish = () => {
          if (settled) return
          settled = true
          window.clearTimeout(timeoutId)
          image.removeEventListener("load", finish)
          image.removeEventListener("error", finish)
          resolve()
        }
        timeoutId = window.setTimeout(finish, IMAGE_LOAD_TIMEOUT_MS)
        image.addEventListener("load", finish)
        image.addEventListener("error", finish)
        if (image.decode) {
          image.decode().then(finish).catch(finish)
        }
      })
    }),
  )
}

const buildExportClone = (node: HTMLElement, options?: ExportRenderOptions) => {
  const wrapper = document.createElement("div")
  wrapper.setAttribute("aria-hidden", "true")
  Object.assign(wrapper.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1",
  })

  const clone = node.cloneNode(true) as HTMLElement
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  const sourceScrollRoots = Array.from(
    node.querySelectorAll<HTMLElement>('[data-conversation-scroll-root="true"]'),
  )
  const cloneScrollRoots = Array.from(
    clone.querySelectorAll<HTMLElement>('[data-conversation-scroll-root="true"]'),
  )

  sourceScrollRoots.forEach((sourceRoot, index) => {
    const cloneRoot = cloneScrollRoots[index]
    if (!cloneRoot) return

    const sourceContent = sourceRoot.querySelector<HTMLElement>('[data-conversation-content="true"]')
    const cloneContent = cloneRoot.querySelector<HTMLElement>('[data-conversation-content="true"]')
    if (!sourceContent || !cloneContent) return

    const override = options?.scrollRootOverrides?.find((entry) => (entry.index ?? 0) === index)
    const scrollTop = override?.top ?? sourceRoot.scrollTop
    const scrollLeft = override?.left ?? sourceRoot.scrollLeft
    if (!scrollTop && !scrollLeft) return

    cloneRoot.style.overflow = "hidden"
    cloneContent.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`
    cloneContent.style.transformOrigin = "top left"
  })

  return {
    clone,
    cleanup: () => wrapper.remove(),
  }
}

const getContentCrop = (clone: HTMLElement): ExportCrop | null => {
  const rootRect = clone.getBoundingClientRect()
  if (!rootRect.width || !rootRect.height) return null

  const header = clone.querySelector<HTMLElement>('[data-chat-header="true"]')
  const conversationRoot = clone.querySelector<HTMLElement>(
    '[data-conversation-scroll-root="true"]',
  )
  const conversationRect = conversationRoot?.getBoundingClientRect()
  const contentTop = Math.max(rootRect.top, conversationRect?.top ?? rootRect.top)
  const contentBottom = Math.min(rootRect.bottom, conversationRect?.bottom ?? rootRect.bottom)
  const messages = Array.from(clone.querySelectorAll<HTMLElement>('[data-chat-message="true"]'))
  const visibleMessages = messages.filter((message) => {
    const rect = message.getBoundingClientRect()
    return rect.bottom > contentTop && rect.top < contentBottom
  })

  if (visibleMessages.length) {
    const firstMessage = visibleMessages[0].getBoundingClientRect()
    const lastMessage = visibleMessages[visibleMessages.length - 1].getBoundingClientRect()
    const top = header
      ? rootRect.top
      : Math.max(rootRect.top, firstMessage.top - CROP_TOP_PADDING_PX)
    const bottom = Math.min(
      contentBottom,
      Math.max(top + 1, lastMessage.bottom + CROP_BOTTOM_PADDING_PX),
    )
    return {
      x: 0,
      y: Math.max(0, Math.ceil(top - rootRect.top)),
      width: Math.ceil(rootRect.width),
      height: Math.max(1, Math.ceil(bottom - top)),
    }
  }

  // An empty conversation still gets a useful cropped header instead of a
  // full blank phone viewport. If chrome is hidden, keep the configured size
  // so an empty-state message remains exportable.
  if (header) {
    const headerRect = header.getBoundingClientRect()
    const bottom = Math.min(contentBottom, headerRect.bottom + CROP_BOTTOM_PADDING_PX)
    return {
      x: 0,
      y: 0,
      width: Math.ceil(rootRect.width),
      height: Math.max(1, Math.ceil(bottom - rootRect.top)),
    }
  }

  return null
}

const cropDataUrl = async (
  dataUrl: string,
  crop: ExportCrop,
  settings: ExportSettings,
) => {
  const image = await withTimeout(
    new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error("Nie udało się przygotować przyciętego obrazu"))
      element.src = dataUrl
    }),
    DATA_URL_LOAD_TIMEOUT_MS,
    "Przygotowanie przyciętego obrazu przekroczyło limit czasu",
  )
  const scale = settings.scale
  const outputWidth = Math.max(1, Math.round(crop.width * scale))
  const outputHeight = Math.max(1, Math.round(crop.height * scale))
  const sourceX = Math.max(0, Math.round(crop.x * scale))
  const sourceY = Math.max(0, Math.round(crop.y * scale))
  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Nie udało się przygotować płótna do cropa")
  if (settings.format === "jpeg") {
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, outputWidth, outputHeight)
  }
  context.drawImage(
    image,
    sourceX,
    sourceY,
    outputWidth,
    outputHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  )
  return canvas.toDataURL(settings.format === "jpeg" ? "image/jpeg" : "image/png", settings.quality)
}

export const exportNodeToImage = async (
  node: HTMLElement,
  settings: ExportSettings,
  options?: ExportRenderOptions,
): Promise<string> => {
  const { clone, cleanup } = buildExportClone(node, options)
  const imagePlaceholder =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
  const transform = options?.offset
    ? `translate(${-options.offset.x}px, ${-options.offset.y}px) scale(1)`
    : "scale(1)"
  try {
    await waitForImages(clone)
    const contentCrop = getContentCrop(clone)
    // A content crop must render the whole chat surface first. The preview's
    // outer scroll offset is only relevant when exporting the fixed viewport.
    const exportTransform = contentCrop ? "scale(1)" : transform

    const commonOptions = {
      width: settings.width,
      height: settings.height,
      pixelRatio: settings.scale,
      cacheBust: true,
      useCORS: true,
      imagePlaceholder,
      style: {
        transform: exportTransform,
        transformOrigin: "top left",
        width: `${settings.width}px`,
        height: `${settings.height}px`,
        "--chat-radius": "0px",
      },
    }

    const exportPromise =
      settings.format === "jpeg"
        ? toJpeg(clone, {
            ...commonOptions,
            quality: settings.quality,
          })
        : toPng(clone, commonOptions)

    const dataUrl = await withTimeout(exportPromise, EXPORT_TIMEOUT_MS, "Export timed out")
    return contentCrop ? await cropDataUrl(dataUrl, contentCrop, settings) : dataUrl
  } finally {
    cleanup()
  }
}

export const exportNodeToImageSequence = async (
  node: HTMLElement,
  settings: ExportSettings,
  renders: ExportRenderOptions[],
): Promise<string[]> => {
  const jobs = renders.length ? renders : [{}]
  const dataUrls: string[] = []
  for (const renderOptions of jobs) {
    dataUrls.push(await exportNodeToImage(node, settings, renderOptions))
  }
  return dataUrls
}
