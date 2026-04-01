import { useRef, useMemo } from "react"

import { Words } from "./words"
import { Cursor } from "./cursor"
import { EngineOverlay } from "./overlay"
import { TypingInput } from "./typing-input"
import { TimeWarning } from "../main/timer-warning"

import { useEngineActions, useEngineConfig } from "../context/engine.context"
import { useMouseShake } from "@/hooks/use-mouse-shake"

export const EngineContainer = () => {
  const { setFocused, setStatus } = useEngineActions()
  const { textData, status, isFocused, isImmersive } = useEngineConfig()

  console.log("STATUS: ", status)

  const containerRef = useRef<HTMLDivElement>(null)
  const typingInputRef = useRef<HTMLTextAreaElement>(null)

  const characters = useMemo(() => textData.text.split("") || [], [textData.text])

  useMouseShake({
    enabled: isImmersive,
    onShake: () => setStatus("paused"),
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (status === "finished") return
    e.preventDefault()
    e.stopPropagation()
    typingInputRef.current?.focus()
  }

  const handleBlur = () => {
    setFocused(false)
  }

  const handleFocus = () => {
    setFocused(true)
    typingInputRef.current?.focus()
  }

  return (
    <div
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
      className="pb-10">
      <TimeWarning />
      <div
        ref={containerRef}
        className="relative h-34 overflow-hidden md:h-41">
        <EngineOverlay />
        <TypingInput
          characters={characters}
          containerRef={containerRef}
          typingInputRef={typingInputRef}
        />
        <Words
          characters={characters}
          containerRef={containerRef}
        />
        <Cursor
          isFocused={isFocused}
          containerRef={containerRef}
        />
      </div>
    </div>
  )
}
