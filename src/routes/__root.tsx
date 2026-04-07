import { Scripts, HeadContent, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"

import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"
import { ThemeProvider } from "@/integrations/next-themes/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

import iconUrl from "../icon.svg?url"
import styles from "../styles.css?url"
import soraFont from "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url"
import robotoMonoFont from "@fontsource-variable/roboto-mono/files/roboto-mono-latin-wght-normal.woff2?url"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Typing Speed Test" },
      {
        name: "description",
        content:
          "Test your typing speed and improve your WPM with our advanced typing test platform.",
      },
      {
        name: "keywords",
        content: "typing test, wpm, typing speed, typing practice, typing test online",
      },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", type: "image/svg+xml", href: iconUrl },
      { rel: "preload", href: soraFont, as: "font", type: "font/woff2", crossOrigin: "" },
      {
        rel: "preload",
        href: robotoMonoFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "",
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
