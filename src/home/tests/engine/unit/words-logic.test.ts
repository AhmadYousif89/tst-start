import { describe, it, expect } from "vitest"
import { getWordEnd, getWordRanges, getWordIndexByCursor } from "../../../engine/logic"

describe("getWordEnd", () => {
  const chars = "the quick brown".split("")

  it("returns index of space after word", () => {
    expect(getWordEnd(0, chars)).toBe(3)
    expect(getWordEnd(1, chars)).toBe(3)
    expect(getWordEnd(2, chars)).toBe(3)
  })

  it("returns space index when cursor is on space", () => {
    expect(getWordEnd(3, chars)).toBe(3)
  })

  it("returns end of word in middle of text", () => {
    expect(getWordEnd(4, chars)).toBe(9)
    expect(getWordEnd(6, chars)).toBe(9)
  })

  it("returns characters.length for the last word", () => {
    expect(getWordEnd(10, chars)).toBe(15)
    expect(getWordEnd(14, chars)).toBe(15)
  })
})

describe("getWordRanges", () => {
  it("converts text into array of start/end indices", () => {
    const text = "the quick brown"
    const ranges = getWordRanges(text)

    expect(ranges).toHaveLength(3)
    expect(ranges[0]).toEqual({ start: 0, end: 4 })
    expect(ranges[1]).toEqual({ start: 4, end: 10 })
    expect(ranges[2]).toEqual({ start: 10, end: 15 })
  })

  it("handles single word", () => {
    const text = "hello"
    const ranges = getWordRanges(text)
    expect(ranges).toHaveLength(1)
    expect(ranges[0]).toEqual({ start: 0, end: 5 })
  })

  it("handles trailing spaces without creating an empty range", () => {
    const text = "hi "
    const ranges = getWordRanges(text)
    expect(ranges).toHaveLength(1)
    expect(ranges[0]).toEqual({ start: 0, end: 3 })
  })

  it("handles consecutive spaces with stable character indices", () => {
    const text = "a  b"
    const ranges = getWordRanges(text)

    // Ranges are chunks that end at a space (inclusive) or the end of the string.
    // This mirrors the UI grouping which can produce a "word" that is just a space.
    expect(ranges).toEqual([
      { start: 0, end: 2 }, // "a "
      { start: 2, end: 3 }, // " "
      { start: 3, end: 4 }, // "b"
    ])
  })
})

describe("getWordIndexByCursor", () => {
  const ranges = [
    { start: 0, end: 4 },
    { start: 4, end: 10 },
    { start: 10, end: 15 },
  ]

  it("finds correct index when cursor is inside word", () => {
    expect(getWordIndexByCursor(0, ranges)).toBe(0)
    expect(getWordIndexByCursor(2, ranges)).toBe(0)
    expect(getWordIndexByCursor(6, ranges)).toBe(1)
    expect(getWordIndexByCursor(14, ranges)).toBe(2)
  })

  it("finds correct index when cursor is on word boundaries", () => {
    expect(getWordIndexByCursor(3, ranges)).toBe(0) // space after first word
    expect(getWordIndexByCursor(4, ranges)).toBe(1) // start of second word
    expect(getWordIndexByCursor(9, ranges)).toBe(1) // space after second word
  })

  it("treats range end as exclusive", () => {
    expect(getWordIndexByCursor(15, ranges)).toBe(-1)
  })

  it("returns -1 if cursor is out of bounds", () => {
    expect(getWordIndexByCursor(20, ranges)).toBe(-1)
  })

  it("maps consecutive spaces consistently", () => {
    const text = "a  b"
    const weirdRanges = getWordRanges(text)

    expect(getWordIndexByCursor(0, weirdRanges)).toBe(0) // "a"
    expect(getWordIndexByCursor(1, weirdRanges)).toBe(0) // first space
    expect(getWordIndexByCursor(2, weirdRanges)).toBe(1) // second space
    expect(getWordIndexByCursor(3, weirdRanges)).toBe(2) // "b"
    expect(getWordIndexByCursor(4, weirdRanges)).toBe(-1) // end of text (exclusive)
  })
})
