import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostPillButton, HostSelect, HostToggle } from '../../components/host/HostFormFields'
import RoomAmenitiesSelector from '../../components/host/RoomAmenitiesSelector'
import { createRoom, getRoom, updateRoom } from '../../services/hostListingsApi'
import { HOSTEL_ROOM_TYPES } from '../../constants/propertyCategories'

// Full room type list (Booking.com reference)
const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Superior Room',
  'Suite',
  'Junior Suite',
  'Executive Room',
  'Family Room',
  'Studio',
  'Villa Suite',
  'Residence',
  'Studio Loft',
  'Dormitory',
]

const BED_TYPES = [
  { value: 'king', label: 'King Bed' },
  { value: 'queen', label: 'Queen Bed' },
  { value: 'twin', label: 'Twin Beds' },
  { value: 'single', label: 'Single Bed' },
  { value: 'bunk', label: 'Bunk Bed' },
  { value: 'sofa_bed', label: 'Sofa Bed' },
  { value: 'floor_futon', label: 'Floor Futon' },
]

const VIEW_TYPES = [
  { value: 'sea_view', label: 'Sea View' },
  { value: 'city_view', label: 'City View' },
  { value: 'garden_view', label: 'Garden View' },
  { value: 'pool_view', label: 'Pool View' },
  { value: 'mountain_view', label: 'Mountain View' },
  { value: 'no_view', label: 'No View' },
]

const SMOKING_POLICIES = ['Non-Smoking', 'Smoking', 'Both Available']

const EMPTY_ROOM_DRAFT = {
  roomId: null,
  listingId: '',
  listingName: '',
  name: '',
  type: 'Standard Room',
  status: 'Ready',
  floor: '',
  capacity: '',
  maxGuests: '',
  beds: '',
  baths: '',
  baseRate: '',
  roomSize: '',
  bedType: 'king',
  numberOfBeds: '1',
  view: 'no_view',
  smokingPolicy: 'Non-Smoking',
  isAccessible: false,
  hasPrivateBathroom: true,
  roomDescription: '',
  roomAmenities: [],
  upsells: '',
  note: '',
}

function typeEnumToLabel(type) {
  if (!type) return 'Standard Room'
  const label = type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
  return ROOM_TYPES.find((t) => t.toLowerCase() === label.toLowerCase()) ?? 'Standard Room'
}

