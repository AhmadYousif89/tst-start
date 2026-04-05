import { useMemo, useRef } from "react"
import { ReplyIcon } from "lucide-react"
import { useHotkey } from "@tanstack/react-hotkeys"

import { cn } from "@/lib/utils"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useReplay } from "./use-replay"
import { useResult } from "./result.context"
import { PauseIcon, PlayIcon } from "./icons/replay.icons"

import { Word } from "@/home/engine/word"
import { Cursor } from "@/home/engine/cursor"
import { wordsGroup } from "@/home/engine/words"
import { isRtlLang } from "@/home/engine/utils"
import { useSound } from "@/home/context/sound.context"
import { calculateWpm, getCharStates } from "@/home/engine/logic"
import { CharState, Keystroke } from "../context/engine.types"
import { useMediaQuery } from "@/hooks/use-media-query"

export const ReplaySection = () => {
  const { playSound } = useSound()
  const { resultData } = useResult()
  const containerRef = useRef<HTMLDivElement>(null)

  const ks = useMemo(() => resultData.keystrokes, [resultData.keystrokes])

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

  const replayedKeystrokes = useMemo(() => ks.slice(0, currentIndex), [ks, currentIndex])

  const charStates = useMemo(
    () => getCharStates(characters, replayedKeystrokes),
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

  return (
    <div className="overflow-hidden">
      <ReplayToolbar
        {...replay}
        ks={ks}
        cursor={cursorIndex}
        charStates={charStates}
      />

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
            className="text-5"
            isReplay
          />
        ))}
      </div>
    </div>
  )
}

type ReplayToolbarProps = {
  ks: Keystroke[]
  charStates: CharState[]
  cursor: number
  currentIndex: number
  isPlaying: boolean
  play: () => void
  pause: () => void
  reset: () => void
}

const ReplayToolbar = ({
  ks,
  charStates,
  cursor,
  currentIndex,
  isPlaying,
  play,
  pause,
  reset,
}: ReplayToolbarProps) => {
  const isMobile = useMediaQuery("(max-width: 1024px)")

  useHotkey(
    "P",
    () => {
      if (!isPlaying) play()
      else pause()
    },
    { requireReset: true },
  )
  useHotkey("R", reset, { requireReset: true })

  const currentTimeMs = useMemo(() => {
    if (cursor === 0 || !ks[cursor - 1]) return 0
    return ks[cursor - 1].timestampMs
  }, [cursor, ks])

  const currentWpm = useMemo(() => {
    if (currentTimeMs === 0) return 0
    const correctChars = charStates.filter((s) => s.state === "correct").length
    return calculateWpm(correctChars, currentTimeMs)
  }, [charStates, currentTimeMs])

  const currentTimeSec = Math.floor(currentTimeMs / 1000)

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <p className="text-6 md:text-5 text-muted-foreground/60 tracking-wide">
            watch replay
          </p>
          <div className="flex items-center gap-1">
            <Tooltip open={isMobile ? false : undefined}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Play/Pause"
                  aria-label="play/pause"
                  onClick={isPlaying ? pause : play}
                  className="text-muted-foreground/75 size-6 rounded-full focus-visible:border-transparent">
                  {isPlaying ?
                    <PauseIcon />
                  : <PlayIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="flex items-center gap-1">
                press <Kbd className="bg-foreground! rounded!">P</Kbd> to{" "}
                {isPlaying ? "pause" : "play"}
              </TooltipContent>
            </Tooltip>
            <Tooltip open={isMobile ? false : undefined}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  title="Reset"
                  variant="ghost"
                  aria-label="replay"
                  onClick={reset}
                  className="text-muted-foreground/75 size-6 rounded-full focus-visible:border-transparent">
                  <ReplyIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="flex items-center gap-1">
                press <Kbd className="bg-foreground! rounded!">R</Kbd> to reset
              </TooltipContent>
            </Tooltip>
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
  )
}
