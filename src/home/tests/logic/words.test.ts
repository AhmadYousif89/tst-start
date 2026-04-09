import { describe, it, expect } from "vitest"

import {
  getWordStart,
  getWordEnd,
  getWordRanges,
  isWordPerfect,
  getWordIndexByCursor,
} from "@/home/logic/words"
import { CharState } from "@/home/context/engine.types"

describe("getWordStart", () => {
  const chars = "the quick brown".split("")

  it("returns 0 for the first word", () => {
    expect(getWordStart(0, chars)).toBe(0)
    expect(getWordStart(1, chars)).toBe(0)
    expect(getWordStart(2, chars)).toBe(0)
  })

  it("returns start of middle words", () => {
    expect(getWordStart(4, chars)).toBe(4)
    expect(getWordStart(6, chars)).toBe(4)
  })

  it("handles cursor on a space (treats as end of prev word)", () => {
    expect(getWordStart(3, chars)).toBe(0)
  })

  it("handles end of string", () => {
    expect(getWordStart(chars.length, chars)).toBe(10)
  })
})

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

    expect(ranges).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 3 },
      { start: 3, end: 4 },
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
    expect(getWordIndexByCursor(3, ranges)).toBe(0)
    expect(getWordIndexByCursor(4, ranges)).toBe(1)
    expect(getWordIndexByCursor(9, ranges)).toBe(1)
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

    expect(getWordIndexByCursor(0, weirdRanges)).toBe(0)
    expect(getWordIndexByCursor(1, weirdRanges)).toBe(0)
    expect(getWordIndexByCursor(2, weirdRanges)).toBe(1)
    expect(getWordIndexByCursor(3, weirdRanges)).toBe(2)
    expect(getWordIndexByCursor(4, weirdRanges)).toBe(-1)
  })
})

describe("isWordPerfect", () => {
  it("returns true for perfect range", () => {
    const states: CharState[] = [
      { state: "correct", typedChar: "a", extras: [] },
      { state: "correct", typedChar: "b", extras: [] },
      { state: "correct", typedChar: " ", extras: [] },
    ]
    expect(isWordPerfect(0, states.length - 1, states)).toBe(true)
  })

  it("returns false if any char is incorrect", () => {
    const states: CharState[] = [
      { state: "correct", typedChar: "a", extras: [] },
      { state: "incorrect", typedChar: "x", extras: [] },
      { state: "correct", typedChar: " ", extras: [] },
    ]
    expect(isWordPerfect(0, states.length - 1, states)).toBe(false)
  })

  it("returns false if extras were found in the middle of the word", () => {
    const states: CharState[] = [
      { state: "correct", typedChar: "a", extras: ["x"] },
      { state: "correct", typedChar: "b", extras: ["y"] },
      { state: "correct", typedChar: "c", extras: [] },
      { state: "correct", typedChar: " ", extras: [] },
    ]
    expect(isWordPerfect(0, states.length - 1, states)).toBe(false)
  })

  it("returns false if extras were found at the end of the word", () => {
    const states: CharState[] = [
      { state: "correct", typedChar: "a", extras: [] },
      { state: "correct", typedChar: "b", extras: [] },
      { state: "correct", typedChar: " ", extras: ["x", "y"] },
    ]
    expect(isWordPerfect(0, states.length - 1, states)).toBe(false)
  })

  it("returns false if any char has extras", () => {
    const states: CharState[] = [
      { state: "correct", typedChar: "a", extras: [] },
      { state: "correct", typedChar: "b", extras: ["x"] },
      { state: "correct", typedChar: " ", extras: [] },
    ]
    expect(isWordPerfect(0, states.length - 1, states)).toBe(false)
  })

  it("returns false for invalid range", () => {
    expect(isWordPerfect(5, 2, [])).toBe(false)
  })

  it("returns false if endIndex is out of bounds", () => {
    const states: CharState[] = [{ state: "correct", typedChar: "a", extras: [] }]
    expect(isWordPerfect(0, 1, states)).toBe(false)
  })
})
