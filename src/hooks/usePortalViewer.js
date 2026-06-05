import { useState, useEffect, useMemo } from 'react'
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

    const queries = []
    if (backendUserId) queries.push(listBookings({ userId: backendUserId }))
    if (user?.email)   queries.push(listBookings({ guestEmail: user.email }))
    Promise.all(queries)
      .then((results) => {
        const seen = new Set()
        const all = results.flat().filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true })
        if (!cancelled) setTripCount(all.length)
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

  // Backend returns camelCase (createdAt); also accept created_at for legacy compat
  const createdAtRaw = user?.createdAt || user?.created_at
  const joinedLabel = createdAtRaw
    ? `Member since ${format(parseISO(createdAtRaw), 'MMMM yyyy')}`
    : null

  const joinedYear = createdAtRaw
    ? format(parseISO(createdAtRaw), 'yyyy')
    : null

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Memoize viewer so downstream components only re-render when values actually change
  const viewer = useMemo(() => ({
    fullName,
    preferredName: fullName.split(' ')[0] || null,
    email: user?.email || profile?.email || null,
    phone: profile?.phone || user?.phone || null,
    avatar: profile?.avatar_url || null,
    role: profile?.role
      ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
      : 'Guest',
    city: profile?.city || user?.city || null,
    timeZone,
    joinedLabel,
    travelStyle: profile?.travelStyle || user?.travelStyle || null,
    bio: profile?.bio || user?.bio || null,
    badges: [],
    stats: [
      { label: 'Trips booked', value: tripCount ?? '—' },
      { label: 'Reviews written', value: reviewCount ?? '—' },
      { label: 'Account type', value: profile?.role
          ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
          : 'Guest' },
      { label: 'Member since', value: joinedYear ?? '—' },
    ],
    preferences: [],
    emergencyContact: null,
    savedAddresses: [],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [fullName, user?.email, user?.phone, user?.city, user?.travelStyle, user?.bio,
       profile?.avatar_url, profile?.role, profile?.phone, profile?.city,
       profile?.travelStyle, profile?.bio, timeZone, joinedLabel, joinedYear,
       tripCount, reviewCount])

  return {
    user,
    profile,
    viewer,
    isPreview: !user,
  }
}
