import { get } from '../lib/api'

export async function getHotelAvailabilityRange(hotelId, startDate, endDate) {
  return get(`/api/inventory/availability/hotel/${hotelId}/occupancy/range`, { startDate, endDate })
}

export async function getAvailableRoomsInRange(hotelId, startDate, endDate) {
  return get(`/api/inventory/availability/hotel/${hotelId}/range`, { checkInDate: startDate, checkOutDate: endDate })
}
