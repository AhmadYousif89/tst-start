import { ModeToggle } from "./settings/mode"
import { AudioControls } from "./settings/audio"
import { CursorToggle } from "./settings/cursor"

export const SettingsPanel = () => {
  return (
    <div className="mx-auto flex flex-col justify-center gap-4 p-4 md:flex-row md:flex-wrap md:gap-8">
      <ModeToggle />
      <AudioControls />
      <CursorToggle />
    </div>
  )
}
