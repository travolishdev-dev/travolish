import { Navigate, useLocation } from 'react-router-dom'
import useRole from '../../hooks/useRole'
import useAuthStore from '../../stores/useAuthStore'

/**
 * Route guard for authentication and role-based access.
 *
 * Props:
 *   requireAuth  {boolean}  – redirect to "/" (+ open auth modal) when not logged in
 *   requireRole  {string}   – 'host' | 'admin' — redirect to "/" when role doesn't match
 *                             Admins are also allowed through host-only routes.
 *   children     {node}
 */
export default function ProtectedRoute({ requireAuth = false, requireRole, children }) {
  const { role, isAuthenticated, isLoading } = useRole()
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const location = useLocation()

  // Wait for auth initialisation before making redirect decisions
  if (isLoading) return null

  if (requireAuth && !isAuthenticated) {
    openAuthModal()
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (requireRole) {
    if (!isAuthenticated) {
      openAuthModal()
      return <Navigate to="/" replace state={{ from: location }} />
    }

    const normalised = requireRole.toLowerCase()

    // admin can access everything; host can access host routes
    const allowed =
      role === 'admin' ||
      (normalised === 'host' && role === 'host') ||
      (normalised === 'admin' && role === 'admin')

    if (!allowed) {
      // Redirect to the most relevant area for the current role
      const fallback = role === 'host' ? '/host' : '/'
      return <Navigate to={fallback} replace />
    }
  }

  return children
}
