import { create } from 'zustand'

const useWishlistStore = create((set, get) => ({
  wishlistIds: [],

  toggleWishlist: (propertyId) => {
    const { wishlistIds } = get()
    if (wishlistIds.includes(propertyId)) {
      set({ wishlistIds: wishlistIds.filter((id) => id !== propertyId) })
    } else {
      set({ wishlistIds: [...wishlistIds, propertyId] })
    }
  },

  isWishlisted: (propertyId) => {
    return get().wishlistIds.includes(propertyId)
  },

  clearWishlists: () => set({ wishlistIds: [] }),
}))

export default useWishlistStore
