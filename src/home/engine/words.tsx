import { memo, useMemo, useEffect, useRef, useCallback } from "react"

import { cn } from "@/lib/utils"
import { Word } from "./word"
import { isRtlLang } from "./engine-utils"
import { getCharStates } from "./engine-logic"
import {
  useEngineKeystroke,
  useEngineConfig,
  useEngineActions,
} from "../context/engine.context"
import { calculateLayoutShift } from "./layout-logic"

// Group characters into words (prevents mid-word line breaks)
export const wordsGroup = (characters: string[]) => {
  const result: { char: string; index: number }[][] = []
  let currentWord: { char: string; index: number }[] = []

  characters.forEach((char: string, index: number) => {
    currentWord.push({ char, index })
    if (char === " " || index === characters.length - 1) {
      result.push(currentWord)
      currentWord = []
    }
  })

  return result
}

type WordsProps = {
  characters: string[]
}

export const Words = memo(({ characters }: WordsProps) => {
  const configCtx = useEngineConfig()
  const keystrokeCtx = useEngineKeystroke()
  const { updateLayout } = useEngineActions()

  const wordsRef = useRef<HTMLDivElement>(null)

  const { cursor, extraOffset, keystrokes, lockedCursorRef } = keystrokeCtx
  const { textData, status, layout, showOverlay } = configCtx
  const startIndex = layout.startIndex
  const layoutVersion = layout.version

  const groupedWords = useMemo(() => wordsGroup(characters), [characters])
  const charStates = useMemo(
    () => getCharStates(characters, keystrokes.current || []),
    [characters, cursor, extraOffset, keystrokes, layoutVersion],
  )

  const rowBreaks = useRef<number[]>([])

  const calculateRowBreaks = useCallback(() => {
    const container = wordsRef.current
    if (!container) return

    const wordElements = container.querySelectorAll("[data-word-index]")
    const wordElemList = Array.from(wordElements) as HTMLElement[]

    if (wordElemList.length === 0) {
      rowBreaks.current = []
      return
    }

    const breaks: number[] = []
    let lastTop: number | null = null
    const fuzzPxs = 5 // tolerance for sub-pixel offsets

    for (const el of wordElemList) {
      const top = el.offsetTop
      const wordIndexAttr = el.getAttribute("data-word-index") || "0"
      const wordIndex = parseInt(wordIndexAttr, 10)
      if (lastTop === null || Math.abs(top - lastTop) > fuzzPxs) {
        breaks.push(wordIndex)
        lastTop = top
      }
    }
    rowBreaks.current = breaks
  }, [])

  // Scroll to top and reset breaks when cursor is 0 (new test/reset)
  useEffect(() => {
    if (cursor === 0 && status === "typing") {
      updateLayout({ shouldReset: true })
      lockedCursorRef.current = 0
      wordsRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      calculateRowBreaks()
    }
  }, [cursor, status, updateLayout, calculateRowBreaks])

  // Update locked cursor when startIndex changes
  useEffect(() => {
    if (startIndex > 0 && groupedWords[startIndex]) {
      const firstVisibleWord = groupedWords[startIndex]
      const firstCharIndex = firstVisibleWord[0].index
      lockedCursorRef.current = firstCharIndex
      updateLayout()
    }
  }, [startIndex, groupedWords, updateLayout])

  // Calculate row breaks on mount and resize
  useEffect(() => {
    const container = wordsRef.current
    if (!container) return

    calculateRowBreaks()

    const resizeObserver = new ResizeObserver(calculateRowBreaks)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [calculateRowBreaks, startIndex, groupedWords, layoutVersion])

  const lastWordChecked = useRef(-1)

  useEffect(() => {
    if (status !== "typing") return

    // Find the word index the cursor is currently in
    const activeWordIndex = groupedWords.findIndex(
      (w) => cursor >= w[0].index && cursor <= w[w.length - 1].index,
    )

    // Only run logic if we've moved to a new word OR if we have extras (which might change layout)
    if (activeWordIndex === lastWordChecked.current && extraOffset === 0) return
    lastWordChecked.current = activeWordIndex

    if (extraOffset > 0) calculateRowBreaks()

    const { shouldShift, newStartIndex } = calculateLayoutShift(
      activeWordIndex,
      startIndex,
      rowBreaks.current,
    )

    if (shouldShift) updateLayout({ newStartIndex })
  }, [
    cursor,
    status,
    startIndex,
    extraOffset,
    groupedWords,
    layoutVersion,
    calculateRowBreaks,
    updateLayout,
  ])

  const isRTL = isRtlLang(textData?.language)

  return (
    <div
      ref={wordsRef}
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "relative flex flex-wrap transition-[opacity,filter] duration-300 ease-in-out select-none",
        showOverlay && "opacity-50 blur-xs select-none dark:opacity-30",
        isRTL ? "font-arabic pr-1 [word-spacing:1rem]" : "pl-1 font-mono",
      )}>
      {groupedWords.slice(startIndex).map((word, i) => {
        const wordIndex = startIndex + i
        return (
          <Word
            key={wordIndex}
            isRTL={isRTL}
            word={word}
            cursor={cursor}
            wordIndex={wordIndex}
            charStates={charStates}
          />
        )
      })}
    </div>
  )
})
