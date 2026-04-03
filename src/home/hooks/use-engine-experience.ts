import { useEffect, useRef } from "react"
import { EngineStatus, EngineAction } from "../context/engine.types"

type ExperienceProps = {
  status: EngineStatus
  isFocused: boolean
  dispatch: React.Dispatch<EngineAction>
}

export const useEngineExperience = ({ status, isFocused, dispatch }: ExperienceProps) => {
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const statusRef = useRef(status)

  // Sync status for the timer closure
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Hide mouse cursor during immersive mode
  useEffect(() => {
    const isImmersive = status === "typing"
    document.documentElement.classList.toggle("cursor-none", isImmersive)
    return () => {
      document.documentElement.classList.remove("cursor-none")
    }
  }, [status])

  // Handle auto-pause when focus is lost
  useEffect(() => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)

    if (!isFocused && status === "typing") {
      overlayTimerRef.current = setTimeout(() => {
        if (statusRef.current === "typing")
          dispatch({ type: "PAUSE", timestamp: Date.now() })
      }, 500)
    }

    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    }
  }, [isFocused, status, dispatch])
}
