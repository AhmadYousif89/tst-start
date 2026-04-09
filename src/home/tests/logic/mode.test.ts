import { describe, it, expect } from "vitest"

import { getInitialTime, getModeLabel } from "@/home/logic/mode"

describe("getModeLabel", () => {
  it("labels passage mode", () => {
    expect(getModeLabel("passage")).toBe("Passage")
  })

  it("labels timed modes", () => {
    expect(getModeLabel("t:15")).toBe("Timed (15s)")
  })
})

describe("getInitialTime", () => {
  it("returns 0 for passage mode", () => {
    expect(getInitialTime("passage")).toBe(0)
  })

  it("parses time correctly from mode string", () => {
    expect(getInitialTime("t:15")).toBe(15)
    expect(getInitialTime("t:30")).toBe(30)
    expect(getInitialTime("t:60")).toBe(60)
    expect(getInitialTime("t:120")).toBe(120)
    expect(getInitialTime("t:180")).toBe(180)
  })

  it("falls back to default for invalid timed strings", () => {
    expect(getInitialTime("t:nope" as any)).toBe(15)
  })
})
