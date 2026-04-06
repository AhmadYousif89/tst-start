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
import { TopLoader } from "@/components/top-loader"
import {
  Keystroke,
  SessionMeta,
  TextCategory,
  TextLanguage,
  TextMode,
} from "@/home/context/engine.types"
import { isSessionInvalid } from "../engine/utils"

export type ResultData = {
  text: string
  mode: TextMode
  category: TextCategory
  language: TextLanguage
  keystrokes: Keystroke[]

  wpm: number
  accuracy: number
  charCount: number
  errorCount: number
  durationMs: number

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

/* -------------------- CONTEXT -------------------- */

const ResultContext = createContext<ResultContextType | undefined>(undefined)

export const ResultProvider = ({ children }: { children: ReactNode }) => {
  const { wpm, accuracy } = useEngineMetrics()
  const { textData, mode } = useEngineConfig()
  const { getTimeElapsed, sessionMetaPromiseRef } = useEngineActions()
  const { keystrokes: keystrokesRef } = useEngineKeystroke()

  const sessionMeta: SessionMeta =
    sessionMetaPromiseRef.current ?
      use(sessionMetaPromiseRef.current)
    : { isFirst: false, isBest: false }

  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isScreenshotting, setIsScreenshotting] = useState(false)

  const resultData = useMemo<ResultData>(() => {
    const ks = keystrokesRef.current ?? []
    const durationMs = getTimeElapsed()
    const totalTyped = ks.filter((k) => k.typedChar !== "Backspace").length
    const correctKeys = ks.filter((k) => k.isCorrect).length
    const errorCount = totalTyped - correctKeys

    return {
      wpm,
      mode,
      accuracy,
      durationMs,
      errorCount,
      keystrokes: ks,
      charCount: totalTyped,
      isInvalid: isSessionInvalid({
        wpm,
        accuracy,
        durationMs,
        errorCount,
        keystrokeCount: ks.length,
      }),
      text: textData.text,
      category: textData.category,
      language: textData.language,
      isFirst: sessionMeta.isFirst,
      isBest: sessionMeta.isBest,
    }
  }, [wpm, accuracy, textData, mode, keystrokesRef, getTimeElapsed, sessionMeta])

  // Invalidate the anon-user query once so the header PB updates
  const queryClient = useQueryClient()
  const hasInvalidatedRef = useRef(false)
  useEffect(() => {
    if (hasInvalidatedRef.current || resultData.isInvalid) return
    hasInvalidatedRef.current = true
    queryClient.invalidateQueries({ queryKey: ["anon-user"] })
  }, [queryClient, resultData.isInvalid])

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
      {isScreenshotting && <TopLoader progress={loadingProgress} />}
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
