import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getInventoryDashboard, getInventoryForecast, getInventoryAlerts } from '../../services/inventoryApi'
import {
  hostForecastBlocks,
  hostInventoryAlerts,
  hostInventoryMetrics,
} from '../../data/mockHostPortalData'

export default function HostInventoryPage() {
  const [metrics, setMetrics] = useState(hostInventoryMetrics)
  const [forecastBlocks, setForecastBlocks] = useState(hostForecastBlocks)
  const [alerts, setAlerts] = useState(hostInventoryAlerts)

  useEffect(() => {
    getInventoryDashboard()
      .then((data) => {
        if (data) {
          const mapped = [
            {
              label: 'Sellable nights',
              value: data.sellableNights ?? data.totalNights ?? hostInventoryMetrics[0].value,
              note: hostInventoryMetrics[0].note,
            },
            {
              label: 'Booked nights',
              value: data.bookedNights ?? hostInventoryMetrics[1].value,
              note: hostInventoryMetrics[1].note,
            },
            {
              label: 'Occupancy',
              value: data.occupancyRate != null ? `${data.occupancyRate}%` : hostInventoryMetrics[2].value,
              note: hostInventoryMetrics[2].note,
            },
          ]
          setMetrics(mapped)
        }
      })
      .catch(() => {})

    getInventoryForecast()
      .then((data) => {
        if (data) {
          const blocks = [
            {
              title: 'Next 7 days',
              value: data.next7Days?.occupancy != null ? `${data.next7Days.occupancy}%` : hostForecastBlocks[0].value,
              note: hostForecastBlocks[0].note,
            },
            {
              title: 'Next 30 days',
              value: data.next30Days?.occupancy != null ? `${data.next30Days.occupancy}%` : hostForecastBlocks[1].value,
              note: hostForecastBlocks[1].note,
            },
            {
              title: 'Weekend occupancy',
              value: data.weekendOccupancy != null ? `${data.weekendOccupancy}%` : hostForecastBlocks[2].value,
              note: hostForecastBlocks[2].note,
            },
          ]
          setForecastBlocks(blocks)
        }
      })
      .catch(() => {})

    getInventoryAlerts()
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
  }, [])

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
              <p className="mt-1 text-sm leading-6 text-muted">{block.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <SectionHeading eyebrow="Alerts" title="Operational pressure points" />

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
        </div>
      </SectionCard>
    </HostShell>
  )
}
