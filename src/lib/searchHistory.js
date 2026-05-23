const STORAGE_KEY = 'travolish_recent_searches'
const MAX_ENTRIES = 5

const DESTINATION_IMAGES = {
  mumbai: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=700&auto=format&fit=crop',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=700&auto=format&fit=crop',
  mussoorie: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=700&auto=format&fit=crop',
  rishikesh: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=700&auto=format&fit=crop',
  jaipur: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=700&auto=format&fit=crop',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&auto=format&fit=crop',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&auto=format&fit=crop',
  rajasthan: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=700&auto=format&fit=crop',
  himachal: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&auto=format&fit=crop',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=700&auto=format&fit=crop',
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop'

function getDestinationImage(city) {
  return DESTINATION_IMAGES[city.toLowerCase()] ?? FALLBACK_IMAGE
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDates(checkIn, checkOut) {
  const from = formatDate(checkIn)
  const to = formatDate(checkOut)
  if (from && to) return `${from} - ${to}`
  if (from) return `From ${from}`
  return 'Flexible dates'
}

function formatGuests(adults = 2, children = 0) {
  const total = adults + children
  const guestLabel = total === 1 ? 'guest' : 'guests'
  return `${total} ${guestLabel}, 1 room`
}

export function saveSearch({ destination, checkIn, checkOut, adults, children }) {
  if (!destination?.trim()) return
  const city = destination.trim()
  const existing = getRecentSearches().filter(
    (s) => s.city.toLowerCase() !== city.toLowerCase(),
  )
  const entry = {
    city,
    dates: formatDates(checkIn, checkOut),
    guests: formatGuests(adults, children),
    image: getDestinationImage(city),
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([entry, ...existing].slice(0, MAX_ENTRIES)),
    )
  } catch {
    // localStorage unavailable — ignore
  }
}

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
