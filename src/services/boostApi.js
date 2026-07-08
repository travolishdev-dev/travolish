import { get, post } from '../lib/api'

export async function getHotelBoosts(hotelId = 1) {
  // Use analytics endpoint — the /hotel/{id} paginated endpoint has a String/enum type mismatch bug
  const data = await get('/api/listings/boost/analytics', { hotelId })
  return Array.isArray(data) ? data : (data?.content ?? [])
}

export async function getActiveHotelBoosts(hotelId = 1) {
  return get(`/api/listings/boost/hotel/${hotelId}/active`)
}

export async function purchaseBoost(body) {
  return post('/api/listings/boost/purchase', body)
}

export async function cancelBoost(boostId) {
  return post(`/api/listings/boost/${boostId}/cancel`, {})
}
