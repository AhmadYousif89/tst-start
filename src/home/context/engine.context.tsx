import React, {
  createContext,
  useCallback,
  useReducer,
  useEffect,
  useMemo,
  useRef,
  useContext,
} from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { useServerFn } from "@tanstack/react-start"
import { useQuery } from "@tanstack/react-query"

import { TextDoc } from "@/lib/types"
import {
  TextMode,
  Keystroke,
  CursorStyle,
  TextLanguage,
  EngineStatus,
  EngineConfigCtxType,
  EngineMetricsCtxType,
  EngineActionsCtxType,
  EngineKeystrokeCtxType,
  ResetOptions,
} from "./engine.types"
import { engineReducer, initialState } from "./engine.reducer"
import { calculateWpm, calculateAccuracy, getInitialTime } from "../engine/logic"
import { useTextSettings } from "./settings.context"
import { getRandomText } from "@/server/data"

const EngineConfigCtx = createContext<EngineConfigCtxType | undefined>(undefined)

const EngineMetricsCtx = createContext<EngineMetricsCtxType | undefined>(undefined)

const EngineKeystrokeCtx = createContext<EngineKeystrokeCtxType | undefined>(undefined)

const EngineActionsCtx = createContext<EngineActionsCtxType | undefined>(undefined)

type ProviderProps = {
  children: React.ReactNode
  data: TextDoc
}

