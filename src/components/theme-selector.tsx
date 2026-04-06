import { useTheme } from "next-themes"
import { PaletteIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHydrated } from "@tanstack/react-router"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

export const ThemeSelector = () => {
  const hydrated = useHydrated()
  const { resolvedTheme, setTheme } = useTheme()

  if (!hydrated) return null

  return (
    <div className="text-muted-foreground/50 flex items-center">
      <Select
        value={resolvedTheme}
        onValueChange={setTheme}>
        <SelectTrigger
          data-icon="hide"
          className="text-6 hover:text-muted-foreground focus-visible:text-muted-foreground px-2 py-0">
          <PaletteIcon className="size-4" />
          <SelectValue placeholder="System" />
        </SelectTrigger>
        <SelectContent
          side="top"
          position="popper"
          data-icon="hide"
          data-indicator="hide"
          className="p-1 *:space-y-1">
          {themes.map((theme) => (
            <SelectItem
              key={theme.value}
              value={theme.value}
              className="text-input dark:focus:bg-input focus:bg-accent/50 focus:text-foreground dark:focus:text-foreground data-checked:bg-accent data-checked:text-foreground! border-0 px-2 py-1.5">
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
