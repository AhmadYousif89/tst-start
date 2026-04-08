type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    platform?: string
  }
}

export const isApplePlatform = () => {
  if (typeof navigator === "undefined") return false

  const nav = navigator as NavigatorWithUAData
  const platform = nav.userAgentData?.platform ?? nav.platform ?? nav.userAgent

  // iPadOS Safari (13+) sometimes reports platform as "MacIntel"
  const isIpadOs = platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1
  if (isIpadOs) return true

  return /mac|iphone|ipad|ipod/i.test(platform)
}

export const getModKeyLabel = () => (isApplePlatform() ? "Cmd" : "Ctrl")
