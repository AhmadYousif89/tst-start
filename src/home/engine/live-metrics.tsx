import { Activity } from "react"

import { cn } from "@/lib/utils"
import { useEngineConfig, useEngineMetrics } from "../context/engine.context"

export const LiveMetrics = () => {
  const { status } = useEngineConfig()
  const { wpm, timeLeft } = useEngineMetrics()

  return (
    <Activity mode={status === "typing" ? "visible" : "hidden"}>
      <div
        className={cn(
          "absolute top-1/2 left-4 -translate-y-46",
          "text-1 grid min-w-52 grid-cols-2 items-center font-mono duration-500 ease-in-out",
          status === "typing" && "animate-in fade-in",
        )}>
        <div className="grid">
          <span className="text-5 text-muted-foreground">WPM</span>
          <span className="text-blue-400">{wpm}</span>
        </div>
        <div className="grid">
          <span className="text-5 text-muted-foreground">Timer</span>
          <span className="text-blue-400">{timeLeft}</span>
        </div>
      </div>
    </Activity>
  )
}
