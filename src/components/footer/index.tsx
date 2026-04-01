import { Image } from "@unpic/react"

import LogoIcon from "/assets/images/logo.svg"

import { cn } from "@/lib/utils"
import { ShortcutLegend } from "@/home/main/shortcuts.kbd"
import { useEngineConfig } from "@/home/context/engine.context"

export const Footer = () => {
  const { isImmersive } = useEngineConfig()

  return (
    <footer
      aria-hidden={isImmersive}
      className={cn("mt-auto grid gap-6", isImmersive && "immersive-mode")}>
      <ShortcutLegend />

      <p className="text-muted-foreground/30 dark:text-muted/50 text-6 flex items-center justify-center gap-1">
        <span>© {new Date().getFullYear()}</span>
        <span className="flex items-center gap-1">
          <Image
            src={LogoIcon}
            alt="Logo"
            width={20}
            height={20}
          />
          TST
        </span>
        <span>. All rights reserved.</span>
      </p>
    </footer>
  )
}
