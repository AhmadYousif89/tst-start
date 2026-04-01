import { describe, it, expect } from "vitest"
import { getInitialSettings } from "@/home/engine/engine-utils"

describe("getInitialSettings", () => {
  it("returns sound settings when filter is 'sound'", () => {
    const settings = getInitialSettings("sound")
    expect(settings).toHaveProperty("soundName")
    expect(settings).toHaveProperty("volume")
    expect(settings).toHaveProperty("isMuted")
    expect(settings).not.toHaveProperty("mode")
    expect(settings).not.toHaveProperty("cursorStyle")
  })

  it("returns text settings when filter is 'text'", () => {
    const settings = getInitialSettings("text")
    expect(settings).toHaveProperty("mode")
    expect(settings).toHaveProperty("cursorStyle")
    expect(settings).not.toHaveProperty("soundName")
    expect(settings).not.toHaveProperty("volume")
    expect(settings).not.toHaveProperty("isMuted")
  })

  it("returns all settings when filter is 'all' or undefined", () => {
    const allSettings = getInitialSettings("all")
    const defaultSettings = getInitialSettings()

    expect(allSettings).toEqual(defaultSettings)
    expect(allSettings).toHaveProperty("soundName")
    expect(allSettings).toHaveProperty("volume")
    expect(allSettings).toHaveProperty("isMuted")
    expect(allSettings).toHaveProperty("mode")
    expect(allSettings).toHaveProperty("cursorStyle")
  })
})
