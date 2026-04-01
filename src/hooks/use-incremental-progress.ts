import { useState, useEffect } from "react"

export function useIncrementalProgress(isPending: boolean, delay: number = 500) {
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (isPending) {
      setProgress(1)
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) return oldProgress
          setMsg("Almost there...")
          const diff = Math.random() * 5
          return Math.min(oldProgress + diff, 90)
        })
      }, 100)

      return () => clearInterval(timer)
    } else {
      if (progress > 0) {
        setProgress(100)
        setMsg("Done")
        const timer = setTimeout(() => setProgress(0), delay)
        return () => clearTimeout(timer)
      }
    }
  }, [isPending])

  return { progress, msg }
}
