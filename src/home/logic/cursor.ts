/**
 * Calculates the next cursor position based on the current cursor and typed character.
 * Enforces a minimum cursor position if a lockedCursor is provided.
 */
export const calculateNextCursor = (
  currentCursor: number,
  typedChar: string,
  characters: string[],
  isCtrlKey: boolean = false,
  lockedCursor: number = 0,
): number => {
  if (typedChar === "Backspace") {
    if (currentCursor <= lockedCursor) return currentCursor

    if (isCtrlKey) {
      let newCursor = currentCursor - 1
      // Skip trailing spaces if any
      while (newCursor > lockedCursor && characters[newCursor] === " ") {
        newCursor--
      }
      // Skip back to the beginning of the word
      while (newCursor > lockedCursor && characters[newCursor - 1] !== " ") {
        newCursor--
      }
      return Math.max(lockedCursor, newCursor)
    }
    return Math.max(lockedCursor, currentCursor - 1)
  }
  // Logic for skipping words when typing a space mid-word
  if (typedChar === " " && characters[currentCursor] !== " ") {
    let nextSpace = currentCursor
    while (nextSpace < characters.length && characters[nextSpace] !== " ") {
      nextSpace++ // advance cursor to the index before the next space
    }
    // return the index at the start of the next word
    return Math.min(characters.length, nextSpace + 1)
  }

  return Math.min(characters.length, currentCursor + 1)
}

type ShiftLayoutResult = {
  shouldShift: boolean
  newStartIndex: number
}

/**
 * Calculates the new start index if a shift is required.
 * This is based on the position of the active word and the starting indices of each row.
 *
 * Logic:
 * - Keep the active word on the first two rows.
 * - If the active word is on the 3rd row (or beyond), shift!
 */
export function calculateLayoutShift(
  activeWordIndex: number,
  startIndex: number,
  rowStarts: number[],
): ShiftLayoutResult {
  // If we don't have at least 3 rows, we can't shift to keep things on the first two
  if (rowStarts.length < 3) {
    return { shouldShift: false, newStartIndex: startIndex }
  }

  const thirdRowStartWordIndex = rowStarts[2]

  // Only shift if the active word has actually ENTERED the third row
  if (activeWordIndex >= thirdRowStartWordIndex) {
    // We shift by the number of words that were in the first row
    const firstRowWordCount = rowStarts[1] - rowStarts[0]
    return {
      shouldShift: true,
      newStartIndex: startIndex + firstRowWordCount,
    }
  }

  return { shouldShift: false, newStartIndex: startIndex }
}
