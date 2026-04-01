export type ShiftLayoutResult = {
  shouldShift: boolean
  newStartIndex: number
}

/**
 * Calculates the new start index if a shift is required.
 *
 * Logic:
 * 1. Keep the active word on the first two rows.
 * 2. If the active word is on the 3rd row (or beyond), shift!
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
