import { useEffect } from "react"
import {
  isModifierKey,
  isSingleLetterKey,
  NUMBER_KEYS,
  NumberKey,
} from "@tanstack/react-hotkeys"

import { EngineStatus } from "@/home/context/engine.types"

type ShortcutsProps = {
  status: EngineStatus
  isFocused: boolean
  setFocused: (isFocused: boolean) => void
}

export const useShortcutKeys = ({ status, isFocused, setFocused }: ShortcutsProps) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFocused || status === "finished" || status === "loading") return

      // Don't steal focus from other inputs
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable)
      )
        return

      if (isModifierKey(e)) return

      const isTypableKey = isSingleLetterKey(e.key) || NUMBER_KEYS.has(e.key as NumberKey) // [a-z, A-Z, 0-9]

      if (isTypableKey) {
        setFocused(true)
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [isFocused, status, setFocused])
}
