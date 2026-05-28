import { useState, useEffect } from 'react'
import { differenceInCalendarDays, format, isAfter, parseISO, startOfToday } from 'date-fns'
import useAuthStore from '../stores/useAuthStore'
import { listBookings } from '../services/bookingsApi'
import { getUnreadCount } from '../services/notificationsApi'

export default function useAccountInsights() {
  const user = useAuthStore((state) => state.user)
  const backendUserId = useAuthStore((state) => state.backendUserId)

  const [nextDeparture, setNextDeparture] = useState(undefined)
  const [tripCount, setTripCount] = useState(undefined)
  const [unreadCount, setUnreadCount] = useState(undefined)

  useEffect(() => {
    if (!user?.email) return
    let cancelled = false

    listBookings(user.email)
      .then((data) => {
        if (cancelled) return
        const bookings = Array.isArray(data) ? data : []
        setTripCount(bookings.length)

        const today = startOfToday()
        const upcoming = bookings
          .filter((b) => {
            const s = b.status?.toUpperCase()
            return (s === 'CONFIRMED' || s === 'PENDING') &&
                   b.checkInDate &&
                   isAfter(parseISO(b.checkInDate), today)
          })
          .sort((a, b) => parseISO(a.checkInDate) - parseISO(b.checkInDate))

        if (upcoming.length > 0) {
          const next = upcoming[0]
          const days = differenceInCalendarDays(parseISO(next.checkInDate), today)
          setNextDeparture({ days, note: `Check-in ${format(parseISO(next.checkInDate), 'MMM d, yyyy')}` })
        } else {
          setNextDeparture(null)
        }
      })
      .catch(() => {
        if (!cancelled) { setTripCount(0); setNextDeparture(null) }
      })

    return () => { cancelled = true }
  }, [user?.email])

  useEffect(() => {
    if (!backendUserId) return
    let cancelled = false

    getUnreadCount(backendUserId)
      .then((data) => {
        if (!cancelled) setUnreadCount(typeof data === 'number' ? data : 0)
      })
      .catch(() => { if (!cancelled) setUnreadCount(0) })

    return () => { cancelled = true }
  }, [backendUserId])

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
}
