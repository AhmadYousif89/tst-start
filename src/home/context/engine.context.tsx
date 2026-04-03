import React, {
  createContext,
  useCallback,
  useReducer,
  useMemo,
  useRef,
  useContext,
} from "react"

import { TextDoc } from "@/lib/types"
import { submitSession } from "@/server/user"
import {
  Keystroke,
  SessionMeta,
  EngineStatus,
  EngineConfigCtxType,
  EngineMetricsCtxType,
  EngineActionsCtxType,
  EngineKeystrokeCtxType,
  ResetOptions,
} from "./engine.types"
import { useTextSettings } from "./settings.context"
import { engineReducer, initialState } from "./engine.reducer"
import { isSessionInvalid } from "../engine/utils"
import { calculateWpm, calculateAccuracy, getInitialTime } from "../engine/logic"
import { useShortcutKeys } from "@/home/hooks/use-shortcut-keys"

import { useSyncLanguage } from "../hooks/use-sync-language"
import { useMetricsTick } from "../hooks/use-metrics-tick"
import { useEngineExperience } from "../hooks/use-engine-experience"
import { useMouseShake } from "../hooks/use-mouse-shake"
import { useHotkey } from "@tanstack/react-hotkeys"

const EngineConfigCtx = createContext<EngineConfigCtxType | undefined>(undefined)

const EngineMetricsCtx = createContext<EngineMetricsCtxType | undefined>(undefined)

const EngineKeystrokeCtx = createContext<EngineKeystrokeCtxType | undefined>(undefined)

const EngineActionsCtx = createContext<EngineActionsCtxType | undefined>(undefined)

type ProviderProps = {
  children: React.ReactNode
  data: TextDoc
}

