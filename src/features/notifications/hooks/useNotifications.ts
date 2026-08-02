import { useEffect, useCallback, useState } from 'react'
import { NotificationService } from '../services/notificationService'
import type { Notification } from '../types/notification.types'
import { useFetch } from '../../../shared/hooks/useFetch'

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markRead: (id: string) => void
  markAllRead: () => void
  refresh: () => Promise<void>
}

export function useNotifications(): UseNotificationsResult {
  const { data, loading, error, refresh } = useFetch(NotificationService.list, 'Failed to load notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (data) setNotifications(data)
  }, [data])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    NotificationService.markRead(id)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    NotificationService.markAllRead()
  }, [])

  return { notifications, unreadCount, loading, error, markRead, markAllRead, refresh }
}
