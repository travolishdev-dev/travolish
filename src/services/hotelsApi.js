import { get } from '../lib/api'

export async function searchHotels({
  name,
  city,
  country,
  minRating,
  maxRating,
  pageNumber = 0,
  pageSize = 12,
} = {}) {
  return get('/api/hotels/search', {
    name,
    city,
    country,
    minRating,
    maxRating,
    pageNumber,
    pageSize,
  })
}

export async function listHotels() {
  return get('/api/hotels')
}

export async function getHotel(id) {
  return get(`/api/hotels/${id}`)
}

export async function listRooms(hotelId) {
  return get('/api/rooms', hotelId ? { hotelId } : {})
}
