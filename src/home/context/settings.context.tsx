import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useRef,
} from "react"
import { useServerFn } from "@tanstack/react-start"

import { getAnonUser, updateAnonUser } from "@/server/user"
import { EngineSettings } from "./settings.types"
import { getStoredSettings, updateStoredSettings } from "./settings.utils"
import { TextLanguage, TextMode, CursorStyle } from "./engine.types"
import { SoundNames } from "./sound.types"

type SettingsState = EngineSettings & {
  settingsDidUpdate: boolean
  isLoaded: boolean
}

type SettingsAction =
  | { type: "SET_MODE"; mode: TextMode }
  | { type: "SET_LANGUAGE"; language: TextLanguage }
  | { type: "SET_CURSOR_STYLE"; style: CursorStyle }
  | { type: "SET_SOUND_NAME"; name: SoundNames }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_IS_MUTED"; isMuted: boolean }
  | { type: "SYNC_SETTINGS"; settings: Partial<EngineSettings> }
  | { type: "UP_SYNC_COMPLETE" }

const initialState: SettingsState = {
  ...getStoredSettings(),
  isLoaded: false,
  settingsDidUpdate: false,
}

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  const currentStored = getStoredSettings()

  switch (action.type) {
    case "SET_MODE":
      if (state.mode === action.mode) return state
      updateStoredSettings({ ...currentStored, mode: action.mode })
      return { ...state, mode: action.mode, settingsDidUpdate: true }

    case "SET_LANGUAGE":
      if (state.language === action.language) return state
      updateStoredSettings({ ...currentStored, language: action.language })
      return { ...state, language: action.language, settingsDidUpdate: true }

    case "SET_CURSOR_STYLE":
      if (state.cursorStyle === action.style) return state
      updateStoredSettings({ ...currentStored, cursorStyle: action.style })
      return { ...state, cursorStyle: action.style, settingsDidUpdate: true }

    case "SET_SOUND_NAME":
      if (state.soundName === action.name) return state
      updateStoredSettings({ ...currentStored, soundName: action.name })
      return { ...state, soundName: action.name, settingsDidUpdate: true }

    case "SET_VOLUME":
      if (state.volume === action.volume) return state
      updateStoredSettings({ ...currentStored, volume: action.volume })
      return { ...state, volume: action.volume, settingsDidUpdate: true }

    case "SET_IS_MUTED":
      if (state.isMuted === action.isMuted) return state
      updateStoredSettings({ ...currentStored, isMuted: action.isMuted })
      return { ...state, isMuted: action.isMuted, settingsDidUpdate: true }

    case "SYNC_SETTINGS":
      updateStoredSettings({ ...currentStored, ...action.settings })
      return { ...state, ...action.settings, isLoaded: true }

    case "UP_SYNC_COMPLETE":
      return { ...state, settingsDidUpdate: false }

    default:
      return state
  }
}

type SettingsContextType = {
  state: SettingsState
  dispatch: React.Dispatch<SettingsAction>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState)
  const initialMountRef = useRef(true)

  const getUserFn = useServerFn(getAnonUser)
  const updateUserFn = useServerFn(updateAnonUser)

  useEffect(() => {
    async function sync() {
      const user = await getUserFn()
      dispatch({ type: "SYNC_SETTINGS", settings: user?.settings || {} })
    }

    sync()
  }, [])

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false
      return
    }

    if (!state.settingsDidUpdate) return

    const syncToDB = async () => {
      const { settingsDidUpdate, isLoaded, ...settings } = state
      await updateUserFn({ data: settings })
      dispatch({ type: "UP_SYNC_COMPLETE" })
    }

    const timer = setTimeout(syncToDB, 1000)
    return () => clearTimeout(timer)
  }, [
    state.mode,
    state.language,
    state.cursorStyle,
    state.soundName,
    state.volume,
    state.isMuted,
    state.settingsDidUpdate,
  ])

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useTextSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useTextSettings must be used within SettingsProvider")

  const { state, dispatch } = context

  const setMode = useCallback(
    (mode: TextMode) => dispatch({ type: "SET_MODE", mode }),
    [dispatch],
  )

  const setLanguage = useCallback(
    (language: TextLanguage) => dispatch({ type: "SET_LANGUAGE", language }),
    [dispatch],
  )

  const setCursorStyle = useCallback(
    (style: CursorStyle) => dispatch({ type: "SET_CURSOR_STYLE", style }),
    [dispatch],
  )

  return useMemo(
    () => ({
      mode: state.mode,
      language: state.language,
      cursorStyle: state.cursorStyle,
      isLoaded: state.isLoaded,
      setMode,
      setLanguage,
      setCursorStyle,
    }),
    [
      state.mode,
      state.language,
      state.cursorStyle,
      state.isLoaded,
      setMode,
      setLanguage,
      setCursorStyle,
    ],
  )
}

export const useSoundSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useSoundSettings must be used within SettingsProvider")

  const { state, dispatch } = context

  const setSoundName = useCallback(
    (name: SoundNames) => dispatch({ type: "SET_SOUND_NAME", name }),
    [dispatch],
  )

  const setVolume = useCallback(
    (volume: number) => dispatch({ type: "SET_VOLUME", volume }),
    [dispatch],
  )

  const setIsMuted = useCallback(
    (isMuted: boolean) => dispatch({ type: "SET_IS_MUTED", isMuted }),
    [dispatch],
  )

  return useMemo(
    () => ({
      soundName: state.soundName,
      volume: state.volume,
      isMuted: state.isMuted,
      isLoaded: state.isLoaded,
      setSoundName,
      setVolume,
      setIsMuted,
    }),
    [
      state.soundName,
      state.volume,
      state.isMuted,
      state.isLoaded,
      setSoundName,
      setVolume,
      setIsMuted,
    ],
  )
}
