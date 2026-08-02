import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseFetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  errorMessage: string | ((error: unknown) => string) = 'Failed to load',
  deps: unknown[] = [],
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  const errorRef = useRef(errorMessage)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  useEffect(() => {
    errorRef.current = errorMessage
  }, [errorMessage])

  const refresh = useCallback(
    async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetcherRef.current()
        if (mountedRef.current) setData(result)
      } catch (err) {
        if (mountedRef.current) {
          const msg = errorRef.current
          setError(typeof msg === 'function' ? msg(err) : msg)
        }
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    deps,
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}
