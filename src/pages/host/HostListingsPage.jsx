import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'
import { getHostListings } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'

const filters = ['All', 'Live', 'Draft updates']

function getBookingRequestCount(listingId) {
  return {
    13: 2,
    10: 1,
    14: 3,
    4: 0,
  }[Number(listingId)] ?? 0
}

function adaptListing(h) {
  return {
    id: h.id,
    status: h.status ?? 'Live',
    market: h.city ?? h.country ?? h.market ?? '—',
    description: h.description ?? '',
    roomCount: h.totalRooms ?? h.roomCount ?? 0,
    occupancy30: h.occupancyRate != null ? `${h.occupancyRate}%` : h.occupancy30 ?? '—',
    revenueMTD: h.revenueMTD ?? '—',
    nextArrival: h.nextArrival ?? '—',
    responseTime: h.responseTime ?? '—',
    performanceNote: h.performanceNote ?? '',
    housekeeping: h.housekeeping ?? '—',
    property: {
      title: h.name ?? h.property?.title ?? 'Untitled',
      location: h.city ?? h.property?.location ?? '—',
      country: h.country ?? h.property?.country ?? '—',
      image: h.images?.[0] ?? h.property?.image ?? '',
    },
  }
}

export default function HostListingsPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [listings, setListings] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (hostLoading || !hostId) return
    getHostListings(hostId)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) setListings(items.map(adaptListing))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hostId, hostLoading])

  const visibleListings = useMemo(() => {
    if (activeFilter === 'All') return listings
    return listings.filter((l) => l.status === activeFilter)
  }, [activeFilter, listings])

  const liveCount = listings.filter((l) => l.status === 'Live').length
  const draftCount = listings.filter((l) => l.status !== 'Live').length

  return (
    <HostShell
      eyebrow="Listings"
      title="Listings"
      mobileTitle="Listings"
      description="Edit property details and jump into rooms."
      actions={[
        { label: 'Dashboard', href: '/host', secondary: true },
        { label: 'New listing', href: '/host/listings/new' },
      ]}
      mobileAction={{ label: 'New', href: '/host/listings/new' }}
      stats={[
        { label: 'Live', value: String(liveCount), note: 'Currently bookable' },
        { label: 'Draft', value: String(draftCount), note: 'Needs updates' },
      ]}
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeading eyebrow="Portfolio" title="All listings" />

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

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading listings…</div>
        )}

        {!loading && visibleListings.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-dark">No listings yet</p>
            <p className="mt-1 text-sm text-muted">Add your first property to start accepting bookings.</p>
          </div>
        )}

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {visibleListings.map((listing) => (
            <div key={listing.id} className="py-5">
              <div className="grid gap-4 lg:grid-cols-[136px_minmax(0,1fr)_260px] lg:items-start">
                <img
                  src={listing.property.image}
                  alt={listing.property.title}
                  className="h-28 w-full rounded-[24px] object-cover"
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={listing.status === 'Live' ? 'success' : 'warning'}>
                      {listing.status}
                    </StatusPill>
                    <StatusPill tone="sky">{listing.market}</StatusPill>
                    {getBookingRequestCount(listing.id) > 0 ? (
                      <StatusPill tone="warning">
                        {getBookingRequestCount(listing.id)} booking request{getBookingRequestCount(listing.id) > 1 ? 's' : ''}
                      </StatusPill>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                    {listing.property.title}
                  </h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
                    <MapPin size={14} />
                    {listing.property.location}, {listing.property.country}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-dark">{listing.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span>{listing.roomCount} rooms</span>
                    <span>{listing.occupancy30} occupancy</span>
                    <span>{listing.nextArrival}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Revenue
                  </p>
                  <p className="mt-2 text-lg font-semibold text-dark">{listing.revenueMTD}</p>
                  <p className="mt-1 text-sm text-muted">{listing.performanceNote}</p>
                  <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                    <Link
                      to={`/host/listings/${listing.id}/edit`}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/host/listings/${listing.id}/rooms`}
                      className="inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                      Rooms
                    </Link>
                    <Link
                      to="/host/bookings"
                      className="inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                    >
                      Requests
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
