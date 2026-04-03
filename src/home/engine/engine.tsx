import { useRef, useMemo } from "react"

import { Words } from "./words"
import { Cursor } from "./cursor"
import { EngineOverlay } from "./overlay"
import { TypingInput } from "./textarea"
import { TimeWarning } from "../main/timer-warning"

import { useEngineActions, useEngineConfig } from "../context/engine.context"

export const EngineContainer = () => {
  const { setFocused } = useEngineActions()
  const { textData, status } = useEngineConfig()

  const containerRef = useRef<HTMLDivElement>(null)
  const typingInputRef = useRef<HTMLTextAreaElement>(null)

  const characters = useMemo(() => textData.text.split("") || [], [textData.text])

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
      className="w-full pb-10">
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
        <Words characters={characters} />
        <Cursor containerRef={containerRef} />
      </div>
    </div>
  )
}
