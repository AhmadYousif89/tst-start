import { useEffect, useRef, useState, useCallback } from "react"
import { Keystroke } from "@/home/context/engine.types"

type Props = {
  keystrokes: Keystroke[]
  playSound: () => void
}

export const useReplay = ({ keystrokes, playSound }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastKeystrokesRef = useRef(keystrokes)

  /* ------------------ REPLAY EFFECT ------------------ */

  useEffect(() => {
    if (lastKeystrokesRef.current !== keystrokes) {
      setCurrentIndex(0)
      setIsPlaying(false)
      lastKeystrokesRef.current = keystrokes
    }
  }, [keystrokes])

  useEffect(() => {
    if (!isPlaying || currentIndex >= keystrokes.length) {
      if (isPlaying && currentIndex >= keystrokes.length) {
        setIsPlaying(false)
      }
      return
    }

    const currentKs = keystrokes[currentIndex]
    const prevKs = currentIndex > 0 ? keystrokes[currentIndex - 1] : null

    if (!currentKs) return

    const delay =
      prevKs ? currentKs.timestampMs - prevKs.timestampMs : currentKs.timestampMs

    timeoutRef.current = setTimeout(() => {
      playSound?.()
      setCurrentIndex((prev) => prev + 1)
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPlaying, currentIndex, keystrokes, playSound])

  /* ------------------ ACTIONS ------------------ */

  const jumpToIndex = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, keystrokes.length))
      setCurrentIndex(safeIndex)
    },
    [keystrokes.length],
  )

  const play = useCallback(() => {
    if (currentIndex >= keystrokes.length) setCurrentIndex(0)
    setIsPlaying(true)
  }, [currentIndex, keystrokes.length])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return { isPlaying, play, pause, reset, currentIndex, jumpToIndex }
}
