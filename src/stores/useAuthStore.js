import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import useNativeAppLocationStore from './useNativeAppLocationStore'
import { findUserByEmail, createUser } from '../services/usersApi'
import useWishlistStore from './useWishlistStore'

async function resolveBackendUserId(email, fullName) {
  try {
    const user = await findUserByEmail(email)
    return user.id
  } catch (err) {
    if (!err.message?.includes('404')) return null
    const parts = (fullName ?? '').trim().split(' ')
    const created = await createUser({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      email,
    })
    return created.id
  }
}

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthModalOpen: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        set({ user: session.user, session, isLoading: false })
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          set({ profile })
        }

        await useNativeAppLocationStore.getState().syncDetails()

        // Resolve backend user ID and load wishlist
        const email = session.user.email
        const fullName = session.user.user_metadata?.full_name ?? ''
        resolveBackendUserId(email, fullName)
          .then((userId) => {
            if (userId) useWishlistStore.getState().initialize(userId)
          })
          .catch(() => {})
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  },

  signInWithEmail: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
    useWishlistStore.getState().clearWishlists()
  },
}))

export default useAuthStore
