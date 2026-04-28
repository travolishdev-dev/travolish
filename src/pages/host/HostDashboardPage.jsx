import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import {
  findHostListing,
  hostArrivalBoard,
  hostDashboardStats,
  hostPriorityTasks,
} from '../../data/mockHostPortalData'

export default function HostDashboardPage() {
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
      stats={hostDashboardStats}
    >
      <SectionCard>
        <SectionHeading eyebrow="Today" title="Priority" />

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {hostPriorityTasks.map((task) => (
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
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="Arrivals" title="Arrival board" />

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {hostArrivalBoard.map((arrival) => {
            const listing = findHostListing(arrival.listingId)

            return (
              <div key={arrival.bookingId} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{arrival.guest}</p>
                      <StatusPill tone="sky">{arrival.status}</StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {arrival.roomName} · {listing?.property.title || 'Listing'} ·{' '}
                      {arrival.bookingId}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-dark">
                      <Clock3 size={14} />
                      {arrival.arrival}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted">{arrival.note}</p>
                  </div>

                  <div className="grid gap-2 sm:flex sm:flex-wrap">
                    <Link
                      to={`/host/listings/${arrival.listingId}/rooms`}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                    >
                      Open rooms
                    </Link>
                    <Link
                      to="/host/auto-replies"
                      className="inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                      Message prep
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </HostShell>
  )
}
