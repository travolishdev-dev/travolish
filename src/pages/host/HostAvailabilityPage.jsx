import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getHotelAvailabilityRange } from '../../services/availabilityApi'
import { getHostRooms } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'

const statusStyles = {
  open: 'bg-white text-dark border-gray-200',
  occupied: 'bg-dark text-white border-dark',
  limited: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
}

function buildDates() {
  const dates = []
  const base = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      iso: d.toISOString().split('T')[0],
    })
  }
  return dates
}

function mapStatus(avail) {
  if (!avail) return 'open'
  const s = avail.status
  if (s === 'BLOCKED' || s === 'CLOSED') return 'blocked'
  if (s === 'FULL' || avail.availableRooms === 0) return 'occupied'
  if (s === 'LIMITED') return 'limited'
  return 'open'
}

function statusLabel(s) {
  if (s === 'occupied') return 'Full'
  if (s === 'blocked') return 'Blk'
  if (s === 'limited') return 'Low'
  return ''
}

function roomLabel(room) {
  return room.number ?? room.roomNumber ?? room.name ?? `Room ${room.id}`
}

function roomSub(room) {
  return room.type ?? room.roomType ?? ''
}

export default function HostAvailabilityPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [dates] = useState(buildDates)
  const [rows, setRows] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (hostLoading || !primaryHotelId) {
      if (!hostLoading) setDataLoading(false)
      return
    }

    const startDate = dates[0].iso
    const endDate = dates[dates.length - 1].iso

    Promise.all([
      getHostRooms(primaryHotelId).catch(() => []),
      getHotelAvailabilityRange(primaryHotelId, startDate, endDate).catch(() => []),
    ]).then(([roomsData, availData]) => {
      const rooms = Array.isArray(roomsData) ? roomsData
        : roomsData?.content ?? roomsData?.rooms ?? []

      const items = Array.isArray(availData) ? availData
        : availData?.availabilityList ?? availData?.content ?? []

      // roomId → iso-date → AvailabilityCheckDTO
      const byRoomDate = {}
      items.forEach((item) => {
        const rid = item.roomId
        if (!rid) return
        if (!byRoomDate[rid]) byRoomDate[rid] = {}
        const iso = String(item.availabilityDate)
        byRoomDate[rid][iso] = item
      })

      // Build one row per room that has availability data, fall back to all fetched rooms
      const roomsWithData = rooms.filter((r) => byRoomDate[r.id])
      const sourceRooms = roomsWithData.length > 0 ? roomsWithData : rooms

      const newRows = sourceRooms.map((room) => ({
        roomId: room.id,
        label: roomLabel(room),
        sub: roomSub(room),
        pattern: dates.map((d) => mapStatus(byRoomDate[room.id]?.[d.iso])),
      }))

      if (newRows.length) setRows(newRows)
    }).finally(() => setDataLoading(false))
  }, [primaryHotelId, hostLoading, dates])

  const openCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'open').length
  const occupiedCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'occupied').length
  const blockedCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'blocked').length
  const limitedCount = rows.flatMap((r) => r.pattern).filter((s) => s === 'limited').length

  return (
    <HostShell
      eyebrow="Availability"
      title="Availability"
      mobileTitle="Calendar"
      description="14-day room availability calendar."
      actions={[
        { label: 'Inventory', href: '/host/inventory', secondary: true },
        { label: 'Pricing rules', href: '/host/pricing' },
      ]}
      stats={[
        { label: 'Open nights', value: String(openCount), note: 'Next 14 days' },
        { label: 'Occupied', value: String(occupiedCount), note: 'Fully booked' },
        { label: 'Blocked', value: String(blockedCount), note: 'Maintenance / hold' },
        { label: 'Limited', value: String(limitedCount), note: 'Low availability' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Calendar" title="14-day view" />

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[880px]">
            {/* Header row */}
            <div className="grid grid-cols-[200px_repeat(14,minmax(0,1fr))] gap-2">
              <div />
              {dates.map((d) => (
                <div
                  key={d.iso}
                  className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  {d.label}
                </div>
              ))}
            </div>

            {/* Room rows */}
            <div className="mt-4 space-y-3">
              {dataLoading && (
                <div className="py-12 text-center text-sm text-muted">Loading calendar…</div>
              )}
              {!dataLoading && rows.length === 0 && (
                <div className="py-12 text-center text-sm text-muted">
                  No availability data for this period.
                </div>
              )}
              {rows.map((row) => (
                <div
                  key={row.roomId}
                  className="grid grid-cols-[200px_repeat(14,minmax(0,1fr))] gap-2"
                >
                  <div className="border-r border-gray-200 pr-4">
                    <p className="text-sm font-semibold text-dark">{row.label}</p>
                    {row.sub && <p className="mt-0.5 text-xs text-muted">{row.sub}</p>}
                  </div>
                  {row.pattern.map((status, idx) => (
                    <div
                      key={`${row.roomId}-${dates[idx].iso}`}
                      className={`flex min-h-[52px] items-center justify-center rounded-xl border text-[11px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status] ?? statusStyles.open}`}
                    >
                      {statusLabel(status)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-gray-200 bg-white" />
            <span className="text-xs text-muted">Open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-dark bg-dark" />
            <span className="text-xs text-muted">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-amber-200 bg-amber-50" />
            <span className="text-xs text-muted">Limited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-rose-200 bg-rose-50" />
            <span className="text-xs text-muted">Blocked</span>
          </div>
        </div>

        {rows.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Showing {rows.length} room{rows.length !== 1 ? 's' : ''} · {dates[0].label} – {dates[dates.length - 1].label}
          </p>
        )}
      </SectionCard>
    </HostShell>
  )
}
