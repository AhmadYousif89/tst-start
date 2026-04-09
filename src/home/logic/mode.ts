import { TextMode } from "@/home/context/engine.types"

/**
 * Gets the label for a given mode.
 * Returns "Passage" for "passage" mode, otherwise returns the mode string.
 */
export const getModeLabel = (m: TextMode) => {
  if (m && m === "passage") return "Passage"
  if (m?.startsWith("t:")) return `Timed (${m.split(":")[1]}s)`
  return m
}

/**
 * Gets the initial time in seconds for a given mode.
 * Returns 0 for "passage" mode, otherwise parses the time from the mode string.
 */
export const getInitialTime = (m: TextMode): number => {
  if (m && m === "passage") return 0
  if (!m) return 15
  const parsed = parseInt(m.split(":")[1] || "", 10)
  return Number.isFinite(parsed) ? parsed : 15
}
