import { useCallback, useTransition } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"

import { SearchParams } from "@/server/data"

export function useUrlState() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  const updateURL = useCallback((updatedSearch: SearchParams) => {
    startTransition(() => {
      navigate({ to: "/", search: updatedSearch })
    })
  }, [])

  const getSearchParams = () => useSearch({ from: "/" })

  return { updateURL, getSearchParams, isPending }
}
