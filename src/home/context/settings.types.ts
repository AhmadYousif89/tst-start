import { SoundSettings } from "./sound.types"
import { CursorStyle, TextLanguage, TextMode } from "./engine.types"

export type EngineSettings = SoundSettings & TextSettings

export type TextSettings = {
  mode: TextMode
  cursorStyle: CursorStyle
  language: TextLanguage
}
