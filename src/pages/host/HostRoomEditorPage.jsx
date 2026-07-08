import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostPillButton } from '../../components/host/HostFormFields'
import { createRoom, getRoom, updateRoom } from '../../services/hostListingsApi'

const roomTypes = ['Suite', 'Villa suite', 'Studio loft', 'Family room', 'Residence']

const EMPTY_ROOM_DRAFT = {
  roomId: null,
  listingId: '',
  listingName: '',
  name: '',
  type: 'Suite',
  status: 'Ready',
  floor: '',
  capacity: '',
  beds: '',
  baths: '',
  baseRate: '',
  upsells: '',
  note: '',
}

function typeEnumToLabel(type) {
  if (!type) return 'Suite'
  const label = type
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(' ')
  return roomTypes.find((t) => t.toLowerCase() === label.toLowerCase()) ?? 'Suite'
}

export default function HostRoomEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formState, setFormState] = useState({
    ...EMPTY_ROOM_DRAFT,
    listingId: searchParams.get('listingId') ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!id) return
    getRoom(id)
      .then((r) => {
        if (!r) return
        setFormState((prev) => ({
          ...prev,
          roomId: r.id,
          listingId: r.hotelId != null ? String(r.hotelId) : prev.listingId,
          name: r.number ?? r.name ?? prev.name,
          type: typeEnumToLabel(r.type),
          status: r.available === false ? 'Blocked' : 'Ready',
          baseRate: r.pricePerNight != null ? String(r.pricePerNight) : prev.baseRate,
          note: r.description ?? prev.note,
        }))
      })
      .catch(() => {})
  }, [id])

  const updateField = (field) => (event) =>
    setFormState((current) => ({ ...current, [field]: event.target.value }))

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        hotelId: Number(formState.listingId) || null,
        type: formState.type?.toUpperCase().replace(/\s+/g, '_') ?? 'SUITE',
        number: formState.name,
        pricePerNight: Number(formState.baseRate) || 0,
        capacity: Number(formState.capacity) || 2,
        available: formState.status?.toLowerCase() !== 'blocked',
      }
      if (id) {
        await updateRoom(id, payload)
      } else {
        await createRoom(payload)
      }
      navigate(`/host/listings/${formState.listingId}/rooms`)
    } catch {
      setSaveError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HostShell
      eyebrow={id ? 'Edit room' : 'New room'}
      title={id ? (formState.name ? `Edit ${formState.name}` : 'Edit room') : 'New room'}
      mobileTitle={id ? 'Edit room' : 'New room'}
      description="Simple room setup form."
      actions={[
        { label: 'Back to rooms', href: `/host/listings/${formState.listingId}/rooms`, secondary: true },
        { label: saving ? 'Saving…' : 'Save room', onClick: handleSave },
      ]}
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: saving ? 'Saving…' : 'Save room', onClick: handleSave }}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SectionCard>
          <SectionHeading eyebrow="Form" title="Room details" />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <HostField label="Room name" value={formState.name} onChange={updateField('name')} placeholder="Lagoon Suite" />
            <HostField label="Listing id" value={String(formState.listingId)} onChange={updateField('listingId')} placeholder="13" />
            <HostField label="Status" value={formState.status} onChange={updateField('status')} placeholder="Ready" />
            <HostField label="Capacity" value={formState.capacity} onChange={updateField('capacity')} placeholder="2 guests" />
            <HostField label="Beds" value={formState.beds} onChange={updateField('beds')} placeholder="1 king bed" />
            <HostField label="Baths" value={formState.baths} onChange={updateField('baths')} placeholder="1 bath" />
            <HostField label="Floor / zone" value={formState.floor} onChange={updateField('floor')} placeholder="Beachfront" />
            <HostField label="Base rate" value={formState.baseRate} onChange={updateField('baseRate')} placeholder="360" />
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Room type
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {roomTypes.map((type) => (
                <HostPillButton
                  key={type}
                  active={formState.type === type}
                  onClick={() => setFormState((current) => ({ ...current, type }))}
                >
                  {type}
                </HostPillButton>
              ))}
            </div>
          </div>

          {saveError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="mt-6">
            <HostField
              label="Room note"
              value={formState.note}
              onChange={updateField('note')}
              placeholder="What should operations remember about this room?"
              textarea
            />
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="rounded-[24px] bg-slate-100 p-4 text-dark">
                <BedDouble size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-semibold text-dark">{formState.name || 'New room'}</p>
                  <StatusPill tone="sky">{formState.type}</StatusPill>
                </div>
                {formState.listingName && (
                  <p className="mt-2 text-sm text-muted">{formState.listingName}</p>
                )}
                <p className="mt-4 text-2xl font-semibold tracking-tight text-dark">
                  {formState.baseRate ? `$${formState.baseRate}` : '—'}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Capacity</span>
                <span className="text-sm font-semibold text-dark">{formState.capacity || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Beds</span>
                <span className="text-sm font-semibold text-dark">{formState.beds || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Status</span>
                <span className="text-sm font-semibold text-dark">{formState.status}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </HostShell>
  )
}
