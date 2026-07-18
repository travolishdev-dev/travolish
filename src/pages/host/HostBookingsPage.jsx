import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, Clock3, Loader2, MessageCircleMore, XCircle } from 'lucide-react'
import { differenceInCalendarDays, format, isToday, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'
import { confirmBooking, rejectBooking, listBookingsByHotel } from '../../services/bookingsApi'
import { Star } from 'lucide-react'
import { getOrCreateConversation } from '../../services/chatApi'
import { findUserByEmail } from '../../services/usersApi'
import useAuthStore from '../../stores/useAuthStore'
import useCurrency from '../../hooks/useCurrency'
import useHostContext from '../../hooks/useHostContext'
import { useNavigate } from 'react-router-dom'

const filters = ['All', 'Request', 'Confirmed', 'Check-in today']

function mapStatus(booking) {
  if (booking.status === 'PENDING') return 'Request'
  if (booking.status === 'CONFIRMED') {
    try {
      if (isToday(parseISO(booking.checkInDate))) return 'Check-in today'
    } catch { /* fall through */ }
    return 'Confirmed'
  }
  return null
}

function toneForStatus(status) {
  if (status === 'Request') return 'warning'
  if (status === 'Confirmed') return 'success'
  if (status === 'Check-in today') return 'brand'
  return 'slate'
}

function fmtDate(iso) {
  try {
    const d = parseISO(iso)
    if (isToday(d)) return 'Today'
    return format(d, 'MMM d')
  } catch {
    return iso
  }
}

function nightCount(checkIn, checkOut) {
  try {
    return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))
  } catch {
    return '—'
  }
}

