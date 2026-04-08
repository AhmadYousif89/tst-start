import { memo, useMemo } from "react"

import { cn } from "@/lib/utils"
import { HEATMAP_COLORS } from "./constants"
import { WordStats } from "./logic/history"
import {
  ResponsiveTooltip,
  ResponsiveTooltipContent,
  ResponsiveTooltipTrigger,
} from "@/components/responsive-tooltip"

type WordItemProps = {
  word: string
  stats: WordStats | null
  isHeatmapVisible: boolean
  isRTL: boolean
}

export const HeatmapWord = memo(
  ({ word, stats, isHeatmapVisible, isRTL }: WordItemProps) => {
    if (!stats) {
      return (
        <div
          className={cn(
            "text-muted cursor-default",
            isRTL ? "font-arabic" : "font-mono",
          )}>
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
      <ResponsiveTooltip>
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
  },
)

const ErrorIndicator = ({ className }: { className?: string }) => {
  return (
    <span className={cn("inline-grid items-center justify-center gap-0.5", className)}>
      <span className="bg-red size-0.5 rounded-full" />
      <span className="bg-red size-0.5 rounded-full" />
      <span className="bg-red size-0.5 rounded-full" />
    </span>
  )
}
