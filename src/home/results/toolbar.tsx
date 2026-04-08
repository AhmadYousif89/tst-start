import { useState } from "react"
import { ChevronsRightIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { ScreenshotButton } from "./share"
import { useResult } from "./result.context"
import { NextButton } from "../main/next.button"
import { ResetButton } from "../main/reset.button"
import { useMediaQuery } from "@/hooks/use-media-query"

type Props = {
  caption: string
  toggleHistory: () => void
  toggleReplay: () => void
}

export const ResultToolbar = ({ caption, toggleHistory, toggleReplay }: Props) => {
  const { resultData } = useResult()

  const sessionIsValid = !resultData.isInvalid
  const sessionHasKeystrokes = resultData.keystrokes.length > 0

  return (
    <div className="flex items-center justify-center gap-4">
      <NextButton />
      <ResetButton
        tooltip={caption}
        actionName="restart"
        tooltipSide="bottom"
        className="text-foreground"
      />
      {sessionHasKeystrokes && sessionIsValid ?
        <>
          <InputHistoryButton toggleHistory={toggleHistory} />
          <ReplayButton toggleReplay={toggleReplay} />
        </>
      : null}
      {sessionIsValid && <ScreenshotButton />}
    </div>
  )
}

const InputHistoryButton = ({ toggleHistory }: { toggleHistory: () => void }) => {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [historyOpen, setHistoryOpen] = useState(false)

  const handleToggleHistory = () => {
    setHistoryOpen(false)
    toggleHistory()
  }

  return (
    <Tooltip
      open={isMobile ? false : historyOpen}
      onOpenChange={setHistoryOpen}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggleHistory}
          className="text-foreground focus-visible:ring-offset-2">
          <span className="sr-only">View Input History</span>
          <LayersIcon className="size-5 rotate-90" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>Input History</span>
      </TooltipContent>
    </Tooltip>
  )
}

const ReplayButton = ({ toggleReplay }: { toggleReplay: () => void }) => {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [replayOpen, setReplayOpen] = useState(false)

  const handleToggleReplay = () => {
    setReplayOpen(false)
    toggleReplay()
  }

  return (
    <Tooltip
      open={isMobile ? false : replayOpen}
      onOpenChange={setReplayOpen}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggleReplay}
          className="text-foreground focus-visible:ring-offset-2">
          <span className="sr-only">Watch Replay</span>
          <ChevronsRightIcon className="size-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>Watch Replay</span>
      </TooltipContent>
    </Tooltip>
  )
}