export const EngineProvider = ({ children, data }: ProviderProps) => {
  const {
    mode,
    language,
    cursorStyle,
    isLoaded,
    setMode: setGlobalMode,
    setLanguage: setGlobalLanguage,
    setCursorStyle: setGlobalCursorStyle,
  } = useTextSettings()

  const [state, dispatch] = useReducer(engineReducer, {
    ...initialState,
    textData: data,
    timeLeft: getInitialTime(mode),
  })

  const lockedCursorRef = useRef(0)
  const accumulatedTimeRef = useRef(0)
  const statusRef = useRef(state.status)
  const hasUpdatedStatsRef = useRef(false)
  const keystrokes = useRef<Keystroke[]>([])
  const timerRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  useHotkey(
    "Mod+R",
    () => {
      if (state.status === "idle") return
      resetSession()
    },
    { requireReset: true },
  )

  const getRandomTextFn = useServerFn(getRandomText)

  const id = state.textData._id.toString()

  // Fetch new text when language changes
  useQuery({
    queryKey: ["random-text", language],
    queryFn: async () => {
      const text = await getRandomTextFn({
        data: { id, language },
      })
      if (text) {
        setTextData(text)
        return text
      }
      return data
    },
    enabled: isLoaded && language !== state.textData.language,
  })

  const isImmersive = state.status === "typing"

  // Hide mouse cursor during immersion mode
  useEffect(() => {
    document.documentElement.classList.toggle("cursor-none", isImmersive)
    return () => {
      document.documentElement.classList.remove("cursor-none")
    }
  }, [isImmersive])

  // Guard against race conditions and stale state
  useEffect(() => {
    statusRef.current = state.status
  }, [state.status])

  // Set initial status to idle once text is loaded and language is synced
  useEffect(() => {
    if (isLoaded && state.status === "loading") {
      const isSynced = language === state.textData.language
      if (isSynced) {
        dispatch({ type: "SET_STATUS", status: "idle" })
      }
    }
  }, [isLoaded, language, state.textData.language, state.status])

  // Pause session after a short delay when focus is lost during typing
  useEffect(() => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)

    if (!state.isFocused && state.status === "typing") {
      overlayTimerRef.current = setTimeout(() => {
        if (statusRef.current === "typing")
          dispatch({ type: "PAUSE", timestamp: Date.now() })
      }, 500)
    }

    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    }
  }, [state.isFocused, state.status])

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
    },
    [mode],
  )

  const startSession = useCallback(() => {
    dispatch({ type: "START", timestamp: Date.now() })
    const now = Date.now()
    timerRef.current = now
    sessionStartTimeRef.current = now
    accumulatedTimeRef.current = 0
    hasUpdatedStatsRef.current = false
  }, [])

  const pauseSession = useCallback(() => {
    if (statusRef.current !== "typing") return
    dispatch({ type: "PAUSE", timestamp: Date.now() })
    if (timerRef.current) {
      accumulatedTimeRef.current += Date.now() - timerRef.current
      timerRef.current = null
    }
  }, [])

  const resumeSession = useCallback(() => {
    if (statusRef.current !== "paused") return
    dispatch({ type: "RESUME", timestamp: Date.now() })
    timerRef.current = Date.now()
  }, [])

  const endSession = useCallback(() => {
    if (statusRef.current !== "typing" && statusRef.current !== "paused") return

    const elapsed = getTimeElapsed()
    timerRef.current = null
    accumulatedTimeRef.current = elapsed

    const ks = keystrokes.current
    const totalTyped = ks.filter((k) => k.typedChar !== "Backspace").length
    const correctKeys = ks.filter((k) => k.isCorrect).length

    const finalWpm = calculateWpm(correctKeys, elapsed)
    const finalAccuracy = calculateAccuracy(correctKeys, totalTyped)

    dispatch({
      type: "END",
      timestamp: Date.now(),
      wpm: finalWpm,
      accuracy: finalAccuracy,
    })
  }, [getTimeElapsed])

  const setTextData = useCallback(
    (newData: TextDoc, shouldFocus: boolean = true) => {
      dispatch({ type: "SET_TEXT", textData: newData })
      resetSession({ status: "idle", shouldFocus })
    },
    [resetSession],
  )

  const setTextLanguage = useCallback(
    async (newLanguage: TextLanguage, shouldFocus: boolean = true) => {
      if (newLanguage === language) {
        const newTextData = await getRandomTextFn({
          data: { id, language: newLanguage },
        })
        if (newTextData) setTextData(newTextData, shouldFocus)
        return
      }
      setGlobalLanguage(newLanguage)
    },
    [language, id, getRandomTextFn, setTextData, setGlobalLanguage],
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

  const setCursorStyle = useCallback(
    (style: CursorStyle) => setGlobalCursorStyle(style),
    [setGlobalCursorStyle],
  )

  const setTextMode = useCallback(
    (newMode: TextMode, shouldFocus: boolean = true) => {
      setGlobalMode(newMode)
      resetSession({ newMode, status: "idle", shouldFocus })
    },
    [setGlobalMode, resetSession],
  )

  const setShowSettings = useCallback(
    (showSettings: boolean | ((prev: boolean) => boolean)) => {
      dispatch({ type: "SET_SHOW_SETTINGS", showSettings })
    },
    [],
  )

  /* -------------------- EFFECTS -------------------- */

  // Update metrics every second
  const intervalRef = useRef<NodeJS.Timeout>(undefined)
  useEffect(() => {
    if (intervalRef.current || state.status !== "typing") return

    intervalRef.current = setInterval(() => {
      const elapsed = getTimeElapsed()
      const ks = keystrokes.current
      const correctKeys = ks.filter((k) => k.isCorrect).length
      const totalTyped = ks.filter((k) => k.typedChar !== "Backspace").length

      const isTimed = mode !== "passage"
      const limit = getInitialTime(mode) * 1000

      if (isTimed && elapsed >= limit) {
        endSession()
        return
      }

      dispatch({
        type: "TICK",
        isTimed,
        wpm: calculateWpm(correctKeys, elapsed),
        accuracy: calculateAccuracy(correctKeys, totalTyped),
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [state.status, mode, getTimeElapsed, endSession])

  /* -------------------- PROVIDER VALUES -------------------- */

  const configValue = useMemo(
    () => ({
      mode,
      status: state.status,
      layout: state.layout,
      textData: state.textData,
      language,
      isFocused: state.isFocused,
      cursorStyle,
      showSettings: state.showSettings,
      showOverlay: state.showOverlay,
      isLoaded,
      isImmersive,
    }),
    [
      mode,
      state.status,
      state.layout,
      state.textData,
      language,
      state.isFocused,
      cursorStyle,
      state.showSettings,
      state.showOverlay,
      isLoaded,
      isImmersive,
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
      cursor: state.cursor,
      extraOffset: state.extraOffset,
      keystrokes,
      lockedCursorRef,
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
      setTextMode,
      setTextLanguage,
      setTextData,
      setFocused,
      updateLayout,
      setCursor,
      setCursorStyle,
      setShowSettings,
    }),
    [
      endSession,
      resetSession,
      startSession,
      pauseSession,
      resumeSession,
      getTimeElapsed,
      setStatus,
      setTextMode,
      setTextLanguage,
      setTextData,
      setFocused,
      updateLayout,
      setCursor,
      setCursorStyle,
      setShowSettings,
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
