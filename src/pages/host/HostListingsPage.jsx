import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'
import { hostListings } from '../../data/mockHostPortalData'

const filters = ['All', 'Live', 'Draft updates']

export default function HostListingsPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const visibleListings = useMemo(() => {
    if (activeFilter === 'All') {
      return hostListings
    }

    return hostListings.filter((listing) => listing.status === activeFilter)
  }, [activeFilter])

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
        { label: 'Live', value: '3', note: 'Currently bookable' },
        { label: 'Draft', value: '1', note: 'Needs updates' },
        { label: 'Avg occupancy', value: '79%', note: 'Rolling 30 days' },
        { label: 'Response time', value: '12 min', note: 'Across active threads' },
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
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                    {listing.property.title}
                  </h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
                    <MapPin size={14} />
                    {listing.property.location}, {listing.property.country}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-dark">
                    {listing.description}
                  </p>
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
