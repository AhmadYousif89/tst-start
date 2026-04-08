import { useState } from "react"
import { CameraIcon } from "lucide-react"
import { domToPng } from "modern-screenshot"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSound } from "@/home/context/sound.context"
import { useResult } from "./result.context"
import { useHotkey } from "@tanstack/react-hotkeys"

export const ScreenshotButton = () => {
  const { setIsScreenshotting, setLoadingProgress } = useResult()
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const [shareOpen, setShareOpen] = useState(false)
  const { playSound } = useSound()

  const handleScreenshot = async () => {
    const element = document.getElementById("result-screen")
    if (!element) return

    setIsScreenshotting(true)
    setLoadingProgress(1)

    playSound("flash")

    try {
      // Small delay to allow the instant layout shift or transitions to finish
      await new Promise((resolve) => setTimeout(resolve, 400))

      const rect = element.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))

      const dataUrl = await domToPng(element, {
        width,
        height,
        backgroundColor: "var(--background)",
        progress: (current, total) => {
          setLoadingProgress(Math.round((current / total) * 100))
        },
      })

      const link = document.createElement("a")
      link.download = `tst-result-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      setLoadingProgress(100)
    } catch (err) {
      console.error("Failed to download screenshot", err)
    } finally {
      setTimeout(() => {
        setIsScreenshotting(false)
        setLoadingProgress(0)
      }, 500)
    }
  }

  useHotkey("Mod+D", handleScreenshot, { requireReset: true })

  return (
    <Tooltip
      open={isMobile ? false : shareOpen}
      onOpenChange={setShareOpen}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-foreground focus-visible:ring-offset-2"
          onClick={() => {
            setShareOpen(false)
            handleScreenshot()
          }}>
          <span className="sr-only">Take Screenshot</span>
          <CameraIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>Take Screenshot</span>
      </TooltipContent>
    </Tooltip>
  )
}
