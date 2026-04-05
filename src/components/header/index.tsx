import { useState } from "react"
import { SettingsIcon } from "lucide-react"
import { useHotkey } from "@tanstack/react-hotkeys"

import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { PersonalBest } from "./personal-best"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { SettingsPanel } from "@/components/settings-panel"
import { useEngineConfig, useEngineActions } from "@/home/context/engine.context"

export const Header = () => {
  const { isImmersive } = useEngineConfig()
  const { setFocused } = useEngineActions()
  const [showSettings, setShowSettings] = useState(false)

  const handleOpenChange = () => {
    const nextState = !showSettings
    if (nextState) {
      setFocused(false)
    }
    setShowSettings(nextState)
  }

  useHotkey("Mod+S", handleOpenChange, { requireReset: true })

  return (
    <header className="flex items-center justify-between gap-2">
      <Logo />
      <div
        aria-hidden={isImmersive}
        className={cn("flex items-center", isImmersive && "immersive-mode")}>
        <PersonalBest />
        <div className="bg-border mr-2 ml-4 h-8 w-px" />

        <Drawer
          open={showSettings}
          onOpenChange={setShowSettings}>
          <DrawerTrigger
            asChild
            suppressHydrationWarning>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Settings panel"
              className="focus-visible:ring-offset-2">
              <SettingsIcon className="size-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="mx-auto xl:max-w-304 [&[data-vaul-drawer-direction][data-vaul-drawer-direction]]:rounded-none">
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>Configure your typing settings</DrawerDescription>
            </DrawerHeader>

            <SettingsPanel />

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="destructive">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  )
}
