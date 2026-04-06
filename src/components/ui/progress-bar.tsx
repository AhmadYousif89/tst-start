import { cn } from "@/lib/utils"

type ProgressbarProps = {
  progress: number
  className?: string
}

export const Progressbar = ({ progress, className }: ProgressbarProps) => {
  return (
    <div
      className={cn(
        "bg-border relative h-1 w-full overflow-hidden rounded-full",
        className,
      )}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progress bar"
        style={{ width: `${progress}%` }}
        className="absolute inset-y-0 rounded-full bg-blue-600 transition-[width] duration-300 dark:bg-blue-400"
      />
      <span
        id="progress-live"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true">
        {progress}% complete
      </span>
    </div>
  )
}
