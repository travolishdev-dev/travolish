import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BedDouble, PencilLine, Users } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getHostListings, getHostRooms } from '../../services/hostListingsApi'
import { findHostListing, findRoomsByListing } from '../../data/mockHostPortalData'

function adaptRoom(r) {
  return {
    id: r.id,
    name: r.name ?? r.roomName ?? 'Room',
    type: r.roomType ?? r.type ?? '—',
    status: r.status ?? 'Ready',
    floor: r.floor ?? '—',
    capacity: r.maxOccupancy ?? r.capacity ?? '—',
    beds: r.bedConfiguration ?? r.beds ?? '—',
    baths: r.bathrooms != null ? `${r.bathrooms} bath` : r.baths ?? '—',
    baseRate: r.basePrice != null ? `$${r.basePrice}` : r.baseRate ?? '—',
    upsells: r.amenities?.join(', ') ?? r.upsells ?? '',
    housekeepingState: r.housekeepingStatus ?? r.housekeepingState ?? '—',
    nightsSold: r.nightsSold ?? 0,
    note: r.description ?? r.note ?? '',
    listingId: r.hotelId ?? r.listingId,
  }
}

function adaptListing(h) {
  return {
    id: h.id,
    status: h.status ?? 'Live',
    market: h.city ?? h.market ?? '—',
    description: h.description ?? '',
    roomCount: h.totalRooms ?? h.roomCount ?? 0,
    occupancy30: h.occupancyRate != null ? `${h.occupancyRate}%` : h.occupancy30 ?? '—',
    housekeeping: h.housekeeping ?? '—',
    operationsStatus: h.operationsStatus ?? '',
    nextArrival: h.nextArrival ?? '—',
    property: {
      title: h.name ?? h.property?.title ?? 'Untitled',
      location: h.city ?? h.property?.location ?? '—',
      country: h.country ?? h.property?.country ?? '—',
      image: h.images?.[0] ?? h.property?.image ?? '',
    },
  }
}

export default function HostRoomsPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(() => findHostListing(id))
  const [rooms, setRooms] = useState(() => findRoomsByListing(id))

  useEffect(() => {
    getHostListings()
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) {
          const found = items.find((h) => String(h.id) === String(id))
          if (found) setListing(adaptListing(found))
        }
      })
      .catch(() => {})

    getHostRooms(id)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) setRooms(items.map(adaptRoom))
      })
      .catch(() => {})
  }, [id])

  if (!listing) {
    return (
      <HostShell
        title="Listing not found."
        mobileTitle="Rooms"
        description="Open this page from a valid listing."
        actions={[{ label: 'Back to listings', href: '/host/listings' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">The requested listing is missing.</p>
        </SectionCard>
      </HostShell>
    )
  }

  return (
    <HostShell
      eyebrow="Rooms"
      title={listing.property.title}
      mobileTitle="Rooms"
      description="Room setup and basic status."
      actions={[
        { label: 'Edit listing', href: `/host/listings/${listing.id}/edit`, secondary: true },
        { label: 'Add room', href: `/host/rooms/new?listingId=${listing.id}` },
      ]}
      mobileAction={{ label: 'Add', href: `/host/rooms/new?listingId=${listing.id}` }}
      stats={[
        { label: 'Rooms', value: String(rooms.length), note: listing.property.location },
        { label: 'Occupancy', value: listing.occupancy30, note: 'Next 30 days' },
        { label: 'Housekeeping', value: listing.housekeeping, note: 'Current load' },
      ]}
    >
      <SectionCard>
        <div className="grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
          <img
            src={listing.property.image}
            alt={listing.property.title}
            className="h-32 w-full rounded-[24px] object-cover"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="success">{listing.status}</StatusPill>
              <StatusPill tone="sky">{listing.market}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-dark">{listing.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span>{listing.roomCount} sellable room types</span>
              <span>{listing.operationsStatus}</span>
              <span>{listing.nextArrival}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <SectionHeading eyebrow="Inventory" title="Room roster" />
        </div>

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {rooms.map((room) => (
            <div key={room.id} className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-dark">{room.name}</p>
                    <StatusPill
                      tone={
                        room.status === 'Ready'
                          ? 'success'
                          : room.status === 'Occupied'
                            ? 'brand'
                            : 'warning'
                      }
                    >
                      {room.status}
                    </StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-2">
                      <BedDouble size={14} />
                      {room.type}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users size={14} />
                      {room.capacity}
                    </span>
                    <span>{room.beds}</span>
                    <span>{room.baths}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-dark">{room.note}</p>
                  <p className="mt-2 text-sm text-muted">
                    {room.housekeepingState} · {room.nightsSold} nights sold
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Base rate
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                    {room.baseRate}
                  </p>
                  <p className="mt-1 text-sm text-muted">{room.upsells}</p>
                  <Link
                    to={`/host/rooms/${room.id}/edit`}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    <PencilLine size={14} />
                    Edit room
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
