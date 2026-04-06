import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { useIncrementalProgress } from "@/hooks/use-incremental-progress"
import { Progressbar } from "./ui/progress-bar"

type Props = {
  isPending?: boolean
  progress?: number
  className?: string
}

export const TopLoader = ({
  isPending = false,
  progress: progressProp,
  className,
}: Props) => {
  const simulatedProgress = useIncrementalProgress(isPending)
  const progress = progressProp !== undefined ? progressProp : simulatedProgress.progress

  return createPortal(
    <Progressbar
      progress={progress}
      className={cn("fixed top-0 left-0 h-1 duration-1000", className)}
    />,
    document.body,
  )
}
