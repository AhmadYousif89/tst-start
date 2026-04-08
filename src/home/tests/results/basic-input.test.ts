import { describe, it, expect } from "vitest"
import { createMockKeystrokes } from "./helpers"
import { analyzeHeatmap } from "@/home/results/heatmap/logic/history"

describe("analyzeHeatmap: Basic Input Handling", () => {
  const mockText = "The quick brown fox"

  it("returns null for empty keystrokes", () => {
    const result = analyzeHeatmap([], mockText)
    expect(result).toBeNull()
  })

  it("returns null for empty text", () => {
    const keystrokes = createMockKeystrokes([
      { charIndex: 0, typedChar: "T", timestampMs: 100, isCorrect: true },
    ])
    const result = analyzeHeatmap(keystrokes, "")
    expect(result).toBeNull()
  })

  it("handles single word without trailing space", () => {
    const keystrokes = createMockKeystrokes([
      { charIndex: 0, typedChar: "H", timestampMs: 100, isCorrect: true },
      { charIndex: 1, typedChar: "e", timestampMs: 200, isCorrect: true },
      { charIndex: 2, typedChar: "l", timestampMs: 300, isCorrect: true },
      { charIndex: 3, typedChar: "l", timestampMs: 400, isCorrect: true },
      { charIndex: 4, typedChar: "o", timestampMs: 500, isCorrect: true },
    ])

    const result = analyzeHeatmap(keystrokes, "Hello")

    expect(result?.wordStatsMap.size).toBe(1)
    const word0 = result?.wordStatsMap.get(0)
    expect(word0?.word).toBe("Hello")
    expect(word0?.wpm).toBeCloseTo(120, 0)
  })

  it("handles incomplete word (partial typing)", () => {
    const keystrokes = createMockKeystrokes([
      { charIndex: 0, typedChar: "H", timestampMs: 100, isCorrect: true },
      { charIndex: 1, typedChar: "e", timestampMs: 200, isCorrect: true },
      { charIndex: 2, typedChar: "l", timestampMs: 300, isCorrect: true },
    ])

    const result = analyzeHeatmap(keystrokes, "Hello world")

    expect(result?.wordStatsMap.size).toBe(1)
    const word0 = result?.wordStatsMap.get(0)
    expect(word0?.wpm).toBeCloseTo(120, 0)
  })
})
