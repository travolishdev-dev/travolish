export const NATIVE_APP_LOCATION_STORAGE_KEY = 'travolish_native_app_location'
export const NATIVE_APP_LOCATION_SYNC_KEY_STORAGE_KEY =
  'travolish_native_app_location_sync_key'

const toNumber = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseNativeAppLocation(search) {
  const params = new URLSearchParams(search)
  const source = params.get('source')

  if (source !== 'react-native-app') {
    return null
  }

  const latitude = toNumber(params.get('latitude'))
  const longitude = toNumber(params.get('longitude'))
  const hasCoordinates = latitude !== null && longitude !== null
  const fallbackName = hasCoordinates
    ? formatCoordinates(latitude, longitude)
    : 'Shared location'
  const locationPermission =
    (params.get('locationPermission') || 'unknown').toLowerCase()
  const platform = (params.get('platform') || 'unknown').toLowerCase()
  const pushToken = params.get('pushToken') || null

  return {
    name: params.get('name') || fallbackName,
    source,
    platform,
    pushToken,
    locationPermission,
    latitude,
    longitude,
    hasCoordinates,
    hasSharedLocation: locationPermission === 'granted' && hasCoordinates,
    isNativeAppLaunch: true,
  }
}

export function formatCoordinates(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return ''
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

export function formatPlatformLabel(platform) {
  if (!platform) {
    return 'Native app'
  }

  return `${platform.charAt(0).toUpperCase()}${platform.slice(1)} app`
}

export function sortPropertiesBySharedLocation(properties, sharedLocation) {
  if (!sharedLocation?.hasSharedLocation) {
    return properties
  }

  const origin = [sharedLocation.latitude, sharedLocation.longitude]

  return [...properties].sort((left, right) => {
    const leftDistance = calculateDistanceInKm(origin, left.coordinates)
    const rightDistance = calculateDistanceInKm(origin, right.coordinates)
    return leftDistance - rightDistance
  })
}

export function buildLocationSyncKey(location) {
  if (!location?.hasSharedLocation) {
    return ''
  }

  return [
    location.name || 'guest',
    location.latitude,
    location.longitude,
    location.pushToken || '',
  ].join('|')
}

function calculateDistanceInKm([originLat, originLng], [targetLat, targetLng]) {
  const earthRadiusKm = 6371
  const dLat = toRadians(targetLat - originLat)
  const dLng = toRadians(targetLng - originLng)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(targetLat)) *
      Math.sin(dLng / 2) ** 2

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(value) {
  return (value * Math.PI) / 180
}
