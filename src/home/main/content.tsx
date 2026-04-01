import { Metrics } from "./metrics"
import { RandomButton } from "./random.button"
import { EngineContainer } from "../engine/engine"
import { LanguageMenu } from "./language.menu"

export const MainContent = () => {
  return (
    <>
      <Metrics />
      <div className="grid content-center justify-items-center gap-6">
        <LanguageMenu />
        <EngineContainer />
        <RandomButton />
      </div>
    </>
  )
}
