import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import {
  getActiveSOSForHotel,
  getHostEmergencyContacts,
  createHostEmergencyContact,
  deleteHostEmergencyContact,
} from '../../services/emergencyApi'
import useHostContext from '../../hooks/useHostContext'

const HIGH_SEVERITY_TYPES = new Set(['MEDICAL_EMERGENCY', 'FIRE_EMERGENCY', 'SAFETY_THREAT', 'POLICE_NEEDED'])

function normaliseSOSStatus(raw) {
  if (!raw) return 'Open'
  const upper = raw.toUpperCase()
  if (upper === 'ACTIVATED' || upper === 'ACTIVE' || upper === 'ESCALATED') return 'Open'
  if (upper === 'ACKNOWLEDGED' || upper === 'IN_PROGRESS') return 'Monitoring'
  return raw
}

function adaptSOS(s) {
  const status = normaliseSOSStatus(s.status)
  const severity = HIGH_SEVERITY_TYPES.has(s.sosType) ? 'High' : 'Medium'
  const noteParts = [
    s.userCity && s.userCountry ? `${s.userCity}, ${s.userCountry}` : null,
    s.emergencyContactsNotified ? `${s.emergencyContactsNotified} contacts notified` : null,
    s.liveLocationSharing ? 'Live location on' : null,
  ].filter(Boolean)

  return {
    id: s.id,
    title: s.emergencyDescription ?? (s.sosType ? s.sosType.replace(/_/g, ' ') : 'SOS Alert'),
    status,
    severity,
    note: noteParts.join(' · ') || s.sosType || '—',
  }
}

const EMPTY_FORM = { label: '', contactName: '', contactNumber: '' }

export default function HostEmergencyPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [incidents, setIncidents] = useState([])
  const [incidentsLoading, setIncidentsLoading] = useState(true)

  const [contacts, setContacts] = useState([])
  const [contactsLoading, setContactsLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const isMounted = useRef(true)
  useEffect(() => () => { isMounted.current = false }, [])

  useEffect(() => {
    if (hostLoading || !primaryHotelId) {
      if (!hostLoading) {
        setIncidentsLoading(false)
        setContactsLoading(false)
      }
      return
    }

    getActiveSOSForHotel(primaryHotelId)
      .then((data) => {
        if (!isMounted.current) return
        const items = Array.isArray(data) ? data : []
        if (items.length > 0) setIncidents(items.map(adaptSOS))
      })
      .catch(() => {})
      .finally(() => { if (isMounted.current) setIncidentsLoading(false) })

    getHostEmergencyContacts(primaryHotelId)
      .then((data) => {
        if (!isMounted.current) return
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        setContacts(items)
      })
      .catch(() => {})
      .finally(() => { if (isMounted.current) setContactsLoading(false) })
  }, [primaryHotelId, hostLoading])

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleAddContact() {
    if (!form.contactName || !form.contactNumber) return
    setSaving(true)
    try {
      const created = await createHostEmergencyContact({
        hotelId: primaryHotelId,
        label: form.label || null,
        contactName: form.contactName,
        contactNumber: form.contactNumber,
        contactType: 'OTHER',
        country: '',
        city: '',
      })
      setContacts((prev) => [...prev, created])
      setForm(EMPTY_FORM)
    } catch {
      // keep state
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteContact(contactId) {
    setDeletingId(contactId)
    try {
      await deleteHostEmergencyContact(contactId)
      setContacts((prev) => prev.filter((c) => c.id !== contactId))
    } catch {
      // keep state
    } finally {
      setDeletingId(null)
    }
  }

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
        { label: 'Active', value: String(incidents.filter((i) => i.status === 'Open').length), note: 'Open incidents' },
        { label: 'Monitoring', value: String(incidents.filter((i) => i.status === 'Monitoring').length), note: 'In progress' },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Incident queue */}
        <SectionCard>
          <SectionHeading eyebrow="Active" title="Incident queue" />

          {incidentsLoading && (
            <div className="py-16 text-center text-sm text-muted">Loading incidents…</div>
          )}

          {!incidentsLoading && (
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

        {/* Emergency chain sidebar */}
        <div className="space-y-5">
          <SectionCard>
            <SectionHeading eyebrow="Contacts" title="Emergency chain" />

            {contactsLoading && (
              <div className="mt-6 py-6 text-center text-sm text-muted">Loading…</div>
            )}

            {!contactsLoading && (
              <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
                {contacts.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted">
                    No contacts added yet.
                  </div>
                )}
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-start justify-between gap-3 py-4">
                    <div className="min-w-0">
                      {contact.label && (
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {contact.label}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-dark">{contact.contactName}</p>
                      <p className="text-sm text-muted">{contact.contactNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      disabled={deletingId === contact.id}
                      className="shrink-0 text-muted hover:text-red-600 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow="Add" title="New contact" />
            <div className="mt-4 space-y-3">
              <HostField
                label="Role / label"
                value={form.label}
                onChange={updateField('label')}
                placeholder="e.g. Security lead"
              />
              <HostField
                label="Name"
                value={form.contactName}
                onChange={updateField('contactName')}
                placeholder="Full name"
              />
              <HostField
                label="Phone"
                value={form.contactNumber}
                onChange={updateField('contactNumber')}
                placeholder="+1 555 000 0000"
              />
              <button
                type="button"
                onClick={handleAddContact}
                disabled={!form.contactName || !form.contactNumber || saving}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Add contact'}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </HostShell>
  )
}
