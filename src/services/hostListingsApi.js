import { del, get, post, put } from '../lib/api'

// ── Hotels ────────────────────────────────────────────────────────────────────

export async function getHostListings(hostId = 1) {
  return get('/api/hotels', { hostId })
}

export async function getHotel(id) {
  return get(`/api/hotels/${id}`)
}

export async function createHotel(body) {
  return post('/api/hotels', body)
}

export async function updateHotel(id, body) {
  return put(`/api/hotels/${id}`, body)
}

export async function deleteHotel(id) {
  return del(`/api/hotels/${id}`)
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export async function getHostRooms(hotelId) {
  return get('/api/rooms', { hotelId })
}

export async function getRoom(id) {
  return get(`/api/rooms/${id}`)
}

export async function createRoom(body) {
  return post('/api/rooms', body)
}

export async function updateRoom(id, body) {
  return put(`/api/rooms/${id}`, body)
}

export async function deleteRoom(id) {
  return del(`/api/rooms/${id}`)
}

// ── Property policies  (/api/hotels/{hotelId}/policies) ───────────────────────

export async function getPolicies(hotelId) {
  return get(`/api/hotels/${hotelId}/policies`)
}

export async function updatePolicies(hotelId, body) {
  return put(`/api/hotels/${hotelId}/policies`, body)
}

// ── Payment config  (/api/hotels/{hotelId}/payment-config) ───────────────────

export async function getPaymentConfig(hotelId) {
  return get(`/api/hotels/${hotelId}/payment-config`)
}

export async function updatePaymentConfig(hotelId, body) {
  return put(`/api/hotels/${hotelId}/payment-config`, body)
}

// ── SEO meta  (/api/hotels/{hotelId}/seo) ────────────────────────────────────

export async function getSeoMeta(hotelId) {
  return get(`/api/hotels/${hotelId}/seo`)
}

export async function regenerateSeo(hotelId) {
  return post(`/api/hotels/${hotelId}/seo/regenerate`)
}

// ── Nearby attractions  (/api/hotels/{hotelId}/nearby) ───────────────────────

export async function getNearbyAttractions(hotelId) {
  return get(`/api/hotels/${hotelId}/nearby`)
}

export async function addNearbyAttraction(hotelId, body) {
  return post(`/api/hotels/${hotelId}/nearby`, body)
}

export async function deleteNearbyAttraction(hotelId, attractionId) {
  return del(`/api/hotels/${hotelId}/nearby/${attractionId}`)
}
