import { useState } from 'react'
import { EventApi } from '../services/eventApi'
import type { CreateEventRequest } from '../types/event.types'

interface UseCreateEventResult {
  submitting: boolean
  error: string | null
  created: boolean
  handleSubmit: (data: CreateEventRequest, posterFile: File | null) => Promise<void>
  reset: () => void
}

export function useCreateEvent(): UseCreateEventResult {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  const handleSubmit = async (data: CreateEventRequest, posterFile: File | null) => {
    setSubmitting(true)
    setError(null)
    setCreated(false)
    try {
      await EventApi.create(data, posterFile)
      setCreated(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create event')
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
