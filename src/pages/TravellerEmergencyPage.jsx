import { useEffect, useState } from 'react'
import {
  Ambulance,
  Building2,
  CheckCircle,
  LifeBuoy,
  Loader2,
  MapPin,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../components/portal/PortalUI'
import { activateSOS } from '../services/emergencyApi'
import { listBookings } from '../services/bookingsApi'
import useAuthStore from '../stores/useAuthStore'

function getCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve({ lat: 0, lng: 0 }); return }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve({ lat: 0, lng: 0 }),
      { timeout: 5000 }
    )
  })
}

const SOS_TYPE = {
  local:     'SAFETY_THREAT',
  medical:   'MEDICAL_EMERGENCY',
  travolish: 'OTHER',
}

export default function TravellerEmergencyPage() {
  const { t } = useTranslation('pages')
  const backendUserId = useAuthStore((s) => s.backendUserId)
  const user          = useAuthStore((s) => s.user)

  const [activating,    setActivating]    = useState(null)   // contact key being activated
  const [sosConfirmed,  setSosConfirmed]  = useState(false)
  const [activeBooking, setActiveBooking] = useState(null)

  useEffect(() => {
    if (!backendUserId) return
    listBookings({ userId: backendUserId })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content ?? [])
        const booking =
          list.find((b) => ['CONFIRMED', 'PENDING'].includes(b.status?.toUpperCase())) ??
          list[0] ??
          null
        setActiveBooking(booking)
      })
      .catch(() => {})
  }, [backendUserId])

  async function handleCall(contactKey, phoneNumber) {
    // Open the native dialer immediately — don't block on API
    window.open(`tel:${phoneNumber.replace(/\s+/g, '')}`, '_self')

    if (!backendUserId) return
    setActivating(contactKey)
    try {
      const { lat, lng } = await getCoords()
      await activateSOS({
        userId:       backendUserId,
        bookingId:    activeBooking?.id    ?? null,
        hotelId:      activeBooking?.hotelId ?? null,
        sosType:      SOS_TYPE[contactKey],
        latitude:     lat,
        longitude:    lng,
        phoneNumber:  user?.phone ?? phoneNumber,
        city:         user?.city  ?? undefined,
      })
      setSosConfirmed(true)
      setTimeout(() => setSosConfirmed(false), 8000)
    } catch {
      // Dialer already open — logging failure is silent
    } finally {
      setActivating(null)
    }
  }

  const emergencyContacts = [
    { key: 'local',     label: t('emergency.contacts.local'),     value: '112',              note: t('emergency.contacts.localDesc'),     icon: ShieldAlert },
    { key: 'medical',   label: t('emergency.contacts.medical'),   value: '108',              note: t('emergency.contacts.medicalDesc'),   icon: Ambulance },
    { key: 'travolish', label: t('emergency.contacts.travolish'), value: '+91 80 5555 0199', note: t('emergency.contacts.travolishDesc'), icon: LifeBuoy },
  ]

  const checklist = [
    t('emergency.checklist.one'),
    t('emergency.checklist.two'),
    t('emergency.checklist.three'),
  ]

  const activeStay = {
    property: 'Upcoming stay safety card',
    location: 'Auto-detects from your nearest active trip',
    host: activeBooking
      ? `Booking #${activeBooking.id} · Hotel ID ${activeBooking.hotelId}`
      : 'Host and property contacts appear here during an active stay.',
  }

  return (
    <PortalShell
      eyebrow={t('emergency.eyebrow')}
      title={t('emergency.title')}
      mobileTitle={t('emergency.eyebrow')}
      description="Traveller-side emergency contacts, active-stay safety details, and one-touch support UI."
      actions={[
        { label: 'Messages', href: '/messages', secondary: true },
        { label: 'Trips', href: '/trips' },
      ]}
      stats={[
        { label: t('emergency.stats.safetyDesk'),      value: '24/7', note: t('emergency.stats.alwaysAvailable') },
        { label: t('emergency.stats.localSOS'),        value: '112',  note: t('emergency.stats.indiaLine') },
        { label: t('emergency.stats.activeIncidents'), value: '0',    note: t('emergency.stats.noOpenCase') },
      ]}
      accent="from-rose-50 via-white to-sky-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard>
          <SectionHeading
            eyebrow={t('emergency.sosEyebrow')}
            title={t('emergency.sosTitle')}
            description="Tap Call to dial instantly. Travolish logs the incident and notifies your hotel host."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {emergencyContacts.map((contact) => {
              const Icon = contact.icon
              const isActive = activating === contact.key
              return (
                <div key={contact.key} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
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
                    onClick={() => handleCall(contact.key, contact.value)}
                    disabled={isActive}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  >
                    {isActive ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <PhoneCall size={15} />
                    )}
                    {isActive ? 'Logging…' : t('emergency.call')}
                  </button>
                </div>
              )
            })}
          </div>

          {sosConfirmed && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              <CheckCircle size={16} className="shrink-0 text-green-600" />
              Incident logged. Travolish support and your hotel host have been notified.
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow={t('emergency.activeStayEyebrow')}
              title={t('emergency.tripSafetyCard')}
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
            <SectionHeading eyebrow={t('emergency.checklistEyebrow')} title={t('emergency.beforeCalling')} />
            <div className="mt-6 space-y-3">
              {checklist.map((item) => (
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
