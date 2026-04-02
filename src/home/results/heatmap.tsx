import { useMemo, useState, memo } from "react"

import { cn } from "@/lib/utils"
import { useResult } from "./result.context"
import { analyzeHeatmap, WordStats } from "./logic/heatmap"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ResponsiveTooltip,
  ResponsiveTooltipContent,
  ResponsiveTooltipTrigger,
} from "@/components/responsive-tooltip"
import { Button } from "@/components/ui/button"
import { HeatmapIcon } from "./icons/heatmap.icons"
import { isRtlLang } from "../engine/engine-utils"

const HEATMAP_COLORS = [
  "var(--red-500)", // Very Slow
  "var(--orange-400)", // Slow
  "var(--heatmap-neutral)", // Avg
  "var(--blue-200)", // Fast
  "var(--blue-600)", // Very Fast
]

type WordItemProps = {
  word: string
  stats: WordStats | null
  isHeatmapVisible: boolean
  isRTL: boolean
}

const WordItem = memo(({ word, stats, isHeatmapVisible, isRTL }: WordItemProps) => {
  if (!stats) {
    return (
      <div
        className={cn("text-muted cursor-default", isRTL ? "font-arabic" : "font-mono")}>
        {word}
      </div>
    )
  }
  const {
    wpm,
    hasError,
    errorCharIndices: errorIndices,
    extras,
    skipIndex,
    bucket,
  } = stats

  const colorVariable =
    isHeatmapVisible && bucket !== undefined ? HEATMAP_COLORS[bucket] : undefined

  const hasExtras = extras && extras.length > 0

  const renderedWord = useMemo(() => {
    const chars = word.split("")
    const result = []

    chars.forEach((char, idx) => {
      const isUntyped = stats?.typedChars?.[idx] === "\0"
      const isError = !isHeatmapVisible && errorIndices?.has(idx)

      if (skipIndex === idx)
        result.push(
          <ErrorIndicator
            key={`skip-${idx}`}
            className="mx-px"
          />,
        )

      result.push(
        <span
          key={idx}
          className={cn(isError && "text-red", isUntyped && !isError && "opacity-60")}>
          {char}
        </span>,
      )
    })

    if (hasExtras)
      result.push(
        <ErrorIndicator
          key="extras-indicator"
          className="ml-px"
        />,
      )

    return result
  }, [word, isHeatmapVisible, errorIndices, skipIndex, hasExtras])

  const content = (
    <span
      className={cn(
        !isHeatmapVisible && hasError && "decoration-red underline decoration-2",
      )}>
      {renderedWord}
    </span>
  )

  return (
    <ResponsiveTooltip delayDuration={0}>
      <ResponsiveTooltipTrigger asChild>
        <div
          style={{ color: colorVariable }}
          className={cn(
            "text-muted-foreground cursor-default",
            isRTL ? "font-arabic" : "font-mono",
          )}>
          {content}
        </div>
      </ResponsiveTooltipTrigger>
      <ResponsiveTooltipContent
        side="top"
        className="bg-accent cursor-default">
        <div className="flex flex-col items-center gap-1">
          <p className="text-foreground text-6">{Math.round(wpm)} wpm</p>
          <div className={cn("text-5", isRTL ? "font-arabic" : "font-mono")}>
            {word.split("").map((char, i) => {
              const typedChar = stats?.typedChars?.[i]
              if (typedChar === "\0") return null

              const isError = errorIndices?.has(i)
              return (
                <span
                  key={i}
                  className={cn(isError ? "text-red" : "text-muted-foreground")}>
                  {typedChar || char}
                </span>
              )
            })}
            {hasExtras && <span className="text-red">{extras.join("")}</span>}
          </div>
        </div>
      </ResponsiveTooltipContent>
    </ResponsiveTooltip>
  )
})

export const HeatmapHistory = () => {
  const { resultData, isScreenshotting } = useResult()
  const [isHeatmapVisible, setHeatmapVisibility] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1024px)")

  const text = resultData.text
  const isRTL = isRtlLang(resultData.language)
  const effectiveIsEnabled = isScreenshotting || isHeatmapVisible

  const analysis = useMemo(() => {
    return analyzeHeatmap(resultData.keystrokes, text)
  }, [resultData.keystrokes, text])

  if (!text || !analysis) return null

  const { wordStatsMap, buckets, words } = analysis

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-muted-foreground/60 text-6 md:text-5 flex items-center gap-2">
            input history
          </h3>
          <Tooltip open={isMobile ? false : undefined}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Toggle Heatmap"
                aria-pressed={isHeatmapVisible || isScreenshotting}
                className="group size-6 rounded-full hover:bg-transparent! focus-visible:border-transparent"
                onClick={() => setHeatmapVisibility(!isHeatmapVisible)}>
                <HeatmapIcon className="text-muted-foreground/75 group-hover:text-red group-aria-pressed:text-red size-5 md:size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span>Toggle Heatmap</span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Legend / Heat Map */}
        {effectiveIsEnabled && (
          <div className="text-6 flex items-center overflow-hidden rounded-full font-mono">
            {HEATMAP_COLORS.map((color, i) => (
              <div
                key={i}
                className="text-background cursor-default px-1 py-0.5 font-mono sm:px-2"
                style={{ backgroundColor: color }}>
                {i === 0 ?
                  `<${buckets[1]}`
                : i === 4 ?
                  `${buckets[4]}+`
                : `${buckets[i]}-${buckets[i + 1]}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Words History */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "text-5 flex flex-wrap items-baseline gap-x-3.25 select-none",
          isRTL ? "text-right" : "text-left",
        )}>
        {words.map((word, i) => {
          const stats = wordStatsMap.get(i)
          return (
            <WordItem
              key={i}
              word={word}
              stats={stats ?? null}
              isHeatmapVisible={effectiveIsEnabled}
              isRTL={isRTL}
            />
          )
        })}
      </div>
    </div>
  )
}

const ErrorIndicator = ({ className }: { className?: string }) => {
  return (
    <span className={cn("inline-grid items-center justify-center gap-0.5", className)}>
      <span className="bg-red size-0.5 rounded-full" />
      <span className="bg-red size-0.5 rounded-full" />
      <span className="bg-red size-0.5 rounded-full" />
    </span>
  )
}
