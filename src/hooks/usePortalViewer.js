import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import useAuthStore from '../stores/useAuthStore'
import { listBookings } from '../services/bookingsApi'
import { getUserReviews } from '../services/reviewsApi'

export default function usePortalViewer() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const backendUserId = useAuthStore((state) => state.backendUserId)

  const { data: bookings, isPending: bookingsPending } = useQuery({
    queryKey: ['bookings', backendUserId, user?.email],
    queryFn: async () => {
      const queries = []
      if (backendUserId) queries.push(listBookings({ userId: backendUserId }))
      if (user?.email)   queries.push(listBookings({ guestEmail: user.email }))
      const results = await Promise.all(queries)
      const seen = new Set()
      return results.flat().filter((b) => {
        if (seen.has(b.id)) return false
        seen.add(b.id)
        return true
      })
    },
    enabled: !!backendUserId || !!user?.email,
    staleTime: 30_000,
  })

  const { data: reviews, isPending: reviewsPending } = useQuery({
    queryKey: ['reviews', 'user', backendUserId],
    queryFn: () =>
      getUserReviews(backendUserId).then((data) =>
        Array.isArray(data) ? data : (data?.content ?? []),
      ),
    enabled: !!backendUserId,
    staleTime: 30_000,
  })

  const tripCount = bookingsPending ? null : (bookings?.length ?? 0)
  const reviewCount = reviewsPending ? null : (reviews?.length ?? 0)

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
