import { describe, it, expect } from "vitest"

import { calculateLayoutShift } from "@/home/logic/cursor"

describe("calculateLayoutShift", () => {
  it("should not shift if there are fewer than 3 rows", () => {
    const rowStarts = [0, 10]
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
    const activeWordIndex = 10
    const result = calculateLayoutShift(activeWordIndex, 0, rowStarts)

    expect(result.shouldShift).toBe(true)
    expect(result.newStartIndex).toBe(5)
  })

  it("should shift by the correct amount based on the first row's length", () => {
    const rowStarts = [0, 8, 14, 20]
    const activeWordIndex = 14
    const result = calculateLayoutShift(activeWordIndex, 0, rowStarts)

    expect(result.shouldShift).toBe(true)
    expect(result.newStartIndex).toBe(8)
  })

  it("should handle shifted start index correctly", () => {
    const rowStarts = [8, 14, 20, 25]
    const activeWordIndex = 20
    const result = calculateLayoutShift(activeWordIndex, 8, rowStarts)

    expect(result.shouldShift).toBe(true)
    expect(result.newStartIndex).toBe(14)
  })

  it("should not shift prematurely when a word is pushed to the 3rd row by extras (User Requirement)", () => {
    const rowStarts = [0, 2, 4, 6]
    const activeWordIndex = 3
    const result = calculateLayoutShift(activeWordIndex, 0, rowStarts)

    expect(result.shouldShift).toBe(false)
  })
})
