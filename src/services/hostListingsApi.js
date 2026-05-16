import { get } from '../lib/api'

export async function getHostListings(hostId = 1) {
  return get('/api/hotels', { hostId })
}

export async function getHostRooms(hotelId) {
  return get('/api/rooms', { hotelId })
}
