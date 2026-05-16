import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getHotelAvailabilityRange } from '../../services/availabilityApi'
import {
  findHostListing,
  hostAvailabilityDays,
  hostAvailabilityRows,
} from '../../data/mockHostPortalData'

const statusStyles = {
  open: 'bg-white text-dark border-gray-200',
  occupied: 'bg-dark text-white border-dark',
  premium: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  turn: 'bg-sky-50 text-sky-700 border-sky-200',
  arrival: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function buildDateRange() {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 13)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

function buildDayLabels() {
  const days = []
  const d = new Date()
  for (let i = 0; i < 14; i++) {
    days.push(
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    )
    d.setDate(d.getDate() + 1)
  }
  return days
}

function mapStatus(availability) {
  if (!availability) return 'open'
  if (availability.blockedCount > 0) return 'blocked'
  if (availability.availableRooms === 0) return 'occupied'
  if (availability.isPremiumDate) return 'premium'
  if (availability.isTurnoverDay) return 'turn'
  if (availability.hasArrival) return 'arrival'
  return 'open'
}

export default function HostAvailabilityPage() {
  const [days, setDays] = useState(hostAvailabilityDays)
  const [rows, setRows] = useState(hostAvailabilityRows)

  useEffect(() => {
    const { startDate, endDate } = buildDateRange()
    setDays(buildDayLabels())

    // fetch availability for the first listing (id=1) as a representative call
    getHotelAvailabilityRange(1, startDate, endDate)
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.availabilityList
        if (items?.length) {
          // group by hotelId/listingId
          const byListing = items.reduce((acc, item) => {
            const lid = item.hotelId ?? item.listingId ?? 1
            if (!acc[lid]) acc[lid] = []
            acc[lid].push(item)
            return acc
          }, {})

          const newRows = Object.entries(byListing).map(([listingId, dateItems]) => ({
            listingId,
            pattern: Array.from({ length: 14 }, (_, i) => {
              const entry = dateItems[i]
              return entry ? mapStatus(entry) : 'open'
            }),
          }))
          if (newRows.length) setRows(newRows)
        }
      })
      .catch(() => {})
  }, [])

  const openCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'open').length
  const blockedCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'blocked').length
  const premiumCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'premium').length
  const turnCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'turn').length

  return (
    <HostShell
      eyebrow="Availability"
      title="Availability"
      mobileTitle="Calendar"
      description="Simple 14-day calendar view."
      actions={[
        { label: 'Inventory', href: '/host/inventory', secondary: true },
        { label: 'Pricing rules', href: '/host/pricing' },
      ]}
      stats={[
        { label: 'Open nights', value: String(openCount), note: 'Next 14 days' },
        { label: 'Blocked', value: String(blockedCount), note: 'Owner or maintenance hold' },
        { label: 'Premium', value: String(premiumCount), note: 'High-demand dates' },
        { label: 'Turns', value: String(turnCount), note: 'Expected room turns' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Calendar" title="14-day view" />

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[220px_repeat(14,minmax(0,1fr))] gap-2">
              <div />
              {days.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {rows.map((row) => {
                const listing = findHostListing(row.listingId)

                return (
                  <div
                    key={row.listingId}
                    className="grid grid-cols-[220px_repeat(14,minmax(0,1fr))] gap-2"
                  >
                    <div className="border-r border-gray-200 pr-4">
                      <p className="text-sm font-semibold text-dark">
                        {listing?.property.title ?? `Listing ${row.listingId}`}
                      </p>
                      <p className="mt-1 text-xs text-muted">{listing?.market ?? '—'}</p>
                    </div>
                    {row.pattern.map((status, index) => (
                      <div
                        key={`${row.listingId}-${days[index]}`}
                        className={`flex min-h-[54px] items-center justify-center rounded-2xl border text-[11px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status] ?? statusStyles.open}`}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <StatusPill tone="success">arrival</StatusPill>
          <StatusPill tone="sky">turn</StatusPill>
          <StatusPill tone="warning">premium</StatusPill>
          <StatusPill tone="danger">blocked</StatusPill>
        </div>
      </SectionCard>
    </HostShell>
  )
}
