import { cn } from "@/lib/utils"
import { Progressbar } from "./ui/progress-bar"

export const LoadingScreen = ({ progress, msg }: { progress: number; msg: string }) => {
  return (
    <div className="bg-background animate-in fade-in fixed inset-0 z-100 grid content-center justify-items-center gap-8 px-8 font-mono duration-500">
      <Progressbar
        progress={progress}
        className="max-w-md"
      />
      <p
        className={cn(
          "text-foreground/80 text-5 animate-in fade-in min-h-5 tracking-wide duration-500",
          msg ? "opacity-100" : "opacity-0",
        )}>
        {msg}
      </p>
    </div>
  )
}
