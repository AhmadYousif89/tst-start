import { useEffect, useMemo } from "react"

import { cn } from "@/lib/utils"
import { isRtlLang } from "./utils"
import {
  useEngineActions,
  useEngineConfig,
  useEngineKeystroke,
} from "../context/engine.context"
import { useSound } from "../context/sound.context"
import {
  getCharStates,
  getWordStart,
  isWordPerfect,
  calculateNextCursor,
  getWordEnd,
  getWordRanges,
  getWordIndexByCursor,
} from "./logic"

const SIDE_BUFFER = 40

type TypingInputProps = {
  characters: string[]
  containerRef: React.RefObject<HTMLDivElement | null>
  typingInputRef: React.RefObject<HTMLTextAreaElement | null>
}

export const TypingInput = ({
  characters,
  containerRef,
  typingInputRef,
}: TypingInputProps) => {
  const { playSound } = useSound()
  const configCtx = useEngineConfig()
  const ActionsCtx = useEngineActions()
  const keystrokeCtx = useEngineKeystroke()

  const { status, textData, isFocused, layout } = configCtx
  const { cursor, extraOffset, keystrokes, lockedCursorRef } = keystrokeCtx
  const { endSession, startSession, resumeSession, getTimeElapsed, setCursor } =
    ActionsCtx

  useEffect(() => {
    typingInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (isFocused && (status === "idle" || status === "paused")) {
      typingInputRef.current?.focus()
    }
  }, [textData.text, status, isFocused])

  const handleBeforeInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
    const data = e.data
    if (!data || data.length !== 1 || data === "\n") return
    handleTyping(data)
  }

  const handleTyping = (typedChar: string) => {
    if (!isFocused) return
    if (status === "finished" || cursor >= characters.length) return
    if (typedChar === " " && cursor === 0) return

    playSound()

    if (status === "idle") startSession()
    if (status === "paused") resumeSession()

    const expectedChar = characters[cursor]
    const timestampMs = getTimeElapsed()
    const isCorrect = typedChar === expectedChar

    if (expectedChar === " " && typedChar !== " ") {
      const containerRect = containerRef.current?.getBoundingClientRect()
      const cursorElement =
        containerRef.current?.querySelector<HTMLElement>(".active-cursor")
      const cursorRect = cursorElement?.getBoundingClientRect()
      if (cursorRect && containerRect) {
        const isOverflowing =
          isRTL ?
            cursorRect.left < containerRect.left + SIDE_BUFFER
          : cursorRect.right > containerRect.right - SIDE_BUFFER

        if (isOverflowing) return
      }
    }

    if (typedChar === " " && isCorrect) {
      const wordStart = getWordStart(cursor, characters)
      const currentStates = getCharStates(characters, keystrokes.current || [])
      const wordIsPerfect = isWordPerfect(wordStart, cursor, currentStates)

      if (wordIsPerfect) {
        lockedCursorRef.current = cursor + 1
      }
    }

    if (expectedChar === " " && typedChar !== " ") {
      if (extraOffset >= 20) return

      keystrokes.current?.push({
        charIndex: cursor,
        expectedChar,
        typedChar,
        isCorrect: false,
        timestampMs,
        positionGroup: Math.floor(cursor / 10),
      })
      setCursor(cursor, extraOffset + 1)
      return
    }

    if (typedChar === " " && expectedChar !== " ") {
      const isWordStart = cursor === getWordStart(cursor, characters)
      const currentStates = getCharStates(characters, keystrokes.current || [])
      const isDirty =
        currentStates[cursor].typedChar !== "" ||
        (currentStates[cursor].extras && currentStates[cursor].extras.length > 0)

      if (isWordStart && !isDirty) return

      let spaceIndex = cursor
      while (spaceIndex < characters.length && characters[spaceIndex] !== " ") {
        spaceIndex++
      }

      const targetIndex = Math.min(characters.length - 1, spaceIndex)
      keystrokes.current?.push({
        charIndex: targetIndex,
        expectedChar: characters[targetIndex],
        typedChar: " ",
        isCorrect: false,
        timestampMs,
        positionGroup: Math.floor(targetIndex / 10),
        skipOrigin: cursor,
      })

      const nextCursor = Math.min(characters.length, spaceIndex + 1)
      setCursor(nextCursor, 0)
      if (nextCursor >= characters.length) endSession()
      return
    }

    keystrokes.current?.push({
      charIndex: cursor,
      expectedChar,
      typedChar,
      isCorrect,
      timestampMs,
      positionGroup: Math.floor(cursor / 10),
    })

    setCursor((ps: number) => {
      const nextCursor = calculateNextCursor(ps, typedChar, characters)
      if (nextCursor >= characters.length) {
        endSession()
      }
      return nextCursor
    }, 0)
  }

  const handleKeydown = (e: React.KeyboardEvent) => {
    if (!isFocused || status === "finished") return

    const typedChar = e.key

    if (typedChar === "Backspace") {
      e.preventDefault()
      e.stopPropagation()

      if (status === "paused") resumeSession()
      if (cursor === 0 && extraOffset === 0) return
      if (cursor <= lockedCursorRef.current && extraOffset === 0) return

      playSound()

      const isControlModifier = e.ctrlKey || e.metaKey || e.altKey
      const expectedChar = characters[cursor]
      const timestampMs = getTimeElapsed()

      if (extraOffset > 0) {
        if (isControlModifier) {
          for (let i = 0; i < extraOffset; i++) {
            keystrokes.current?.push({
              charIndex: cursor,
              expectedChar,
              typedChar: "Backspace",
              isCorrect: false,
              timestampMs,
              positionGroup: Math.floor(cursor / 10),
            })
          }
          setCursor(cursor, 0)
        } else {
          keystrokes.current?.push({
            charIndex: cursor,
            expectedChar,
            typedChar: "Backspace",
            isCorrect: false,
            timestampMs,
            positionGroup: Math.floor(cursor / 10),
          })
          setCursor(cursor, extraOffset - 1)
        }
        return
      }

      let nextCursor = calculateNextCursor(
        cursor,
        "Backspace",
        characters,
        isControlModifier,
        lockedCursorRef.current,
      )

      if (nextCursor < cursor) {
        const currentStates = getCharStates(characters, keystrokes.current || [])
        if (isControlModifier) {
          for (let i = cursor - 1; i >= nextCursor; i--) {
            const totalExtraOffset = currentStates[i].extras?.length || 0
            for (let j = 0; j <= totalExtraOffset; j++) {
              keystrokes.current?.push({
                charIndex: i,
                expectedChar: characters[i],
                typedChar: "Backspace",
                isCorrect: false,
                timestampMs,
                positionGroup: Math.floor(i / 10),
              })
            }
          }
          setCursor(nextCursor, 0)
        } else {
          const targetIndex = nextCursor
          const totalExtraOffset = currentStates[targetIndex].extras?.length || 0
          const lastStroke = keystrokes.current
            ?.slice()
            .reverse()
            .find((k) => k.charIndex === targetIndex && k.typedChar !== "Backspace")

          const finalCursor =
            lastStroke?.skipOrigin !== undefined ? lastStroke.skipOrigin : targetIndex

          keystrokes.current?.push({
            charIndex: targetIndex,
            expectedChar: characters[targetIndex],
            typedChar: "Backspace",
            isCorrect: false,
            timestampMs,
            positionGroup: Math.floor(targetIndex / 10),
          })
          setCursor(finalCursor, totalExtraOffset)
        }
      }
      return
    }

    const isModifier = e.ctrlKey || e.metaKey || e.altKey

    if (typedChar.length === 1 && !isModifier) {
      e.preventDefault()
      e.stopPropagation()
      handleTyping(typedChar)
    }
  }

  const isRTL = isRtlLang(textData?.language)

  const { currentWord } = useMemo(() => {
    const wordStartIndex = getWordStart(cursor, characters)
    const wordEndIndex = getWordEnd(cursor, characters)
    const currentWord = textData.text.slice(wordStartIndex, wordEndIndex)
    return { currentWord }
  }, [cursor, characters, textData.text])

  const wordRanges = useMemo(() => getWordRanges(textData.text), [textData.text])
  const wordIndex = useMemo(
    () => getWordIndexByCursor(cursor, wordRanges),
    [cursor, wordRanges],
  )

  useEffect(() => {
    if (!containerRef.current) return
    const wordEl = containerRef.current.querySelector(
      `[data-wordindex="${wordIndex}"]`,
    ) as HTMLElement
    if (!wordEl) return
    const top = wordEl.offsetTop
    const width = wordEl.offsetWidth
    const height = wordEl.offsetHeight
    const left = wordEl.offsetLeft
    const right = containerRef.current.offsetWidth - wordEl.offsetLeft - width

    typingInputRef.current?.style.setProperty("top", `${top}px`)
    if (isRTL) {
      typingInputRef.current?.style.setProperty("right", `${right}px`)
      typingInputRef.current?.style.setProperty("left", `auto`)
    } else {
      typingInputRef.current?.style.setProperty("left", `${left}px`)
      typingInputRef.current?.style.setProperty("right", `auto`)
    }
    typingInputRef.current?.style.setProperty("width", `${width}px`)
    typingInputRef.current?.style.setProperty("height", `${height}px`)
  }, [wordIndex, layout.version, isRTL])

  return (
    <textarea
      ref={typingInputRef}
      aria-label={currentWord}
      onKeyDown={handleKeydown}
      onBeforeInput={handleBeforeInput}
      dir={isRTL ? "rtl" : "ltr"}
      autoCapitalize="none"
      spellCheck="false"
      autoCorrect="off"
      inputMode="text"
      className={cn(
        "pointer-events-none absolute resize-none overflow-hidden opacity-0 outline-none",
        isRTL ? "right-0" : "left-0",
      )}
    />
  )
}
