import { cn } from "@/lib/utils"
import { CursorStyle } from "@/home/context/engine.types"
import { useTextSettings } from "@/home/context/settings.context"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const cursorOptions: { value: CursorStyle; label: string }[] = [
  { value: "pip", label: "Pip" },
  { value: "box", label: "Box" },
  { value: "underline", label: "Underline" },
]

export const CursorToggle = () => {
  const { setCursorStyle, cursorStyle } = useTextSettings()

  return (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground text-6">Cursor</span>
      <ToggleGroup
        spacing={2}
        type="single"
        variant="outline"
        value={cursorStyle}
        onValueChange={(val) => {
          if (!val) return // Prevent untoggling
          setCursorStyle(val as CursorStyle)
        }}>
        {cursorOptions.map(({ value, label }) => {
          const content =
            value === "pip" ?
              <span className="bg-muted h-4.5 w-0.5 group-hover:bg-blue-600" />
            : value === "box" ?
              <span className="border-muted aspect-square h-4.5 w-2.5 border-2 group-hover:border-blue-600" />
            : <span className="bg-muted mb-2 h-0.5 w-3 self-end group-hover:bg-blue-600" />
          return (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className={cn(
                "group",
                value === "box" ?
                  "data-[state=on]:*:border-[white]"
                : "data-[state=on]:*:bg-[white]",
              )}>
              {content}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}
