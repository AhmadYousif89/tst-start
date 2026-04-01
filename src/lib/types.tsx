import { ObjectId } from "mongodb"
import {
  Keystroke,
  TextMode,
  TextCategory,
  TextLanguage,
} from "@/home/context/engine.types"
import { EngineSettings } from "@/home/context/settings.types"

// texts collection
export type TextDoc = {
  _id: string | ObjectId

  text: string
  charCount: number
  language: TextLanguage
  category: TextCategory
  totalCompletions?: number
  averageWpm?: number

  createdAt: Date
}

// anonymous_users collection
export type AnonUserDoc = {
  _id: string | ObjectId

  anonUserId: string // UUID v4 (in a cookie)
  bestWpm: number
  bestAccuracy: number
  totalSessions: number
  settings: EngineSettings

  createdAt: Date
  updatedAt: Date
}

// typing_sessions collection
export type TypingSessionDoc = {
  _id: string | ObjectId

  anonUserId: string // references AnonUserDoc._id
  textId: string | ObjectId // references TextDoc._id

  category: TextCategory
  mode: TextMode

  wpm: number
  accuracy: number
  charCount: number
  errorCount: number
  durationMs: number
  rawWpm: number
  consistency: number
  isInvalid?: boolean // For spam or invalid sessions
  keystrokes?: KeystrokeDoc[] // Only for populating session analytics

  startedAt: Date
  finishedAt: Date
  isFirst?: boolean
  isBest?: boolean
  validSessionsCount?: number
}

// keystrokes collection
export type KeystrokeDoc = {
  _id: string | ObjectId

  textId: string | ObjectId
  sessionId: string | ObjectId
  anonUserId: string
  createdAt: Date
} & Keystroke
