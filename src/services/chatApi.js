import { get, post } from '../lib/api'

export async function listConversations(userId) {
  return get('/api/chat/conversations', { userId })
}

export async function getConversation(id) {
  return get(`/api/chat/conversations/${id}`)
}

export async function getMessages(conversationId, { page = 0, pageSize = 50 } = {}) {
  return get(`/api/chat/messages/${conversationId}`, { page, pageSize })
}

export async function sendMessage({ conversationId, receiverId, messageText }) {
  return post('/api/chat/messages', { conversationId, receiverId, messageText })
}

export async function getOrCreateConversation(userId1, userId2) {
  return post(`/api/chat/conversations?userId1=${userId1}&userId2=${userId2}`, {})
}
