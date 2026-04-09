import { useMemo, useRef } from "react"

import { cn } from "@/lib/utils"
import { useResult } from "./result.context"
import { useSound } from "@/home/context/sound.context"

import { useReplay } from "./replay/use-replay"
import { PlaybackToolbar } from "./replay/header"
import { Word } from "@/home/engine/word"
import { Cursor } from "@/home/engine/cursor"
import { wordsGroup } from "@/home/engine/words"
import { getCharStates } from "@/home/logic/char-state"
import { isRtlLang } from "@/home/utils"

export const ReplaySection = () => {
  const { playSound } = useSound()
  const { resultData } = useResult()
  const containerRef = useRef<HTMLDivElement>(null)

  const ks = useMemo(() => resultData.keystrokes, [resultData.keystrokes])
  const typedIndices = useMemo(() => new Set(ks.map((k) => k.charIndex)), [ks])

  const replay = useReplay({ keystrokes: ks, playSound })
  const { currentIndex } = replay

  const text = resultData.text
  const isRTL = isRtlLang(resultData.language)

  const characters = useMemo(() => {
    if (!text) return []
    const lastIdx = ks.reduce((max, k) => Math.max(max, k.charIndex), 0)
    // Add one extra character so the cursor has a valid element to attach to when advancing.
    const chars = text.split("").slice(0, lastIdx + 2)
    // If lastIdx was the absolute end of the text, append a dummy space.
    if (chars.length === lastIdx + 1) chars.push(" ")

    return chars
  }, [text, ks])

  const replayedKeystrokes = useMemo(
    () => new Set(ks.slice(0, currentIndex)),
    [ks, currentIndex],
  )

  const charStates = useMemo(
    () => getCharStates(characters, [...replayedKeystrokes]),
    [characters, replayedKeystrokes],
  )

  const groupedWords = useMemo(() => wordsGroup(characters), [characters])

  // Get cursor position and extra offset
  const { cursor: cursorIndex, extraOffset } = useMemo(() => {
    let cursor = 0
    for (const k of replayedKeystrokes) {
      if (k.typedChar === "Backspace") {
        if (k.skipOrigin !== undefined) cursor = k.skipOrigin
        else cursor = k.charIndex
      } else {
        const isExtra = characters[k.charIndex] === " " && k.typedChar !== " "
        if (isExtra) cursor = k.charIndex
        else cursor = k.charIndex + 1
      }
    }

    const currentExtras = charStates[cursor]?.extras?.length || 0
    return { cursor, extraOffset: currentExtras }
  }, [replayedKeystrokes, characters, charStates])

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const charIndex = parseInt(target.getAttribute("data-charindex") || "", 10)
    if (!isNaN(charIndex)) {
      let ksIndex = ks.findIndex((k) => k.charIndex === charIndex)
      if (ksIndex !== -1) {
        replay.jumpToIndex(ksIndex + 1)
      } else {
        ksIndex = ks.findIndex((k) => k.charIndex > charIndex)
        if (ksIndex !== -1)
          replay.jumpToIndex(ksIndex) // first keystroke after the jumped character
        else replay.jumpToIndex(ks.length) // last keystroke
      }
    }
  }

  return (
    <div className="overflow-hidden">
      <PlaybackToolbar
        {...replay}
        ks={ks}
        cursor={cursorIndex}
        charStates={charStates}
      />

      {/* Replay */}
      <div
        ref={containerRef}
        dir={isRTL ? "rtl" : "ltr"}
        onClick={handleTimelineClick}
        className={cn(
          "relative flex flex-wrap items-center gap-x-1 pb-2 select-none",
          isRTL ? "font-arabic" : "font-mono",
        )}>
        <Cursor
          containerRef={containerRef}
          isRTL={isRTL}
          cursor={cursorIndex}
          extraOffset={extraOffset}
          cursorStyle="underline"
          isReplaying
        />
        {groupedWords.map((word, wordIndex) => (
          <Word
            key={wordIndex}
            word={word}
            isRTL={isRTL}
            wordIndex={wordIndex}
            charStates={charStates}
            cursor={cursorIndex}
            typedIndices={typedIndices}
            className="text-5"
            isReplay
          />
        ))}
      </div>
    </div>
  )
}
