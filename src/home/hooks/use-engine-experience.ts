import { useEffect, useRef } from "react"
import { EngineStatus, EngineAction } from "../context/engine.types"

type ExperienceProps = {
  status: EngineStatus
  isFocused: boolean
  isImmersive: boolean
  dispatch: React.Dispatch<EngineAction>
}

export const useEngineExperience = ({
  status,
  isFocused,
  isImmersive,
  dispatch,
}: ExperienceProps) => {
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const statusRef = useRef(status)

  // Guard against stale status
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Hide mouse cursor during immersive mode
  useEffect(() => {
    document.documentElement.classList.toggle("cursor-none", isImmersive)
    return () => {
      document.documentElement.classList.remove("cursor-none")
    }
  }, [isImmersive])

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
