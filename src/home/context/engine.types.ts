import z from "zod"
import { TextDoc } from "@/lib/types"

export const schema = z.object({
  id: z.string().optional(),
  cat: z.enum(["lyrics", "general", "quotes", "code"]).default("general"),
  lang: z.enum(["ar", "en", "en:lyrics", "en:quotes", "en:code"]).default("en"),
  mode: z.enum(["t:15", "t:30", "t:60", "t:120", "t:180", "passage"]).default("t:60"),
})

export type TextSchema = z.infer<typeof schema>

export type TextMode = TextSchema["mode"]
export type TextCategory = TextSchema["cat"]
export type TextLanguage = TextSchema["lang"]

export type CursorStyle = "pip" | "box" | "underline"
export type CharState = {
  state: "not-typed" | "correct" | "incorrect"
  typedChar: string
  extras?: string[]
}

export type Keystroke = {
  charIndex: number
  expectedChar: string
  typedChar: string
  positionGroup?: number
  isCorrect: boolean
  timestampMs: number // offset from session start
  skipOrigin?: number // where the cursor was before the jump
}

export type EngineStatus = "loading" | "idle" | "typing" | "paused" | "finished"

export type EngineState = {
  status: EngineStatus
  textData: TextDoc
  wpm: number
  cursor: number
  accuracy: number
  extraOffset: number
  progress: number
  timeLeft: number
  isFocused: boolean
  showOverlay: boolean
  layout: {
    startIndex: number // starting index of the current word
    version: number // increments on layout changes to trigger Cursor rerender
  }
}

export type EngineConfigCtxType = {
  status: EngineStatus
  mode: TextMode
  textData: TextDoc
  language: TextLanguage
  isLoaded: boolean
  isImmersive: boolean
  isFocused: boolean
  showOverlay: boolean
  layout: {
    startIndex: number
    version: number
  }
}

export type EngineMetricsCtxType = {
  wpm: number
  accuracy: number
  timeLeft: number
  progress: number
}

export type EngineKeystrokeCtxType = {
  cursor: number
  extraOffset: number
  keystrokes: React.RefObject<Keystroke[]>
  lockedCursorRef: React.RefObject<number>
}

export type ResetOptions = {
  status?: EngineStatus
  actionName?: string
  newMode?: TextMode
  shouldFocus?: boolean
}

export type EngineActionsCtxType = {
  endSession: () => void
  resetSession: (opts?: ResetOptions) => void
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  getTimeElapsed: () => number
  setStatus: (s: EngineStatus) => void
  setTextData: (textData: TextDoc, shouldFocus?: boolean) => void
  setFocused: (isFocused: boolean) => void
  updateLayout: (opts?: { shouldReset?: boolean; newStartIndex?: number }) => void
  setCursor: (cursor: number | ((prev: number) => number), extraOffset?: number) => void
}

export type EngineAction =
  | { type: "START"; timestamp: number }
  | { type: "PAUSE"; timestamp: number }
  | { type: "RESUME"; timestamp: number }
  | { type: "RESET"; timeLeft: number; status?: EngineStatus; shouldFocus?: boolean }
  | { type: "END"; timestamp: number; wpm?: number; accuracy?: number }
  | { type: "TICK"; isTimed: boolean; wpm?: number; accuracy?: number }
  | { type: "SET_TEXT"; textData: TextDoc }
  | { type: "SET_FOCUSED"; isFocused: boolean }
  | { type: "SET_SHOW_OVERLAY"; showOverlay: boolean }
  | { type: "SET_STATUS"; status: EngineStatus }
  | { type: "SET_METRICS"; wpm: number; accuracy: number }
  | {
      type: "SET_CURSOR"
      cursor: number | ((prev: number) => number)
      charCount?: number
      extraOffset?: number
    }
  | {
      type: "UPDATE_LAYOUT"
      shouldReset?: boolean
      newStartIndex?: number
    }
