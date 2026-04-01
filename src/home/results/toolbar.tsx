import { useState } from "react"
import { ChevronsRightIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { ScreenshotButton } from "./share"
import { ResetButton } from "../main/reset.button"
import { NextButton } from "../main/next.button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useResult } from "./result.context"

type Props = {
  caption?: string
  toggleHistory: () => void
  toggleReplay: () => void
}

export const ResultToolbar = ({ caption, toggleHistory, toggleReplay }: Props) => {
  const { resultData } = useResult()
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [replayOpen, setReplayOpen] = useState(false)

  const sessionIsValid = !resultData.isInvalid
  const sessionHasKeystrokes = resultData.keystrokes.length > 0

  return (
    <div className="flex items-center justify-center gap-4">
      <NextButton inResults />

      <ResetButton
        tooltip={caption}
        className="text-foreground"
        actionName="restart"
        tooltipSide="bottom"
      />

      {sessionHasKeystrokes && sessionIsValid ?
        <>
          <Tooltip
            open={isMobile ? false : historyOpen}
            onOpenChange={setHistoryOpen}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-foreground focus-visible:ring-offset-2"
                onClick={() => {
                  setHistoryOpen(false)
                  toggleHistory()
                }}>
                <LayersIcon className="size-5 rotate-90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Input History</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip
            open={isMobile ? false : replayOpen}
            onOpenChange={setReplayOpen}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-foreground focus-visible:ring-offset-2"
                onClick={() => {
                  setReplayOpen(false)
                  toggleReplay()
                }}>
                <ChevronsRightIcon className="size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Watch Replay</span>
            </TooltipContent>
          </Tooltip>
        </>
      : null}

      {sessionIsValid && <ScreenshotButton />}
    </div>
  )
}
