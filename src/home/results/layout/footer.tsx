import { Image } from "@unpic/react"
import { Activity, useCallback, useState } from "react"

import Star1 from "/assets/images/pattern-star-1.svg"

import { cn } from "@/lib/utils"
import { ReplaySection } from "../replay"
import { ResultToolbar } from "../toolbar"
import { HeatmapHistory } from "../heatmap"
import { useResult } from "../result.context"
import { LogoImage } from "@/components/header/logo"
import { ResponsiveTooltipProvider } from "@/components/responsive-tooltip"

type Props = {
  caption?: string
  isNewRecord?: boolean
}

export const ResultFooter = ({ caption, isNewRecord }: Props) => {
  const { resultData, isScreenshotting } = useResult()
  const [showReplay, setShowReplay] = useState(false)
  const [isAnimatingReplay, setIsAnimatingReplay] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isAnimatingHistory, setIsAnimatingHistory] = useState(false)

  const toggleReplay = useCallback(() => {
    setShowReplay((prev) => !prev)
    setIsAnimatingReplay(true)
  }, [])

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev)
    setIsAnimatingHistory(true)
  }, [])

  const sessionIsValid = !resultData.isInvalid
  const sessionHasKeystrokes = resultData.keystrokes.length > 0
  const effectiveShowHistory = isScreenshotting || showHistory
  const effectiveShowReplay = !isScreenshotting && showReplay
  const shouldShowHistory = effectiveShowHistory || isAnimatingHistory
  const shouldShowReplay = effectiveShowReplay || isAnimatingReplay

  return (
    <footer className="text-background relative flex flex-col items-center justify-center gap-4 pb-4">
      {sessionHasKeystrokes ?
        <div className="mx-auto grid w-full max-w-5xl">
          <div
            className={cn(
              isScreenshotting ? "block w-full" : (
                "grid w-full transition-[grid-template-rows] duration-300 ease-in-out"
              ),
              effectiveShowHistory ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
            onTransitionEnd={() => setIsAnimatingHistory(false)}>
            <Activity mode={shouldShowHistory ? "visible" : "hidden"}>
              <ResponsiveTooltipProvider>
                <HeatmapHistory />
              </ResponsiveTooltipProvider>
            </Activity>
          </div>
          <div
            className={cn(
              isScreenshotting ? "grid-rows-[0fr]" : (
                "mt-4 grid w-full transition-[grid-template-rows] duration-300 ease-in-out"
              ),
              effectiveShowReplay ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
            onTransitionEnd={() => setIsAnimatingReplay(false)}>
            <Activity mode={shouldShowReplay ? "visible" : "hidden"}>
              <ReplaySection />
            </Activity>
          </div>
        </div>
      : null}

      {!isScreenshotting && (
        <ResultToolbar
          caption={caption}
          toggleHistory={toggleHistory}
          toggleReplay={toggleReplay}
        />
      )}

      {sessionIsValid && !isNewRecord && !isScreenshotting && (
        <Image
          src={Star1}
          alt="Star Pattern"
          width={40}
          height={40}
          className="absolute right-0 -bottom-10 size-10 md:size-18"
        />
      )}

      {/* Watermark */}
      {isScreenshotting && (
        <div
          id="screenshot-watermark"
          className="text-muted text-5 flex items-end justify-end gap-2 self-end px-4 font-bold">
          <span>
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="flex items-end gap-1 border-l-2 pl-2">
            <LogoImage className="size-6" /> TST
          </span>
        </div>
      )}
    </footer>
  )
}
