import { describe, it, expect } from "vitest"
import { createMockKeystrokes } from "./helpers"
import { analyzeHeatmap } from "@/home/results/logic/heatmap"

describe("analyzeHeatmap: Corrections and Backspaces", () => {
  const mockText = "The quick brown fox"

  it("ignores backspace keystrokes in WPM calculation", () => {
    const keystrokes = createMockKeystrokes([
      { charIndex: 0, typedChar: "T", timestampMs: 100, isCorrect: true },
      { charIndex: 1, typedChar: "h", timestampMs: 200, isCorrect: true },
      { charIndex: 1, typedChar: "Backspace", timestampMs: 300, isCorrect: false },
      { charIndex: 1, typedChar: "h", timestampMs: 400, isCorrect: true },
      { charIndex: 2, typedChar: "e", timestampMs: 500, isCorrect: true },
      { charIndex: 3, typedChar: " ", timestampMs: 600, isCorrect: true },
    ])

    const result = analyzeHeatmap(keystrokes, mockText)
    const word0 = result?.wordStatsMap.get(0)
    expect(word0?.wpm).toBeDefined()
  })

  it("handles backspacing and correcting errors correctly", () => {
    const text = "across"
    const keystrokes = createMockKeystrokes([
      { charIndex: 0, typedChar: "c", isCorrect: false, timestampMs: 100 },
      { charIndex: 1, typedChar: "r", isCorrect: false, timestampMs: 200 },
      { charIndex: 2, typedChar: "o", isCorrect: false, timestampMs: 300 },
      { charIndex: 3, typedChar: "s", isCorrect: false, timestampMs: 400 },
      { charIndex: 3, typedChar: "Backspace", isCorrect: true, timestampMs: 500 },
      { charIndex: 2, typedChar: "Backspace", isCorrect: true, timestampMs: 600 },
      { charIndex: 1, typedChar: "Backspace", isCorrect: true, timestampMs: 700 },
      { charIndex: 0, typedChar: "Backspace", isCorrect: true, timestampMs: 800 },
      { charIndex: 0, typedChar: "a", isCorrect: true, timestampMs: 900 },
      { charIndex: 1, typedChar: "c", isCorrect: true, timestampMs: 1000 },
      { charIndex: 2, typedChar: "r", isCorrect: true, timestampMs: 1100 },
      { charIndex: 3, typedChar: "o", isCorrect: true, timestampMs: 1200 },
      { charIndex: 4, typedChar: "s", isCorrect: true, timestampMs: 1300 },
      { charIndex: 5, typedChar: "s", isCorrect: true, timestampMs: 1400 },
    ])

    const result = analyzeHeatmap(keystrokes, text)
    const stats = result?.wordStatsMap.get(0)

    expect(stats?.typedChars).toBe("crosss")
    expect(stats?.errorCharIndices.size).toBe(4)
    expect(stats?.hasError).toBe(true)
  })

  it("preserves extra characters even after backspacing", () => {
    const keystrokes = createMockKeystrokes([
      { charIndex: 0, typedChar: "T", timestampMs: 100, isCorrect: true },
      { charIndex: 1, typedChar: "h", timestampMs: 200, isCorrect: true },
      { charIndex: 2, typedChar: "e", timestampMs: 300, isCorrect: true },
      { charIndex: 3, typedChar: "x", timestampMs: 400, isCorrect: false },
      { charIndex: 3, typedChar: "Backspace", timestampMs: 500, isCorrect: true },
      { charIndex: 3, typedChar: " ", timestampMs: 600, isCorrect: true },
    ])

    const result = analyzeHeatmap(keystrokes, "The quick")
    const stats = result?.wordStatsMap.get(0)
    expect(stats?.extras).toContain("x")
    expect(stats?.hasError).toBe(true)
  })
})
