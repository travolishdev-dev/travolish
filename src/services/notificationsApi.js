import { get, post, put, del } from '../lib/api'

export async function listNotifications(userId, { page = 0, size = 50 } = {}) {
  return get(`/api/notifications/user/${userId}`, { page, size })
}

export async function listUnreadNotifications(userId, { page = 0, size = 50 } = {}) {
  return get(`/api/notifications/user/${userId}/unread`, { page, size })
}

export async function getUnreadCount(userId) {
  return get(`/api/notifications/user/${userId}/unread-count`)
}

export async function markNotificationRead(notificationId) {
  return post(`/api/notifications/${notificationId}/read`, {})
}

export async function deleteNotification(notificationId) {
  return del(`/api/notifications/${notificationId}`)
}

export async function getNotificationPreferences(userId) {
  return get(`/api/notifications/preferences/user/${userId}`)
}

export async function updateNotificationPreferences(userId, prefs) {
  return put(`/api/notifications/preferences/user/${userId}`, prefs)
}

export async function listTemplates() {
  return get('/api/notifications/templates')
}

export async function listActiveTemplates() {
  return get('/api/notifications/templates/active')
}

export async function scheduleNotification(body) {
  return post('/api/notifications/schedule', body)
}

export async function sendEmailNotification(body) {
  return post('/api/notifications/email', body)
}

export async function sendSmsNotification(body) {
  return post('/api/notifications/sms', body)
}
