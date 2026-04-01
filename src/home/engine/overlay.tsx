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
      <OverlayMessage message="Click here to focus" />
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
      <svg
        className="size-5 opacity-90"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="currentColor">
        <path d="M606-105q-23 11-46 2.5T526-134L406-392l-93 130q-17 24-45 15t-28-38v-513q0-25 22.5-36t42.5 5l404 318q23 17 13.5 44T684-440H516l119 255q11 23 2.5 46T606-105Z" />
      </svg>
      <span>{message}</span>
    </p>
  )
}
