import { get, post } from '../lib/api'

export async function getHotelAvailabilityRange(hotelId, startDate, endDate) {
  return get(`/api/inventory/availability/hotel/${hotelId}/occupancy/range`, { startDate, endDate })
}

export async function getAvailableRoomsInRange(hotelId, startDate, endDate) {
  return get(`/api/inventory/availability/hotel/${hotelId}/range`, { checkInDate: startDate, checkOutDate: endDate })
}

// Block a single room for one date. hotelId auto-creates the record when it doesn't exist yet.
export async function blockRoomDate(roomId, date, count = 1, reason = 'owner hold', hotelId = null) {
  const params = { date, count: String(count), reason }
  if (hotelId != null) params.hotelId = String(hotelId)
  return post(`/api/inventory/availability/${roomId}/block?${new URLSearchParams(params)}`)
}

// Unblock a single room for one date. hotelId auto-creates the record when it doesn't exist yet.
export async function unblockRoomDate(roomId, date, count = 1, hotelId = null) {
  const params = { date, count: String(count) }
  if (hotelId != null) params.hotelId = String(hotelId)
  return post(`/api/inventory/availability/${roomId}/unblock?${new URLSearchParams(params)}`)
}
