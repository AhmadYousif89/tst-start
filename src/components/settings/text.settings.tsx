import { cn } from "@/lib/utils"
import { useEngineActions, useEngineConfig } from "@/home/context/engine.context"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { TextMode } from "@/home/context/engine.types"

export const TextSettings = () => {
  const { mode } = useEngineConfig()
  const { setTextMode } = useEngineActions()

  return (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground text-6 md:text-5">Mode</span>
      <div className="flex items-center gap-2">
        <Select
          value={mode === "passage" ? "" : mode}
          onValueChange={(val) => setTextMode(val as TextMode)}>
          <SelectTrigger
            className={cn(
              "text-6 md:text-5 min-w-26 md:min-w-38",
              mode === "passage" ? "" : "bg-blue-400 dark:bg-blue-600",
            )}>
            <SelectValue placeholder="Timed" />
          </SelectTrigger>
          <SelectContent
            side="top"
            position="popper"
            className="duration-300 ease-out">
            <SelectGroup>
              <SelectItem value="t:15">Timed (15s)</SelectItem>
              <SelectSeparator className="bg-border my-1 h-px w-full" />
              <SelectItem value="t:30">Timed (30s)</SelectItem>
              <SelectSeparator className="bg-border my-1 h-px w-full" />
              <SelectItem value="t:60">Timed (60s)</SelectItem>
              <SelectSeparator className="bg-border my-1 h-px w-full" />
              <SelectItem value="t:120">Timed (120s)</SelectItem>
              <SelectSeparator className="bg-border my-1 h-px w-full" />
              <SelectItem value="t:180">Timed (180s)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Toggle
          variant="outline"
          aria-label="Passage"
          pressed={mode === "passage"}
          onPressedChange={(pressed) => setTextMode(pressed ? "passage" : "t:15")}>
          <span className="text-6 md:text-5">Passage</span>
        </Toggle>
      </div>
    </div>
  )
}
