import { memo } from "react"
import { cn } from "@/lib/utils"
import { CharState } from "../context/engine.types"

type CharacterProps = {
  char: string
  state: CharState["state"]
  isRTL: boolean
  extras?: string[]
  className?: string
  index?: number
}

export const Character = memo(
  ({ char, state, isRTL, extras, className, index }: CharacterProps) => {
    return (
      <>
        {extras?.length ?
          <div
            className={cn(isRTL ? "inline" : "inline-flex")}
            style={isRTL ? { letterSpacing: 0 } : undefined}>
            {extras?.map((extra, i) => (
              <span
                key={i}
                className="text-red/70">
                {extra}
              </span>
            ))}
          </div>
        : null}
        <span
          data-charindex={index}
          className={cn(
            "data-charindex:hover:bg-muted/40 relative transition-colors duration-100 ease-linear data-charindex:cursor-pointer",
            isRTL ? "inline" : "inline-flex",
            state === "correct" && "text-green",
            state === "incorrect" && "text-red",
            state === "not-typed" && "text-muted-foreground",
            className,
          )}>
          {char === " " ? "\u00a0" : char}
        </span>
      </>
    )
  },
)

Character.displayName = "Character"
