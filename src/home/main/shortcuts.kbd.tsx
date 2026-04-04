import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { PlusIcon } from "lucide-react"

export const ShortcutLegend = () => {
  return (
    <div className="text-6 hidden gap-2 opacity-50 md:grid">
      <div className="flex place-content-center gap-4">
        <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono">
          <KbdGroup>
            <Kbd className="rounded text-[10px]">Ctrl</Kbd>
            <PlusIcon className="size-2.5" />
            <Kbd className="rounded text-[10px]">R</Kbd>
          </KbdGroup>
          <span>-</span>
          <p>Restart Test</p>
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono">
          <KbdGroup>
            <Kbd className="rounded text-[10px]">Ctrl</Kbd>
            <PlusIcon className="size-2.5" />
            <Kbd className="rounded text-[10px]">S</Kbd>
          </KbdGroup>
          <span>-</span>
          <p>Open Settings</p>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono">
        <KbdGroup>
          <Kbd className="rounded text-[10px]">Ctrl</Kbd>
          <PlusIcon className="size-2.5" />
          <Kbd className="rounded text-[10px]">K</Kbd>
        </KbdGroup>
        <span>-</span>
        <p>Open Keybinds</p>
      </div>
    </div>
  )
}
