export type SoundNames =
  | "beep"
  | "click"
  | "creamy"
  | "hitmarker"
  | "osu"
  | "pop"
  | "punch"
  | "rubber"
  | "typewriter"

export type SoundType = "keystroke" | "warning" | "flash"

export type SoundSettings = {
  soundName: SoundNames
  volume: number
  isMuted: boolean
}

export type SoundFile = Record<
  SoundNames,
  { folder: string; prefix: string; count: number }
>

export type SoundContextType = {
  volume: number
  isMuted: boolean
  soundName: SoundNames
  setVolume: (v: number) => void
  setIsMuted: (m: boolean) => void
  setSoundName: (name: SoundNames) => void
  playSound: (type?: SoundType) => void
  stopSound: (type: SoundType) => void
}