export default function HostBookingsPage() {
  const { hostId, hotels, loading: hostLoading } = useHostContext()
  const { formatCurrency } = useCurrency()
  const navigate = useNavigate()
  const myUserId = useAuthStore((s) => s.backendUserId)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [actioning, setActioning] = useState(null)

  const hotelById = useMemo(() => {
    const map = {}
    hotels.forEach((h) => { map[h.id] = h })
    return map
  }, [hotels])

  useEffect(() => {
    if (hostLoading) return
    if (!hotels.length) {
      setLoading(false)
      return
    }

    Promise.all(hotels.map((h) => listBookingsByHotel(h.id).catch(() => [])))
      .then((arrays) => {
        const all = arrays
          .flat()
          .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')
          .sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
            if (b.status === 'PENDING' && a.status !== 'PENDING') return 1
            return (a.checkInDate ?? '').localeCompare(b.checkInDate ?? '')
          })
        setBookings(all)
      })
      .finally(() => setLoading(false))
  }, [hotels, hostLoading])

  const visibleRows = useMemo(() => {
    if (activeFilter === 'All') return bookings
    return bookings.filter((b) => mapStatus(b) === activeFilter)
  }, [bookings, activeFilter])

  const requestCount = bookings.filter((b) => b.status === 'PENDING').length
  const todayCount = bookings.filter((b) => {
    try { return b.status === 'CONFIRMED' && isToday(parseISO(b.checkInDate)) } catch { return false }
  }).length
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length
  const totalValue = bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)

  async function handleApprove(booking) {
    setActioning(booking.id)
    try {
      const updated = await confirmBooking(booking.id, booking)
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, ...updated, status: 'CONFIRMED' } : b))
      toast.success(`Booking #${booking.id} confirmed`)
    } catch {
      toast.error('Failed to confirm booking')
    } finally {
      setActioning(null)
    }
  }

  async function handleMessage(booking) {
    if (!myUserId || !booking.guestEmail) {
      navigate('/messages')
      return
    }
    try {
      const guest = await findUserByEmail(booking.guestEmail).catch(() => null)
      const guestUserId = guest?.id
      if (guestUserId) {
        const conv = await getOrCreateConversation(myUserId, guestUserId)
        navigate(`/messages/${conv.id}`)
      } else {
        navigate('/messages')
      }
    } catch {
      navigate('/messages')
    }
  }

  async function handleReject(booking) {
    setActioning(booking.id)
    try {
      await rejectBooking(booking.id, booking)
      setBookings((prev) => prev.filter((b) => b.id !== booking.id))
      toast.success(`Booking #${booking.id} declined`)
    } catch {
      toast.error('Failed to decline booking')
    } finally {
      setActioning(null)
    }
  }

  return (
    <HostShell
      eyebrow="Bookings"
      title="Bookings and reservation requests"
      mobileTitle="Bookings"
      description="Review incoming requests, track arrivals, and keep check-in / check-out work visible."
      actions={[
        { label: 'Availability', href: '/host/availability', secondary: true },
        { label: 'Messages', href: '/messages' },
      ]}
      stats={[
        { label: 'Requests', value: String(requestCount), note: 'Need host decision' },
        { label: 'Today', value: String(todayCount), note: 'Check-in attention' },
        { label: 'Confirmed', value: String(confirmedCount), note: 'Upcoming stays' },
        {
          label: 'Value',
          value: totalValue > 0 ? formatCurrency(Math.round(totalValue)) : '—',
          note: 'Visible queue total',
        },
      ]}
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeading
            eyebrow="Reservations"
            title="Request and arrival queue"
            description="Approve or decline pending requests and track confirmed arrivals."
          />
          <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0">
            <div className="flex w-max gap-2">
              {filters.map((filter) => (
                <HostPillButton
                  key={filter}
                  active={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </HostPillButton>
              ))}
            </div>
          </div>
        </div>

        {loading || hostLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            Loading bookings…
          </div>
        ) : visibleRows.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            {activeFilter === 'All' ? 'No active bookings.' : `No bookings with status "${activeFilter}".`}
          </p>
        ) : (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {visibleRows.map((booking) => {
              const status = mapStatus(booking)
              const hotel = hotelById[booking.hotelId]
              const nights = nightCount(booking.checkInDate, booking.checkOutDate)
              const busy = actioning === booking.id

              return (
                <div key={booking.id} className="py-5">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={toneForStatus(status)}>{status}</StatusPill>
                        <StatusPill tone="sky">#{booking.id}</StatusPill>
                        {booking.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f6f2] px-3 py-1 text-xs font-semibold text-muted">
                            <Clock3 size={13} />
                            Awaiting response
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                        {booking.guestName}
                      </h2>
                      {booking.guestEmail && (
                        <p className="mt-1 text-sm text-muted">{booking.guestEmail}</p>
                      )}
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {hotel?.name ?? `Property #${booking.hotelId}`}
                        {booking.roomId ? ` · Room ${booking.roomId}` : ''}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-dark">
                        <span className="inline-flex items-center gap-2">
                          <CalendarCheck size={15} />
                          {fmtDate(booking.checkInDate)} → {fmtDate(booking.checkOutDate)}
                        </span>
                        {nights !== '—' && <span>{nights} night{nights !== 1 ? 's' : ''}</span>}
                        {booking.totalPrice != null && (
                          <span className="font-semibold">{formatCurrency(booking.totalPrice)}</span>
                        )}
                      </div>
                      {booking.notes && (
                        <p className="mt-3 text-sm leading-6 text-dark">{booking.notes}</p>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      {booking.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(booking)}
                            disabled={busy}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                          >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(booking)}
                            disabled={busy}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark">
                          <CalendarCheck size={16} />
                          {status}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleMessage(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                      >
                        <MessageCircleMore size={16} />
                        Message
                      </button>
                      {booking.status === 'CONFIRMED' && (booking.userId || booking.guestId) && (
                        <Link
                          to={`/host/reviews/guests/${booking.userId ?? booking.guestId}?bookingId=${booking.id}&hotelId=${booking.hotelId}&guestName=${encodeURIComponent(booking.guestName ?? 'Guest')}`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                        >
                          <Star size={16} />
                          Review guest
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </HostShell>
  )
}
