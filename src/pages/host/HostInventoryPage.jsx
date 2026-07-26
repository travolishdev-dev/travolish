import { useEffect, useMemo, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getInventoryDashboard, getInventoryForecast, getInventoryAlerts } from '../../services/inventoryApi'
import useHostContext from '../../hooks/useHostContext'

const DEMAND_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2, VERY_HIGH: 3 }

function highestDemand(results, key) {
  const levels = results.map((d) => d[key]?.demandLevel ?? 'LOW')
  return levels.reduce((best, lvl) =>
    (DEMAND_RANK[lvl] ?? 0) > (DEMAND_RANK[best] ?? 0) ? lvl : best,
  'LOW')
}

const EMPTY_METRICS = [
  { label: 'Sellable nights', value: '—', note: '' },
  { label: 'Booked nights', value: '—', note: '' },
  { label: 'Occupancy', value: '—', note: '' },
]

const EMPTY_FORECAST = [
  { title: 'Next 7 days', value: '—', note: '' },
  { title: 'Next 30 days', value: '—', note: '' },
  { title: 'Weekend demand', value: '—', note: '' },
]

export default function HostInventoryPage() {
  const { hotels, loading: hostLoading } = useHostContext()
  const [metrics, setMetrics] = useState(EMPTY_METRICS)
  const [forecastBlocks, setForecastBlocks] = useState(EMPTY_FORECAST)
  const [alerts, setAlerts] = useState([])

  // Stable dep — re-run only when the set of hotel IDs actually changes
  const hotelIdsKey = useMemo(() => hotels.map((h) => h.id).join(','), [hotels])

  useEffect(() => {
    if (hostLoading || !hotels.length) return

    const hotelIds = hotels.map((h) => h.id)

    // ── Dashboard metrics (aggregate across all listings) ─────────────────────
    Promise.all(hotelIds.map((id) => getInventoryDashboard(id).catch(() => null)))
      .then((results) => {
        const valid = results.filter(Boolean)
        if (!valid.length) return

        const totalSellable = valid.reduce((sum, d) => sum + (d.sellableNights ?? 0), 0)
        const totalBooked   = valid.reduce((sum, d) => sum + (d.bookedNights ?? 0), 0)
        const totalAvailable = valid.reduce((sum, d) => sum + (d.availableNights ?? 0), 0)
        const occupancyRate = totalSellable > 0
          ? Math.round((totalBooked / totalSellable) * 100)
          : 0

        let status
        if (occupancyRate === 0)       status = 'VACANT'
        else if (occupancyRate < 20)   status = 'LOW'
        else if (occupancyRate > 85)   status = 'CRITICAL'
        else if (occupancyRate > 70)   status = 'WARNING'
        else                           status = 'GOOD'

        setMetrics([
          {
            label: 'Sellable nights',
            value: String(totalSellable),
            note: `${totalAvailable} available`,
          },
          {
            label: 'Booked nights',
            value: String(totalBooked),
            note: '',
          },
          {
            label: 'Occupancy',
            value: `${occupancyRate}%`,
            note: status,
          },
        ])
      })

    // ── Forecast (take highest demand, sum avg bookings) ──────────────────────
    Promise.all(hotelIds.map((id) => getInventoryForecast(id).catch(() => null)))
      .then((results) => {
        const valid = results.filter(Boolean)
        if (!valid.length) return

        const fmtDemand   = (lvl) => lvl ? lvl.charAt(0) + lvl.slice(1).toLowerCase() : '—'
        const fmtBookings = (v)   => v != null ? `${v} bookings avg/day` : ''
        const sumAvg      = (key) => valid.reduce((sum, d) => sum + (d[key]?.avgBookings ?? 0), 0)

        const weekendAvg = valid.reduce((sum, d) => sum + (d.weekendAvgBookings ?? 0), 0)
        const weekendDemand = valid.reduce((best, d) => {
          const lvl = d.weekendDemand ?? 'LOW'
          return (DEMAND_RANK[lvl] ?? 0) > (DEMAND_RANK[best] ?? 0) ? lvl : best
        }, 'LOW')

        setForecastBlocks([
          {
            title: 'Next 7 days',
            value: fmtDemand(highestDemand(valid, 'next7Days')),
            note: fmtBookings(sumAvg('next7Days')),
          },
          {
            title: 'Next 30 days',
            value: fmtDemand(highestDemand(valid, 'next30Days')),
            note: fmtBookings(sumAvg('next30Days')),
          },
          {
            title: 'Weekend demand',
            value: fmtDemand(weekendDemand),
            note: fmtBookings(weekendAvg),
          },
        ])
      })

    // ── Alerts (merge across all listings) ────────────────────────────────────
    Promise.all(hotelIds.map((id) => getInventoryAlerts(id).catch(() => null)))
      .then((results) => {
        const all = results.flatMap((data) => {
          const items = Array.isArray(data) ? data : data?.alerts
          return items ?? []
        })
        if (all.length) {
          setAlerts(
            all.map((a) => ({
              title: a.title ?? a.alertType ?? 'Alert',
              detail: a.detail ?? a.message ?? a.description ?? '',
              tone: a.tone ?? a.severity ?? 'warning',
            })),
          )
        }
      })
  }, [hotelIdsKey, hostLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HostShell
      eyebrow="Inventory"
      title="Inventory"
      mobileTitle="Inventory"
      description="Sellable nights, demand, and alerts."
      actions={[
        { label: 'Availability', href: '/host/availability', secondary: true },
        { label: 'Reports', href: '/host/reports' },
      ]}
      stats={metrics}
    >
      <SectionCard>
        <SectionHeading eyebrow="Overview" title="Forecast and alerts" />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {forecastBlocks.map((block) => (
            <div
              key={block.title}
              className="rounded-[22px] border border-gray-200 bg-[#fcfbf8] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {block.title}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                {block.value}
              </p>
              {block.note && (
                <p className="mt-1 text-sm leading-6 text-muted">{block.note}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <SectionHeading eyebrow="Alerts" title="Operational pressure points" />

          {alerts.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No active alerts.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfbf8] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-dark">{alert.title}</p>
                    <StatusPill tone={alert.tone}>{alert.tone}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{alert.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </HostShell>
  )
}
