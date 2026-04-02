import { calculateLayoutShift } from "@/home/engine/logic"
import { describe, it, expect } from "vitest"

describe("calculateLayoutShift", () => {
  it("should not shift if there are fewer than 3 rows", () => {
    const rowStarts = [0, 10] // Only 2 rows
    const result = calculateLayoutShift(5, 0, rowStarts)
    expect(result.shouldShift).toBe(false)
  })

  it("should not shift if the active word is on the 1st row", () => {
    const rowStarts = [0, 5, 10, 15]
    const result = calculateLayoutShift(2, 0, rowStarts)
    expect(result.shouldShift).toBe(false)
  })

  it("should not shift if the active word is on the 2nd row", () => {
    const rowStarts = [0, 5, 10, 15]
    const result = calculateLayoutShift(7, 0, rowStarts)
    expect(result.shouldShift).toBe(false)
  })

  it("should shift when the active word enters the 3rd row", () => {
    const rowStarts = [0, 5, 10, 15]
    const activeWordIndex = 10 // Start of 3rd row
    const result = calculateLayoutShift(activeWordIndex, 0, rowStarts)

    expect(result.shouldShift).toBe(true)
    expect(result.newStartIndex).toBe(5) // Shift by the number of words in 1st row (5 - 0)
  })

  it("should shift by the correct amount based on the first row's length", () => {
    const rowStarts = [0, 8, 14, 20]
    const activeWordIndex = 14 // Start of 3rd row
    const result = calculateLayoutShift(activeWordIndex, 0, rowStarts)

    expect(result.shouldShift).toBe(true)
    expect(result.newStartIndex).toBe(8) // Shift by 8 words
  })

  it("should handle shifted start index correctly", () => {
    // Current state: startIndex is 8, words are 8...50
    // Rows: [8, 14, 20, 25] (indices relative to text start)
    const rowStarts = [8, 14, 20, 25]
    const activeWordIndex = 20 // Enters the relative 3rd row
    const result = calculateLayoutShift(activeWordIndex, 8, rowStarts)

    expect(result.shouldShift).toBe(true)
    expect(result.newStartIndex).toBe(14) // Shift by 6 words (14 - 8)
  })

  it("should not shift prematurely when a word is pushed to the 3rd row by extras (User Requirement)", () => {
    /**
     * Scenario:
     * Row 1: Word 0, 1
     * Row 2: Word 2, 3
     * Row 3: Word 4, 5
     *
     * User is typing word 3.
     * Even if word 3 has many extras, the activeWordIndex is still 3.
     * The rowStarts might update to show Word 4 moved to Row 4, etc.
     * But as long as activeWordIndex (3) < thirdRowStart (4), it should NOT shift.
     */
    const rowStarts = [0, 2, 4, 6]
    const activeWordIndex = 3 // Still on row 2
    const result = calculateLayoutShift(activeWordIndex, 0, rowStarts)

    expect(result.shouldShift).toBe(false)
  })
})
