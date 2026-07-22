import { useState, useEffect, useCallback } from 'react'
import { NotificationService } from '../services/notificationService'
import type { Notification } from '../types/notification.types'

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markRead: (id: string) => void
  markAllRead: () => void
  refresh: () => void
}

export function useNotifications(role: 'customer' | 'admin' | 'organizer'): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await NotificationService.list(role)
      setNotifications(data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    NotificationService.markRead(id)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    NotificationService.markAllRead(role)
  }, [role])

  return { notifications, unreadCount, loading, error, markRead, markAllRead, refresh: fetchNotifications }
}
