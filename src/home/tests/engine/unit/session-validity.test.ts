import { describe, it, expect } from "vitest"
import { isSessionInvalid } from "@/home/engine/utils"

describe("isSessionInvalid", () => {
  it("should return false for a valid session", () => {
    // wpm: 50, accuracy: 95, duration: 10s, errorCount: 2, keystrokeCount: 100
    // All values are within valid thresholds
    expect(isSessionInvalid({ wpm: 50, accuracy: 95, durationMs: 10000, errorCount: 2, keystrokeCount: 100 })).toBe(false)
  })

  it("should return true if WPM is below MIN_WPM (10)", () => {
    expect(isSessionInvalid({ wpm: 9, accuracy: 100, durationMs: 5000, errorCount: 0, keystrokeCount: 20 })).toBe(true)
  })

  it("should return true if accuracy is below MIN_ACCURACY (20)", () => {
    expect(isSessionInvalid({ wpm: 40, accuracy: 19, durationMs: 5000, errorCount: 15, keystrokeCount: 20 })).toBe(true)
  })

  it("should return true if duration is below MIN_DURATION_MS (2000)", () => {
    expect(isSessionInvalid({ wpm: 50, accuracy: 100, durationMs: 1999, errorCount: 0, keystrokeCount: 20 })).toBe(true)
  })

  it("should return true if keystrokeCount is below MIN_KEYSTROKES (5)", () => {
    expect(isSessionInvalid({ wpm: 50, accuracy: 100, durationMs: 5000, errorCount: 0, keystrokeCount: 4 })).toBe(true)
  })

  it("should return true if errorCount is more than half of keystrokeCount", () => {
    // 11 errors in 20 keystrokes is > 50%
    expect(isSessionInvalid({ wpm: 50, accuracy: 45, durationMs: 5000, errorCount: 11, keystrokeCount: 20 })).toBe(true)
  })

  it("should return false if errorCount is exactly half of keystrokeCount", () => {
    // 10 errors in 20 keystrokes is exactly 50% (should be valid per 'errorCount > keystrokeCount / 2')
    expect(isSessionInvalid({ wpm: 50, accuracy: 50, durationMs: 5000, errorCount: 10, keystrokeCount: 20 })).toBe(false)
  })

  it("should handle edge cases like zero values", () => {
    expect(isSessionInvalid({ wpm: 0, accuracy: 0, durationMs: 0, errorCount: 0, keystrokeCount: 0 })).toBe(true)
  })
})
