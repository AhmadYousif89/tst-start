import { useMemo } from "react"

import { getModeLabel } from "@/home/logic/mode"
import { calculateConsistency, calculateRawWpm } from "@/home/logic/metrics"
import { useResult } from "./result.context"

export const SessionStatistics = () => {
  const { resultData } = useResult()

  const stats = useMemo(() => {
    return {
      raw: calculateRawWpm(resultData.keystrokes.length, resultData.durationMs),
      consistency: calculateConsistency(resultData.keystrokes, resultData.durationMs),
      testType: {
        mode: getModeLabel(resultData.mode),
        cat: resultData.category,
      },
      duration: Math.round(resultData.durationMs / 1000),
    }
  }, [resultData])

  return (
    <div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 py-2 font-mono">
      {/* Test Type */}
      <div className="flex flex-col gap-1">
        <span className="text-6 md:text-5 text-muted-foreground">test type</span>
        <div className="text-6 flex flex-col text-blue-400">
          <span>{stats.testType.mode}</span>
          <span className="text-6 text-blue-400 capitalize">{stats.testType.cat}</span>
        </div>
      </div>

      {/* Raw */}
      <div className="flex flex-col gap-1">
        <span className="text-6 md:text-5 text-muted-foreground">raw</span>
        <span className="text-2 font-medium text-blue-400">{stats.raw}</span>
      </div>

      {/* Consistency */}
      <div className="flex flex-col gap-1">
        <span className="text-6 md:text-5 text-muted-foreground">consistency</span>
        <span className="text-2 font-medium text-blue-400">{stats.consistency}%</span>
      </div>

      {/* Time */}
      <div className="flex flex-col gap-1">
        <span className="text-6 md:text-5 text-muted-foreground">time</span>
        <span className="text-2 font-medium text-blue-400">{stats.duration}s</span>
      </div>
    </div>
  )
}
