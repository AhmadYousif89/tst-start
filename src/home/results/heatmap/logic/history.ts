import { getBuckets } from "./buckets"
import { getWordRanges } from "@/home/engine/logic"
import { Keystroke } from "@/home/context/engine.types"

export type WordStats = {
  wpm: number
  word: string
  hasError: boolean
  errorCharIndices: Set<number>
  extras?: string[]
  skipIndex?: number
  bucket?: number
  typedChars?: string
}

export type HeatmapAnalysis = {
  wordStatsMap: Map<number, WordStats>
  buckets: number[]
  words: string[]
}

export const analyzeHeatmap = (keystrokes: Keystroke[], text: string) => {
  if (!keystrokes || keystrokes.length === 0 || !text) return null

  const sortedKeystrokes = [...keystrokes].sort((a, b) => a.timestampMs - b.timestampMs)

  const wordRanges = getWordRanges(text)
  // This avoids trailing-empty entries that `split(" ")` produces for texts ending in spaces.
  const words = wordRanges.map((r) => text.slice(r.start, r.end).replace(/ +$/g, ""))

  const wordData = createInitialWordData(words)

  processKeystrokes({ sortedKeystrokes, wordRanges, words, wordData })
  const absoluteLastTypedWordIdx = getAbsoluteLastTypedWordIdx(
    sortedKeystrokes,
    wordRanges,
  )

  const wordStatsMap = new Map<number, WordStats>()
  const wordWPMsList: number[] = []
  const lastTypedWordIdx = buildWordStats({
    words,
    wordData,
    absoluteLastTypedWordIdx,
    wordStatsMap,
    wordWPMsList,
  })

  const buckets = getBuckets(wordWPMsList, wordStatsMap) || []
  // Limit displayed words to typed words + a few context words
  const displayWords = words.slice(0, lastTypedWordIdx + 4)

  return { wordStatsMap, buckets, words: displayWords }
}

type WordRange = { start: number; end: number }

type WordData = {
  keystrokes: Keystroke[]
  errors: Set<number>
  extras: string[]
  skipIndex: number | undefined
  typedChars: Array<string | null>
  maxRelIdx: number
  hasTypingError: boolean
  activeExtras: number
}

function findWordIndexByCharIndex(charIndex: number, wordRanges: WordRange[]) {
  for (let idx = 0; idx < wordRanges.length; idx++) {
    const r = wordRanges[idx]
    if (idx === wordRanges.length - 1) return charIndex >= r.start ? idx : -1
    if (charIndex >= r.start && charIndex < wordRanges[idx + 1].start) return idx
  }
  return -1
}

function createInitialWordData(words: string[]): WordData[] {
  return words.map((word) => ({
    keystrokes: [] as Keystroke[],
    errors: new Set<number>(),
    extras: [] as string[],
    skipIndex: undefined as number | undefined,
    typedChars: new Array(word.length).fill(null),
    maxRelIdx: -1,
    hasTypingError: false,
    activeExtras: 0,
  }))
}

function processKeystrokes({
  sortedKeystrokes,
  wordRanges,
  words,
  wordData,
}: {
  sortedKeystrokes: Keystroke[]
  wordRanges: WordRange[]
  words: string[]
  wordData: WordData[]
}) {
  sortedKeystrokes.forEach((k) => {
    const isBackspace = k.typedChar === "Backspace"
    const wordIdx = findWordIndexByCharIndex(k.charIndex, wordRanges)
    if (wordIdx === -1) return

    const data = wordData[wordIdx]
    const range = wordRanges[wordIdx]
    const relIdx = k.charIndex - range.start
    const isExtra = relIdx >= words[wordIdx].length

    if (isBackspace) {
      // Keeping extras in the array to preserve the "first mistake" history
      if (isExtra && data.activeExtras > 0) data.activeExtras--
      return
    }

    data.keystrokes.push(k)

    if (!isExtra) {
      data.maxRelIdx = Math.max(data.maxRelIdx, relIdx)
      const currentEntry = data.typedChars[relIdx]
      const currentIsError = data.errors.has(relIdx)

      if (currentEntry === null || (!currentIsError && !k.isCorrect)) {
        data.typedChars[relIdx] = k.typedChar
        if (!k.isCorrect) {
          data.errors.add(relIdx)
          data.hasTypingError = true
        }
      }
    } else {
      // Handle extras
      const isSpace = relIdx === words[wordIdx].length && k.typedChar === " "
      if (!isSpace) {
        const depth = data.activeExtras
        if (data.extras[depth] == null) {
          data.extras[depth] = k.typedChar
        }
        data.activeExtras++
        data.hasTypingError = true
      }
    }

    // Handle skips
    if (k.skipOrigin !== undefined) {
      const skipWordIdx = wordRanges.findIndex(
        (r) => k.skipOrigin! >= r.start && k.skipOrigin! < r.end,
      )
      if (skipWordIdx !== -1) {
        wordData[skipWordIdx].skipIndex = k.skipOrigin - wordRanges[skipWordIdx].start
      }
    }
  })
}

