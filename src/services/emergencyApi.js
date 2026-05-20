import { get, post, del } from '../lib/api'

export async function getActiveSOSForHotel(hotelId = 1) {
  return get(`/api/emergency/sos/hotel/${hotelId}/active`)
}

export async function getUserSOSHistory(userId = 1) {
  const data = await get(`/api/emergency/sos/user/${userId}`)
  return Array.isArray(data) ? data : (data?.content ?? [])
}

export async function activateSOS(body) {
  return post('/api/emergency/sos/activate', body)
}

export async function getEmergencyContacts(country, city) {
  return get('/api/emergency/contacts', { country, city })
}

export async function getHostEmergencyContacts(hotelId) {
  return get(`/api/emergency/contacts/hotel/${hotelId}`)
}

export async function createHostEmergencyContact(dto) {
  return post('/api/emergency/contacts', dto)
}

export async function deleteHostEmergencyContact(contactId) {
  return del(`/api/emergency/contacts/${contactId}`)
}
