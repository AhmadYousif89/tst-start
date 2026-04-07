import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { RefreshCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRandomText } from "@/server/data"
import { useEngineConfig, useEngineActions } from "../context/engine.context"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"

export const RandomButton = () => {
  const { setTextData, setFocused } = useEngineActions()
  const { textData, language, isImmersive } = useEngineConfig()
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [isFetching, setIsFetching] = useState(false)

  const getRandomPassage = useServerFn(getRandomText)
  const currId = textData._id.toString()

  const handleRandomize = async () => {
    try {
      setFocused(false)
      setIsFetching(true)
      const newPassage = await getRandomPassage({ data: { id: currId, language } })
      if (newPassage) setTextData(newPassage)
    } catch (error) {
      console.error("Error fetching random text data:", error)
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div
      aria-hidden={isImmersive}
      className={cn("p-10 pt-0", isImmersive && "immersive-mode")}>
      <Tooltip open={isMobile ? false : undefined}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Randomize"
            disabled={isFetching}
            onClick={handleRandomize}
            onMouseDown={(e) => e.preventDefault()}
            className="text-muted-foreground focus-visible:ring-offset-2">
            <RefreshCcwIcon className={cn("size-5", isFetching && "animate-spin")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>Randomize</span>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
