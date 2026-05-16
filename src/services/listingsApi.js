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

export async function publishListing(draftData) {
  const hotel = await post('/api/hotels', {
    name: draftData.title,
    city: draftData.location?.city || null,
    country: draftData.location?.country || null,
    description: draftData.description || null,
    rating: 0,
  })

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
  return post('/api/ai/description-generator', body)
}

export async function uploadListingImage(hotelId, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('hotelId', hotelId)
  const res = await fetch(`/api/images/hotel/${hotelId}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function uploadListingVideo(hotelId, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('hotelId', hotelId)
  const res = await fetch(`/api/images/hotel/${hotelId}/video`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}
