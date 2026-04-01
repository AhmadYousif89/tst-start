import { RotateCcwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEngineActions } from "@/home/context/engine.context"

type Props = {
  className?: string
  tooltip?: string
  actionName?: string
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

export const ResetButton = ({
  className,
  tooltip = "Restart",
  tooltipSide = "top",
}: Props) => {
  const { resetSession } = useEngineActions()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            resetSession({ shouldFocus: true })
          }}
          className={cn("text-muted-foreground focus-visible:ring-offset-2", className)}>
          <RotateCcwIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <span>{tooltip}</span>
      </TooltipContent>
    </Tooltip>
  )
}
