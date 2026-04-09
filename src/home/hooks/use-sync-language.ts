import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { TextDoc } from "@/lib/types"
import { isLanguageSynced } from "../utils"
import { getRandomText } from "@/server/data"
import { TextLanguage, EngineStatus } from "../context/engine.types"

type SyncProps = {
  id: string
  isLoaded: boolean
  status: EngineStatus
  language: TextLanguage
  currentText: TextDoc
  setTextData: (text: TextDoc) => void
  setStatus: (status: EngineStatus) => void
}

export const useSyncLanguage = ({
  id,
  language,
  isLoaded,
  status,
  currentText,
  setTextData,
  setStatus,
}: SyncProps) => {
  const getRandomTextFn = useServerFn(getRandomText)

  const query = useQuery({
    queryKey: ["random-text", language],
    queryFn: async () => {
      const text = await getRandomTextFn({
        data: { id, language },
      })
      if (text) {
        setTextData(text)
        return text
      }
      return currentText
    },
    enabled: isLoaded && !isLanguageSynced(language, currentText),
  })

  useEffect(() => {
    if (isLoaded && status === "loading") {
      const isSynced = isLanguageSynced(language, currentText)
      if (isSynced) setStatus("idle")
    }
  }, [isLoaded, language, currentText, status, setStatus])

  return query
}
