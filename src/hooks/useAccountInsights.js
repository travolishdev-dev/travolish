import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, format, isAfter, parseISO, startOfToday } from 'date-fns'
import useAuthStore from '../stores/useAuthStore'
import { listBookings } from '../services/bookingsApi'
import { getUnreadCount } from '../services/notificationsApi'

export default function useAccountInsights() {
  const user = useAuthStore((state) => state.user)
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

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count', backendUserId],
    queryFn: () => getUnreadCount(backendUserId),
    enabled: !!backendUserId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const tripCount = bookingsPending ? undefined : (bookings?.length ?? 0)
  const unreadCount = !backendUserId
    ? undefined
    : typeof unreadData === 'number'
      ? unreadData
      : (unreadData?.count ?? undefined)

  const nextDeparture = useMemo(() => {
    if (!bookings) return undefined
    const today = startOfToday()
    const upcoming = bookings
      .filter((b) => {
        const s = b.status?.toUpperCase()
        return (s === 'CONFIRMED' || s === 'PENDING') &&
               b.checkInDate &&
               isAfter(parseISO(b.checkInDate), today)
      })
      .sort((a, b) => parseISO(a.checkInDate) - parseISO(b.checkInDate))

    if (upcoming.length === 0) return null
    const next = upcoming[0]
    const days = differenceInCalendarDays(parseISO(next.checkInDate), today)
    return { days, note: `Check-in ${format(parseISO(next.checkInDate), 'MMM d, yyyy')}` }
  }, [bookings])

  // Memoize so the returned array reference is stable unless actual values change
  return useMemo(() => {
    const loading = '—'
    return [
      {
        label: 'Next departure',
        value: nextDeparture === undefined ? loading
             : nextDeparture === null ? 'None'
             : `${nextDeparture.days} day${nextDeparture.days !== 1 ? 's' : ''}`,
        note: nextDeparture?.note ?? null,
      },
      {
        label: 'Unread host updates',
        value: unreadCount === undefined ? loading : String(unreadCount),
        note: unreadCount === 0 ? 'All caught up'
            : unreadCount === 1 ? '1 notification'
            : unreadCount > 1 ? `${unreadCount} notifications`
            : null,
      },
      {
        label: 'Trips booked',
        value: tripCount === undefined ? loading : String(tripCount),
        note: tripCount === 1 ? '1 booking total'
            : tripCount > 1 ? `${tripCount} bookings total`
            : tripCount === 0 ? 'No bookings yet'
            : null,
      },
    ]
  }, [nextDeparture, unreadCount, tripCount])
}
