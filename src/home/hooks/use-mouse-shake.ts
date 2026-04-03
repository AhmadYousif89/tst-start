import { useEffect, useRef } from "react"

type MouseShakeOptions = {
  enabled: boolean
  windowMs?: number
  threshold?: number
  minEvents?: number
  cooldownMs?: number
  peakThreshold?: number
  onShake: () => void
}
type Sample = { t: number; d: number }
type Pos = { x: number; y: number; t: number }

export function useMouseShake({
  enabled,
  onShake,
  windowMs = 240,
  threshold = 220,
  minEvents = 4,
  peakThreshold = 12,
  cooldownMs = 600,
}: MouseShakeOptions) {
  const lastPosRef = useRef<Pos | null>(null)
  const samplesRef = useRef<Sample[]>([])
  const cooldownUntilRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      lastPosRef.current = null
      samplesRef.current = []
      return
    }

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now()

      // Always update last position to avoid huge deltas
      const last = lastPosRef.current
      if (!last) {
        lastPosRef.current = { x: e.clientX, y: e.clientY, t: now }
        return
      }

      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      lastPosRef.current = { x: e.clientX, y: e.clientY, t: now }

      if (now < cooldownUntilRef.current) return

      const d = Math.abs(dx) + Math.abs(dy)
      // Ignore tiny jitter / trackpad noise
      if (d < 3) return

      const samples = samplesRef.current
      samples.push({ t: now, d })

      const cutoff = now - windowMs
      while (samples.length && samples[0]!.t < cutoff) samples.shift()

      if (samples.length < minEvents) return

      let energy = 0
      let peak = 0
      for (const s of samples) {
        energy += s.d
        if (s.d > peak) peak = s.d
      }

      // Require both sustained movement and at least one "real" move
      if (energy >= threshold && peak >= peakThreshold) {
        cooldownUntilRef.current = now + cooldownMs
        samplesRef.current = []
        onShake()
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMouseMove)
  }, [enabled, onShake, windowMs, threshold, minEvents, peakThreshold, cooldownMs])
}
