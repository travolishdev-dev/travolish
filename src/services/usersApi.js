import { get, post, put } from '../lib/api'

export async function findUserByEmail(email) {
  return get('/api/users/by-email', { email })
}

export async function createUser(body) {
  return post('/api/users', body)
}

export async function getUser(userId) {
  return get(`/api/users/${userId}`)
}

export async function updateUser(userId, body) {
  return put(`/api/users/${userId}`, body)
}
