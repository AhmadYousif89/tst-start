import { lazy } from "react"
import { Activity, Suspense } from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Spinner } from "@/components/spinner"
import { LoadingScreen } from "@/components/loading-screen"

import { MainContent } from "./main/content"
import { ResultProvider } from "./results/result.context"
import { useEngineConfig } from "./context/engine.context"
import { useIncrementalProgress } from "@/hooks/use-incremental-progress"

const Results = lazy(() =>
  import("./results/results").then((m) => ({ default: m.Results })),
)
const KeybindsModal = lazy(() =>
  import("../components/keybinds.modal").then((m) => ({ default: m.KeybindsModal })),
)

export const Home = () => {
  const { status } = useEngineConfig()
  const { progress, msg } = useIncrementalProgress(status === "loading", 1000)
  const isLoading = status === "loading" || progress > 0

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <main>
          <LoadingScreen
            progress={progress}
            msg={msg}
          />
        </main>
      </Activity>
      <div className="container">
        <Header />
        {status !== "finished" ?
          <MainContent shouldAnimate={!isLoading} />
        : <Suspense fallback={<Spinner />}>
            <ResultProvider>
              <Results />
            </ResultProvider>
          </Suspense>
        }
        <Footer />
        <Suspense fallback={null}>
          <KeybindsModal />
        </Suspense>
      </div>
    </>
  )
}
