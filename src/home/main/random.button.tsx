import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { RefreshCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRandomText } from "@/server/data"
import { useEngineConfig, useEngineActions } from "../context/engine.context"
import { cn } from "@/lib/utils"

export const RandomButton = () => {
  const { setTextData, setFocused } = useEngineActions()
  const { textData, language, isImmersive } = useEngineConfig()
  const [isFetching, setIsFetching] = useState(false)

  const getRandomPassage = useServerFn(getRandomText)
  const currId = textData._id.toString()

  const handleRandomize = async () => {
    try {
      setFocused(false)
      setIsFetching(true)
      const newPassage = await getRandomPassage({ data: { id: currId, language } })
      if (newPassage) {
        setTextData(newPassage, { shouldFocus: true })
      }
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
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground focus-visible:ring-offset-2"
        disabled={isFetching}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleRandomize}>
        <RefreshCcwIcon className={cn("size-5", isFetching && "animate-spin")} />
      </Button>
    </div>
  )
}
