import { cn } from "@/lib/utils"
import { useEngineActions, useEngineConfig } from "../context/engine.context"

export const EngineOverlay = () => {
  const { showOverlay } = useEngineConfig()
  const { resumeSession } = useEngineActions()

  return (
    <div
      onClick={resumeSession}
      className={cn(
        "bg-background/30 absolute inset-0 z-20 flex items-center justify-center font-mono font-medium",
        "transition-all duration-300 ease-in-out",
        showOverlay ?
          "pointer-events-auto opacity-100 delay-500"
        : "pointer-events-none invisible opacity-0",
      )}>
      <OverlayMessage message="Click here or press any key to focus" />
    </div>
  )
}

const OverlayMessage = ({
  message,
  className,
}: {
  message: string
  className?: string
}) => {
  return (
    <p
      className={cn(
        "text-foreground/80 text-5 flex items-center gap-1.5 tracking-wide",
        className,
      )}>
      <span>{message}</span>
    </p>
  )
}
