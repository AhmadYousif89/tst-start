import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useMemo,
  useRef,
  use,
} from "react"
import { createPortal } from "react-dom"
import { useQueryClient } from "@tanstack/react-query"

import {
  useEngineMetrics,
  useEngineConfig,
  useEngineKeystroke,
  useEngineActions,
} from "@/home/context/engine.context"
import { submitSession } from "@/server/user"
import { TopLoader } from "@/components/top-loader"
import { calculateRawWpm, calculateConsistency } from "@/home/engine/engine-logic"
import {
  Keystroke,
  TextCategory,
  TextLanguage,
  TextMode,
} from "@/home/context/engine.types"

export type ResultData = {
  text: string
  mode: TextMode
  category: TextCategory
  language: TextLanguage
  keystrokes: Keystroke[]

  wpm: number
  rawWpm: number
  accuracy: number
  charCount: number
  errorCount: number
  durationMs: number
  consistency: number

  isFirst: boolean
  isBest: boolean
  isInvalid: boolean
}

type ResultContextType = {
  resultData: ResultData
  loadingProgress: number
  isScreenshotting: boolean

  setLoadingProgress: (value: number) => void
  setIsScreenshotting: (value: boolean) => void
}

/* -------------------- VALIDATION -------------------- */

const MIN_WPM = 10
const MIN_ACCURACY = 20
const MIN_KEYSTROKES = 5
const MIN_DURATION_MS = 2000

function isSessionInvalid(
  wpm: number,
  accuracy: number,
  durationMs: number,
  keystrokeCount: number,
): boolean {
  return (
    wpm < MIN_WPM ||
    accuracy < MIN_ACCURACY ||
    durationMs < MIN_DURATION_MS ||
    keystrokeCount < MIN_KEYSTROKES
  )
}

/* -------------------- CONTEXT -------------------- */

const ResultContext = createContext<ResultContextType | undefined>(undefined)

export const ResultProvider = ({ children }: { children: ReactNode }) => {
  const { wpm, accuracy } = useEngineMetrics()
  const { textData, mode } = useEngineConfig()
  const { getTimeElapsed } = useEngineActions()
  const { keystrokes: keystrokesRef } = useEngineKeystroke()

  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isScreenshotting, setIsScreenshotting] = useState(false)
  const [sessionMeta, setSessionMeta] = useState({ isFirst: false, isBest: false })

  const resultData = useMemo<ResultData>(() => {
    const ks = keystrokesRef.current ?? []
    const durationMs = getTimeElapsed()
    const text = textData?.text ?? ""
    const language = textData?.language ?? "en"
    const category = textData?.category ?? "general"

    const totalTyped = ks.filter((k) => k.typedChar !== "Backspace").length
    const correctKeys = ks.filter((k) => k.isCorrect).length
    const errorCount = totalTyped - correctKeys

    const rawWpm = calculateRawWpm(ks.length, durationMs)
    const consistency = calculateConsistency(ks, durationMs)
    const isInvalid = isSessionInvalid(wpm, accuracy, durationMs, ks.length)

    return {
      wpm,
      accuracy,
      charCount: totalTyped,
      errorCount,
      durationMs,
      rawWpm,
      consistency,
      mode,
      category,
      isInvalid,
      keystrokes: ks,
      text,
      language,
      isFirst: sessionMeta.isFirst,
      isBest: sessionMeta.isBest,
    }
  }, [wpm, accuracy, textData, mode, keystrokesRef, getTimeElapsed, sessionMeta])

  const queryClient = useQueryClient()
  const hasSubmittedRef = useRef(false)
  // Update anon_user with session data
  useEffect(() => {
    if (hasSubmittedRef.current) return
    hasSubmittedRef.current = true

    submitSession({ data: { wpm, accuracy, isInvalid: resultData.isInvalid } })
      .then((result) => {
        setSessionMeta(result)
        // Invalidate the query so the header PB updates immediately
        queryClient.invalidateQueries({ queryKey: ["anon-user"] })
      })
      .catch(console.error)
  }, [queryClient, resultData.isInvalid, wpm, accuracy])

  return (
    <ResultContext.Provider
      value={{
        resultData,
        loadingProgress,
        isScreenshotting,
        setLoadingProgress,
        setIsScreenshotting,
      }}>
      {children}
      {isScreenshotting && (
        <TopLoader
          progress={loadingProgress}
          className="duration-1000"
        />
      )}
      {isScreenshotting &&
        createPortal(
          <div className="animate-flash bg-foreground pointer-events-none fixed inset-0 z-1001 delay-50" />,
          document.body,
        )}
    </ResultContext.Provider>
  )
}

export const useResult = () => {
  const ctx = use(ResultContext)
  if (ctx === undefined) {
    throw new Error("useResult must be used within a ResultProvider")
  }
  return ctx
}
