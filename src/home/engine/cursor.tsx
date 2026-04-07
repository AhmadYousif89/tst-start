import { memo, useRef, useEffect } from "react"

import { cn } from "@/lib/utils"
import { isRtlLang } from "./utils"
import { CursorStyle } from "../context/engine.types"
import { useEngineConfig, useEngineKeystroke } from "../context/engine.context"
import { useWindowResize } from "@/hooks/use-window-resize"
import { useTextSettings } from "../context/settings.context"

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
    const { cursorStyle: currentCursorStyle } = useTextSettings()

    const { status, textData, view, isFocused } = config
    const cursor = cursorProp ?? keystroke.cursor
    const extraOffset = extraOffsetProp ?? keystroke.extraOffset

    const isRTL = isRTLProp || isRtlLang(textData.language)
    const cursorStyle = cursorStyleProp ?? currentCursorStyle

    useEffect(() => {
      let rafId: number | null = null

      const measureAndApply = () => {
        const container = containerRef.current
        const indicator = cursorIndicatorRef.current
        if (!container || !indicator) return false

        const cursorEl = container.querySelector<HTMLElement>(".active-cursor")
        if (!cursorEl) return false

        const containerRect = container.getBoundingClientRect()
        const cursorRect = cursorEl.getBoundingClientRect()
        const { scrollTop, scrollLeft } = container

        const hasWideShape = cursorStyle === "box" || cursorStyle === "underline"
        const left =
          isRTL ?
            hasWideShape ? cursorRect.left - containerRect.left + scrollLeft
            : cursorRect.right - containerRect.left + scrollLeft
          : cursorRect.left - containerRect.left + scrollLeft

        const position: CursorPosition = {
          top: cursorRect.top - containerRect.top + scrollTop,
          left,
          width: cursorRect.width,
          height: cursorRect.height,
        }

        const width = hasWideShape ? position.width || 0 : 2
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
    }, [isRTL, cursor, extraOffset, cursorStyle, view.version, windowWidth])

    const shouldBlink = status !== "typing" && !isReplaying && isFocused

    return (
      <div
        ref={cursorIndicatorRef}
        className={cn(
          "bg-ring/90 pointer-events-none absolute z-10 rounded transition-all duration-50 will-change-[left,top,width,height]",
          (status === "typing" || isReplaying) && "duration-200",
          shouldBlink && "animate-blink",
          !isFocused && "invisible opacity-0",
          cursorStyle === "box" && "border-ring/90 border-2 bg-transparent",
        )}
      />
    )
  },
)

Cursor.displayName = "Cursor"
