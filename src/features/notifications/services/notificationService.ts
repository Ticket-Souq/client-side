import { API } from '../../../shared/api'
import { authFetch } from '../../../shared/auth'
import { NOTIFICATION_MAP } from '../data/mockNotifications'
import type { Notification } from '../types/notification.types'

export const NotificationService = {
  async list(role: 'customer' | 'admin' | 'organizer'): Promise<Notification[]> {
    try {
      const res = await authFetch(API.notifications.list)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (err) {
      console.warn('Notifications API unavailable, using mock data:', err)
      return NOTIFICATION_MAP[role] ?? []
    }
  },

  async getUnreadCount(role: 'customer' | 'admin' | 'organizer'): Promise<number> {
    try {
      const res = await authFetch(API.notifications.unreadCount)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (err) {
      console.warn('Unread count API unavailable, using mock:', err)
      const all = NOTIFICATION_MAP[role] ?? []
      return all.filter((n) => !n.read).length
    }
  },

  async markRead(id: string): Promise<void> {
    try {
      const res = await authFetch(API.notifications.markRead(Number(id)), { method: 'PUT' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.warn('Mark-read API unavailable, falling back to local state:', err)
    }
  },

  async markAllRead(role: 'customer' | 'admin' | 'organizer'): Promise<void> {
    try {
      const res = await authFetch(API.notifications.markAllRead, { method: 'PUT' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.warn('Mark-all-read API unavailable, falling back to local state:', err)
    }
  },
}
