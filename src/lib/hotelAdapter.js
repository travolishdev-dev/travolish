// Cycling pool of hotel-themed placeholder images (Unsplash)
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop',
]

function getPlaceholderImages(id) {
  const base = (Number(id) || 0) % PLACEHOLDER_IMAGES.length
  return [0, 1, 2].map((i) => PLACEHOLDER_IMAGES[(base + i) % PLACEHOLDER_IMAGES.length])
}

// Build a map of hotelId → cheapest room price from a flat rooms array
function buildPriceMap(rooms = []) {
  const map = {}
  rooms.forEach((room) => {
    const hid = room.hotelId
    if (hid == null) return
    if (map[hid] === undefined || room.pricePerNight < map[hid]) {
      map[hid] = room.pricePerNight
    }
  })
  return map
}

// Build a map of hotelId → max guest capacity from room capacities
function buildCapacityMap(rooms = []) {
  const map = {}
  rooms.forEach((room) => {
    const hid = room.hotelId
    const cap = Number(room.capacity)
    if (hid == null || !cap) return
    map[hid] = Math.max(map[hid] || 0, cap)
  })
  return map
}

export function adaptHotel(hotel, priceMap = {}, capacityMap = {}) {
  const price = priceMap[hotel.id]

  // Build image gallery: cover first, then gallery uploads, then placeholders to fill 3 slots
  const realImage = hotel.imageUrl ?? null
  const gallery = Array.isArray(hotel.galleryImages) ? hotel.galleryImages.filter(Boolean) : []
  const realImages = [realImage, ...gallery].filter(Boolean)
  const placeholders = getPlaceholderImages(hotel.id)
  const images = realImages.length > 0
    ? [...realImages, ...placeholders].slice(0, Math.max(realImages.length, 3))
    : placeholders

  return {
    id: String(hotel.id),
    title: hotel.name,
    location: hotel.city || hotel.address || '',
    country: hotel.country || '',
    city: hotel.city || '',
    price: price !== undefined ? Math.round(price) : null,
    rating: hotel.rating ?? 0,
    reviewCount: hotel.reviewCount ?? hotel.reviews?.length ?? 0,
    images,
    videoUrl: hotel.videoUrl ?? null,
    host: {
      name: hotel.hostName ?? 'Host',
      superhost: hotel.superhost ?? false,
    },
    amenities: hotel.amenities ?? [],
    beds: hotel.beds ?? 1,
    bedrooms: hotel.bedrooms ?? 1,
    bathrooms: hotel.bathrooms ?? 1,
    // Use explicit hotel-level maxGuests when set; null means unknown → search filter skips it.
    // Room capacity is used for booking, not search discovery.
    guests: hotel.maxGuests ?? hotel.guests ?? null,
    description: hotel.description || '',
    houseRules: hotel.houseRules ?? null,
    instantBookable: hotel.instantBooking ?? true,
    minimumStay: hotel.minimumStay ?? 1,
    checkInTime: hotel.checkInTime ?? null,
    checkOutTime: hotel.checkOutTime ?? null,
    coordinates: {
      lat: hotel.latitude != null ? Number(hotel.latitude) : null,
      lng: hotel.longitude != null ? Number(hotel.longitude) : null,
    },
    category: 'city',
    dates: null,
  }
}

export function adaptHotels(hotels, rooms = []) {
  const priceMap    = buildPriceMap(rooms)
  const capacityMap = buildCapacityMap(rooms)
  return hotels.map((h) => adaptHotel(h, priceMap, capacityMap))
}
