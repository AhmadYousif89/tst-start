import { RotateCcwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEngineActions } from "@/home/context/engine.context"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const { resetSession } = useEngineActions()

  return (
    <Tooltip open={isMobile ? false : undefined}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => resetSession()}
          onMouseDown={(e) => e.preventDefault()}
          className={cn("text-muted-foreground focus-visible:ring-offset-2", className)}>
          <span className="sr-only">{tooltip}</span>
          <RotateCcwIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        <span>{tooltip}</span>
      </TooltipContent>
    </Tooltip>
  )
}
