export type NotificationType = 'EVENT' | 'BOOKING' | 'PAYMENT' | 'SYSTEM' | string

export interface NotificationResponse {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  preview: string
  timeAgo: string
  timestamp: string
  read: boolean
}
