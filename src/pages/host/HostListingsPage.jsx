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
import { getHostListings, getHostRooms } from '../../services/hostListingsApi'
import { listBookingsByHotel } from '../../services/bookingsApi'
import useHostContext from '../../hooks/useHostContext'

const filters = ['All', 'Live', 'In Review', 'Draft updates', 'Paused']

// Map backend HotelStatus enum → UI label used by filter tabs
function mapHotelStatus(raw) {
  if (raw === 'LIVE') return 'Live'
  if (raw === 'PENDING_REVIEW') return 'In Review'
  if (raw === 'DRAFT') return 'Draft updates'
  if (raw === 'PAUSED') return 'Paused'
  return 'Draft updates'
}

function statusTone(status) {
  if (status === 'Live') return 'success'
  if (status === 'In Review') return 'sky'
  if (status === 'Paused') return 'slate'
  return 'warning'
}

function adaptListing(h) {
  return {
    id: h.id,
    status: mapHotelStatus(h.status),
    adminNote: h.adminNote ?? null,
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
      // imageUrl is the correct field name from Hotel entity; h.images[] doesn't exist
      image: h.imageUrl ?? h.images?.[0] ?? h.property?.image
        ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop',
    },
  }
}

export default function HostListingsPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [listings, setListings] = useState([])
  const [pendingCounts, setPendingCounts] = useState({})
  const [roomCounts, setRoomCounts] = useState({})
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hostLoading) return
    if (!hostId) { setLoading(false); return }

    getHostListings(hostId)
      .then(async (data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (!items?.length) return
        setListings(items.map(adaptListing))

        // Fetch pending bookings, room counts in parallel for all hotels
        const [bookingResults, roomResults] = await Promise.all([
          Promise.all(
            items.map((h) =>
              listBookingsByHotel(h.id)
                .then((bookings) => {
                  const arr = Array.isArray(bookings) ? bookings : []
                  return [h.id, arr.filter((b) => b.status === 'PENDING').length]
                })
                .catch(() => [h.id, 0]),
            ),
          ),
          Promise.all(
            items.map((h) =>
              getHostRooms(h.id)
                .then((rooms) => {
                  const arr = Array.isArray(rooms) ? rooms : (rooms?.content ?? [])
                  return [h.id, arr.length]
                })
                .catch(() => [h.id, 0]),
            ),
          ),
        ])

        setPendingCounts(Object.fromEntries(bookingResults))
        setRoomCounts(Object.fromEntries(roomResults))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hostId, hostLoading])

  const visibleListings = useMemo(() => {
    if (activeFilter === 'All') return listings
    return listings.filter((l) => l.status === activeFilter)
  }, [activeFilter, listings])

  const liveCount = listings.filter((l) => l.status === 'Live').length
  const reviewCount = listings.filter((l) => l.status === 'In Review').length
  const draftCount = listings.filter((l) => l.status === 'Draft updates').length
  const pausedCount = listings.filter((l) => l.status === 'Paused').length

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
        { label: 'In Review', value: String(reviewCount), note: 'Pending admin approval' },
        { label: 'Draft', value: String(draftCount), note: 'Needs updates' },
        { label: 'Paused', value: String(pausedCount), note: 'Temporarily hidden' },
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
                    <StatusPill tone={statusTone(listing.status)}>
                      {listing.status}
                    </StatusPill>
                    <StatusPill tone="sky">{listing.market}</StatusPill>
                    {(pendingCounts[listing.id] ?? 0) > 0 ? (
                      <StatusPill tone="warning">
                        {pendingCounts[listing.id]} booking request{pendingCounts[listing.id] > 1 ? 's' : ''}
                      </StatusPill>
                    ) : null}
                  </div>
                  {listing.status === 'Draft updates' && listing.adminNote && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                      <span className="shrink-0 font-semibold">Admin note:</span>
                      <span className="leading-5">{listing.adminNote}</span>
                    </div>
                  )}
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                    {listing.property.title}
                  </h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
                    <MapPin size={14} />
                    {listing.property.location}, {listing.property.country}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-dark">{listing.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span>{roomCounts[listing.id] ?? listing.roomCount} rooms</span>
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
