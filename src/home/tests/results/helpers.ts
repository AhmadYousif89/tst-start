import { Keystroke } from "@/home/context/engine.types"

export const createMockKeystrokes = (keystrokes: Partial<Keystroke>[]): Keystroke[] =>
  keystrokes.map((k) => ({
    charIndex: k.charIndex ?? 0,
    expectedChar: k.expectedChar ?? "",
    typedChar: k.typedChar ?? "",
    isCorrect: k.isCorrect ?? true,
    timestampMs: k.timestampMs ?? 0,
    positionGroup: k.positionGroup,
    skipOrigin: k.skipOrigin,
  }))
