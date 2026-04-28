import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import {
  hostForecastBlocks,
  hostInventoryAlerts,
  hostInventoryMetrics,
} from '../../data/mockHostPortalData'

export default function HostInventoryPage() {
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
      stats={hostInventoryMetrics}
    >
      <SectionCard>
        <SectionHeading eyebrow="Overview" title="Forecast and alerts" />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {hostForecastBlocks.map((block) => (
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
            {hostInventoryAlerts.map((alert) => (
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
