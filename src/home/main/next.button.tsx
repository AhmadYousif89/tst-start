import { ChevronRightIcon } from "lucide-react"
import { useServerFn } from "@tanstack/react-start"

import { cn } from "@/lib/utils"
import { getNextText } from "@/server/data"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEngineActions, useEngineConfig } from "../context/engine.context"
import { useMediaQuery } from "@/hooks/use-media-query"

export const NextButton = ({ className }: { className?: string }) => {
  const { textData } = useEngineConfig()
  const { setTextData } = useEngineActions()
  const getNextPassage = useServerFn(getNextText)

  const isMobile = useMediaQuery("(max-width: 1024px)")

  const handleNext = async () => {
    const newTextData = await getNextPassage({
      data: { id: textData._id.toString(), lang: textData.language },
    })
    if (newTextData) setTextData(newTextData)
  }

  return (
    <Tooltip open={isMobile ? false : undefined}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          onMouseDown={(e) => e.preventDefault()}
          className={cn("text-foreground focus-visible:ring-offset-2", className)}>
          <span className="sr-only">Next Text</span>
          <ChevronRightIcon className={cn("size-6")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>Next Text</span>
      </TooltipContent>
    </Tooltip>
  )
}
