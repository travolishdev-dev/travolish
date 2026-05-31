import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import useAuthStore from '../stores/useAuthStore'
import { listBookings } from '../services/bookingsApi'
import { getUserReviews } from '../services/reviewsApi'

export default function usePortalViewer() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const backendUserId = useAuthStore((state) => state.backendUserId)
  const [tripCount, setTripCount] = useState(null)
  const [reviewCount, setReviewCount] = useState(null)

  useEffect(() => {
    if (!backendUserId) return
    let cancelled = false

    listBookings(user?.email)
      .then((data) => {
        if (!cancelled) setTripCount(Array.isArray(data) ? data.length : 0)
      })
      .catch(() => { if (!cancelled) setTripCount(0) })

    getUserReviews(backendUserId)
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : (data?.content ?? [])
          setReviewCount(list.length)
        }
      })
      .catch(() => { if (!cancelled) setReviewCount(0) })

    return () => { cancelled = true }
  }, [backendUserId, user?.email])

  const fullName =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    ''

  const joinedLabel = user?.created_at
    ? `Member since ${format(parseISO(user.created_at), 'MMMM yyyy')}`
    : null

  const joinedYear = user?.created_at
    ? format(parseISO(user.created_at), 'yyyy')
    : null

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const viewer = {
    fullName,
    preferredName: fullName.split(' ')[0] || null,
    email: user?.email || profile?.email || null,
    phone: profile?.phone || null,
    avatar: profile?.avatar_url || null,
    role: profile?.role || 'Guest',
    city: profile?.city || null,
    timeZone,
    joinedLabel,
    travelStyle: null,
    bio: null,
    badges: [],
    stats: [
      { label: 'Trips booked', value: tripCount ?? '—' },
      { label: 'Reviews written', value: reviewCount ?? '—' },
      { label: 'Account type', value: profile?.role ?? 'Guest' },
      { label: 'Member since', value: joinedYear ?? '—' },
    ],
    preferences: [],
    emergencyContact: null,
    savedAddresses: [],
  }

  return {
    user,
    profile,
    viewer,
    isPreview: !user,
  }
}
