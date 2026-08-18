import { API } from '../../../shared/api'
import { request } from '../../../shared/http'
import { timeAgo } from '../../../shared/format'
import type { Notification, NotificationResponse } from '../types/notification.types'

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

export const NotificationService = {
  async list(): Promise<Notification[]> {
    const data = await request<NotificationResponse[]>(API.notifications.list)
    return data.map(toNotification)
  },

  async getUnreadCount(): Promise<number> {
    const data = await request<{ unreadCount: number }>(API.notifications.unreadCount)
    return data.unreadCount
  },

  markRead(id: string): Promise<void> {
    return request<void>(API.notifications.markRead(Number(id)), { method: 'PATCH' })
  },

  markAllRead(): Promise<void> {
    return request<void>(API.notifications.markAllRead, { method: 'PATCH' })
  },
}
