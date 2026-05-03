import { post } from '../lib/api'

export async function submitReview(hotelId, { title, content, rating }, userId = 1) {
  return post(
    `/api/reviews/hotels/${hotelId}`,
    { title, content, rating },
    { 'X-User-Id': String(userId) },
  )
}
