import { TextSettings } from "./settings/text.settings"
import { SoundSettings } from "./settings/sound.settings"
import { CursorSelector } from "./settings/cursor.settings"
import { ThemeSelector } from "./theme-selector"

export const SettingsPanel = () => {
  return (
    <div className="mx-auto flex flex-col justify-center gap-4 p-4 md:flex-row md:flex-wrap md:gap-8">
      <TextSettings />
      <SoundSettings />
      <CursorSelector />
      <ThemeSelector />
    </div>
  )
}
