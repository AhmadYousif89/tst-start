import { useState, useEffect, memo } from "react"

import { cn } from "@/lib/utils"
import { isRtlLang } from "./engine-utils"
import { CursorStyle } from "../context/engine.types"
import { useEngineConfig, useEngineKeystroke } from "../context/engine.context"
import { useWindowResize } from "@/hooks/use-window-resize"

export type CursorProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  isFocused: boolean
  cursor?: number
  extraOffset?: number
  cursorStyle?: CursorStyle
  isReplaying?: boolean
  isRTL?: boolean
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

    const { status, showOverlay, textData, layout, isFocused } = config
    const cursor = cursorProp ?? keystroke.cursor
    const extraOffset = extraOffsetProp ?? keystroke.extraOffset
    const configCursorStyle = config.cursorStyle

    const isRTL = isRTLProp || isRtlLang(textData?.language)
    const [position, setPosition] = useState<CursorPosition>({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    })

    const cursorStyle = cursorStyleProp ?? configCursorStyle ?? "pip"
    const isBoxy = cursorStyle === "box" || cursorStyle === "underline"
    const layoutVersion = layout.version

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const cursorEl = container.querySelector(".active-cursor") as HTMLElement

      if (cursorEl) {
        const containerRect = container.getBoundingClientRect()
        const cursorRect = cursorEl.getBoundingClientRect()
        const { scrollTop, scrollLeft } = container

        const left =
          isRTL ?
            isBoxy ? cursorRect.left - containerRect.left + scrollLeft
            : cursorRect.right - containerRect.left + scrollLeft
          : cursorRect.left - containerRect.left + scrollLeft

        setPosition({
          top: cursorRect.top - containerRect.top + scrollTop,
          left,
          width: cursorRect.width,
          height: cursorRect.height,
        })
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
    ])

    const left = position.left
    const width = isBoxy ? position.width || 0 : 2
    const height =
      cursorStyle === "underline" ? 2 : (position.height || 0) * (isRTL ? 0.85 : 0.9)
    const top =
      cursorStyle === "underline" ?
        position.top - (isRTL ? 3 : 0) + (position.height || 0)
      : position.top + (isRTL ? 2 : 0) + ((position.height || 0) - height) / 2

    return (
      <div
        style={{ top, left, width, height }}
        className={cn(
          "pointer-events-none absolute z-10 rounded bg-blue-400/90 transition-[left,top,width,height] duration-0 will-change-[left,top,width,height]",
          (status === "typing" || isReplaying) && "duration-150",
          !isReplaying &&
            status !== "typing" &&
            !showOverlay &&
            isFocused &&
            "animate-blink ease-linear",
          showOverlay && "invisible opacity-0",
          cursorStyle === "box" && "border-2 border-blue-400/90 bg-transparent",
        )}
      />
    )
  },
)

Cursor.displayName = "Cursor"
