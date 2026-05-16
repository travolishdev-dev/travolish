import { get, put } from '../lib/api'

export async function getUser(userId = 1) {
  return get(`/api/users/${userId}`)
}

export async function updateUser(userId = 1, body) {
  return put(`/api/users/${userId}`, body)
}
