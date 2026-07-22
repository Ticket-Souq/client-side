const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API = {
  base: BASE_URL,
  auth: {
    register: `${BASE_URL}/api/v1/auth/register`,
    login: `${BASE_URL}/api/v1/auth/login`,
    logout: `${BASE_URL}/api/v1/auth/logout`,
    logoutAll: `${BASE_URL}/api/v1/auth/logout-all`,
    verifyEmail: `${BASE_URL}/api/v1/auth/email-varification`,
    forgotPassword: `${BASE_URL}/api/v1/auth/password-forgot`,
    changePassword: `${BASE_URL}/api/v1/auth/password`,
    deactivate: `${BASE_URL}/api/v1/auth`,
  },
  events: {
    search: `${BASE_URL}/api/v1/events/search`,
    list: `${BASE_URL}/api/v1/events`,
    byId: (id: string) => `${BASE_URL}/api/v1/events/${id}`,
    create: `${BASE_URL}/api/v1/events`,
    cancel: (id: string) => `${BASE_URL}/api/v1/events/${id}`,
  },
  notifications: {
    list: `${BASE_URL}/api/v1/notification`,
    unreadCount: `${BASE_URL}/api/v1/notification/unread-count`,
    markRead: (id: number) => `${BASE_URL}/api/v1/notification/${id}/read`,
    markAllRead: `${BASE_URL}/api/v1/notification/read-all`,
  },
  reservations: {
    list: `${BASE_URL}/api/v1/reservations`,
  },
  tickets: {
    list: `${BASE_URL}/api/v1/tickets`,
    byId: (id: string) => `${BASE_URL}/api/v1/tickets/${id}`,
    byReservation: (reservationId: string) => `${BASE_URL}/api/v1/tickets?reservationId=${reservationId}`,
  },
};
