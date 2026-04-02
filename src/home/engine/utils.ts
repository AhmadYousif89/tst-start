import { TextSchema } from "../context/engine.types"
// Formats a time in seconds to a string in the format "MM:SS".
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export const isRtlLang = (language?: TextSchema["lang"]) => language === "ar"
