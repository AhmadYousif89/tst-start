import { ComponentProps, createContext, use } from "react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"

const ResponsiveTooltipCtx = createContext<{ isMobile: boolean } | null>(null)

export function ResponsiveTooltipProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 1024px)")
  return (
    <ResponsiveTooltipCtx.Provider value={{ isMobile }}>
      {children}
    </ResponsiveTooltipCtx.Provider>
  )
}

export function ResponsiveTooltip({
  children,
  ...props
}: ComponentProps<typeof Tooltip> | ComponentProps<typeof Popover>) {
  const context = use(ResponsiveTooltipCtx)
  const isMobile = context?.isMobile ?? false

  return isMobile ?
      <Popover {...props}>{children}</Popover>
    : <Tooltip {...props}>{children}</Tooltip>
}

export function ResponsiveTooltipTrigger({
  children,
  ...props
}: ComponentProps<typeof TooltipTrigger> | ComponentProps<typeof PopoverTrigger>) {
  const context = use(ResponsiveTooltipCtx)
  const isMobile = context?.isMobile ?? false

  return isMobile ?
      <PopoverTrigger {...props}>{children}</PopoverTrigger>
    : <TooltipTrigger {...props}>{children}</TooltipTrigger>
}

type ResponsiveTooltipContentProps = (
  | ComponentProps<typeof TooltipContent>
  | ComponentProps<typeof PopoverContent>
) & { shouldCenter?: boolean }

export function ResponsiveTooltipContent({
  className,
  children,
  shouldCenter,
  ...props
}: ResponsiveTooltipContentProps) {
  const context = use(ResponsiveTooltipCtx)
  const isMobile = context?.isMobile ?? false

  if (isMobile) {
    return (
      <PopoverContent
        className={cn(
          "w-fit shadow-none",
          className,
          shouldCenter && "translate-y-6.25 animate-none!",
        )}
        {...props}>
        {children}
      </PopoverContent>
    )
  }

  return (
    <TooltipContent
      shouldCenter
      className={cn(className, shouldCenter && "translate-y-6.25 animate-none!")}
      {...props}>
      {children}
    </TooltipContent>
  )
}
