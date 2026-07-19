import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { HostPillButton } from '../../components/host/HostFormFields'
import { createHotel } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'
import useAuthStore from '../../stores/useAuthStore'
import {
  PROPERTY_CATEGORIES,
  TARGET_GUESTS,
  STAY_TYPES,
  getSubTypesForCategory,
  showsStarRating,
} from '../../constants/propertyCategories'

// ── Quick features offered in step 4 ─────────────────────────────────────────
const QUICK_FEATURES = [
  { id: 'family_friendly',      label: 'Family Friendly' },
  { id: 'pet_friendly',         label: 'Pet Friendly' },
  { id: 'spa',                  label: 'Spa' },
  { id: 'pool',                 label: 'Pool' },
  { id: 'breakfast_included',   label: 'Breakfast Included' },
  { id: 'eco_certified',        label: 'Eco Certified' },
  { id: 'wheelchair_accessible',label: 'Wheelchair Accessible' },
  { id: 'beach_access',         label: 'Beach Access' },
  { id: 'free_parking',         label: 'Free Parking' },
  { id: 'airport_shuttle',      label: 'Airport Shuttle' },
  { id: 'gym',                  label: 'Gym / Fitness' },
  { id: 'ev_charging',          label: 'EV Charging' },
]

const STAR_RATINGS = ['1', '2', '3', '4', '5']

const EMPTY_DRAFT = {
  category:     '',
  subTypes:     [],
  targetGuests: [],
  stayType:     'entire_property',
  title:        '',
  starRating:   '',
  numBedrooms:  '',
  numBathrooms: '',
  maxGuests:    '',
  numUnits:     '',
  checkInTime:  '15:00',
  checkOutTime: '11:00',
  amenities:    [],
}

// ── Small reusable pieces ────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="mb-8 flex items-center gap-1.5" aria-label={`Step ${step} of 4`}>
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            n <= step ? 'bg-dark' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function StepLabel({ step, title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Step {step} of 4</p>
      <h2 className="mt-2 text-2xl font-semibold text-dark">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  )
}

function NavRow({ onBack, onNext, onSkip, nextLabel = 'Continue', loading = false, nextDisabled = false }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
      >
        <ChevronLeft size={15} />
        Back
      </button>
      <div className="flex items-center gap-3">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-muted hover:text-dark"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="rounded-full bg-dark px-7 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Creating…' : nextLabel}
        </button>
      </div>
    </div>
  )
}

