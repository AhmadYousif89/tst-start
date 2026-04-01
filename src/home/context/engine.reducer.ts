import { TextDoc } from "@/lib/types"
import { EngineState, EngineAction } from "./engine.types"

export const initialState: EngineState = {
  status: "loading",
  wpm: 0,
  cursor: 0,
  timeLeft: 0,
  progress: 0,
  accuracy: 100,
  extraOffset: 0,
  isFocused: false,
  showOverlay: true,
  showSettings: false,
  layout: {
    startIndex: 0,
    version: 0,
  },
  textData: {} as TextDoc,
}

export const engineReducer = (state: EngineState, action: EngineAction): EngineState => {
  switch (action.type) {
    case "RESET": {
      const isFocused = action.shouldFocus ?? state.isFocused
      const status = action.status ?? (state.status === "loading" ? "loading" : "idle")

      return {
        ...initialState,
        status,
        isFocused,
        showOverlay: isFocused ? false : status !== "finished",
        textData: state.textData,
        showSettings: state.showSettings,
        timeLeft: action.timeLeft,
      }
    }
    case "START":
      return {
        ...state,
        status: "typing",
      }
    case "PAUSE":
      return {
        ...state,
        status: "paused",
      }
    case "RESUME":
      return {
        ...state,
        status: "typing",
      }
    case "END":
      return {
        ...state,
        status: "finished",
        wpm: action.wpm ?? state.wpm,
        accuracy: action.accuracy ?? state.accuracy,
      }
    case "TICK": {
      const nextTime =
        action.isTimed ? Math.max(0, state.timeLeft - 1) : state.timeLeft + 1
      return {
        ...state,
        timeLeft: nextTime,
        wpm: action.wpm ?? state.wpm,
        accuracy: action.accuracy ?? state.accuracy,
      }
    }
    case "SET_CURSOR": {
      const nextCursor =
        typeof action.cursor === "function" ? action.cursor(state.cursor) : action.cursor
      const progress =
        action.charCount ?
          Math.min((nextCursor / action.charCount) * 100, 100)
        : state.progress
      return {
        ...state,
        progress,
        cursor: nextCursor,
        extraOffset: action.extraOffset ?? state.extraOffset,
      }
    }
    case "SET_FOCUSED":
      if (state.isFocused === action.isFocused) return state
      return {
        ...state,
        isFocused: action.isFocused,
        showOverlay: action.isFocused ? false : state.status !== "finished",
      }
    case "SET_SHOW_OVERLAY":
      if (state.showOverlay === action.showOverlay) return state
      return {
        ...state,
        showOverlay: action.showOverlay,
      }
    case "SET_STATUS":
      if (state.status === action.status) return state
      return {
        ...state,
        status: action.status,
      }
    case "SET_METRICS":
      return {
        ...state,
        wpm: action.wpm,
        accuracy: action.accuracy,
      }
    case "SET_TEXT":
      return {
        ...state,
        textData: action.textData,
        cursor: 0,
        progress: 0,
        extraOffset: 0,
        layout: {
          startIndex: 0,
          version: 0,
        },
      }
    case "SET_SHOW_SETTINGS":
      return {
        ...state,
        showSettings:
          typeof action.showSettings === "function" ?
            action.showSettings(state.showSettings)
          : action.showSettings,
      }
    case "UPDATE_LAYOUT":
      return {
        ...state,
        layout: {
          startIndex:
            action.shouldReset ? 0 : (action.newStartIndex ?? state.layout.startIndex),
          version: action.shouldReset ? 0 : state.layout.version + 1,
        },
      }

    default:
      return state
  }
}
