import { get, post, put, del } from '../lib/api'

export async function getTemplatesForHost(hostId) {
  return get(`/api/host/auto-reply/host/${hostId}`)
}

export async function createAutoReply(body) {
  return post('/api/host/auto-reply/create', body)
}

export async function updateAutoReply(templateId, body) {
  return put(`/api/host/auto-reply/${templateId}`, body)
}

export async function deleteAutoReply(templateId) {
  return del(`/api/host/auto-reply/${templateId}`)
}

export async function activateAutoReply(templateId) {
  return post(`/api/host/auto-reply/${templateId}/activate`, {})
}

export async function deactivateAutoReply(templateId) {
  return post(`/api/host/auto-reply/${templateId}/deactivate`, {})
}
