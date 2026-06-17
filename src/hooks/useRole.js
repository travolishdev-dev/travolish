import useAuthStore from '../stores/useAuthStore'

/**
 * Returns auth state and role-based convenience flags.
 *
 * role:            'guest' | 'host' | 'admin' | null (not yet loaded)
 * isAuthenticated: true when a user is logged in
 * isGuest:         logged in but no elevated role
 * isHost:          role === 'host'
 * isAdmin:         role === 'admin'
 * isLoading:       auth initialisation in progress
 */
export default function useRole() {
  const profile   = useAuthStore((s) => s.profile)
  const isLoading = useAuthStore((s) => s.isLoading)

  const role           = profile?.role ?? null          // 'guest' | 'host' | 'admin' | null
  const isAuthenticated = profile !== null
  const isGuest        = isAuthenticated && role === 'guest'
  const isHost         = isAuthenticated && role === 'host'
  const isAdmin        = isAuthenticated && role === 'admin'

  return { role, isAuthenticated, isGuest, isHost, isAdmin, isLoading }
}
