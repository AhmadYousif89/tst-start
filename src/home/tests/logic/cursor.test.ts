import { describe, it, expect } from "vitest"

import { calculateNextCursor } from "@/home/logic/cursor"

describe("calculateNextCursor", () => {
  const chars = "hello world".split("")

  it("increments cursor for normal characters", () => {
    expect(calculateNextCursor(0, "a", chars)).toBe(1)
    expect(calculateNextCursor(5, "x", chars)).toBe(6)
  })

  it("skips to the next word when typing a space mid-word", () => {
    expect(calculateNextCursor(1, " ", chars)).toBe(6)
  })

  it("decrements cursor for Backspace", () => {
    expect(calculateNextCursor(5, "Backspace", chars)).toBe(4)
  })

  it("stops at lockedCursor during Backspace", () => {
    expect(calculateNextCursor(6, "Backspace", chars, false, 6)).toBe(6)
    expect(calculateNextCursor(7, "Backspace", chars, false, 6)).toBe(6)
  })

  it("Ctrl+Backspace stops at lockedCursor", () => {
    expect(calculateNextCursor(11, "Backspace", chars, true, 6)).toBe(6)
  })

  it("does not decrement cursor below 0", () => {
    expect(calculateNextCursor(0, "Backspace", chars)).toBe(0)
  })

  it("does not increment cursor beyond text length", () => {
    expect(calculateNextCursor(chars.length, "a", chars)).toBe(chars.length)
  })

  it("cursor corrects to max length if out of bounds on backspace", () => {
    expect(calculateNextCursor(chars.length + 1, "Backspace", chars)).toBe(chars.length)
  })

  it("Ctrl+Backspace jumps to start of current word", () => {
    expect(calculateNextCursor(8, "Backspace", chars, true)).toBe(6)
  })

  it("Ctrl+Backspace from end of word jumps to start of word", () => {
    expect(calculateNextCursor(5, "Backspace", chars, true)).toBe(0)
  })

  it("Ctrl+Backspace from space jumps to start of PREVIOUS word", () => {
    expect(calculateNextCursor(6, "Backspace", chars, true)).toBe(0)
  })
})
