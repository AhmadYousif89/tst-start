import { useMemo, useState } from "react"
import { useHotkey } from "@tanstack/react-hotkeys"

import { cn } from "@/lib/utils"
import { useResult } from "./result.context"
import { analyzeHeatmap } from "./heatmap/logic/history"
import { useMediaQuery } from "@/hooks/use-media-query"

import { isRtlLang } from "../engine/utils"
import { HeatmapWord } from "./heatmap/word"
import { HeatmapHeader } from "./heatmap/header"
import { HeatmapLegend } from "./heatmap/legend"

export { HEATMAP_COLORS } from "./heatmap/constants"

export const HeatmapHistory = () => {
  const { resultData, isScreenshotting } = useResult()
  const [isHeatmapVisible, setHeatmapVisibility] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1024px)")

  useHotkey("H", () => setHeatmapVisibility((pv) => !pv), { requireReset: true })

  const text = resultData.text
  const isRTL = isRtlLang(resultData.language)
  const effectiveIsEnabled = isScreenshotting || isHeatmapVisible

  const analysis = useMemo(() => {
    return analyzeHeatmap(resultData.keystrokes, text)
  }, [resultData.keystrokes, text])

  if (!text || !analysis) return null

  const { wordStatsMap, buckets, words } = analysis
  const showLegend = effectiveIsEnabled && buckets.length >= 6

  return (
    <div className="overflow-hidden">
      <div className="flex items-center gap-4 py-2">
        <HeatmapHeader
          isMobile={isMobile}
          isHeatmapVisible={isHeatmapVisible}
          setHeatmapVisibility={setHeatmapVisibility}
          isScreenshotting={isScreenshotting}
        />
        {showLegend && <HeatmapLegend buckets={buckets} />}
      </div>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "text-5 flex flex-wrap items-baseline gap-x-3.25 select-none",
          isRTL ? "text-right" : "text-left",
        )}>
        {words.map((word, i) => {
          const stats = wordStatsMap.get(i)
          return (
            <HeatmapWord
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
