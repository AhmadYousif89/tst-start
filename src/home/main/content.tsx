import { Metrics } from "./metrics"
import { RandomButton } from "./random.button"
import { EngineContainer } from "../engine/engine"
import { LanguageMenu } from "./language.menu"
import { cn } from "@/lib/utils"

export const MainContent = ({ shouldAnimate }: { shouldAnimate: boolean }) => {
  return (
    <main
      className={cn(
        "grid grow transform-gpu grid-rows-[auto_1fr]",
        shouldAnimate && "animate-in fade-in duration-1000",
      )}>
      <h1 className="sr-only">Test Your Speed</h1>
      <Metrics />
      <div className="grid content-center justify-items-center gap-6">
        <LanguageMenu />
        <EngineContainer />
        <RandomButton />
      </div>
    </main>
  )
}
