import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getInventoryDashboard, getInventoryForecast, getInventoryAlerts } from '../../services/inventoryApi'
import useHostContext from '../../hooks/useHostContext'

const EMPTY_METRICS = [
  { label: 'Sellable nights', value: '—', note: '' },
  { label: 'Booked nights', value: '—', note: '' },
  { label: 'Occupancy', value: '—', note: '' },
]

const EMPTY_FORECAST = [
  { title: 'Next 7 days', value: '—', note: '' },
  { title: 'Next 30 days', value: '—', note: '' },
  { title: 'Weekend occupancy', value: '—', note: '' },
]

export default function HostInventoryPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [metrics, setMetrics] = useState(EMPTY_METRICS)
  const [forecastBlocks, setForecastBlocks] = useState(EMPTY_FORECAST)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (hostLoading || !primaryHotelId) return

    getInventoryDashboard(primaryHotelId)
      .then((data) => {
        if (data) {
          setMetrics([
            {
              label: 'Sellable nights',
              value: data.sellableNights != null ? String(data.sellableNights) : '—',
              note: data.availableNights != null ? `${data.availableNights} available` : '',
            },
            {
              label: 'Booked nights',
              value: data.bookedNights != null ? String(data.bookedNights) : '—',
              note: '',
            },
            {
              label: 'Occupancy',
              value: data.occupancyRate != null ? `${data.occupancyRate}%` : '—',
              note: data.status ?? '',
            },
          ])
        }
      })
      .catch(() => {})

    getInventoryForecast(primaryHotelId)
      .then((data) => {
        if (data) {
          const fmtDemand = (level) =>
            level ? level.charAt(0) + level.slice(1).toLowerCase() : '—'
          const fmtBookings = (v) =>
            v != null ? `${v} booking${v !== 1 ? 's' : ''} avg/day` : ''

          setForecastBlocks([
            {
              title: 'Next 7 days',
              value: fmtDemand(data.next7Days?.demandLevel),
              note: fmtBookings(data.next7Days?.avgBookings),
            },
            {
              title: 'Next 30 days',
              value: fmtDemand(data.next30Days?.demandLevel),
              note: fmtBookings(data.next30Days?.avgBookings),
            },
            {
              title: 'Weekend demand',
              value: fmtDemand(data.weekendDemand),
              note: fmtBookings(data.weekendAvgBookings),
            },
          ])
        }
      })
      .catch(() => {})

    getInventoryAlerts(primaryHotelId)
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.alerts
        if (items?.length) {
          setAlerts(
            items.map((a) => ({
              title: a.title ?? a.alertType ?? 'Alert',
              detail: a.detail ?? a.message ?? a.description ?? '',
              tone: a.tone ?? a.severity ?? 'warning',
            })),
          )
        }
      })
      .catch(() => {})
  }, [primaryHotelId, hostLoading])

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
