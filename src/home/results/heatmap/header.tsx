import { HeatmapIcon } from "./icons"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type HeatmapHeaderProps = {
  isMobile: boolean
  isHeatmapVisible: boolean
  isScreenshotting: boolean
  setHeatmapVisibility: (pv: boolean | ((pv: boolean) => boolean)) => void
}

export const HeatmapHeader = ({
  isMobile,
  isHeatmapVisible,
  isScreenshotting,
  setHeatmapVisibility,
}: HeatmapHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-muted-foreground/60 text-6 md:text-5 flex items-center gap-2">
        input history
      </h3>
      <Tooltip open={isMobile ? false : undefined}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            title="Toggle Heatmap"
            aria-label="Toggle Heatmap"
            aria-pressed={isHeatmapVisible || isScreenshotting}
            className="group size-6 rounded-full hover:bg-transparent! focus-visible:border-transparent"
            onClick={() => setHeatmapVisibility((pv) => !pv)}>
            <HeatmapIcon className="text-muted-foreground/75 group-hover:text-red group-aria-pressed:text-red size-5 md:size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="p-1.5">
          Press <Kbd className="bg-foreground! rounded!">H</Kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
