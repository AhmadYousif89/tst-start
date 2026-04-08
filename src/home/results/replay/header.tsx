import { useMemo } from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { PauseIcon, PlayIcon, ReplyIcon } from "lucide-react"

import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip"
import { calculateWpm } from "@/home/engine/logic"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Keystroke, CharState } from "@/home/context/engine.types"

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

export const PlaybackToolbar = ({
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
                className="p-1.5">
                press <Kbd className="bg-foreground! rounded!">P</Kbd>
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
                className="p-1.5">
                press <Kbd className="bg-foreground! rounded!">R</Kbd>
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
