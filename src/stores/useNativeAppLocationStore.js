import { create } from 'zustand'
import {
  NATIVE_APP_LOCATION_STORAGE_KEY,
  NATIVE_APP_LOCATION_SYNC_KEY_STORAGE_KEY,
  buildLocationSyncKey,
  parseNativeAppLocation,
} from '../lib/nativeAppLocation'
import { supabase } from '../lib/supabase'

const inFlightSyncKeys = new Set()

const defaultState = {
  name: null,
  source: null,
  platform: null,
  pushToken: null,
  locationPermission: null,
  latitude: null,
  longitude: null,
  hasCoordinates: false,
  hasSharedLocation: false,
  isNativeAppLaunch: false,
  lastSyncedLocationKey: null,
}

const persistState = (nextState) => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(
    NATIVE_APP_LOCATION_STORAGE_KEY,
    JSON.stringify(nextState),
  )
}

const persistSyncKey = (syncKey) => {
  if (typeof window === 'undefined') {
    return
  }

  if (!syncKey) {
    window.sessionStorage.removeItem(NATIVE_APP_LOCATION_SYNC_KEY_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(
    NATIVE_APP_LOCATION_SYNC_KEY_STORAGE_KEY,
    syncKey,
  )
}

const readPersistedState = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.sessionStorage.getItem(
    NATIVE_APP_LOCATION_STORAGE_KEY,
  )

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch (error) {
    console.error('Unable to restore native app location state:', error)
    window.sessionStorage.removeItem(NATIVE_APP_LOCATION_STORAGE_KEY)
    return null
  }
}

const readPersistedSyncKey = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage.getItem(
    NATIVE_APP_LOCATION_SYNC_KEY_STORAGE_KEY,
  )
}

const useNativeAppLocationStore = create((set, get) => ({
  ...defaultState,

  hydrate: async () => {
    const persistedState = readPersistedState()
    const persistedSyncKey = readPersistedSyncKey()

    if (persistedState) {
      set({
        ...persistedState,
        lastSyncedLocationKey: persistedSyncKey || null,
      })

      if (persistedState.hasSharedLocation) {
        await get().syncDetails({
          ...persistedState,
          lastSyncedLocationKey: persistedSyncKey || null,
        })
      }
    }
  },

  initializeFromSearch: async (search) => {
    const nextState = parseNativeAppLocation(search)

    if (!nextState) {
      return
    }

    set(nextState)
    persistState(nextState)

    if (!nextState.hasSharedLocation) {
      return
    }

    await get().syncDetails(nextState)
  },

  syncDetails: async (locationOverride) => {
    const locationState = locationOverride || get()

    if (!locationState?.hasSharedLocation) {
      return
    }

    const detailsPayload = await buildDetailsPayload(locationState)
    const syncKey = buildLocationSyncKey({
      ...locationState,
      name: detailsPayload.name,
      pushToken: detailsPayload.fcm_token,
    })

    if (
      !syncKey ||
      syncKey === get().lastSyncedLocationKey ||
      inFlightSyncKeys.has(syncKey)
    ) {
      return
    }

    inFlightSyncKeys.add(syncKey)

    try {
      const { error } = await supabase.from('details').insert(detailsPayload)

      if (error) {
        console.error('Unable to insert captured location into details:', error)
        return
      }

      set({ lastSyncedLocationKey: syncKey })
      persistSyncKey(syncKey)
    } finally {
      inFlightSyncKeys.delete(syncKey)
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(NATIVE_APP_LOCATION_STORAGE_KEY)
    }

    set(defaultState)
    persistSyncKey(null)
  },
}))

async function buildDetailsPayload(locationState) {
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  const user = session?.user
  const email = user?.email?.trim()?.toLowerCase()
  const fullName =
    user?.user_metadata?.full_name?.trim() || user?.user_metadata?.name?.trim()

  return {
    name: email || fullName || 'guest',
    lat: locationState.latitude,
    long: locationState.longitude,
    fcm_token: locationState.pushToken || null,
  }
}

export default useNativeAppLocationStore
