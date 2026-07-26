import { API } from '../../../shared/api'
import { authFetch } from '../../../shared/auth'
import type { Notification, NotificationResponse } from '../types/notification.types'

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function toNotification(r: NotificationResponse): Notification {
  return {
    id: r.id,
    title: r.title,
    preview: r.message,
    timeAgo: timeAgo(r.createdAt),
    timestamp: r.createdAt,
    read: r.isRead,
  }
}

async function ensureOk(res: Response): Promise<never> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export const NotificationService = {
  async list(): Promise<Notification[]> {
    const res = await authFetch(API.notifications.list)
    await ensureOk(res)
    const data: NotificationResponse[] = await res.json()
    return data.map(toNotification)
  },

  async getUnreadCount(): Promise<number> {
    const res = await authFetch(API.notifications.unreadCount)
    await ensureOk(res)
    const data = await res.json()
    return data.unreadCount as number
  },

  async markRead(id: string): Promise<void> {
    const res = await authFetch(API.notifications.markRead(Number(id)), { method: 'PATCH' })
    await ensureOk(res)
  },

  async markAllRead(): Promise<void> {
    const res = await authFetch(API.notifications.markAllRead, { method: 'PATCH' })
    await ensureOk(res)
  },
}
