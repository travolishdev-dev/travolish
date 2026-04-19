import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, MapPin, Users } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { bookings } from '../../data/mockPortalData'

const filters = [
  { id: 'all', label: 'All trips' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const statusTone = {
  upcoming: 'brand',
  completed: 'success',
  cancelled: 'warning',
}

export default function TripsPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visibleTrips = useMemo(() => {
    if (activeFilter === 'all') {
      return bookings
    }

    return bookings.filter((booking) => booking.status === activeFilter)
  }, [activeFilter])

  const tripStats = useMemo(() => {
    const upcoming = bookings.filter((booking) => booking.status === 'upcoming')
    const completed = bookings.filter((booking) => booking.status === 'completed')

    return [
      { label: 'Upcoming stays', value: String(upcoming.length), note: upcoming[0]?.property.title },
      {
        label: 'Completed this year',
        value: String(completed.length),
        note: 'Ready for review history',
      },
      {
        label: 'Average trip size',
        value: '2.8 guests',
        note: 'Across current mock bookings',
      },
    ]
  }, [])

  return (
    <PortalShell
      eyebrow="Trips"
      title="Manage every trip in one place."
      mobileTitle="Trips"
      description="This is the guest-side trip center for booking status, itinerary context, payment state, and host coordination. It stays mock-first now, but it is already shaped around the booking APIs."
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
                    <StatusPill tone={statusTone[booking.status]}>
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
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={14} />
                      {booking.property.location}, {booking.property.country}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock size={14} />
                      {booking.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users size={14} />
                      {booking.guests} guests
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-dark">
                    {booking.hostNote}
                  </p>
                </div>

                <div className="col-span-2 border-t border-gray-200 pt-4 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Trip status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-dark">
                    {booking.tripMood}
                  </p>
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
                    <span className="text-xl font-semibold text-dark">
                      {booking.total}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  )
}
