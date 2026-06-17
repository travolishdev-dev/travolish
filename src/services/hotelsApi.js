import { get } from '../lib/api'

export async function searchHotels({
  query,
  name,
  city,
  country,
  minRating,
  maxRating,
  latMin,
  latMax,
  lngMin,
  lngMax,
  pageNumber = 0,
  pageSize = 12,
} = {}) {
  return get('/api/hotels/search', {
    query,
    name,
    city,
    country,
    minRating,
    maxRating,
    latMin,
    latMax,
    lngMin,
    lngMax,
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

export async function getHotelReviews(hotelId, { pageSize = 20 } = {}) {
  return get(`/api/reviews/hotels/${hotelId}`, { pageSize })
}

export async function getHotelAddOns(hotelId) {
  return get('/api/addons', { hotelId })
}
