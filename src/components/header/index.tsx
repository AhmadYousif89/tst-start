import { useState } from "react"
import { SettingsIcon } from "lucide-react"
import { useHotkey } from "@tanstack/react-hotkeys"

import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { PersonalBest } from "./personal-best"
import { SettingsPanel } from "../settings-panel"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useEngineConfig, useEngineActions } from "@/home/context/engine.context"

export const Header = () => {
  const { isImmersive } = useEngineConfig()
  const { registerOverlay, unregisterOverlay } = useEngineActions()
  const [showSettings, setShowSettings] = useState(false)

  const toggleSettings = () => {
    const nextState = !showSettings
    if (nextState) {
      registerOverlay("settings")
    } else {
      unregisterOverlay("settings")
    }
    setShowSettings(nextState)
  }

  useHotkey("Mod+S", toggleSettings, { requireReset: true })

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
          onOpenChange={toggleSettings}>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleSettings}
            aria-label="Settings panel"
            aria-expanded={showSettings}
            aria-controls={showSettings ? "settings-drawer-content" : undefined}
            className="focus-visible:ring-offset-2">
            <SettingsIcon className="size-5" />
          </Button>

          <DrawerContent
            id="settings-drawer-content"
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
