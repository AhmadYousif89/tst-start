import { useEffect } from "react"
import confetti from "canvas-confetti"

import { cn } from "@/lib/utils"
import { useResult } from "./result.context"

import { ResultHeader } from "./layout/header"
import { ResultFooter } from "./layout/footer"
import { ResultSection } from "./layout/section"

const resultTags = {
  invalid: {
    title: "Invalid Session",
    subtitle:
      "This round was too short or had bad performance. It won't be counted in your stats.",
    caption: "Try Again",
  },
  highscore: {
    title: "High Score Smashed!",
    subtitle: "You’re getting faster. That was incredible typing.",
    caption: "Beat This Score",
  },
  baseline: {
    title: "Baseline Established!",
    subtitle: "You’ve set the bar. Now the real challenge begins—time to beat it.",
    caption: "Beat This Score",
  },
  normal: {
    title: "Test Complete!",
    subtitle: "Solid run. Keep pushing to beat your high score.",
    caption: "Go Again",
  },
}

export const Results = () => {
  const { resultData, isScreenshotting } = useResult()

  const isBaseline = resultData.isFirst
  const isNewRecord = resultData.isBest && !resultData.isFirst

  useEffect(() => {
    if (!isNewRecord) return
    confetti({
      particleCount: 200,
      spread: 100,
      angle: -220,
      origin: { y: 0.225, x: 0.525 },
      gravity: 1,
      shapes: ["circle", "square"],
      colors: ["#177dff", "#4dd67b", "#f4dc73", "#d64d5b", "#ffffff"],
      drift: 1,
    })
  }, [isNewRecord])

  let tags = { title: "\u00A0", subtitle: "\u00A0", caption: "\u00A0" }

  if (resultData.isInvalid) {
    tags = resultTags["invalid"]
  } else if (isNewRecord) {
    tags = resultTags["highscore"]
  } else if (isBaseline) {
    tags = resultTags["baseline"]
  } else {
    tags = resultTags["normal"]
  }

  return (
    <main className="animate-in fade-in grow py-4 duration-500 md:py-6">
      <div
        id="result-screen"
        className={cn(isScreenshotting && "px-4 md:px-6")}>
        <ResultHeader
          isNewRecord={isNewRecord}
          isInvalid={resultData.isInvalid}
          title={tags.title}
          subTitle={tags.subtitle}
        />
        <ResultSection />
        <ResultFooter
          caption={tags.caption}
          isNewRecord={isNewRecord}
        />
      </div>
    </main>
  )
}
