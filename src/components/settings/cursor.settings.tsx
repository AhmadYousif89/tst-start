import { CursorStyle } from "@/home/context/engine.types"
import { useEngineActions, useEngineConfig } from "@/home/context/engine.context"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const CursorSelector = () => {
  const { cursorStyle } = useEngineConfig()
  const { setCursorStyle } = useEngineActions()

  return (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground text-6 md:text-5">Cursor</span>
      <ToggleGroup
        spacing={2}
        type="single"
        variant="outline"
        className="text-6 md:text-5"
        value={cursorStyle}
        onValueChange={(val: CursorStyle) => {
          if (val) setCursorStyle(val)
        }}>
        <ToggleGroupItem
          value="pip"
          aria-label="Pip"
          className="data-[state=on]:*:bg-foreground">
          <span className="bg-muted h-4.5 w-0.5" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="box"
          aria-label="Box"
          className="data-[state=on]:*:border-foreground">
          <span className="border-muted aspect-square h-4.5 w-2.5 border-2" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Underline"
          className="data-[state=on]:*:bg-foreground">
          <span className="bg-muted mb-2 h-0.5 w-3 self-end" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
