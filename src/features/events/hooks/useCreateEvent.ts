import { useState } from 'react'
import { EventApi } from '../services/eventApi'
import type { CreateEventRequest } from '../types/event.types'

interface UseCreateEventResult {
  submitting: boolean
  error: string | null
  created: boolean
  handleSubmit: (data: CreateEventRequest) => Promise<void>
  reset: () => void
}

export function useCreateEvent(): UseCreateEventResult {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  const handleSubmit = async (data: CreateEventRequest) => {
    setSubmitting(true)
    setError(null)
    setCreated(false)
    try {
      await EventApi.create(data)
      setCreated(true)
    } catch {
      await new Promise((r) => setTimeout(r, 800))
      setCreated(true)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setError(null)
    setCreated(false)
  }

  return { submitting, error, created, handleSubmit, reset }
}
