import { createFileRoute, notFound } from "@tanstack/react-router"

import { Home } from "@/home"
import { SoundProvider } from "@/home/context/sound.context"
import { EngineProvider } from "@/home/context/engine.context"
import { SettingsProvider } from "@/home/context/settings.context"

import { getInitialText } from "@/server/data"
import anonUserMiddleware from "@/middlewares/anonUserId.cookie"

export const Route = createFileRoute("/")({
  server: {
    middleware: [anonUserMiddleware],
  },
  loader: async () => {
    const data = await getInitialText()
    if (data === null) throw notFound({ throw: true, data: { msg: "No Text Found!" } })
    return { data }
  },
  notFoundComponent: ({ data }) => (
    <main className="flex grow flex-col items-center justify-center">
      <p className="text-muted-foreground">{(data as { msg: string }).msg}</p>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="flex grow flex-col items-center justify-center">
      <p className="text-muted-foreground">{error.message || "Something went erong!"}</p>
    </main>
  ),
  component: TST,
})

function TST() {
  const { data } = Route.useLoaderData()

  return (
    <SettingsProvider>
      <EngineProvider data={data}>
        <SoundProvider>
          <Home />
        </SoundProvider>
      </EngineProvider>
    </SettingsProvider>
  )
}
