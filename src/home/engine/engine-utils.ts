import { TextSchema } from "../context/engine.types"
import { SoundSettings } from "../context/sound.types"
import { getStoredSettings } from "../context/settings.utils"
import { TextSettings, EngineSettings } from "../context/settings.types"

// Formats a time in seconds to a string in the format "MM:SS".
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export const isRtlLang = (language?: TextSchema["lang"]) => language === "ar"

function getSettings(filter: "sound"): SoundSettings
function getSettings(filter: "text"): TextSettings
function getSettings(filter?: "all"): EngineSettings
function getSettings(
  filter: "sound" | "text" | "all" = "all",
): EngineSettings | SoundSettings | TextSettings {
  const stored = getStoredSettings()

  if (filter === "sound")
    return {
      soundName: stored.soundName,
      volume: stored.volume,
      isMuted: stored.isMuted,
    }
  if (filter === "text")
    return {
      mode: stored.mode,
      language: stored.language,
      cursorStyle: stored.cursorStyle,
    }

  return stored
}

export const getInitialSettings = getSettings
