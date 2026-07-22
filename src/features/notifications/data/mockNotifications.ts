import type { Notification } from '../types/notification.types'

export const CUSTOMER_NOTIFICATIONS: Notification[] = [
  { id: 'c-1', title: 'Ticket purchase confirmed', preview: 'Your order for Nile Nights Festival has been confirmed.', timeAgo: '2 min ago', timestamp: '2026-07-23T17:58:00Z', read: false },
  { id: 'c-2', title: 'Reservation expiring soon', preview: 'Your seats A12, A13 for Rooftop Jazz will expire in 15 minutes.', timeAgo: '15 min ago', timestamp: '2026-07-23T17:45:00Z', read: false },
  { id: 'c-3', title: 'Payment received', preview: 'EGP 3,000 payment for VIP tickets was successful.', timeAgo: '1 hour ago', timestamp: '2026-07-23T16:00:00Z', read: false },
  { id: 'c-4', title: 'Event cancelled', preview: 'The Comedy Night event scheduled for Jul 23 has been cancelled.', timeAgo: '3 hours ago', timestamp: '2026-07-23T14:00:00Z', read: true },
  { id: 'c-5', title: 'Refund processed', preview: 'Your refund of EGP 450 for cancelled event has been issued.', timeAgo: '1 day ago', timestamp: '2026-07-22T17:00:00Z', read: true },
  { id: 'c-6', title: 'Account update', preview: 'Your profile information was successfully updated.', timeAgo: '2 days ago', timestamp: '2026-07-21T12:00:00Z', read: true },
  { id: 'c-7', title: 'New feature', preview: 'Seat selection is now available for all venues.', timeAgo: '5 days ago', timestamp: '2026-07-18T09:00:00Z', read: true },
  { id: 'c-8', title: 'Welcome', preview: 'Welcome to Ticket Souq! Start exploring events.', timeAgo: '2 weeks ago', timestamp: '2026-07-09T08:00:00Z', read: true },
]

export const ADMIN_NOTIFICATIONS: Notification[] = [
  { id: 'a-1', title: 'New organization request', preview: 'Cairo Jazz Collective has submitted an organizer application pending review.', timeAgo: '5 min ago', timestamp: '2026-07-23T17:55:00Z', read: false },
  { id: 'a-2', title: 'System alert', preview: 'Payment gateway latency above threshold — current response time 2.4s.', timeAgo: '15 min ago', timestamp: '2026-07-23T17:45:00Z', read: false },
  { id: 'a-3', title: 'Reported content', preview: 'Comedy Night event has been reported for inappropriate content by 3 users.', timeAgo: '1 hour ago', timestamp: '2026-07-23T16:00:00Z', read: false },
  { id: 'a-4', title: 'Dispute filed', preview: 'A refund dispute has been escalated from Delta Music Festival — EGP 3,000.', timeAgo: '3 hours ago', timestamp: '2026-07-23T14:00:00Z', read: true },
  { id: 'a-5', title: 'Performance warning', preview: 'Nile Nights Festival page load time is 4.8s — exceeds 3s threshold.', timeAgo: '1 day ago', timestamp: '2026-07-22T10:00:00Z', read: true },
  { id: 'a-6', title: 'Organizer verified', preview: 'Delta Music Festival has been verified as a legitimate organizer.', timeAgo: '2 days ago', timestamp: '2026-07-21T15:00:00Z', read: true },
  { id: 'a-7', title: 'Maintenance scheduled', preview: 'Platform maintenance is scheduled for 26 Jul 02:00-04:00 AM.', timeAgo: '3 days ago', timestamp: '2026-07-20T08:00:00Z', read: true },
  { id: 'a-8', title: 'Welcome', preview: 'Welcome to the Ticket Souq admin panel.', timeAgo: '2 weeks ago', timestamp: '2026-07-09T08:00:00Z', read: true },
]

export const ORGANIZER_NOTIFICATIONS: Notification[] = [
  { id: 'o-1', title: 'New ticket sale', preview: '12 VIP tickets sold for Nile Nights Festival — EGP 18,000 in revenue.', timeAgo: '5 min ago', timestamp: '2026-07-23T17:55:00Z', read: false },
  { id: 'o-2', title: 'Event approved', preview: 'Rooftop Jazz has been approved and is now live on the platform.', timeAgo: '1 hour ago', timestamp: '2026-07-23T16:00:00Z', read: false },
  { id: 'o-3', title: 'Venue booking confirmed', preview: 'Cairo Festival Grounds confirmed for Nile Nights Festival on 25 Jul.', timeAgo: '3 hours ago', timestamp: '2026-07-23T14:00:00Z', read: false },
  { id: 'o-4', title: 'Payout processed', preview: 'EGP 42,500 has been transferred to your account for July ticket sales.', timeAgo: '1 day ago', timestamp: '2026-07-22T10:00:00Z', read: true },
  { id: 'o-5', title: 'Refund approved', preview: 'EGP 450 refund approved for Comedy Night cancellation — deducted from your next payout.', timeAgo: '2 days ago', timestamp: '2026-07-21T16:00:00Z', read: true },
  { id: 'o-6', title: 'New review', preview: 'Rooftop Jazz received a 4.8 star review from attendee Mona A.', timeAgo: '3 days ago', timestamp: '2026-07-20T12:00:00Z', read: true },
  { id: 'o-7', title: 'Staff account created', preview: 'Agent account for Karim Naguib has been created successfully.', timeAgo: '4 days ago', timestamp: '2026-07-19T09:00:00Z', read: true },
  { id: 'o-8', title: 'Welcome', preview: 'Welcome to Ticket Souq! Start creating events.', timeAgo: '1 month ago', timestamp: '2026-06-23T08:00:00Z', read: true },
]

export const NOTIFICATION_MAP: Record<string, Notification[]> = {
  customer: CUSTOMER_NOTIFICATIONS,
  admin: ADMIN_NOTIFICATIONS,
  organizer: ORGANIZER_NOTIFICATIONS,
}
