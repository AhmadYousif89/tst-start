import { CharState } from "@/home/context/engine.types"

/**
 * Finds the starting index of the word containing the character at the given index.
 */
export const getWordStart = (index: number, characters: string[]): number => {
  let wordStart = index
  while (wordStart > 0 && characters[wordStart - 1] !== " ") {
    wordStart--
  }
  return wordStart
}

/**
 * Finds the ending index of the word containing the character at the given index.
 */
export const getWordEnd = (index: number, characters: string[]): number => {
  let wordEnd = index
  while (wordEnd < characters.length && characters[wordEnd] !== " ") {
    wordEnd++
  }
  return wordEnd
}

/**
 * Returns the index of the word that the cursor is currently in.
 */
export const getWordIndexByCursor = (
  cursor: number,
  wordRanges: { start: number; end: number }[],
) => {
  for (let i = 0; i < wordRanges.length; i++) {
    const wordRange = wordRanges[i]
    // Cursor is considered to be "in" the word if it's between the start and end indices (end index is exclusive)
    if (cursor >= wordRange.start && cursor < wordRange.end) return i
  }
  return -1
}

/**
 * Returns the start and end indices of each word in the text.
 */
export function getWordRanges(text: string) {
  const wordRanges: { start: number; end: number }[] = []
  if (!text) return wordRanges

  let start = 0

  for (let i = 0; i < text.length; i++) {
    const isLast = i === text.length - 1
    const isSpace = text[i] === " "

    if (isSpace || isLast) {
      const end = i + 1
      if (end > start) wordRanges.push({ start, end })
      start = end
    }
  }

  return wordRanges
}

/**
 * Checks if a range of characters has been typed perfectly correctly.
 */
export const isWordPerfect = (
  startIndex: number,
  endIndex: number,
  charStates: CharState[],
): boolean => {
  if (startIndex < 0 || endIndex < startIndex) return false
  if (endIndex >= charStates.length) return false
  // Check letters: must be correct and have no extras
  for (let i = startIndex; i < endIndex; i++) {
    const s = charStates[i]
    if (s.state !== "correct" || (s.extras && s.extras.length > 0)) {
      return false
    }
  }

  // Check the space (or final char): must have no extras
  const lastCharExtras = charStates[endIndex]?.extras?.length || 0
  return lastCharExtras === 0
}
