import { get } from '../lib/api'

export async function getHotelBoosts(hotelId = 1) {
  const data = await get(`/api/listings/boost/hotel/${hotelId}`)
  return Array.isArray(data) ? data : (data?.content ?? [])
}

export async function getActiveHotelBoosts(hotelId = 1) {
  return get(`/api/listings/boost/hotel/${hotelId}/active`)
}
