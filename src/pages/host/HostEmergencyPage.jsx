import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import {
  hostEmergencyContacts,
  hostEmergencyIncidents,
} from '../../data/mockHostPortalData'
import { getActiveSOSForHotel } from '../../services/emergencyApi'

const HOTEL_ID = 1

const HIGH_SEVERITY_TYPES = new Set(['MEDICAL', 'FIRE', 'SECURITY', 'ASSAULT'])

function adaptSOS(s) {
  const status =
    s.status === 'ACTIVE' ? 'Open'
    : s.status === 'IN_PROGRESS' ? 'Monitoring'
    : s.status ?? 'Open'

  const severity = HIGH_SEVERITY_TYPES.has(s.sosType) ? 'High' : 'Medium'

  const noteParts = [
    s.userCity && s.userCountry ? `${s.userCity}, ${s.userCountry}` : null,
    s.emergencyContactsNotified ? `${s.emergencyContactsNotified} contacts notified` : null,
    s.liveLocationSharing ? 'Live location on' : null,
  ].filter(Boolean)

  return {
    id: s.id,
    title: s.emergencyDescription ?? (s.sosType ? s.sosType.replace(/_/g, ' ') : 'SOS Alert'),
    listingId: null,
    status,
    severity,
    note: noteParts.join(' · ') || s.sosType || '—',
  }
}

export default function HostEmergencyPage() {
  const [incidents, setIncidents] = useState(hostEmergencyIncidents)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveSOSForHotel(HOTEL_ID)
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        if (items.length > 0) setIncidents(items.map(adaptSOS))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
      stats={[
        { label: 'Active', value: String(incidents.filter(i => i.status === 'Open').length), note: 'Open incidents' },
        { label: 'Monitoring', value: String(incidents.filter(i => i.status === 'Monitoring').length), note: 'In progress' },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard>
          <SectionHeading eyebrow="Active" title="Incident queue" />

          {loading && (
            <div className="py-16 text-center text-sm text-muted">Loading incidents…</div>
          )}

          {!loading && (
            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {incidents.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">No active incidents.</div>
              ) : incidents.map((incident) => (
                <div key={incident.id} className="py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-dark">{incident.title}</p>
                        <StatusPill tone={incident.status === 'Open' ? 'warning' : 'sky'}>
                          {incident.status}
                        </StatusPill>
                        <StatusPill tone={incident.severity === 'High' ? 'warning' : 'slate'}>
                          {incident.severity}
                        </StatusPill>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-dark">{incident.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
