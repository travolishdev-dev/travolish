import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { listBookings } from '../../services/bookingsApi'
import { getHotel } from '../../services/hotelsApi'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop',
]

const API_STATUS_MAP = {
  PENDING: 'upcoming',
  CONFIRMED: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const STATUS_TONE = {
  upcoming: 'brand',
  completed: 'success',
  cancelled: 'warning',
}

const filters = [
  { id: 'all', label: 'All trips' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

function placeholderImage(hotelId) {
  return PLACEHOLDER_IMAGES[(Number(hotelId) || 0) % PLACEHOLDER_IMAGES.length]
}

function formatDateLabel(checkIn, checkOut) {
  try {
    return `${format(parseISO(checkIn), 'MMM d')} – ${format(parseISO(checkOut), 'MMM d, yyyy')}`
  } catch {
    return `${checkIn} – ${checkOut}`
  }
}

function adaptBooking(booking, hotelMap) {
  const hotel = hotelMap[booking.hotelId] || {}
  const status = API_STATUS_MAP[booking.status] ?? 'upcoming'
  return {
    id: String(booking.id),
    status,
    confirmationCode: `#${booking.id}`,
    dateLabel: formatDateLabel(booking.checkInDate, booking.checkOutDate),
    total: `$${Number(booking.totalPrice ?? 0).toFixed(2)}`,
    paymentStatus:
      booking.status === 'PENDING' ? 'Payment pending'
      : booking.status === 'CONFIRMED' ? 'Payment confirmed'
      : booking.status,
    tripMood:
      status === 'upcoming' ? 'Ready for check-in'
      : status === 'completed' ? 'Stay completed'
      : 'Trip cancelled',
    timeline: [
      { label: 'Check-in', value: booking.checkInDate },
      { label: 'Check-out', value: booking.checkOutDate },
      { label: 'Status', value: booking.status },
    ],
    property: {
      title: hotel.name || `Hotel #${booking.hotelId}`,
      location: hotel.city || '',
      country: hotel.country || '',
      image: placeholderImage(booking.hotelId),
    },
  }
}

export default function TripsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const raw = await listBookings()
        const hotelIds = [...new Set(raw.map((b) => b.hotelId).filter(Boolean))]
        const hotels = await Promise.all(
          hotelIds.map((id) => getHotel(id).catch(() => ({ id })))
        )
        const hotelMap = Object.fromEntries(hotels.map((h) => [h.id, h]))
        setBookings(raw.map((b) => adaptBooking(b, hotelMap)))
      } catch {
        setError('Could not load your bookings. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const visibleTrips = useMemo(
    () => (activeFilter === 'all' ? bookings : bookings.filter((b) => b.status === activeFilter)),
    [activeFilter, bookings]
  )

  const tripStats = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status === 'upcoming')
    const completed = bookings.filter((b) => b.status === 'completed')
    return [
      { label: 'Upcoming stays', value: String(upcoming.length), note: upcoming[0]?.property.title || '—' },
      { label: 'Completed stays', value: String(completed.length), note: 'All time' },
      { label: 'Total bookings', value: String(bookings.length), note: 'Across all statuses' },
    ]
  }, [bookings])

  return (
    <PortalShell
      eyebrow="Trips"
      title="Manage every trip in one place."
      mobileTitle="Trips"
      description="All your bookings in one view — filter by status to see what's coming up, done, or cancelled."
      actions={[
        { label: 'Open messages', href: '/messages', secondary: true },
        { label: 'Browse stays', href: '/search' },
      ]}
      stats={tripStats}
      accent="from-amber-50 via-white to-rose-50"
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeading
            eyebrow="Reservations"
            title="Trip library"
            description="Filter by stage to see what the travel experience looks like before, during, and after a stay."
          />

          <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0">
            <div className="flex w-max gap-2 md:w-auto md:flex-wrap md:gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-dark text-white'
                      : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading trips…</div>
        )}

        {error && (
          <div className="py-16 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && visibleTrips.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            No {activeFilter !== 'all' ? activeFilter + ' ' : ''}trips found.{' '}
            <Link to="/search" className="font-semibold underline">
              Browse stays
            </Link>
          </div>
        )}

        {!loading && !error && visibleTrips.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {visibleTrips.map((booking) => (
              <Link
                key={booking.id}
                to={`/trips/${booking.id}`}
                className="group block py-4 transition-colors hover:bg-white/40 md:py-5"
              >
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 md:gap-5 lg:grid-cols-[220px_minmax(0,1fr)_240px] lg:items-center">
                  <img
                    src={booking.property.image}
                    alt={booking.property.title}
                    className="h-28 w-full rounded-[22px] object-cover lg:h-auto lg:aspect-[4/3]"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={STATUS_TONE[booking.status]}>
                        {booking.status}
                      </StatusPill>
                      <p className="text-xs font-medium text-muted md:text-sm">
                        Confirmation {booking.confirmationCode}
                      </p>
                    </div>

                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-dark md:mt-3 md:text-2xl">
                      {booking.property.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted md:mt-3">
                      {(booking.property.location || booking.property.country) && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin size={14} />
                          {[booking.property.location, booking.property.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock size={14} />
                        {booking.dateLabel}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-gray-200 pt-4 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Trip status
                    </p>
                    <p className="mt-2 text-lg font-semibold text-dark">{booking.tripMood}</p>
                    <p className="mt-1 text-sm text-muted">{booking.paymentStatus}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {booking.timeline.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted">{item.label}</span>
                          <span className="font-medium text-dark">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                      <span className="text-sm text-muted">Total</span>
                      <span className="text-xl font-semibold text-dark">{booking.total}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PortalShell>
  )
}
