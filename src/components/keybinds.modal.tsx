import { useState } from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { PlusIcon, KeyboardIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useEngineActions } from "../home/context/engine.context"

export const KeybindsModal = () => {
  const { registerOverlay, unregisterOverlay } = useEngineActions()
  const [isOpen, setIsOpen] = useState(false)

  const toggleModal = () => {
    const nextState = !isOpen
    if (nextState) {
      registerOverlay("keybinds")
    } else {
      unregisterOverlay("keybinds")
    }
    setIsOpen(nextState)
  }

  useHotkey("Mod+K", toggleModal, { requireReset: true })

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={toggleModal}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <KeyboardIcon className="size-5" />
            </div>
            <AlertDialogTitle className="text-3">Keyboard Shortcuts</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Master TST with these keyboard shortcuts.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <Section title="General">
            <Shortcut
              keys={["Ctrl", "R"]}
              label="Restart Test"
            />
            <Shortcut
              keys={["Ctrl", "S"]}
              label="Open Settings"
            />
            <Shortcut
              keys={["Ctrl", "K"]}
              label="Toggle Keybinds Menu"
            />
          </Section>

          <span className="bg-border h-px w-full" />

          <Section title="Results Screen">
            <Shortcut
              keys={["P"]}
              label="Play / Pause Replay"
            />
            <Shortcut
              keys={["R"]}
              label="Reset Replay"
            />
            <Shortcut
              keys={["H"]}
              label="Toggle Heatmap"
            />
          </Section>
        </div>

        <AlertDialogFooter className="rounded-md border-0">
          <AlertDialogAction
            variant="secondary"
            className="w-full sm:w-auto">
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="text-muted-foreground space-y-3">
    <h4 className="text-5 font-semibold tracking-wider uppercase">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
)

const Shortcut = ({ keys, label }: { keys: string[]; label: string }) => (
  <div className="text-6 flex items-center justify-between gap-4 py-0.5 font-mono">
    <span className="text-muted-foreground">{label}</span>
    <KbdGroup>
      {keys.map((key, i) => (
        <div
          key={key}
          className="flex items-center gap-1">
          <Kbd className="h-6 min-w-6 rounded px-1.5 font-bold">{key}</Kbd>
          {i < keys.length - 1 && (
            <PlusIcon className="text-muted-foreground/50 size-2.5" />
          )}
        </div>
      ))}
    </KbdGroup>
  </div>
)
