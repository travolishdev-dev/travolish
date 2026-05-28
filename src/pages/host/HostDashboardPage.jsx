import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock3, Loader2 } from 'lucide-react'
import { format, parseISO, isToday, isTomorrow, addDays, isAfter, isBefore } from 'date-fns'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getDashboardOverview } from '../../services/analyticsApi'
import { listBookingsByHotel } from '../../services/bookingsApi'
import useHostContext from '../../hooks/useHostContext'

function fmtCheckIn(dateStr) {
  try {
    const d = parseISO(dateStr)
    if (isToday(d)) return `Today · ${format(d, 'MMM d')}`
    if (isTomorrow(d)) return `Tomorrow · ${format(d, 'MMM d')}`
    return format(d, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

function arrivalLabel(dateStr) {
  try {
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'MMM d')
  } catch {
    return dateStr
  }
}

function buildStats(overview) {
  if (!overview) return [
    { label: 'Total bookings', value: '—', note: 'Loading…' },
    { label: 'This month', value: '—', note: 'Loading…' },
    { label: 'Avg rating', value: '—', note: 'Loading…' },
    { label: 'Occupancy', value: '—', note: 'Loading…' },
  ]
  return [
    {
      label: 'Total bookings',
      value: String(overview.totalBookings ?? 0),
      note: `${overview.pendingBookings ?? 0} pending`,
    },
    {
      label: 'This month',
      value: String(overview.thisMonthBookings ?? 0),
      note: `${overview.cancelledThisMonth ?? 0} cancelled`,
    },
    {
      label: 'Avg rating',
      value: overview.averageRating != null
        ? Number(overview.averageRating).toFixed(1)
        : '—',
      note: `${overview.reviewsThisMonth ?? 0} reviews this month`,
    },
    {
      label: 'Occupancy',
      value: overview.occupancyRate != null
        ? `${Math.round(Number(overview.occupancyRate))}%`
        : '—',
      note: `${Math.round(Number(overview.responseRate ?? 0))}% response rate`,
    },
  ]
}

function buildPriorityTasks(overview) {
  const tasks = []

  if (overview?.pendingBookings > 0) {
    tasks.push({
      title: `${overview.pendingBookings} booking${overview.pendingBookings !== 1 ? 's' : ''} waiting for confirmation`,
      context: 'Review and confirm pending reservations to secure your calendar.',
      href: '/trips',
      tone: 'brand',
    })
  }

  if (overview?.reviewsThisMonth > 0) {
    tasks.push({
      title: `${overview.reviewsThisMonth} new review${overview.reviewsThisMonth !== 1 ? 's' : ''} this month`,
      context: 'Check guest feedback and respond to maintain your response rate.',
      href: '/host/reports',
      tone: 'sky',
    })
  }

  if (overview?.responseRate != null && Number(overview.responseRate) < 90) {
    tasks.push({
      title: 'Response rate below 90%',
      context: `Current rate: ${Math.round(Number(overview.responseRate))}%. Reply to open messages to improve standing.`,
      href: '/messages',
      tone: 'warning',
    })
  }

  if (tasks.length === 0) {
    tasks.push({
      title: 'Complete your KYC verification',
      context: 'Upload required documents to unlock payouts and full host status.',
      href: '/host/kyc',
      tone: 'warning',
    })
    tasks.push({
      title: 'Set up auto-reply templates',
      context: 'Pre-written replies for check-in, arrival, and checkout save time during busy periods.',
      href: '/host/auto-replies',
      tone: 'sky',
    })
    tasks.push({
      title: 'Review pricing rules',
      context: 'Apply weekend premiums and last-minute fill rules to maximise revenue.',
      href: '/host/pricing',
      tone: 'brand',
    })
  }

  return tasks.slice(0, 3)
}

function buildArrivalBoard(bookings) {
  const now = new Date()
  const cutoff = addDays(now, 7)
  return bookings
    .filter((b) => {
      if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') return false
      try {
        const d = parseISO(b.checkInDate)
        return (isAfter(d, now) || isToday(d)) && isBefore(d, cutoff)
      } catch {
        return false
      }
    })
    .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))
    .slice(0, 5)
}

export default function HostDashboardPage() {
  const { hostId, hotels, loading: hostLoading } = useHostContext()
  const [overview, setOverview] = useState(null)
  const [arrivals, setArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hostLoading || !hostId) return
    async function load() {
      try {
        const [ov, ...hotelBookingArrays] = await Promise.all([
          getDashboardOverview(hostId).catch(() => null),
          ...hotels.map((h) => listBookingsByHotel(h.id).catch(() => [])),
        ])
        setOverview(ov)
        setArrivals(buildArrivalBoard(hotelBookingArrays.flat()))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [hostId, hotels, hostLoading])

  const stats = buildStats(overview)
  const priorityTasks = buildPriorityTasks(overview)

  return (
    <HostShell
      eyebrow="Host"
      title="Host workspace"
      mobileTitle="Host"
      description="Listings, arrivals, and next actions."
      actions={[
        { label: 'Listings', href: '/host/listings', secondary: true },
        { label: 'Availability', href: '/host/availability' },
      ]}
      stats={stats}
    >
      <SectionCard>
        <SectionHeading eyebrow="Today" title="Priority" />

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            Loading dashboard…
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {priorityTasks.map((task) => (
              <Link
                key={task.title}
                to={task.href}
                className="group rounded-[24px] border border-gray-200 bg-[#fcfbf8] p-4 transition-colors hover:border-dark"
              >
                <StatusPill tone={task.tone}>{task.tone}</StatusPill>
                <p className="mt-3 text-lg font-semibold tracking-tight text-dark">
                  {task.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{task.context}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-dark">
                  Open queue
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="Arrivals" title="Arrival board" />

        {loading && (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            Fetching arrivals…
          </div>
        )}

        {!loading && arrivals.length === 0 && (
          <p className="mt-6 text-sm text-muted">No upcoming arrivals in the next 7 days.</p>
        )}

        {!loading && arrivals.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {arrivals.map((booking) => (
              <div key={booking.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{booking.guestName}</p>
                      <StatusPill tone={booking.status === 'CONFIRMED' ? 'success' : 'warning'}>
                        {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      Room {booking.roomId} · Booking #{booking.id}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-dark">
                      <Clock3 size={14} />
                      {fmtCheckIn(booking.checkInDate)} → {format(parseISO(booking.checkOutDate), 'MMM d')}
                    </p>
                    {booking.guestEmail && (
                      <p className="mt-2 text-sm text-muted">{booking.guestEmail}</p>
                    )}
                  </div>

                  <div className="grid gap-2 sm:flex sm:flex-wrap">
                    <Link
                      to={`/trips/${booking.id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                    >
                      View booking
                    </Link>
                    <Link
                      to="/messages"
                      className="inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                      Message guest
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </HostShell>
  )
}
