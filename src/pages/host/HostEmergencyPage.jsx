import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import {
  findHostListing,
  hostEmergencyContacts,
  hostEmergencyIncidents,
} from '../../data/mockHostPortalData'

export default function HostEmergencyPage() {
  return (
    <HostShell
      eyebrow="Emergency"
      title="Safety"
      mobileTitle="Safety"
      description="Emergency contacts and active issues."
      actions={[
        { label: 'Auto replies', href: '/host/auto-replies', secondary: true },
        { label: 'KYC', href: '/host/kyc' },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard>
          <SectionHeading eyebrow="Active" title="Incident queue" />

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {hostEmergencyIncidents.map((incident) => {
              const listing = findHostListing(incident.listingId)

              return (
                <div key={incident.id} className="py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-dark">{incident.title}</p>
                        <StatusPill tone={incident.status === 'Open' ? 'warning' : 'sky'}>
                          {incident.status}
                        </StatusPill>
                        <StatusPill tone={incident.severity === 'Medium' ? 'warning' : 'slate'}>
                          {incident.severity}
                        </StatusPill>
                      </div>
                      <p className="mt-2 text-sm text-muted">{listing?.property.title}</p>
                      <p className="mt-3 text-sm leading-6 text-dark">{incident.note}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading eyebrow="Contacts" title="Emergency chain" />

            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {hostEmergencyContacts.map((contact) => (
                <div key={contact.label} className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {contact.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-dark">{contact.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </HostShell>
  )
}
