import { useMemo, useRef } from "react"
import { ReplyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { useReplay } from "./use-replay"
import { useResult } from "./result.context"
import { PauseIcon, PlayIcon } from "./icons/replay.icons"

import { Word } from "@/home/engine/word"
import { Cursor } from "@/home/engine/cursor"
import { wordsGroup } from "@/home/engine/words"
import { isRtlLang } from "@/home/engine/engine-utils"
import { useSound } from "@/home/context/sound.context"
import { calculateWpm, getCharStates } from "@/home/engine/engine-logic"

export const ReplaySection = () => {
  const { playSound } = useSound()
  const { resultData } = useResult()
  const containerRef = useRef<HTMLDivElement>(null)

  const text = resultData.text
  const language = resultData.language
  const isRTL = isRtlLang(language)
  const ks = useMemo(() => resultData.keystrokes, [resultData.keystrokes])

  const characters = useMemo(() => {
    if (!text) return []
    const lastIdx = ks.reduce((max, k) => Math.max(max, k.charIndex), 0)
    return text.split("").slice(0, lastIdx + 1)
  }, [text, ks])

  const { isPlaying, play, pause, reset, currentIndex } = useReplay({
    keystrokes: ks,
    playSound,
  })

  const replayedKeystrokes = useMemo(() => ks.slice(0, currentIndex), [ks, currentIndex])

  const charStates = useMemo(
    () => getCharStates(characters, replayedKeystrokes),
    [characters, replayedKeystrokes],
  )

  const groupedWords = useMemo(() => wordsGroup(characters), [characters])

  // Get cursor position and extra offset
  const { cursor: cursorIndex, extraOffset } = useMemo(() => {
    let cursor = 0

    // Iterate through all played keystrokes to calculate current cursor state
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

  const currentTimeMs = useMemo(() => {
    if (currentIndex === 0 || !ks[currentIndex - 1]) return 0
    return ks[currentIndex - 1].timestampMs
  }, [currentIndex, ks])

  const currentWpm = useMemo(() => {
    if (currentTimeMs === 0) return 0
    const correctChars = charStates.filter((s) => s.state === "correct").length
    return calculateWpm(correctChars, currentTimeMs)
  }, [charStates, currentTimeMs])

  const currentTimeSec = Math.floor(currentTimeMs / 1000)

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <p className="text-6 md:text-5 text-muted-foreground/60 tracking-wide">
              watch replay
            </p>
            <div className="flex items-center gap-1">
              {/* Play/Pause button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={isPlaying ? pause : play}
                className="text-muted-foreground/75 size-6 rounded-full focus-visible:border-transparent"
                aria-label="play/pause"
                title="Play/Pause">
                {isPlaying ?
                  <PauseIcon />
                : <PlayIcon />}
              </Button>
              {/* Reset button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={reset}
                className="text-muted-foreground/75 size-6 rounded-full focus-visible:border-transparent"
                aria-label="replay"
                title="Reset">
                <ReplyIcon className="size-4" />
              </Button>
            </div>
          </div>
          {/* WPM and time */}
          <div className="text-6 md:text-5 flex items-center gap-2 font-mono">
            <span className="text-blue-400">{currentWpm}wpm</span>
            <span className="text-muted-foreground">{currentTimeSec}s</span>
          </div>
        </div>
        {/* Key count */}
        <div className="text-6 text-muted-foreground/60 tabular-nums">
          <span className="text-muted-foreground">{currentIndex} </span>/
          <span> {ks.length} keys</span>
        </div>
      </div>

      {/* Replay */}
      <div
        ref={containerRef}
        dir={isRTL ? "rtl" : "ltr"}
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
            className="text-5!"
            isReplay
          />
        ))}
      </div>
    </div>
  )
}
