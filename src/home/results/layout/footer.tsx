import { Image } from "@unpic/react"
import { useCallback, useState } from "react"

import Star1 from "/assets/images/pattern-star-1.svg"

import { useResult } from "../result.context"
import { ResultToolbar } from "../toolbar"
import { AnalyticSection } from "../analytics"
import { LogoImage } from "@/components/header/logo"

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

  return (
    <footer className="text-background relative flex flex-col items-center justify-center gap-4 pb-4">
      {sessionHasKeystrokes ?
        <AnalyticSection
          showReplay={showReplay}
          showHistory={showHistory}
          isAnimatingReplay={isAnimatingReplay}
          isAnimatingHistory={isAnimatingHistory}
          setIsAnimatingReplay={setIsAnimatingReplay}
          setIsAnimatingHistory={setIsAnimatingHistory}
        />
      : !sessionHasKeystrokes && sessionIsValid ?
        <p className="text-muted-foreground pb-4 whitespace-nowrap">
          Analytics are no longer available for this test.
        </p>
      : !sessionIsValid ?
        <p className="text-muted-foreground pb-4 whitespace-nowrap">
          No analytics available for this test.
        </p>
      : null}

      {!isScreenshotting && (
        <ResultToolbar
          caption={caption}
          toggleHistory={toggleHistory}
          toggleReplay={toggleReplay}
        />
      )}

      {sessionIsValid && !isNewRecord && (
        <Image
          src={Star1}
          alt="Star Pattern"
          width={40}
          height={40}
          className="absolute right-0 -bottom-20 size-10 md:size-18"
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
