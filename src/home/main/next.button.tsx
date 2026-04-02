import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { getNextText } from "@/server/data"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEngineActions, useEngineConfig } from "../context/engine.context"
import { useMediaQuery } from "@/hooks/use-media-query"

type Props = {
  className?: string
  inResults?: boolean
}

export const NextButton = ({ className, inResults }: Props) => {
  const { textData } = useEngineConfig()
  const { setTextData } = useEngineActions()
  const getNextPassage = useServerFn(getNextText)

  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [open, setOpen] = useState(false)

  const handleNext = async () => {
    setOpen(false)
    const newTextData = await getNextPassage({
      data: { id: textData._id.toString(), lang: textData.language },
    })
    if (newTextData) setTextData(newTextData)
  }

  return (
    <Tooltip
      open={isMobile ? false : open}
      onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          onMouseDown={(e) => e.preventDefault()}
          className={cn("text-foreground focus-visible:ring-offset-2", className)}>
          <ChevronRightIcon className={cn("size-6")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={inResults ? "bottom" : "top"}>
        <span>Next Text</span>
      </TooltipContent>
    </Tooltip>
  )
}
