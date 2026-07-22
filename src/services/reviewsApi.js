import { get, post, put } from '../lib/api'
import useAuthStore from '../stores/useAuthStore'

function getUserId() {
  const profile = useAuthStore.getState().profile
  return profile?.id ?? null
}

export async function getUserReviews(userId, { page = 0, size = 50 } = {}) {
  const uid = userId ?? getUserId()
  if (!uid) throw new Error('User ID required to fetch reviews')
  return get('/api/reviews/user', { page, size }, { 'X-User-Id': String(uid) })
}

export async function submitReview(hotelId, { title, content, rating, categoryScores, tags }, userId) {
  const uid = userId ?? getUserId()
  if (!uid) throw new Error('User ID required to submit a review')
  return post(
    `/api/reviews/hotels/${hotelId}`,
    {
      title,
      content,
      rating,
      cleanlinessRating: categoryScores?.cleanliness ?? null,
      accuracyRating: categoryScores?.accuracy ?? null,
      communicationRating: categoryScores?.communication ?? null,
      locationRating: categoryScores?.location ?? null,
      checkInRating: categoryScores?.checkIn ?? null,
      valueRating: categoryScores?.value ?? null,
      tags: Array.isArray(tags) ? tags.join(',') : (tags ?? null),
    },
    { 'X-User-Id': String(uid) },
  )
}

export async function updateReview(reviewId, { title, content, rating, categoryScores, tags }) {
  return put(`/api/reviews/${reviewId}`, {
    title,
    content,
    rating,
    cleanlinessRating: categoryScores?.cleanliness ?? null,
    accuracyRating: categoryScores?.accuracy ?? null,
    communicationRating: categoryScores?.communication ?? null,
    locationRating: categoryScores?.location ?? null,
    checkInRating: categoryScores?.checkIn ?? null,
    valueRating: categoryScores?.value ?? null,
    tags: Array.isArray(tags) ? tags.join(',') : (tags ?? null),
  })
}

export async function getReview(reviewId) {
  return get(`/api/reviews/${reviewId}`)
}

export async function getHotelRatingStats(hotelId) {
  return get(`/api/reviews/hotels/${hotelId}/stats`)
}

export async function submitGuestReview(guestId, bookingId, { title, content, rating, hotelId, cleanlinessRating, theftRating, behaviorRating }, hostUserId) {
  return post(
    `/api/reviews/guests/${guestId}?bookingId=${bookingId}`,
    { title, content, rating, hotelId, cleanlinessRating, theftRating, behaviorRating },
    { 'X-Host-Id': String(hostUserId) },
  )
}

export async function getGuestReviews(guestId, { page = 0, size = 20 } = {}) {
  return get(`/api/reviews/guests/${guestId}`, { page, size })
}