function getAbsoluteLastTypedWordIdx(
  sortedKeystrokes: Keystroke[],
  wordRanges: WordRange[],
) {
  // Determine the last word that received any keystroke
  let absoluteLastTypedWordIdx = -1

  sortedKeystrokes.forEach((k) => {
    const wordIdx = findWordIndexByCharIndex(k.charIndex, wordRanges)
    if (wordIdx === -1) return

    const isSpaceAtEnd =
      k.charIndex === wordRanges[wordIdx].end - 1 && k.typedChar === " "
    // Only update last word if it wasn't just the space moving us forward,
    // UNLESS there are no more words.
    if (!isSpaceAtEnd || wordIdx > absoluteLastTypedWordIdx) {
      if (wordIdx > absoluteLastTypedWordIdx) {
        absoluteLastTypedWordIdx = wordIdx
      }
    }
  })

  return absoluteLastTypedWordIdx
}

function buildWordStats({
  words,
  wordData,
  absoluteLastTypedWordIdx,
  wordStatsMap,
  wordWPMsList,
}: {
  words: string[]
  wordData: WordData[]
  absoluteLastTypedWordIdx: number
  wordStatsMap: Map<number, WordStats>
  wordWPMsList: number[]
}) {
  let prevWordEndTime = 0
  let lastTypedWordIdx = -1

  words.forEach((word, wordIdx) => {
    let wpm = 0
    const data = wordData[wordIdx]
    const {
      errors,
      keystrokes: wordKeystrokes,
      extras,
      skipIndex,
      typedChars,
      maxRelIdx,
      hasTypingError,
    } = data

    // A word is included in the map if it was interacted with
    const shouldInclude =
      wordKeystrokes.length > 0 ||
      hasTypingError ||
      skipIndex !== undefined ||
      extras.length > 0

    if (shouldInclude) {
      // Mark remaining untyped characters (skipped) as errors
      for (let i = 0; i < word.length; i++) {
        if (typedChars[i] === null) {
          const isLastWord = wordIdx === absoluteLastTypedWordIdx
          const isBeforeEnd = i < maxRelIdx
          const wasSkipped = skipIndex !== undefined && i >= skipIndex

          if (!isLastWord || isBeforeEnd || wasSkipped) {
            errors.add(i)
          }
        }
      }

      const lastKeystroke = wordKeystrokes[wordKeystrokes.length - 1]
      if (lastKeystroke) {
        const currentWordEndTime = lastKeystroke.timestampMs
        const durationMs = currentWordEndTime - prevWordEndTime
        prevWordEndTime = currentWordEndTime
        const safeDuration = Math.max(durationMs, 200)
        const typedCharCount = wordKeystrokes.length
        wpm = typedCharCount / 5 / (safeDuration / 60000)
        wordWPMsList.push(wpm)
        lastTypedWordIdx = wordIdx
      }

      const filteredExtras = extras.filter((e) => e !== null && e !== undefined)

      wordStatsMap.set(wordIdx, {
        wpm,
        hasError: hasTypingError || errors.size > 0,
        word,
        errorCharIndices: errors,
        extras: filteredExtras.length > 0 ? filteredExtras : undefined,
        skipIndex,
        typedChars: typedChars.map((c) => c || "\0").join(""),
      })
    }
  })

  return lastTypedWordIdx
}
