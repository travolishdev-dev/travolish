import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostPillButton } from '../../components/host/HostFormFields'
import { buildRoomDraft } from '../../data/mockHostPortalData'

const roomTypes = ['Suite', 'Villa suite', 'Studio loft', 'Family room', 'Residence']

export default function HostRoomEditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const draft = buildRoomDraft(id, searchParams.get('listingId'))
  const [formState, setFormState] = useState(draft)

  const updateField = (field) => (event) =>
    setFormState((current) => ({ ...current, [field]: event.target.value }))

  return (
    <HostShell
      eyebrow={id ? 'Edit room' : 'New room'}
      title={id ? `Edit ${draft.name}` : 'New room'}
      mobileTitle={id ? 'Edit room' : 'New room'}
      description="Simple room setup form."
      actions={[
        { label: 'Back to rooms', href: `/host/listings/${formState.listingId}/rooms`, secondary: true },
        { label: 'Save room', href: `/host/listings/${formState.listingId}/rooms` },
      ]}
      mobileAction={{ label: 'Save', href: `/host/listings/${formState.listingId}/rooms` }}
      mobileBottomAction={{ label: 'Save room', href: `/host/listings/${formState.listingId}/rooms` }}
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
                  <p className="text-xl font-semibold text-dark">{formState.name}</p>
                  <StatusPill tone="sky">{formState.type}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-muted">{draft.listingName}</p>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-dark">
                  ${formState.baseRate}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Capacity</span>
                <span className="text-sm font-semibold text-dark">{formState.capacity}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Beds</span>
                <span className="text-sm font-semibold text-dark">{formState.beds}</span>
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
