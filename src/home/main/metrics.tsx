import { formatTime } from "../engine/utils"
import { useEngineConfig, useEngineMetrics } from "../context/engine.context"
import { Progressbar } from "@/components/ui/progress-bar"
import { useHydrated } from "@tanstack/react-router"

export const Metrics = () => {
  const hydrated = useHydrated()
  const { mode, status } = useEngineConfig()
  const { wpm, accuracy, timeLeft, progress } = useEngineMetrics()

  if (!hydrated) return null

  let timeLeftStyle = ""
  if (status === "typing" || status === "paused")
    timeLeftStyle = "dark:text-yellow text-orange"
  if (mode !== "passage" && timeLeft < 10) timeLeftStyle = "text-red"
  if (mode === "passage" && status === "finished") timeLeftStyle = "text-green"

  return (
    <div className="overflow-hidden">
      <div className="grid grid-flow-col justify-center gap-5 pb-4 text-center md:gap-4">
        <div className="flex flex-col gap-2 max-md:grow md:flex-row md:gap-3">
          <span className="text-muted-foreground text-3-mobile md:text-3">WPM:</span>
          <span className="text-2">{Math.round(wpm)}</span>
        </div>
        <div className="bg-border mx-5 h-full w-px" />
        <div className="flex flex-col gap-2 max-md:grow md:flex-row md:gap-3">
          <span className="text-muted-foreground text-3-mobile md:text-3">Accuracy:</span>
          <span
            className={`text-2 ${
              status !== "idle" && accuracy === 100 ? "text-green"
              : accuracy < 100 ? "text-red"
              : ""
            }`}>
            {Math.round(accuracy)}%
          </span>
        </div>
        <div className="bg-border mx-5 h-full w-px" />
        <div className="flex flex-col gap-2 max-md:grow md:flex-row md:gap-3">
          <span className="text-muted-foreground text-3-mobile md:text-3">Time:</span>
          <span className={`text-2 min-w-20 ${timeLeftStyle}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <Progressbar
        progress={progress}
        className="h-px"
      />
    </div>
  )
}
