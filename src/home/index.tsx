import { Header } from "@/components/header"
import { MainContent } from "./main/content"
import { Footer } from "@/components/footer"
import { Results } from "./results/results"

import { ResultProvider } from "./results/result.context"
import { useEngineConfig } from "./context/engine.context"
import { LoadingScreen } from "@/components/loading-screen"
import { useIncrementalProgress } from "@/hooks/use-incremental-progress"

export const Home = () => {
  const { status } = useEngineConfig()
  const { progress, msg } = useIncrementalProgress(status === "loading", 1000)

  if (status === "loading" || progress > 0) {
    return (
      <LoadingScreen
        progress={progress}
        msg={msg}
      />
    )
  }

  return (
    <div className="container">
      <Header />
      {status !== "finished" ?
        <MainContent />
      : <ResultProvider>
          <Results />
        </ResultProvider>
      }
      <Footer />
    </div>
  )
}
