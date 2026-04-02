import { useEngineActions, useEngineConfig } from "@/home/context/engine.context"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TextMode } from "@/home/context/engine.types"

const modeOptions: { value: TextMode; label: string; text: string }[] = [
  { value: "t:15", label: "Timed 15s", text: "15s" },
  { value: "t:30", label: "Timed 30s", text: "30s" },
  { value: "t:60", label: "Timed 60s", text: "60s" },
  { value: "t:120", label: "Timed 120s", text: "120s" },
  { value: "passage", label: "Passage", text: "Passage" },
]

export const ModeToggle = () => {
  const { mode } = useEngineConfig()
  const { setTextMode } = useEngineActions()

  return (
    <div className="flex items-center gap-4">
      <span className="text-6 text-muted-foreground">Mode</span>
      <ToggleGroup
        value={mode}
        spacing={2}
        type="single"
        variant="outline"
        onValueChange={(val) => setTextMode(val as TextMode)}>
        {modeOptions.map(({ value, label, text }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            aria-label={label}
            className="bg-accent dark:bg-input border-transparent text-[white] data-[state=on]:hover:border-transparent! dark:hover:bg-transparent">
            <span className="text-6">{text}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
