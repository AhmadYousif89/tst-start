import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  [
    "group/toggle inline-flex items-center justify-center gap-1 rounded-md  whitespace-nowrap transition-all outline-none hover:text-foreground cursor-pointer",

    "focus-visible:ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",

    "data-[state=on]:text-[white] data-[state=on]:border-transparent data-[state=on]:bg-blue-400",
    "dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-[white]",

    "disabled:pointer-events-none disabled:opacity-50",

    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ",

    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-pressed:bg-muted",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border text-muted-foreground hover:border-blue-600 hover:text-blue-600 bg-transparent shadow-xs dark:hover:text-blue-400 dark:hover:border-blue-400 data-[state=on]:hover:border-transparent!",
      },
      size: {
        default: "h-8 min-w-8 px-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-1.5 text-[0.8rem]",
        lg: "h-9 min-w-9 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
