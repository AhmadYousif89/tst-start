import { TextCategory, TextLanguage, TextSchema } from "./context/engine.types"

// Formats a time in seconds to a string in the format "MM:SS".
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export const isRtlLang = (language?: TextSchema["lang"]) => language === "ar"

type ParsedLang = {
  lang: TextLanguage
  cat: TextCategory
}

const parseLanguage = (langStr: TextLanguage): ParsedLang => {
  const [lang, cat] = langStr.split(":")
  return { lang, cat } as ParsedLang
}

export const getLangCat = (language: TextLanguage, category?: TextCategory) => {
  const languageStr = String(language)
  if (languageStr.includes(":")) return parseLanguage(language)

  return {
    lang: language,
    cat: category ?? "general",
  }
}

export const isLanguageSynced = (
  selectedLanguage: TextLanguage,
  currentText: { language: TextLanguage; category?: TextCategory },
) => {
  const selected = getLangCat(selectedLanguage)
  const current = getLangCat(currentText.language, currentText.category)
  return selected.lang === current.lang && selected.cat === current.cat
}

const MIN_WPM = 10
const MIN_ACCURACY = 20
const MIN_KEYSTROKES = 5
const MIN_DURATION_MS = 2000

/**
 * Checks if a session is invalid based on WPM, accuracy, duration, error count, and keystroke count.
 *
 * @returns True if the session is invalid, false otherwise.
 */
export function isSessionInvalid({
  wpm,
  accuracy,
  durationMs,
  errorCount,
  keystrokeCount,
}: {
  wpm: number
  accuracy: number
  durationMs: number
  errorCount: number
  keystrokeCount: number
}): boolean {
  return (
    wpm < MIN_WPM ||
    accuracy < MIN_ACCURACY ||
    durationMs < MIN_DURATION_MS ||
    keystrokeCount < MIN_KEYSTROKES ||
    errorCount > keystrokeCount / 2
  )
}