export default function HostRoomEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isHostel = searchParams.get('category') === 'hostel'
  const effectiveRoomTypes = isHostel ? HOSTEL_ROOM_TYPES : ROOM_TYPES
  const [formState, setFormState] = useState({
    ...EMPTY_ROOM_DRAFT,
    type: isHostel ? 'Mixed Dorm' : 'Standard Room',
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
          roomId:          r.id,
          listingId:       r.hotelId != null ? String(r.hotelId) : prev.listingId,
          name:            r.number ?? r.name ?? prev.name,
          type:            typeEnumToLabel(r.type),
          status:          r.available === false ? 'Blocked' : 'Ready',
          baseRate:        r.pricePerNight != null ? String(r.pricePerNight) : prev.baseRate,
          capacity:        r.capacity != null ? String(r.capacity) : prev.capacity,
          maxGuests:       r.maxOccupancy != null ? String(r.maxOccupancy) : prev.maxGuests,
          roomSize:        r.roomSize != null ? String(r.roomSize) : prev.roomSize,
          bedType:         r.bedType ?? prev.bedType,
          numberOfBeds:    r.numberOfBeds != null ? String(r.numberOfBeds) : prev.numberOfBeds,
          view:            r.view ?? prev.view,
          smokingPolicy:   r.smokingPolicy ?? prev.smokingPolicy,
          isAccessible:    r.isAccessible ?? prev.isAccessible,
          hasPrivateBathroom: r.hasPrivateBathroom ?? prev.hasPrivateBathroom,
          roomDescription: r.roomDescription ?? r.description ?? prev.roomDescription,
          roomAmenities:   r.roomAmenities ?? r.amenities ?? prev.roomAmenities,
          floor:           r.floor != null ? String(r.floor) : prev.floor,
          beds:            r.bedConfiguration ?? r.beds ?? prev.beds,
          baths:           r.bathrooms != null ? String(r.bathrooms) : prev.baths,
          note:            r.description ?? prev.note,
        }))
      })
      .catch(() => {})
  }, [id])

  const setField = (key, val) =>
    setFormState((prev) => ({ ...prev, [key]: val }))

  const fieldHandler = (key) => (e) => setField(key, e.target.value)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      // ── Room payload — field names match backend Room entity ─────────────────
      const payload = {
        hotelId:         Number(formState.listingId) || null,
        type:            formState.type?.toUpperCase().replace(/\s+/g, '_') ?? 'STANDARD_ROOM',
        number:          formState.name,
        pricePerNight:   Number(formState.baseRate) || 0,
        capacity:        Number(formState.maxGuests) || Number(formState.capacity) || 2,
        available:       formState.status?.toLowerCase() !== 'blocked',
        // backend field names
        size:            formState.roomSize ? Number(formState.roomSize) : null,        // backend: size
        bedType:         formState.bedType || null,
        numberOfBeds:    formState.numberOfBeds ? Number(formState.numberOfBeds) : null,
        view:            formState.view || null,
        smokingAllowed:  formState.smokingPolicy !== 'Non-Smoking',                     // backend: smokingAllowed (boolean)
        accessibleRoom:  formState.isAccessible,                                        // backend: accessibleRoom
        privateBathroom: formState.hasPrivateBathroom,                                  // backend: privateBathroom
        description:     formState.roomDescription || null,                             // backend: description
        amenities:       formState.roomAmenities,                                       // backend: amenities
        floor:           formState.floor || null,
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
      description="Configure room details, bed setup, view, accessibility, and amenities."
      actions={[
        { label: 'Back to rooms', href: `/host/listings/${formState.listingId}/rooms`, secondary: true },
        { label: saving ? 'Saving…' : 'Save room', onClick: handleSave },
      ]}
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: saving ? 'Saving…' : 'Save room', onClick: handleSave }}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">

          {/* ── Core details ── */}
          <SectionCard>
            <SectionHeading eyebrow="Room Details" title="Basic information" />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <HostField label="Room name / number" value={formState.name} onChange={fieldHandler('name')} placeholder="e.g., Lagoon Suite 101" />
              <HostField label="Listing ID" value={String(formState.listingId)} onChange={fieldHandler('listingId')} placeholder="13" type="number" />
              <HostField label="Base rate (per night)" value={formState.baseRate} onChange={fieldHandler('baseRate')} placeholder="360" type="number" />
              <HostField label="Room size (m²)" value={formState.roomSize} onChange={fieldHandler('roomSize')} placeholder="32" type="number" />
              <HostField label="Max guests" value={formState.maxGuests} onChange={fieldHandler('maxGuests')} placeholder="2" type="number" />
              <HostField label="Number of beds" value={formState.numberOfBeds} onChange={fieldHandler('numberOfBeds')} placeholder="1" type="number" />
              <HostField label="Floor / zone" value={formState.floor} onChange={fieldHandler('floor')} placeholder="e.g., Beachfront, Floor 4" />
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Status</label>
                <div className="flex gap-2">
                  {['Ready', 'Blocked'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField('status', s)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        formState.status === s
                          ? 'border-dark bg-dark text-white'
                          : 'border-gray-200 bg-white text-dark hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Room type ── */}
          <SectionCard>
            <SectionHeading eyebrow="Room Details" title="Room type" description="Select the type that best matches this room's configuration." />
            <div className="mt-5 flex flex-wrap gap-2">
              {effectiveRoomTypes.map((type) => (
                <HostPillButton
                  key={type}
                  active={formState.type === type}
                  onClick={() => setField('type', type)}
                >
                  {type}
                </HostPillButton>
              ))}
            </div>
          </SectionCard>

          {/* ── Bed & view config ── */}
          <SectionCard>
            <SectionHeading eyebrow="Room Details" title="Bed type & view" />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <HostSelect
                label="Bed type"
                value={formState.bedType}
                onChange={fieldHandler('bedType')}
                options={BED_TYPES}
              />
              <HostSelect
                label="View"
                value={formState.view}
                onChange={fieldHandler('view')}
                options={VIEW_TYPES}
              />
            </div>

            <div className="mt-5">
              <label className="mb-3 block text-sm font-semibold text-dark">Smoking policy</label>
              <div className="flex flex-wrap gap-2">
                {SMOKING_POLICIES.map((p) => (
                  <HostPillButton
                    key={p}
                    active={formState.smokingPolicy === p}
                    onClick={() => setField('smokingPolicy', p)}
                  >
                    {p}
                  </HostPillButton>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <HostToggle
                label="Accessible room"
                description="This room meets accessibility requirements (wheelchair access, roll-in shower, etc.)."
                checked={formState.isAccessible}
                onChange={(e) => setField('isAccessible', e.target.checked)}
              />
              <HostToggle
                label="Private bathroom"
                description="The room has an en-suite private bathroom."
                checked={formState.hasPrivateBathroom}
                onChange={(e) => setField('hasPrivateBathroom', e.target.checked)}
              />
            </div>
          </SectionCard>

          {/* ── Description ── */}
          <SectionCard>
            <SectionHeading eyebrow="Room Details" title="Room description" />
            <div className="mt-5">
              <textarea
                value={formState.roomDescription}
                onChange={fieldHandler('roomDescription')}
                placeholder="Describe the room's highlights, décor, and unique features guests will love…"
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
              />
              <p className="mt-1 text-xs text-muted">{formState.roomDescription.length}/500</p>
            </div>
          </SectionCard>

          {/* ── Room amenities ── */}
          <SectionCard>
            <SectionHeading eyebrow="Room Amenities" title="In-room amenities" description="Select all facilities and services available in this specific room." />
            <div className="mt-6">
              <RoomAmenitiesSelector
                value={formState.roomAmenities}
                onChange={(val) => setField('roomAmenities', val)}
              />
            </div>
          </SectionCard>

          {/* ── Operations note ── */}
          <SectionCard>
            <SectionHeading eyebrow="Operations" title="Room note" description="Internal note for housekeeping and operations. Not shown to guests." />
            <div className="mt-5">
              <HostField
                label="Operations note"
                value={formState.note}
                onChange={fieldHandler('note')}
                placeholder="What should operations remember about this room?"
                textarea
              />
            </div>
          </SectionCard>

          {saveError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/host/listings/${formState.listingId}/rooms`)}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save room'}
            </button>
          </div>
        </div>

        {/* Sidebar preview */}
        <div className="space-y-5">
          <SectionCard>
            <div className="flex items-start gap-4">
              <div className="rounded-[20px] bg-slate-100 p-4 text-dark">
                <BedDouble size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-semibold text-dark">{formState.name || 'New room'}</p>
                  <StatusPill tone="sky">{formState.type}</StatusPill>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-dark">
                  {formState.baseRate ? `$${formState.baseRate}/night` : '—'}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="grid gap-3">
              {[
                ['Max guests', formState.maxGuests || formState.capacity || '—'],
                ['Room size', formState.roomSize ? `${formState.roomSize} m²` : '—'],
                ['Bed type', BED_TYPES.find((b) => b.value === formState.bedType)?.label ?? '—'],
                ['Number of beds', formState.numberOfBeds || '—'],
                ['View', VIEW_TYPES.find((v) => v.value === formState.view)?.label ?? '—'],
                ['Smoking', formState.smokingPolicy],
                ['Accessible', formState.isAccessible ? 'Yes' : 'No'],
                ['Private bathroom', formState.hasPrivateBathroom ? 'Yes' : 'No'],
                ['Status', formState.status],
                ['Amenities', `${formState.roomAmenities.length} selected`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">{k}</span>
                  <span className="text-right font-semibold text-dark">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </HostShell>
  )
}
