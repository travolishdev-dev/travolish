import { create } from 'zustand'
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistApi'

const useWishlistStore = create((set, get) => ({
  wishlistIds: [],
  backendUserId: null,

  // Called after login — loads persisted wishlist from backend
  initialize: async (userId) => {
    if (!userId) return
    set({ backendUserId: userId })
    try {
      const items = await fetchWishlist(userId)
      set({ wishlistIds: items.map((item) => String(item.hotelId)) })
    } catch {
      // Backend unavailable — keep local state
    }
  },

  // Clear items only (keep backendUserId for continued syncing)
  clearItems: () => set({ wishlistIds: [] }),
  // Full reset on sign-out
  clearWishlists: () => set({ wishlistIds: [], backendUserId: null }),

  toggleWishlist: (propertyId) => {
    const { wishlistIds, backendUserId } = get()
    const id = String(propertyId)
    const isCurrentlyWishlisted = wishlistIds.includes(id)

    // Optimistic local update — instant UI feedback
    if (isCurrentlyWishlisted) {
      set({ wishlistIds: wishlistIds.filter((w) => w !== id) })
    } else {
      set({ wishlistIds: [...wishlistIds, id] })
    }

    // Sync to backend in background if logged in
    if (backendUserId) {
      const hotelId = Number(propertyId)
      const apiCall = isCurrentlyWishlisted
        ? removeFromWishlist(backendUserId, hotelId)
        : addToWishlist(backendUserId, hotelId)

      apiCall.catch(() => {
        // Revert on failure
        const current = get().wishlistIds
        if (isCurrentlyWishlisted) {
          set({ wishlistIds: [...current, id] })
        } else {
          set({ wishlistIds: current.filter((w) => w !== id) })
        }
      })
    }
  },

  isWishlisted: (propertyId) => {
    return get().wishlistIds.includes(String(propertyId))
  },
}))

export default useWishlistStore
