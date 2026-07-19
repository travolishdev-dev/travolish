import { create } from 'zustand'
import {
  setAuthToken,
  setRefreshToken,
  clearTokens,
  loadRefreshToken,
  refreshAccessToken,
} from '../lib/api'
import { getMe } from '../services/usersApi'
import useWishlistStore from './useWishlistStore'
import { normalizePhoneForStorage } from '../lib/phone'
import queryClient from '../lib/queryClient'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Build a Supabase-compatible profile shape from the backend user so existing
// components that read `profile.avatar_url` / `profile.full_name` keep working.
function deriveProfile(user) {
  if (!user) return null
  // Normalise role: backend sends GUEST/HOST/ADMIN (uppercase) → lowercase for display
  const rawRole = user.role || 'GUEST'
  return {
    id: user.id,
    avatar_url: user.avatarUrl || user.imageKey || null,
    full_name: [user.firstName, user.lastName].filter(Boolean).join(' '),
    email: user.email,
    role: rawRole.toLowerCase(),   // 'guest' | 'host' | 'admin'
    // Pass through all profile fields so viewer and edit-profile pages have them
    phone: user.phone ? normalizePhoneForStorage(user.phone, user.phoneCountryCode || '+91') : null,
    city: user.city || null,
    timeZone: user.timeZone || null,
    travelStyle: user.travelStyle || null,
    bio: user.bio || null,
    preferredName: user.preferredName || null,
    createdAt: user.createdAt || null,
  }
}

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,       // derived from user — kept for backward compat
  backendUserId: null,
  isLoading: true,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  // Restore session on page load using stored refresh token
  initialize: async () => {
    const refreshToken = loadRefreshToken()
    if (!refreshToken) {
      set({ isLoading: false })
      return
    }
    try {
      const accessToken = await refreshAccessToken()
      setAuthToken(accessToken)
      const backendUser = await getMe()
      set({
        user: backendUser,
        profile: deriveProfile(backendUser),
        backendUserId: backendUser.id,
        isLoading: false,
      })
      useWishlistStore.getState().initialize(backendUser.id)
    } catch {
      clearTokens()
      set({ isLoading: false })
    }
  },

  // Called by AuthModal with the Google credential (id_token) from @react-oauth/google
  signInWithGoogle: async (credential) => {
    const res = await fetch(`${BASE_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: credential }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Google sign-in failed')
    }
    const data = await res.json()
    setAuthToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    const backendUser = await getMe()
    set({
      user: backendUser,
      profile: deriveProfile(backendUser),
      backendUserId: backendUser.id,
    })
    useWishlistStore.getState().initialize(backendUser.id)
    return data
  },

  // Step 1 of email signup — request a verification code be emailed.
  startEmailSignup: async (email, role = 'guest') => {
    const res = await fetch(`${BASE_URL}/api/auth/signup/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Could not send verification code')
    }
    return res.json().catch(() => ({}))
  },

  // Step 2 of email signup — verify the code, which creates the user and
  // returns the same token pair as the OAuth flows.
  verifyEmailSignup: async (email, code, { firstName, lastName } = {}) => {
    const res = await fetch(`${BASE_URL}/api/auth/signup/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, firstName, lastName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || err.message || 'Verification failed')
    }
    const data = await res.json()
    setAuthToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    const backendUser = await getMe()
    set({
      user: backendUser,
      profile: deriveProfile(backendUser),
      backendUserId: backendUser.id,
    })
    useWishlistStore.getState().initialize(backendUser.id)
    return data
  },

  signOut: () => {
    clearTokens()
    set({ user: null, profile: null, backendUserId: null })
    useWishlistStore.getState().clearWishlists()
    // Flush all cached query data so a subsequent user on the same device
    // cannot see private data served from the in-memory stale cache.
    queryClient.clear()
  },

  updateAvatar: (avatarUrl) => {
    set((state) => {
      const user = state.user ? { ...state.user, avatarUrl } : null
      return { user, profile: deriveProfile(user) }
    })
  },

  // Patch the stored user with updated fields after a profile save
  patchUser: (fields) => {
    set((state) => {
      const user = state.user ? { ...state.user, ...fields } : null
      return { user, profile: deriveProfile(user) }
    })
  },
}))

export default useAuthStore
