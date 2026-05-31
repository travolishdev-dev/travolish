import { get, post } from '../lib/api'

export async function getUserReviews(userId = 1, { page = 0, size = 50 } = {}) {
  return get('/api/reviews/user', { page, size }, { 'X-User-Id': String(userId) })
}

export async function submitReview(hotelId, { title, content, rating }, userId = 1) {
  return post(
    `/api/reviews/hotels/${hotelId}`,
    { title, content, rating },
    { 'X-User-Id': String(userId) },
  )
}

export async function getHotelRatingStats(hotelId) {
  return get(`/api/reviews/hotels/${hotelId}/stats`)
}
