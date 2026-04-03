import { useEffect, useRef } from "react"
import { 
  EngineStatus, 
  TextMode, 
  EngineAction, 
  Keystroke 
} from "../context/engine.types"
import { calculateWpm, calculateAccuracy, getInitialTime } from "../engine/logic"

type MetricsTickProps = {
  status: EngineStatus
  mode: TextMode
  dispatch: React.Dispatch<EngineAction>
  getTimeElapsed: () => number
  endSession: () => void
  keystrokesRef: React.RefObject<Keystroke[]>
}

export const useMetricsTick = ({
  status,
  mode,
  dispatch,
  getTimeElapsed,
  endSession,
  keystrokesRef,
}: MetricsTickProps) => {
  const intervalRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    if (intervalRef.current || status !== "typing") return

    intervalRef.current = setInterval(() => {
      const elapsed = getTimeElapsed()
      const ks = keystrokesRef.current ?? []
      const correctKeys = ks.filter((k) => k.isCorrect).length
      const totalTyped = ks.filter((k) => k.typedChar !== "Backspace").length

      const isTimed = mode !== "passage"
      const limit = getInitialTime(mode) * 1000

      if (isTimed && elapsed >= limit) {
        endSession()
        return
      }

      dispatch({
        type: "TICK",
        isTimed,
        wpm: calculateWpm(correctKeys, elapsed),
        accuracy: calculateAccuracy(correctKeys, totalTyped),
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [status, mode, getTimeElapsed, endSession, keystrokesRef, dispatch])
}
