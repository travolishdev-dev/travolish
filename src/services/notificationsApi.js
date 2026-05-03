import { get, post } from '../lib/api'

export async function listNotifications(userId, { page = 0, size = 50 } = {}) {
  return get(`/api/notifications/user/${userId}`, { page, size })
}

export async function listUnreadNotifications(userId, { page = 0, size = 50 } = {}) {
  return get(`/api/notifications/user/${userId}/unread`, { page, size })
}

export async function markNotificationRead(notificationId) {
  return post(`/api/notifications/${notificationId}/read`, {})
}
