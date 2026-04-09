import { describe, it, expect } from "vitest"

import { Keystroke } from "@/home/context/engine.types"
import { getCharStates } from "@/home/logic/char-state"

describe("getCharStates", () => {
  const chars = "The quick brown fox".split("")

  it("returns 'not-typed' for characters without keystrokes", () => {
    const states = getCharStates(chars, [])
    expect(states[0]).toEqual({
      state: "not-typed",
      typedChar: "",
      extras: [],
    })
  })

  it("shares a single empty extras array across all characters (fragility check)", () => {
    const states = getCharStates(chars, [])
    const firstExtras = states[0].extras
    expect(states.every((s) => s.extras === firstExtras)).toBe(true)
  })

  it("prevents mutating the shared empty extras array (frozen)", () => {
    const states = getCharStates(chars, [])
    expect(() => {
      ;(states[0].extras as string[]).push("x")
    }).toThrow()
  })

  it("returns the same array reference when called again with the same keystrokes array and no changes", () => {
    const keystrokes: Keystroke[] = []
    const states1 = getCharStates(chars, keystrokes)
    const states2 = getCharStates(chars, keystrokes)
    expect(states2).toBe(states1)
  })

  it("returns a new array reference when keystrokes are appended (and does not mutate the previous result)", () => {
    const keystrokes: Keystroke[] = []
    const states1 = getCharStates(chars, keystrokes)

    keystrokes.push({
      charIndex: 0,
      expectedChar: "T",
      typedChar: "T",
      isCorrect: true,
      timestampMs: 100,
    })

    const states2 = getCharStates(chars, keystrokes)
    expect(states2).not.toBe(states1)
    expect(states2[0].state).toBe("correct")
    expect(states1[0].state).toBe("not-typed")
  })

  it("returns 'correct' for a correctly typed character", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 100,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0].state).toBe("correct")
  })

  it("returns 'incorrect' for an incorrectly typed character", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 100,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0].state).toBe("incorrect")
  })

  it("neutralizes color after backspace", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 200,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0].state).toBe("not-typed")
  })

  it("processes extra characters typed at a space", () => {
    const spaceIndex = 3
    const keystrokes: Keystroke[] = [
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 100,
      },
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "y",
        isCorrect: false,
        timestampMs: 200,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[spaceIndex].extras).toEqual(["x", "y"])
  })

  it("handles backspacing extra characters correctly", () => {
    const spaceIndex = 3
    const keystrokes: Keystroke[] = [
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 100,
      },
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "y",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[spaceIndex].extras).toEqual(["x"])
  })

  it("handles re-typing correctly after backspace", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 100,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0].state).toBe("correct")
    expect(states[0].typedChar).toBe("T")
  })

  it("handles backspacing multiple times at the same index", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "a",
        isCorrect: false,
        timestampMs: 100,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "b",
        isCorrect: false,
        timestampMs: 300,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 400,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 500,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0]).toEqual({
      state: "correct",
      typedChar: "T",
      extras: [],
    })
  })

  it("does not affect previous correct characters when later characters are incorrect", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 1,
        expectedChar: "h",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 200,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0]).toEqual({
      state: "correct",
      typedChar: "T",
      extras: [],
    })
    expect(states[1]).toEqual({
      state: "incorrect",
      typedChar: "x",
      extras: [],
    })
  })

  it("does not neutralize earlier characters when backspacing a later index", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 1,
        expectedChar: "h",
        typedChar: "h",
        isCorrect: true,
        timestampMs: 200,
      },
      {
        charIndex: 1,
        expectedChar: "h",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0]).toEqual({
      state: "correct",
      typedChar: "T",
      extras: [],
    })
    expect(states[1]).toEqual({
      state: "not-typed",
      typedChar: "",
      extras: [],
    })
  })

  it("removes main char first on backspace (Standard Behavior)", () => {
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "T",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: 0,
        expectedChar: "T",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[0].state).toBe("not-typed")
    expect(states[0].typedChar).toBe("")
    expect(states[0].extras).toEqual(["x"])
  })

  it("removes main char first on backspace (Space)", () => {
    const spaceIndex = 3
    const keystrokes: Keystroke[] = [
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: " ",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: spaceIndex,
        expectedChar: " ",
        typedChar: "Backspace",
        isCorrect: false,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[spaceIndex].state).toBe("not-typed")
    expect(states[spaceIndex].typedChar).toBe("")
    expect(states[spaceIndex].extras).toEqual(["x"])
  })
})

describe("getCharStates - additional edge cases", () => {
  it("returns empty array for empty characters", () => {
    const states = getCharStates([], [])
    expect(states).toEqual([])
  })

  it("handles special characters correctly", () => {
    const chars = "Hello, World!".split("")
    const keystrokes: Keystroke[] = [
      {
        charIndex: 5,
        expectedChar: ",",
        typedChar: ",",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 6,
        expectedChar: " ",
        typedChar: " ",
        isCorrect: true,
        timestampMs: 200,
      },
      {
        charIndex: 12,
        expectedChar: "!",
        typedChar: "!",
        isCorrect: true,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states[5]).toEqual({ state: "correct", typedChar: ",", extras: [] })
    expect(states[6]).toEqual({ state: "correct", typedChar: " ", extras: [] })
    expect(states[12]).toEqual({
      state: "correct",
      typedChar: "!",
      extras: [],
    })
  })

  it("handles all characters typed correctly", () => {
    const chars = "abc".split("")
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "a",
        typedChar: "a",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 1,
        expectedChar: "b",
        typedChar: "b",
        isCorrect: true,
        timestampMs: 200,
      },
      {
        charIndex: 2,
        expectedChar: "c",
        typedChar: "c",
        isCorrect: true,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states.every((s) => s.state === "correct" && s.extras?.length === 0)).toBe(
      true,
    )
  })

  it("handles all characters typed incorrectly", () => {
    const chars = "abc".split("")
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "a",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 100,
      },
      {
        charIndex: 1,
        expectedChar: "b",
        typedChar: "y",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: 2,
        expectedChar: "c",
        typedChar: "z",
        isCorrect: false,
        timestampMs: 300,
      },
    ]
    const states = getCharStates(chars, keystrokes)
    expect(states.every((s) => s.state === "incorrect" && s.extras?.length === 0)).toBe(
      true,
    )
  })
})

describe("getCharStates - robustness", () => {
  it("ignores keystrokes with out-of-bounds charIndex", () => {
    const chars = "abc".split("")
    const keystrokes: Keystroke[] = [
      {
        charIndex: 0,
        expectedChar: "a",
        typedChar: "a",
        isCorrect: true,
        timestampMs: 100,
      },
      {
        charIndex: 3,
        expectedChar: " ",
        typedChar: " ",
        isCorrect: false,
        timestampMs: 200,
      },
      {
        charIndex: 5,
        expectedChar: "x",
        typedChar: "x",
        isCorrect: false,
        timestampMs: 300,
      },
    ]

    const states = getCharStates(chars, keystrokes)
    expect(states.length).toBe(3)
    expect(states[0].state).toBe("correct")
  })
})
