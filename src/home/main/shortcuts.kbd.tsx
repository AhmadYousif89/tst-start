import { Kbd } from "@/components/ui/kbd"
import { getModKeyLabel } from "@/lib/platform"

export const ShortcutLegend = () => {
  const modKeyLabel = getModKeyLabel()

  return (
    <div className="text-6 hidden gap-2 opacity-50 md:grid">
      <div className="flex place-content-center gap-4">
        <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono">
          <Kbd className="rounded text-[10.5px]">
            {modKeyLabel} {">"} R
          </Kbd>
          <span>-</span>
          <p>Restart Test</p>
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono">
          <Kbd className="rounded text-[10.5px]">
            {modKeyLabel} {">"} S
          </Kbd>
          <span>-</span>
          <p>Open Settings</p>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono">
        <Kbd className="rounded text-[10.5px]">
          {modKeyLabel} {">"} K
        </Kbd>
        <span>-</span>
        <p>Open Keybinds</p>
      </div>
    </div>
  )
}