export const EngineProvider = ({ children, data }: ProviderProps) => {
  const { mode, language, isLoaded } = useTextSettings()

  const [state, dispatch] = useReducer(engineReducer, {
    ...initialState,
    textData: data,
    timeLeft: getInitialTime(mode),
  })

  /* -------------------- REFS & HOOKS -------------------- */

  const lockedCursorRef = useRef(0)
  const accumulatedTimeRef = useRef(0)
  const keystrokes = useRef<Keystroke[]>([])
  const timerRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)
  const sessionMetaPromiseRef = useRef<Promise<SessionMeta> | null>(null)

  const isImmersive = state.status === "typing"

  useEngineExperience({
    dispatch,
    status: state.status,
    isFocused: state.isFocused,
  })

  useMouseShake({
    enabled: isImmersive,
    onShake: () => dispatch({ type: "PAUSE", timestamp: Date.now() }),
  })

  useHotkey(
    "Mod+R",
    () => {
      if (state.status === "idle") return
      resetSession()
    },
    { requireReset: true },
  )

  useShortcutKeys({
    status: state.status,
    isFocused: state.isFocused,
    setFocused: (v) => dispatch({ type: "SET_FOCUSED", isFocused: v }),
  })

  useSyncLanguage({
    id: state.textData._id.toString(),
    isLoaded,
    language,
    status: state.status,
    currentText: state.textData,
    setStatus: (s) => dispatch({ type: "SET_STATUS", status: s }),
    setTextData: (newData) => dispatch({ type: "SET_TEXT", textData: newData }),
  })

  /* -------------------- ACTIONS -------------------- */

  const getTimeElapsed = useCallback(() => {
    const currentElapsed = timerRef.current ? Date.now() - timerRef.current : 0
    return accumulatedTimeRef.current + currentElapsed
  }, [])

  const resetSession = useCallback(
    (opts?: ResetOptions) => {
      const modeToUse = opts?.newMode || mode
      dispatch({
        type: "RESET",
        timeLeft: getInitialTime(modeToUse),
        ...(opts?.status && { status: opts.status }),
        shouldFocus: opts?.shouldFocus,
      })
      keystrokes.current = []
      timerRef.current = null
      sessionStartTimeRef.current = null
      accumulatedTimeRef.current = 0
      lockedCursorRef.current = 0
      sessionMetaPromiseRef.current = null
    },
    [mode],
  )

  const startSession = useCallback(() => {
    dispatch({ type: "START", timestamp: Date.now() })
    const now = Date.now()
    timerRef.current = now
    sessionStartTimeRef.current = now
    accumulatedTimeRef.current = 0
  }, [])

  const pauseSession = useCallback(() => {
    if (state.status !== "typing") return
    dispatch({ type: "PAUSE", timestamp: Date.now() })
    if (timerRef.current) {
      accumulatedTimeRef.current += Date.now() - timerRef.current
      timerRef.current = null
    }
  }, [state.status])

  const resumeSession = useCallback(() => {
    if (state.status !== "paused") return
    dispatch({ type: "RESUME", timestamp: Date.now() })
    timerRef.current = Date.now()
  }, [state.status])

  const endSession = useCallback(() => {
    if (state.status !== "typing" && state.status !== "paused") return

    const elapsed = getTimeElapsed()
    timerRef.current = null
    accumulatedTimeRef.current = elapsed

    const ks = keystrokes.current
    const totalTyped = ks.filter((k) => k.typedChar !== "Backspace").length
    const correctKeys = ks.filter((k) => k.isCorrect).length

    const finalWpm = calculateWpm(correctKeys, elapsed)
    const finalAccuracy = calculateAccuracy(correctKeys, totalTyped)

    const isInvalid = isSessionInvalid(finalWpm, finalAccuracy, elapsed, ks.length)

    sessionMetaPromiseRef.current =
      isInvalid ?
        Promise.resolve({ isFirst: false, isBest: false })
      : submitSession({
          data: { wpm: finalWpm, accuracy: finalAccuracy, isInvalid: false },
        }).catch(() => ({ isFirst: false, isBest: false }))

    dispatch({
      type: "END",
      timestamp: Date.now(),
      wpm: finalWpm,
      accuracy: finalAccuracy,
    })
  }, [getTimeElapsed, state.status])

  const setTextData = useCallback(
    (newData: TextDoc, shouldFocus: boolean = true) => {
      dispatch({ type: "SET_TEXT", textData: newData })
      resetSession({ status: "idle", shouldFocus })
    },
    [resetSession],
  )

  const setCursor = useCallback(
    (cursor: number | ((prev: number) => number), extraOffset?: number) => {
      dispatch({
        type: "SET_CURSOR",
        cursor,
        extraOffset,
        charCount: data.charCount,
      })
    },
    [data.charCount],
  )

  const setStatus = useCallback((status: EngineStatus) => {
    dispatch({ type: "SET_STATUS", status })
  }, [])

  const setFocused = useCallback((isFocused: boolean) => {
    dispatch({ type: "SET_FOCUSED", isFocused })
  }, [])

  const updateLayout = useCallback(
    (opts?: { shouldReset?: boolean; newStartIndex?: number }) => {
      dispatch({ type: "UPDATE_LAYOUT", ...opts })
    },
    [],
  )

  /* -------------------- EFFECTS -------------------- */

  useMetricsTick({
    mode,
    status: state.status,
    keystrokesRef: keystrokes,
    dispatch,
    endSession,
    getTimeElapsed,
  })

  /* -------------------- PROVIDER VALUES -------------------- */

  const configValue = useMemo(
    () => ({
      mode,
      language,
      isLoaded,
      isImmersive,
      status: state.status,
      layout: state.layout,
      textData: state.textData,
      isFocused: state.isFocused,
      showOverlay: state.showOverlay,
    }),
    [
      mode,
      language,
      isLoaded,
      isImmersive,
      state.status,
      state.layout,
      state.textData,
      state.isFocused,
      state.showOverlay,
    ],
  )

  const metricsValue = useMemo(
    () => ({
      wpm: state.wpm,
      accuracy: state.accuracy,
      timeLeft: state.timeLeft,
      progress: state.progress,
    }),
    [state.wpm, state.accuracy, state.timeLeft, state.progress],
  )

  const keystrokeValue = useMemo(
    () => ({
      keystrokes,
      lockedCursorRef,
      cursor: state.cursor,
      extraOffset: state.extraOffset,
    }),
    [state.cursor, state.extraOffset],
  )

  const actionsValue = useMemo(
    () => ({
      endSession,
      resetSession,
      startSession,
      pauseSession,
      resumeSession,
      getTimeElapsed,
      setStatus,
      sessionMetaPromiseRef,
      setTextData,
      setFocused,
      updateLayout,
      setCursor,
    }),
    [
      endSession,
      resetSession,
      startSession,
      pauseSession,
      resumeSession,
      getTimeElapsed,
      setStatus,
      setTextData,
      setFocused,
      updateLayout,
      setCursor,
    ],
  )

  return (
    <EngineConfigCtx.Provider value={configValue}>
      <EngineMetricsCtx.Provider value={metricsValue}>
        <EngineKeystrokeCtx.Provider value={keystrokeValue}>
          <EngineActionsCtx.Provider value={actionsValue}>
            {children}
          </EngineActionsCtx.Provider>
        </EngineKeystrokeCtx.Provider>
      </EngineMetricsCtx.Provider>
    </EngineConfigCtx.Provider>
  )
}

export const useEngineConfig = () => {
  const context = useContext(EngineConfigCtx)
  if (!context) throw new Error("useEngineConfig must be used within EngineProvider")
  return context
}

export const useEngineMetrics = () => {
  const context = useContext(EngineMetricsCtx)
  if (!context) throw new Error("useEngineMetrics must be used within EngineProvider")
  return context
}

export const useEngineKeystroke = () => {
  const context = useContext(EngineKeystrokeCtx)
  if (!context) throw new Error("useEngineKeystroke must be used within EngineProvider")
  return context
}

export const useEngineActions = () => {
  const context = useContext(EngineActionsCtx)
  if (!context) throw new Error("useEngineActions must be used within EngineProvider")
  return context
}
