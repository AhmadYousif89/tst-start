import { cn } from "@/lib/utils"

export const LoadingScreen = ({ progress, msg }: { progress: number; msg: string }) => {
  return (
    <div className="bg-background animate-in fade-in fixed inset-0 z-100 grid content-center justify-items-center gap-8 px-8 font-mono duration-500">
      <p className="text-foreground/80 text-5 tracking-wide">Downloading user data</p>
      <LoadingBar progress={progress} />
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

const LoadingBar = ({ progress }: { progress: number }) => {
  return (
    <div className="bg-foreground/5 relative h-1.5 w-full max-w-md overflow-hidden rounded-full">
      <div
        style={{ width: `${progress}%` }}
        className={cn(
          "absolute inset-y-0 left-0 rounded-full bg-blue-200 transition-all duration-300",
        )}
      />
    </div>
  )
}
