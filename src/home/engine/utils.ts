import { TextCategory, TextLanguage, TextSchema } from "../context/engine.types"

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
