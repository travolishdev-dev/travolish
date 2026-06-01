import {
  Ambulance,
  Building2,
  LifeBuoy,
  MapPin,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../components/portal/PortalUI'

const emergencyContacts = [
  { label: 'Local emergency', value: '112', note: 'Police, fire, ambulance', icon: ShieldAlert },
  { label: 'Medical help', value: '108', note: 'Ambulance support', icon: Ambulance },
  { label: 'Travolish safety desk', value: '+91 80 5555 0199', note: '24/7 traveller support', icon: LifeBuoy },
]

const activeStay = {
  property: 'Upcoming stay safety card',
  location: 'Auto-detects from your nearest active trip',
  host: 'Host and property contacts appear here during an active stay.',
}

export default function TravellerEmergencyPage() {
  return (
    <PortalShell
      eyebrow="Emergency"
      title="Guest safety and SOS."
      mobileTitle="Emergency"
      description="Traveller-side emergency contacts, active-stay safety details, and one-touch support UI."
      actions={[
        { label: 'Messages', href: '/messages', secondary: true },
        { label: 'Trips', href: '/trips' },
      ]}
      stats={[
        { label: 'Safety desk', value: '24/7', note: 'Always available' },
        { label: 'Local SOS', value: '112', note: 'India emergency line' },
        { label: 'Active incidents', value: '0', note: 'No open safety case' },
      ]}
      accent="from-rose-50 via-white to-sky-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard>
          <SectionHeading
            eyebrow="SOS"
            title="One-touch emergency actions"
            description="These controls are UI-ready and can connect to emergency APIs, native dialer, and incident logging later."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {emergencyContacts.map((contact) => {
              const Icon = contact.icon
              return (
                <div key={contact.label} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                      <Icon size={22} />
                    </div>
                    <StatusPill tone="danger">SOS</StatusPill>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-muted">{contact.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-dark">{contact.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{contact.note}</p>
                  <button
                    type="button"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-3 text-sm font-semibold text-white"
                  >
                    <PhoneCall size={15} />
                    Call
                  </button>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Active stay"
              title="Trip safety card"
              description="Relevant safety details will follow the traveller's active booking."
            />
            <div className="mt-6 rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 w-max">
                <Building2 size={22} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-dark">{activeStay.property}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <MapPin size={15} />
                {activeStay.location}
              </p>
              <p className="mt-4 text-sm leading-6 text-muted">{activeStay.host}</p>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow="Checklist" title="Before calling" />
            <div className="mt-6 space-y-3">
              {[
                'Share your booking ID and current location.',
                'Contact the property host through messages if it is safe.',
                'Use local emergency services first for immediate danger.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm leading-6 text-dark">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
