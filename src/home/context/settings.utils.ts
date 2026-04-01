import { createClientOnlyFn } from "@tanstack/react-start"
import { EngineSettings } from "./settings.types"

export const STORAGE_KEY = "typing_settings"

export const DEFAULT_SETTINGS: EngineSettings = {
  volume: 0.75,
  isMuted: false,
  soundName: "creamy",
  mode: "t:60",
  language: "en",
  cursorStyle: "box",
}

/**
 * Get stored settings from local storage
 */
export const getStoredSettings = (key: string = STORAGE_KEY) => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(key)
    const result = stored ? JSON.parse(stored) : DEFAULT_SETTINGS
    return result as EngineSettings
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Update local storage with the provided data
 */
export const updateStoredSettings = createClientOnlyFn(
  (data: EngineSettings, key: string = STORAGE_KEY) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error)
    }
  },
)
