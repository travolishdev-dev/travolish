import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertCircle, CalendarClock, MapPin } from 'lucide-react'
import { format, isBefore, parseISO, startOfDay } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { listBookings, refreshBookingStatuses } from '../../services/bookingsApi'
import { getHotel } from '../../services/hotelsApi'
import useAuthStore from '../../stores/useAuthStore'
import useCurrency from '../../hooks/useCurrency'

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

// Derive display status from dates — never trust a stale DB value for the traveller view.
// Rules:
//   CANCELLED              → always 'cancelled'
//   checkOutDate in past   → 'completed'  (stay ended regardless of host approval state)
//   checkInDate in past    → 'upcoming'   (in progress / currently staying)
//   otherwise              → map from DB status (PENDING/CONFIRMED → 'upcoming')
function resolveDisplayStatus(booking) {
  if (booking.status === 'CANCELLED') return 'cancelled'
  const today = startOfDay(new Date())
  const checkOut = booking.checkOutDate ? parseISO(booking.checkOutDate) : null
  if (checkOut && isBefore(checkOut, today)) return 'completed'
  return 'upcoming'
}

const STATUS_TONE = {
  upcoming: 'brand',
  completed: 'success',
  cancelled: 'warning',
}

const filters = [
  { id: 'all', labelKey: 'filters.all' },
  { id: 'upcoming', labelKey: 'filters.upcoming' },
  { id: 'completed', labelKey: 'filters.completed' },
  { id: 'cancelled', labelKey: 'filters.cancelled' },
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

function adaptBooking(booking, hotelMap, t) {
  const hotel = hotelMap[booking.hotelId] || {}
  const status = resolveDisplayStatus(booking)
  return {
    id: String(booking.id),
    status,
    confirmationCode: `#${booking.id}`,
    dateLabel: formatDateLabel(booking.checkInDate, booking.checkOutDate),
    rawTotal: Number(booking.totalPrice ?? 0),
    paymentStatus:
      status === 'completed' ? t('status.completed')
      : booking.status === 'PENDING' ? t('status.awaiting')
      : booking.status === 'CONFIRMED' ? t('status.confirmed')
      : booking.status,
    tripMood:
      status === 'completed' ? t('status.completed')
      : status === 'cancelled' ? t('status.cancelled')
      : t('status.readyCheckIn'),
    timeline: [
      { label: t('labels.checkIn'),  value: booking.checkInDate },
      { label: t('labels.checkOut'), value: booking.checkOutDate },
      // Show the resolved display status, not the raw DB value, so it's always accurate
      { label: t('labels.status'), value: status.charAt(0).toUpperCase() + status.slice(1) },
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
  const { t } = useTranslation(['trips', 'common'])
  const [activeFilter, setActiveFilter] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, backendUserId } = useAuthStore()
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetch by userId (new bookings) AND by guestEmail (existing/older bookings),
        // Trigger server-side status refresh first so past bookings are COMPLETED in DB
        await refreshBookingStatuses()

        // then deduplicate by id so neither set is lost.
        const queries = []
        if (backendUserId) queries.push(listBookings({ userId: backendUserId }))
        if (user?.email)   queries.push(listBookings({ guestEmail: user.email }))
        if (queries.length === 0) { setLoading(false); return }

        const results = await Promise.all(queries)
        const seen = new Set()
        const raw = results.flat().filter((b) => {
          if (seen.has(b.id)) return false
          seen.add(b.id)
          return true
        })

        if (cancelled) return
        const hotelIds = [...new Set(raw.map((b) => b.hotelId).filter(Boolean))]
        const hotels = await Promise.all(
          hotelIds.map((id) => getHotel(id).catch(() => ({ id })))
        )
        if (cancelled) return
        const hotelMap = Object.fromEntries(hotels.map((h) => [h.id, h]))
        setBookings(raw.map((b) => adaptBooking(b, hotelMap, t)))
      } catch {
        if (!cancelled) setError(t('loadError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [backendUserId, user?.email])

  const visibleTrips = useMemo(
    () => {
      const filtered = activeFilter === 'all'
        ? bookings
        : bookings.filter((booking) => booking.status === activeFilter)
      return filtered.map((booking) => ({
        ...booking,
        total: formatCurrency(booking.rawTotal),
      }))
    },
    [activeFilter, bookings, formatCurrency]
  )

  const tripStats = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status === 'upcoming')
    const completed = bookings.filter((b) => b.status === 'completed')
    return [
      { label: t('stats.upcoming'), value: String(upcoming.length), note: upcoming[0]?.property.title || '—' },
      { label: t('stats.completed'), value: String(completed.length), note: t('stats.allTime') },
      { label: t('stats.total'), value: String(bookings.length), note: t('stats.allStatuses') },
    ]
  }, [bookings, t])

  return (
    <PortalShell
      eyebrow={t('eyebrow')}
      title={t('heading')}
      mobileTitle={t('eyebrow')}
      description={t('desc')}
      actions={[
        { label: t('openMessages'), href: '/messages', secondary: true },
        { label: t('browseStays'), href: '/search' },
      ]}
      stats={tripStats}
      accent="from-rose-50 via-white to-white"
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeading
            eyebrow={t('reservations')}
            title={t('title')}
            description={t('filterDesc')}
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
                  {t(filter.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 py-5 md:gap-5 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
                <div className="h-28 w-full rounded-[22px] skeleton-shimmer lg:aspect-[4/3] lg:h-auto" />
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                    <div className="h-5 w-28 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="h-7 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-4 w-1/2 rounded skeleton-shimmer" />
                  <div className="h-4 w-2/5 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={26} />
            </span>
            <p className="mt-4 text-base font-semibold text-dark">{error}</p>
            <p className="mt-1 text-sm text-muted">Refresh the page to try again.</p>
          </div>
        )}

        {!loading && !error && visibleTrips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-muted">
              <CalendarClock size={26} />
            </span>
            <p className="mt-4 text-base font-semibold text-dark">{t('empty')}</p>
            <Link
              to="/search"
              className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {t('browseStays')}
            </Link>
          </div>
        )}

        {!loading && !error && visibleTrips.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {visibleTrips.map((booking) => (
              <Link
                key={booking.id}
                to={`/trips/${booking.id}`}
                className="group block py-4 transition-colors hover:bg-gray-50/60 md:py-5"
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
                        {t('labels.confirmation')} {booking.confirmationCode}
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
                      {t('labels.tripStatus')}
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
                      <span className="text-sm text-muted">{t('detail.total')}</span>
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
