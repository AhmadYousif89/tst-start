import { Image } from "@unpic/react"
import { useServerFn } from "@tanstack/react-start"

import LogoIcon from "/assets/images/logo.svg"

import { cn } from "@/lib/utils"
import { getRandomText } from "@/server/data"
import { useTextSettings } from "@/home/context/settings.context"
import { useEngineConfig, useEngineActions } from "@/home/context/engine.context"

export const Logo = () => {
  const { language } = useTextSettings()
  const { setTextData } = useEngineActions()
  const { textData, isImmersive } = useEngineConfig()

  const getRandomPassage = useServerFn(getRandomText)
  const id = textData._id.toString()

  return (
    <button
      onClick={async () => {
        const newTextData = await getRandomPassage({ data: { id, language } })
        if (newTextData) setTextData(newTextData)
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2 transition-[filter] duration-1000 ease-in-out",
        isImmersive && "grayscale-100",
      )}>
      <LogoImage className="size-8 self-start" />
      <div className="hidden gap-0.5 md:grid">
        <span className="text-2 from-muted-foreground dark:from-foreground/90 bg-linear-to-br to-blue-400 bg-clip-text text-transparent">
          Typing Speed Test
        </span>
        <span className="dark:text-muted-foreground text-6">
          Type as fast as you can in 60 seconds
        </span>
      </div>
    </button>
  )
}

export const LogoImage = ({ className }: { className?: string }) => {
  return (
    <Image
      src={LogoIcon}
      alt="logo"
      width={40}
      height={40}
      className={cn("", className)}
    />
  )
}
