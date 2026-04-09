import { Keystroke } from "@/home/context/engine.types"

/**
 * Calculates words per minute (WPM).
 * Standard formula: (Correct Characters / 5) / Time (min)
 */
export const calculateWpm = (correctChars: number, timeElapsedMs: number): number => {
  const elapsedMinutes = timeElapsedMs / 60000
  if (elapsedMinutes <= 0) return 0
  return Math.round(correctChars / 5 / elapsedMinutes)
}

/**
 * Calculates raw words per minute (Raw WPM).
 * Formula: (Total Keystrokes / 5) / Duration (min)
 */
export const calculateRawWpm = (totalKeystrokes: number, durationMs: number): number => {
  const durationMin = durationMs / 60000
  if (durationMin <= 0) return 0
  return Math.round(totalKeystrokes / 5 / durationMin)
}

/**
 * Calculates typing accuracy percentage.
 * Formula: (Correct Keystrokes / Total Keystrokes (excluding Backspace)) * 100
 */
export const calculateAccuracy = (correctKeys: number, totalTyped: number): number => {
  if (totalTyped === 0) return 100
  return Math.round((correctKeys / totalTyped) * 100)
}

/**
 * Calculates typing consistency percentage.
 * Breakdown based on variation in WPM across 1-second interval buckets.
 */
export const calculateConsistency = (
  keystrokes: Keystroke[],
  durationMs: number,
): number => {
  if (!keystrokes || keystrokes.length === 0 || durationMs <= 0) return 0

  const durationSec = Math.ceil(durationMs / 1000)
  const correctsPerSecond = new Array<number>(durationSec).fill(0)

  // Single pass bucketing: equivalent to the per-second filtering
  // should avoid repeatedly scanning the entire keystrokes array.
  for (const k of keystrokes) {
    if (!k.isCorrect || k.typedChar === "Backspace") continue // Skip incorrect ks and bs as they don't contribute to WPM
    if (k.timestampMs < 0 || k.timestampMs >= durationMs) continue // Skip out-of-bounds timestamps
    const bucketIndex = Math.min(durationSec - 1, Math.floor(k.timestampMs / 1000))
    correctsPerSecond[bucketIndex]++
  }

  const wpmValues: number[] = []
  for (let i = 0; i < durationSec; i++) {
    const startTime = i * 1000
    const bucketDurationMs = Math.min(1000, durationMs - startTime)
    // WPM for this second = (correct / 5) / (duration / 60)
    const instantWpm = correctsPerSecond[i] / 5 / (bucketDurationMs / 60000)
    wpmValues.push(instantWpm)
  }

  const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length
  if (mean <= 0) return 0

  const variance =
    wpmValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmValues.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / mean // Coefficient of Variation
  // 70 is the slope of the line that goes from (0, 100) to (1, 0)
  // So if CV is 0, consistency is 100, and if CV is 1, consistency is 30 (100 - 70)
  const slope = 70
  const consistency = Math.max(0, 100 - cv * slope)

  return Math.round(consistency)
}
