import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialSize?: number
}

interface UsePaginationResult {
  page: number
  size: number
  setPage: (p: number) => void
  setSize: (s: number) => void
  nextPage: () => void
  prevPage: () => void
  hasNext: boolean
  hasPrev: boolean
}

export function usePagination({ initialPage = 0, initialSize = 12 }: UsePaginationOptions = {}): UsePaginationResult {
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)

  const nextPage = useCallback(() => setPage((p) => p + 1), [])
  const prevPage = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])

  return { page, size, setPage, setSize, nextPage, prevPage, hasNext: true, hasPrev: page > 0 }
}
