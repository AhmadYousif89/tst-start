import { CharState, Keystroke } from "@/home/context/engine.types"

// Shared immutable empty extras list for all untouched characters.
const EMPTY_EXTRAS: readonly string[] = Object.freeze([])

type CharStatesCacheEntry = {
  characters: string[]
  processedLen: number
  typedCharByIndex: string[]
  stateByIndex: Array<CharState["state"]>
  extrasByIndex: Array<readonly string[]>
  lastResult: CharState[]
}

// Cache is keyed by keystrokes array identity.
const CHAR_STATES_CACHE = new WeakMap<Keystroke[], CharStatesCacheEntry>()

function createCharStatesCacheEntry(characters: string[]): CharStatesCacheEntry {
  const typedCharByIndex: string[] = new Array(characters.length)
  const stateByIndex: Array<CharState["state"]> = new Array(characters.length)
  const extrasByIndex: Array<readonly string[]> = new Array(characters.length)
  const lastResult: CharState[] = new Array(characters.length)

  for (let i = 0; i < characters.length; i++) {
    stateByIndex[i] = "not-typed"
    typedCharByIndex[i] = ""
    extrasByIndex[i] = EMPTY_EXTRAS
    lastResult[i] = {
      state: "not-typed",
      typedChar: "",
      extras: EMPTY_EXTRAS,
    }
  }

  return {
    characters,
    processedLen: 0,
    stateByIndex,
    typedCharByIndex,
    extrasByIndex,
    lastResult,
  }
}

function applyKeystrokeToCache(
  characters: string[],
  cacheEntry: CharStatesCacheEntry,
  k: Keystroke,
): number | null {
  const idx = k.charIndex
  if (idx < 0 || idx >= characters.length) return null

  const char = characters[idx]
  const isBackspace = k.typedChar === "Backspace"

  if (isBackspace) {
    // Prioritize cleaning main characters first
    if (cacheEntry.typedCharByIndex[idx] !== "") {
      cacheEntry.stateByIndex[idx] = "not-typed"
      cacheEntry.typedCharByIndex[idx] = ""
    } else {
      const extras = cacheEntry.extrasByIndex[idx]
      if (extras.length > 0) {
        cacheEntry.extrasByIndex[idx] =
          extras.length === 1 ? EMPTY_EXTRAS : extras.slice(0, -1)
      }
    }
    return idx
  }

  // If it's a space but we typed a letter, it's an extra
  if (char === " " && k.typedChar !== " ") {
    const prevExtras = cacheEntry.extrasByIndex[idx]
    cacheEntry.extrasByIndex[idx] =
      prevExtras === EMPTY_EXTRAS ? [k.typedChar] : [...prevExtras, k.typedChar]
    return idx
  }

  // If we already have a typed char for this index, subsequent ones are extras
  if (cacheEntry.typedCharByIndex[idx] !== "") {
    const prevExtras = cacheEntry.extrasByIndex[idx]
    cacheEntry.extrasByIndex[idx] =
      prevExtras === EMPTY_EXTRAS ? [k.typedChar] : [...prevExtras, k.typedChar]
    return idx
  }

  cacheEntry.stateByIndex[idx] = k.isCorrect ? "correct" : "incorrect"
  cacheEntry.typedCharByIndex[idx] = k.typedChar
  return idx
}

/**
 * Computes all character states based on the original characters and the list of keystrokes.
 * Returns an array of CharState objects corresponding to each character in the text.
 */
export const getCharStates = (
  characters: string[],
  keystrokes: Keystroke[],
): CharState[] => {
  if (!characters || characters.length === 0) return []
  if (!keystrokes) keystrokes = []

  const cached = CHAR_STATES_CACHE.get(keystrokes)
  const shouldRebuild =
    !cached ||
    cached.characters !== characters ||
    keystrokes.length < cached.processedLen ||
    cached.lastResult.length !== characters.length

  const cacheEntry = shouldRebuild ? createCharStatesCacheEntry(characters) : cached!

  // Rebuild processes from the beginning.
  const start = shouldRebuild ? 0 : cacheEntry.processedLen
  const changed = new Set<number>()

  for (let i = start; i < keystrokes.length; i++) {
    const idx = applyKeystrokeToCache(characters, cacheEntry, keystrokes[i])
    if (idx != null) changed.add(idx)
  }

  cacheEntry.processedLen = keystrokes.length

  // If nothing changed and we're not rebuilding, return the previous result reference.
  if (!shouldRebuild && changed.size === 0) {
    return cacheEntry.lastResult
  }

  // Create a new array reference so React memo comparisons can detect updates.
  const next =
    shouldRebuild ?
      new Array<CharState>(characters.length)
    : cacheEntry.lastResult.slice()

  if (shouldRebuild) {
    for (let i = 0; i < characters.length; i++) {
      next[i] = {
        state: cacheEntry.stateByIndex[i],
        typedChar: cacheEntry.typedCharByIndex[i],
        extras: cacheEntry.extrasByIndex[i],
      }
    }
  } else {
    for (const idx of changed) {
      next[idx] = {
        state: cacheEntry.stateByIndex[idx],
        typedChar: cacheEntry.typedCharByIndex[idx],
        extras: cacheEntry.extrasByIndex[idx],
      }
    }
  }

  cacheEntry.lastResult = next
  if (shouldRebuild) {
    CHAR_STATES_CACHE.set(keystrokes, cacheEntry)
  }

  return next
}
