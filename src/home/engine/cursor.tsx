import { useLayoutEffect, memo, useRef } from "react"

import { cn } from "@/lib/utils"
import { isRtlLang } from "./engine-utils"
import { CursorStyle } from "../context/engine.types"
import { useEngineConfig, useEngineKeystroke } from "../context/engine.context"
import { useWindowResize } from "@/hooks/use-window-resize"

export type CursorProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  cursor?: number
  extraOffset?: number
  cursorStyle?: CursorStyle
  isRTL?: boolean
  isReplaying?: boolean
}

type CursorPosition = {
  top: number
  left: number
  width: number
  height: number
}

export const Cursor = memo(
  ({
    containerRef,
    isReplaying,
    isRTL: isRTLProp,
    cursor: cursorProp,
    extraOffset: extraOffsetProp,
    cursorStyle: cursorStyleProp,
  }: CursorProps) => {
    const config = useEngineConfig()
    const keystroke = useEngineKeystroke()
    const { width: windowWidth } = useWindowResize()
    const cursorIndicatorRef = useRef<HTMLDivElement>(null)

    const { status, showOverlay, textData, layout, isFocused } = config
    const cursor = cursorProp ?? keystroke.cursor
    const extraOffset = extraOffsetProp ?? keystroke.extraOffset
    const configCursorStyle = config.cursorStyle

    const isRTL = isRTLProp || isRtlLang(textData?.language)
    const cursorStyle = cursorStyleProp ?? configCursorStyle ?? "pip"
    const isBoxy = cursorStyle === "box" || cursorStyle === "underline"
    const layoutVersion = layout.version

    useLayoutEffect(() => {
      let rafId: number | null = null

      const measureAndApply = () => {
        const container = containerRef.current
        const indicator = cursorIndicatorRef.current
        if (!container || !indicator) return false

        const cursorEl = container.querySelector(".active-cursor") as HTMLElement | null
        if (!cursorEl) return false

        const containerRect = container.getBoundingClientRect()
        const cursorRect = cursorEl.getBoundingClientRect()
        const { scrollTop, scrollLeft } = container

        const left =
          isRTL ?
            isBoxy ? cursorRect.left - containerRect.left + scrollLeft
            : cursorRect.right - containerRect.left + scrollLeft
          : cursorRect.left - containerRect.left + scrollLeft

        const position: CursorPosition = {
          top: cursorRect.top - containerRect.top + scrollTop,
          left,
          width: cursorRect.width,
          height: cursorRect.height,
        }

        const width = isBoxy ? position.width || 0 : 2
        const height =
          cursorStyle === "underline" ? 2 : (position.height || 0) * (isRTL ? 0.85 : 0.9)
        const top =
          cursorStyle === "underline" ?
            position.top - (isRTL ? 3 : 0) + (position.height || 0)
          : position.top + (isRTL ? 2 : 0) + ((position.height || 0) - height) / 2

        indicator.style.left = `${left}px`
        indicator.style.top = `${top}px`
        indicator.style.width = `${width}px`
        indicator.style.height = `${height}px`

        return true
      }

      const hasBeenMeasured = measureAndApply()
      if (!hasBeenMeasured) {
        rafId = requestAnimationFrame(measureAndApply)
      }

      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId)
      }
    }, [
      textData.text,
      cursor,
      extraOffset,
      isRTL,
      cursorStyle,
      isBoxy,
      layoutVersion,
      windowWidth,
      showOverlay,
    ])

    const shouldBlink = status !== "typing" && !isReplaying && !showOverlay && isFocused

    return (
      <div
        ref={cursorIndicatorRef}
        className={cn(
          "pointer-events-none absolute z-10 rounded bg-blue-400/90 transition-all duration-50 will-change-[left,top,width,height]",
          (status === "typing" || isReplaying) && "duration-200",
          shouldBlink && "animate-blink",
          showOverlay && "invisible opacity-0",
          cursorStyle === "box" && "border-2 border-blue-400/90 bg-transparent",
        )}
      />
    )
  },
)

Cursor.displayName = "Cursor"
