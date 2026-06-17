const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const CACHE_PREFIX = 'geo_'
// Nominatim ToS: max 1 req/s; we give a little headroom
const MIN_INTERVAL_MS = 1100

let lastCallAt = 0

async function throttledFetch(url, signal) {
  const now = Date.now()
  const gap = now - lastCallAt
  if (gap < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - gap))
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  lastCallAt = Date.now()
  return fetch(url, { signal, headers: { 'Accept-Language': 'en' } })
}

function cacheKey(query) {
  return CACHE_PREFIX + query.trim().toLowerCase()
}

export async function geocodeQuery(query, signal) {
  if (!query?.trim()) return null
  if (signal?.aborted) return null

  const key = cacheKey(query)
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) return JSON.parse(cached)
  } catch { /* private browsing */ }

  try {
    const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`
    const res = await throttledFetch(url, signal)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    const { lat, lon } = data[0]
    const coords = { lat: Number(lat), lng: Number(lon) }
    try { sessionStorage.setItem(key, JSON.stringify(coords)) } catch { /* quota */ }
    return coords
  } catch (err) {
    if (err.name === 'AbortError') return null
    return null
  }
}

/**
 * Geocodes up to `limit` properties that are missing coordinates.
 * Pass an AbortSignal to cancel mid-loop when a new search starts.
 */
export async function geocodeMissing(properties, signal, limit = 12) {
  const updated = [...properties]
  let geocoded = 0

  for (let i = 0; i < updated.length; i++) {
    if (signal?.aborted || geocoded >= limit) break

    const p = updated[i]
    const { lat, lng } = p.coordinates ?? {}
    const hasCoords =
      Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)

    if (hasCoords) continue

    // Build the most specific query first; fall back to city-level
    const query = [p.title, p.city, p.location, p.country].filter(Boolean).join(', ')
    const coords = await geocodeQuery(query, signal)
    if (signal?.aborted) break

    if (coords) {
      updated[i] = { ...p, coordinates: coords }
      geocoded++
    }
  }
  return updated
}
