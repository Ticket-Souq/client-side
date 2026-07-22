import { useState, useCallback, useRef, useEffect } from 'react'
import { EventApi } from '../services/eventApi'
import { MOCK_CARDS } from '../data/mockEvents'
import type { EventCardResponse } from '../types/event.types'

interface UseEventSearchResult {
  results: EventCardResponse[]
  loading: boolean
  query: string
  setQuery: (q: string) => void
  clear: () => void
}

export function useEventSearch(debounceMs = 300): UseEventSearchResult {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<EventCardResponse[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const queryRef = useRef('')

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await EventApi.search({ title: q })
      if (queryRef.current === q) {
        setResults(res.content)
      }
    } catch {
      if (queryRef.current === q) {
        const filtered = MOCK_CARDS.filter((e) =>
          e.title.toLowerCase().includes(q.toLowerCase()) ||
          (e.venueName && e.venueName.toLowerCase().includes(q.toLowerCase()))
        )
        setResults(filtered)
      }
    } finally {
      if (queryRef.current === q) {
        setLoading(false)
      }
    }
  }, [])

  const setQuery = useCallback(
    (q: string) => {
      queryRef.current = q
      setQueryState(q)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSearch(q), debounceMs)
    },
    [doSearch, debounceMs]
  )

  const clear = useCallback(() => {
    queryRef.current = ''
    setQueryState('')
    setResults([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return { results, loading, query, setQuery, clear }
}
