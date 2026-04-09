import { useEffect, useRef } from "react"

import { EngineStatus, TextMode, EngineAction, Keystroke } from "../context/engine.types"
import { calculateWpm, calculateAccuracy } from "../logic/metrics"
import { getInitialTime } from "../logic/mode"

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
  // Performance: avoid scanning the entire keystrokes array on every tick.
  const processedLenRef = useRef(0)
  const correctKeysRef = useRef(0)
  const totalTypedRef = useRef(0)

  useEffect(() => {
    if (intervalRef.current || status !== "typing") return

    const isTimed = mode !== "passage"
    const limitMs = getInitialTime(mode) * 1000

    intervalRef.current = setInterval(() => {
      const elapsed = getTimeElapsed()
      const ks = keystrokesRef.current ?? []
      // Reset counters if a new session replaced the array (or it was truncated).
      if (ks.length < processedLenRef.current) {
        processedLenRef.current = 0
        correctKeysRef.current = 0
        totalTypedRef.current = 0
      }
      // Process only newly-added keystrokes since the last tick.
      for (let i = processedLenRef.current; i < ks.length; i++) {
        const k = ks[i]
        if (k.isCorrect) correctKeysRef.current++
        if (k.typedChar !== "Backspace") totalTypedRef.current++
      }
      processedLenRef.current = ks.length

      if (isTimed && elapsed >= limitMs) {
        endSession()
        return
      }

      dispatch({
        type: "TICK",
        isTimed,
        wpm: calculateWpm(correctKeysRef.current, elapsed),
        accuracy: calculateAccuracy(correctKeysRef.current, totalTypedRef.current),
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