function FieldRow({ label, value, onChange, type = 'text', placeholder = '' }) {
  const isNumeric = type === 'number'
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-dark">{label}</span>
      <input
        type={isNumeric ? 'text' : type}
        inputMode={isNumeric ? 'numeric' : undefined}
        pattern={isNumeric ? '[0-9]*' : undefined}
        value={value}
        onChange={isNumeric ? (e) => { e.target.value = e.target.value.replace(/\D/g, ''); onChange(e) } : onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
      />
    </label>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function Step1({ draft, setDraft, onNext, onCancel }) {
  return (
    <div>
      <StepLabel
        step={1}
        title="What are you listing?"
        subtitle="Choose the category that best describes your property."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROPERTY_CATEGORIES.map((cat) => {
          const active = draft.category === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setDraft((prev) => ({ ...prev, category: cat.id, subTypes: [] }))
                onNext()
              }}
              className={`flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                active
                  ? 'border-dark bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span>
                <span className={`block text-sm font-semibold ${active ? 'text-dark' : 'text-dark'}`}>
                  {cat.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted leading-snug">{cat.description}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-10">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted hover:text-dark"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function Step2({ draft, setDraft, onNext, onBack }) {
  const subTypes = getSubTypesForCategory(draft.category)

  function toggle(id) {
    setDraft((prev) => ({
      ...prev,
      subTypes: prev.subTypes.includes(id)
        ? prev.subTypes.filter((s) => s !== id)
        : [...prev.subTypes, id],
    }))
  }

  const category = PROPERTY_CATEGORIES.find((c) => c.id === draft.category)

  return (
    <div>
      <StepLabel
        step={2}
        title={`Select the property type`}
        subtitle={`Choose all types that apply to your ${category?.label ?? 'property'}. You can select multiple.`}
      />
      <div className="flex flex-wrap gap-2">
        {subTypes.map((st) => (
          <HostPillButton
            key={st.id}
            active={draft.subTypes.includes(st.id)}
            onClick={() => toggle(st.id)}
          >
            {st.label}
          </HostPillButton>
        ))}
      </div>
      {draft.subTypes.length > 0 && (
        <p className="mt-4 text-xs text-muted">{draft.subTypes.length} selected</p>
      )}
      <NavRow
        onBack={onBack}
        onNext={onNext}
        onSkip={onNext}
        nextDisabled={false}
      />
    </div>
  )
}

function Step3({ draft, setDraft, onNext, onBack }) {
  function set(key, val) {
    setDraft((prev) => ({ ...prev, [key]: val }))
  }

  const needsStars = showsStarRating(draft.category)

  return (
    <div>
      <StepLabel
        step={3}
        title="Tell us about the property"
        subtitle="These details help guests understand what to expect."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldRow
            label="Property Name *"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g., Grand Harbor Hotel"
          />
        </div>

        {needsStars && (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-dark">Star Rating</label>
            <div className="flex flex-wrap gap-2">
              {STAR_RATINGS.map((s) => (
                <HostPillButton
                  key={s}
                  active={draft.starRating === s}
                  onClick={() => set('starRating', draft.starRating === s ? '' : s)}
                >
                  {'★'.repeat(Number(s))} {s} Star
                </HostPillButton>
              ))}
            </div>
          </div>
        )}

        <FieldRow
          label="Max Guests"
          value={draft.maxGuests}
          onChange={(e) => set('maxGuests', e.target.value)}
          type="number"
          placeholder="e.g., 4"
        />
        <FieldRow
          label="Number of Units / Rooms"
          value={draft.numUnits}
          onChange={(e) => set('numUnits', e.target.value)}
          type="number"
          placeholder="e.g., 20"
        />
        <FieldRow
          label="Bedrooms"
          value={draft.numBedrooms}
          onChange={(e) => set('numBedrooms', e.target.value)}
          type="number"
          placeholder="e.g., 2"
        />
        <FieldRow
          label="Bathrooms"
          value={draft.numBathrooms}
          onChange={(e) => set('numBathrooms', e.target.value)}
          type="number"
          placeholder="e.g., 2"
        />
        <FieldRow
          label="Check-in Time"
          value={draft.checkInTime}
          onChange={(e) => set('checkInTime', e.target.value)}
          type="time"
        />
        <FieldRow
          label="Check-out Time"
          value={draft.checkOutTime}
          onChange={(e) => set('checkOutTime', e.target.value)}
          type="time"
        />
      </div>
      <NavRow
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!draft.title.trim()}
      />
    </div>
  )
}

function Step4({ draft, setDraft, onSubmit, onBack, error, loading }) {
  function toggleAmenity(id) {
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }))
  }

  function toggleTargetGuest(id) {
    setDraft((prev) => ({
      ...prev,
      targetGuests: prev.targetGuests.includes(id)
        ? prev.targetGuests.filter((g) => g !== id)
        : [...prev.targetGuests, id],
    }))
  }

  return (
    <div>
      <StepLabel
        step={4}
        title="Add features"
        subtitle="Select what your property offers. You can add more later."
      />

      <div className="space-y-8">
        <div>
          <p className="mb-3 text-sm font-semibold text-dark">Key amenities</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_FEATURES.map((f) => (
              <HostPillButton
                key={f.id}
                active={draft.amenities.includes(f.id)}
                onClick={() => toggleAmenity(f.id)}
              >
                {f.label}
              </HostPillButton>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-dark">Target guests</p>
          <div className="flex flex-wrap gap-2">
            {TARGET_GUESTS.map((g) => (
              <HostPillButton
                key={g.id}
                active={draft.targetGuests.includes(g.id)}
                onClick={() => toggleTargetGuest(g.id)}
              >
                {g.label}
              </HostPillButton>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-dark">What will guests have access to?</p>
          <div className="flex flex-wrap gap-2">
            {STAY_TYPES.map((st) => (
              <HostPillButton
                key={st.id}
                active={draft.stayType === st.id}
                onClick={() => setDraft((prev) => ({ ...prev, stayType: st.id }))}
              >
                {st.label}
              </HostPillButton>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <NavRow
        onBack={onBack}
        onNext={onSubmit}
        nextLabel="Create listing"
        loading={loading}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HostCreateListingPage() {
  const navigate = useNavigate()
  const { hostId } = useHostContext()
  const initialize = useAuthStore((s) => s.initialize)
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  function goNext() { setStep((s) => Math.min(s + 1, 4)) }
  function goBack() {
    if (step === 1) navigate('/host/listings')
    else setStep((s) => s - 1)
  }

  async function handleSubmit() {
    setCreating(true)
    setCreateError(null)
    try {
      const payload = {
        hostId,
        name:         draft.title,
        category:     draft.category,
        subTypes:     draft.subTypes,
        targetGuests: draft.targetGuests,
        stayType:     draft.stayType,
        starRating:   draft.starRating ? Number(draft.starRating) : null,
        numBedrooms:  draft.numBedrooms ? Number(draft.numBedrooms) : null,
        numBathrooms: draft.numBathrooms ? Number(draft.numBathrooms) : null,
        maxGuests:    draft.maxGuests ? Number(draft.maxGuests) : null,
        numUnits:     draft.numUnits ? Number(draft.numUnits) : null,
        checkInTime:  draft.checkInTime || null,
        checkOutTime: draft.checkOutTime || null,
        amenities:    draft.amenities,
        status:       'DRAFT',
      }
      const created = await createHotel(payload)
      // Backend promotes this user to ROLE_HOST during hotel creation.
      // Refresh JWT so all subsequent host-gated API calls on the editor page succeed.
      await initialize()
      const newId = created?.id
      if (newId) {
        navigate(`/host/listings/${newId}/edit?tab=location`)
      } else {
        navigate('/host/listings')
      }
    } catch {
      setCreateError('Could not create the listing. Please check your details and try again.')
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      <div className="mx-auto max-w-2xl px-5 py-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold text-dark">New listing</p>
          <button
            type="button"
            onClick={() => navigate('/host/listings')}
            className="text-sm text-muted hover:text-dark"
          >
            Save &amp; exit
          </button>
        </div>

        <ProgressBar step={step} />

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          {step === 1 && (
            <Step1
              draft={draft}
              setDraft={setDraft}
              onNext={goNext}
              onCancel={() => navigate('/host/listings')}
            />
          )}
          {step === 2 && (
            <Step2
              draft={draft}
              setDraft={setDraft}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 3 && (
            <Step3
              draft={draft}
              setDraft={setDraft}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 4 && (
            <Step4
              draft={draft}
              setDraft={setDraft}
              onSubmit={handleSubmit}
              onBack={goBack}
              error={createError}
              loading={creating}
            />
          )}
        </div>

      </div>
    </div>
  )
}
