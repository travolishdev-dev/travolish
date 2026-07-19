import { post, get } from '../lib/api'

const PROPERTY_TYPE_TO_ROOM_TYPE = {
  house: 'DOUBLE',
  apartment: 'SINGLE',
  guesthouse: 'DOUBLE',
  cabin: 'SINGLE',
  tent: 'SINGLE',
  castle: 'SUITE',
  barn: 'DOUBLE',
}

// onHotelCreated is an optional async callback invoked after the hotel is persisted.
// The backend promotes the user to ROLE_HOST inside the create transaction, so callers
// should pass their token-refresh function here so the subsequent POST /api/rooms request
// carries the updated HOST role in the JWT.
export async function publishListing(draftData, onHotelCreated) {
  const hotel = await post('/api/hotels', {
    name: draftData.title,
    city: draftData.location?.city || null,
    country: draftData.location?.country || null,
    description: draftData.description || null,
    rating: 0,
  })

  if (onHotelCreated) await onHotelCreated(hotel)

  const room = await post('/api/rooms', {
    number: '101',
    type: PROPERTY_TYPE_TO_ROOM_TYPE[draftData.propertyType] ?? 'DOUBLE',
    pricePerNight: parseFloat(draftData.pricing.weekday) || 0,
    available: true,
    hotelId: hotel.id,
  })

  return { hotel, room }
}

export async function generateListingDescription(body) {
  return post('/api/ai/descriptions/generate', body)
}

export async function uploadListingImage(hotelId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api/hotels/${hotelId}/images`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function uploadListingVideo(hotelId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api/hotels/${hotelId}/videos`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}
