import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Minus, Plus, Upload, X,
  Wifi, Waves, Utensils, Car, AirVent, WashingMachine,
  Tv, Dumbbell, Coffee, Flame, PawPrint, Snowflake,
  Loader2, CheckCircle2, AlertCircle,
  Zap, DoorOpen, PartyPopper, Users,
} from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import useOnboardingStore from '../stores/useOnboardingStore'
import useAuthStore from '../stores/useAuthStore'
import { publishListing } from '../services/listingsApi'
import useCurrency from '../hooks/useCurrency'
import TravolishWordmark from '../components/common/TravolishWordmark'
import {
  PROPERTY_CATEGORIES,
  TARGET_GUESTS,
  STAY_TYPES,
  getSubTypesForCategory,
  showsStarRating,
} from '../constants/propertyCategories'

const AMENITY_LIST = [
  { id: 'wifi',      icon: Wifi,           label: 'Wi-Fi' },
  { id: 'pool',      icon: Waves,          label: 'Pool' },
  { id: 'kitchen',   icon: Utensils,       label: 'Kitchen' },
  { id: 'parking',   icon: Car,            label: 'Free Parking' },
  { id: 'ac',        icon: AirVent,        label: 'Air Conditioning' },
  { id: 'washer',    icon: WashingMachine, label: 'Washer' },
  { id: 'tv',        icon: Tv,             label: 'TV' },
  { id: 'gym',       icon: Dumbbell,       label: 'Gym' },
  { id: 'coffee',    icon: Coffee,         label: 'Coffee Maker' },
  { id: 'fireplace', icon: Flame,          label: 'Fireplace' },
  { id: 'pets',      icon: PawPrint,       label: 'Pet Friendly' },
  { id: 'ski',       icon: Snowflake,      label: 'Ski-in / Ski-out' },
]

const BOOKING_PREF_LIST = [
  {
    id: 'instantBook',
    icon: Zap,
    label: 'Instant Booking',
    description: 'Guests can book without waiting for your approval.',
  },
  {
    id: 'selfCheckIn',
    icon: DoorOpen,
    label: 'Self Check-In',
    description: 'Guests can check in on their own using a smart lock or key box.',
  },
  {
    id: 'petsAllowed',
    icon: PawPrint,
    label: 'Pets Allowed',
    description: 'Allow guests to bring well-behaved pets.',
  },
  {
    id: 'eventsAllowed',
    icon: PartyPopper,
    label: 'Events Allowed',
    description: 'Allow small gatherings or events at your property.',
  },
]

const STAR_RATINGS = ['1', '2', '3', '4', '5']

const STEPS = [
  { number: 1, label: 'Property type' },
  { number: 2, label: 'Property sub-type' },
  { number: 3, label: 'About your place' },
  { number: 4, label: 'Basics & timing' },
  { number: 5, label: 'Amenities' },
  { number: 6, label: 'Features & guests' },
  { number: 7, label: 'Photos' },
  { number: 8, label: 'Pricing' },
]

const TOTAL_STEPS = STEPS.length

export default function OnboardingPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const {
    currentStep, draftData, setStep,
    updateDraft, updateBasics, updateBookingSettings, updatePricing, resetDraft,
  } = useOnboardingStore()
  const initialize = useAuthStore((s) => s.initialize)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [published, setPublished] = useState(null)
  const { formatCurrency } = useCurrency()

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!draftData.propertyType
      case 2: return true
      case 3: return !!draftData.title.trim()
      case 4: return true
      case 5: return draftData.amenities.length > 0
      case 6: return true
      case 7: return draftData.photos.length > 0
      case 8: return !!draftData.pricing.weekday
      default: return false
    }
  }

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setStep(currentStep + 1)
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      // After the hotel is persisted the backend promotes this user to ROLE_HOST.
      // We refresh the JWT here so the subsequent POST /api/rooms call carries the new role.
      const result = await publishListing(draftData, () => initialize())
      setPublished(result)
      resetDraft()
    } catch {
      setSubmitError('Something went wrong publishing your listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setStep(currentStep - 1)
    else navigate('/')
  }

  const stepLabel = STEPS[currentStep - 1]?.label ?? ''

  // ── Success screen ───────────────────────────────────────────────────────────
  if (published) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </span>
          <h1 className="text-[28px] font-semibold text-dark mb-3">You're live!</h1>
          <p className="text-muted mb-2">
            <span className="font-semibold text-dark">{published.hotel.name}</span>{' '}
            has been published (#{published.hotel.id}).
          </p>
          <p className="text-sm text-muted mb-8">
            Room {published.room.number} · {published.room.type} · {formatCurrency(published.room.pricePerNight)} per night
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/property/${published.hotel.id}`)}
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-2xl transition-colors"
            >
              View your listing
            </button>
            <button
              onClick={() => navigate('/host')}
              className="px-6 py-3 border border-gray-200 text-dark text-sm font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
            >
              Go to host dashboard
            </button>
          </div>
        </Motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/"><TravolishWordmark className="h-7" /></Link>
          <button
            onClick={() => { resetDraft(); navigate('/') }}
            className="text-sm font-semibold text-dark hover:text-muted transition-colors"
          >
            Save &amp; exit
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-1 flex-shrink-0">
        <Motion.div
          className="h-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      </div>

      {/* Step label */}
      <div className="border-b border-gray-100 px-6 py-2.5 flex-shrink-0">
        <p className="max-w-4xl mx-auto text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Step {currentStep} of {TOTAL_STEPS} · {stepLabel}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 md:py-14">
          <AnimatePresence mode="wait">
            <Motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              {currentStep === 1 && (
                <StepPropertyType
                  selected={draftData.propertyType}
                  onSelect={(type) => {
                    updateDraft('propertyType', type)
                    updateDraft('subTypes', [])
                    setStep(2)
                  }}
                />
              )}
              {currentStep === 2 && (
                <StepSubTypes
                  propertyType={draftData.propertyType}
                  selected={draftData.subTypes}
                  onToggle={(id) => {
                    const current = draftData.subTypes
                    const updated = current.includes(id)
                      ? current.filter((s) => s !== id)
                      : [...current, id]
                    updateDraft('subTypes', updated)
                  }}
                />
              )}
              {currentStep === 3 && (
                <StepAbout
                  title={draftData.title}
                  description={draftData.description}
                  location={draftData.location}
                  onTitleChange={(v) => updateDraft('title', v)}
                  onDescriptionChange={(v) => updateDraft('description', v)}
                  onLocationChange={(v) => updateDraft('location', { ...draftData.location, ...v })}
                />
              )}
              {currentStep === 4 && (
                <StepBasics
                  propertyType={draftData.propertyType}
                  basics={draftData.basics}
                  starRating={draftData.starRating}
                  checkInTime={draftData.checkInTime}
                  checkOutTime={draftData.checkOutTime}
                  numUnits={draftData.numUnits}
                  onUpdateBasics={updateBasics}
                  onUpdate={updateDraft}
                />
              )}
              {currentStep === 5 && (
                <StepAmenities
                  selected={draftData.amenities}
                  onToggle={(amenity) => {
                    const updated = draftData.amenities.includes(amenity)
                      ? draftData.amenities.filter((a) => a !== amenity)
                      : [...draftData.amenities, amenity]
                    updateDraft('amenities', updated)
                  }}
                />
              )}
              {currentStep === 6 && (
                <StepFeaturesAndGuests
                  bookingSettings={draftData.bookingSettings}
                  targetGuests={draftData.targetGuests}
                  stayType={draftData.stayType}
                  onToggleBooking={updateBookingSettings}
                  onToggleGuest={(id) => {
                    const current = draftData.targetGuests
                    const updated = current.includes(id)
                      ? current.filter((g) => g !== id)
                      : [...current, id]
                    updateDraft('targetGuests', updated)
                  }}
                  onStayType={(v) => updateDraft('stayType', v)}
                />
              )}
              {currentStep === 7 && (
                <StepPhotos
                  photos={draftData.photos}
                  onPhotos={(photos) => updateDraft('photos', photos)}
                />
              )}
              {currentStep === 8 && (
                <StepPricing pricing={draftData.pricing} onUpdate={updatePricing} />
              )}
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer navigation */}
      <footer className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {submitError && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="text-sm font-semibold text-dark hover:text-muted disabled:opacity-40 transition-colors"
            >
              {currentStep === 1 ? 'Exit' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Publishing…</>
              ) : currentStep === TOTAL_STEPS ? (
                'Publish listing'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Step 1: Property Type ─────────────────────────────────────────────────── */

function StepPropertyType({ selected, onSelect }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        Which of these best describes your place?
      </h1>
      <p className="text-muted mb-8">Pick the type that guests would most recognise.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROPERTY_CATEGORIES.map(({ id, emoji, label, description }) => {
          const isActive = selected === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                isActive
                  ? 'border-brand bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span>
                <span className={`block text-sm font-semibold ${isActive ? 'text-brand' : 'text-dark'}`}>
                  {label}
                </span>
                <span className="mt-0.5 block text-xs text-muted leading-snug">{description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Step 2: Sub-type ──────────────────────────────────────────────────────── */

function StepSubTypes({ propertyType, selected, onToggle }) {
  const category = PROPERTY_CATEGORIES.find((c) => c.id === propertyType)
  const subTypes = getSubTypesForCategory(propertyType)

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        What type of {category?.label.toLowerCase() ?? 'property'} is it?
      </h1>
      <p className="text-muted mb-8">
        Select all that apply — this helps guests find you in the right searches.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {subTypes.map((st) => {
          const isActive = selected.includes(st.id)
          return (
            <button
              key={st.id}
              onClick={() => onToggle(st.id)}
              className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                isActive
                  ? 'border-brand bg-rose-50 text-brand font-semibold'
                  : 'border-gray-200 text-gray-700 font-medium hover:border-gray-400'
              }`}
            >
              {st.label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted mt-5">{selected.length} selected · you can pick multiple</p>
      )}
    </div>
  )
}

/* ─── Step 3: About Your Place ──────────────────────────────────────────────── */

function StepAbout({ title, description, location, onTitleChange, onDescriptionChange, onLocationChange }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        Tell guests about your place
      </h1>
      <p className="text-muted mb-8">
        A great title and description help your listing stand out.
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Listing title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Sunlit studio near the old town"
            maxLength={80}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base text-dark bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
          />
          <p className="text-xs text-muted mt-1.5">{title.length}/80</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe what makes your place special — the vibe, the views, what's nearby…"
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm text-dark bg-[#fcfcfb] outline-none focus:border-brand resize-none transition-colors"
          />
          <p className="text-xs text-muted mt-1.5">{description.length}/500</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">City</label>
            <input
              type="text"
              value={location?.city || ''}
              onChange={(e) => onLocationChange({ city: e.target.value })}
              placeholder="e.g. Paris"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base text-dark bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">Country</label>
            <input
              type="text"
              value={location?.country || ''}
              onChange={(e) => onLocationChange({ country: e.target.value })}
              placeholder="e.g. France"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base text-dark bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 4: Basics & Timing ───────────────────────────────────────────────── */

function StepBasics({ propertyType, basics, starRating, checkInTime, checkOutTime, numUnits, onUpdateBasics, onUpdate }) {
  const needsStars = showsStarRating(propertyType)

  const counterFields = [
    { key: 'guests',    label: 'Guests',    desc: 'Maximum number of guests',     min: 1, max: 50 },
    { key: 'bedrooms',  label: 'Bedrooms',  desc: 'Total bedrooms available',      min: 0, max: 30 },
    { key: 'beds',      label: 'Beds',      desc: 'Total beds in the property',    min: 1, max: 50 },
    { key: 'bathrooms', label: 'Bathrooms', desc: 'Private and shared combined',   min: 1, max: 20 },
  ]

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        Share some basics about your place
      </h1>
      <p className="text-muted mb-8">Guests filter by these, so keep them accurate.</p>

      {/* Stepper counters */}
      <div className="divide-y divide-gray-100 border-t border-gray-100 mb-8">
        {counterFields.map((field) => (
          <div key={field.key} className="flex items-center justify-between py-5">
            <div>
              <p className="text-base font-semibold text-dark">{field.label}</p>
              <p className="text-xs text-muted mt-0.5">{field.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onUpdateBasics(field.key, Math.max(field.min, basics[field.key] - 1))}
                disabled={basics[field.key] <= field.min}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={15} />
              </button>
              <span className="text-base font-semibold w-7 text-center tabular-nums">{basics[field.key]}</span>
              <button
                onClick={() => onUpdateBasics(field.key, Math.min(field.max, basics[field.key] + 1))}
                disabled={basics[field.key] >= field.max}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Number of units */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
          Number of units / rooms
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={numUnits ?? ''}
          onChange={(e) => onUpdate('numUnits', e.target.value.replace(/\D/g, '') || null)}
          placeholder="e.g. 20 (for hotels) or 1 (for a house)"
          className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base text-dark bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
        />
      </div>

      {/* Star rating — hotels and resorts only */}
      {needsStars && (
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-3">
            Star rating
          </label>
          <div className="flex flex-wrap gap-2">
            {STAR_RATINGS.map((s) => {
              const isActive = starRating === s
              return (
                <button
                  key={s}
                  onClick={() => onUpdate('starRating', isActive ? null : s)}
                  className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                    isActive
                      ? 'border-brand bg-rose-50 text-brand font-semibold'
                      : 'border-gray-200 text-gray-700 font-medium hover:border-gray-400'
                  }`}
                >
                  {'★'.repeat(Number(s))} {s} Star
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Check-in / Check-out */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Check-in time
          </label>
          <input
            type="time"
            value={checkInTime}
            onChange={(e) => onUpdate('checkInTime', e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base text-dark bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Check-out time
          </label>
          <input
            type="time"
            value={checkOutTime}
            onChange={(e) => onUpdate('checkOutTime', e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base text-dark bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 5: Amenities ─────────────────────────────────────────────────────── */

function StepAmenities({ selected, onToggle }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        What does your place offer?
      </h1>
      <p className="text-muted mb-8">Select at least one. You can add more later in your listing editor.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AMENITY_LIST.map(({ id, icon: Icon, label }) => {
          const isActive = selected.includes(id)
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                isActive
                  ? 'border-brand bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={isActive ? 'text-brand flex-shrink-0' : 'text-gray-500 flex-shrink-0'}
              />
              <span className={`text-sm ${isActive ? 'font-semibold text-brand' : 'text-gray-700'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Step 6: Features & Guests ─────────────────────────────────────────────── */

function StepFeaturesAndGuests({ bookingSettings, targetGuests, stayType, onToggleBooking, onToggleGuest, onStayType }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        Features & guest preferences
      </h1>
      <p className="text-muted mb-8">
        These help guests know what to expect — all can be changed anytime from your dashboard.
      </p>

      {/* Booking preferences */}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-3">Booking options</p>
      <div className="space-y-3 mb-8">
        {BOOKING_PREF_LIST.map(({ id, icon: Icon, label, description }) => {
          const isActive = bookingSettings[id]
          return (
            <button
              key={id}
              onClick={() => onToggleBooking(id, !isActive)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                isActive
                  ? 'border-brand bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                isActive ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'
              }`}>
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${isActive ? 'text-brand' : 'text-dark'}`}>{label}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
              </div>
              <div className={`ml-auto flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0.5 transition-colors ${
                isActive ? 'bg-brand' : 'bg-gray-200'
              }`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Target guests */}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-3">Who's this place best for?</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {TARGET_GUESTS.map((g) => {
          const isActive = targetGuests.includes(g.id)
          return (
            <button
              key={g.id}
              onClick={() => onToggleGuest(g.id)}
              className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                isActive
                  ? 'border-brand bg-rose-50 text-brand font-semibold'
                  : 'border-gray-200 text-gray-700 font-medium hover:border-gray-400'
              }`}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* Stay type */}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-3">What will guests have access to?</p>
      <div className="flex flex-wrap gap-2">
        {STAY_TYPES.map((st) => {
          const isActive = stayType === st.id
          return (
            <button
              key={st.id}
              onClick={() => onStayType(st.id)}
              className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                isActive
                  ? 'border-brand bg-rose-50 text-brand font-semibold'
                  : 'border-gray-200 text-gray-700 font-medium hover:border-gray-400'
              }`}
            >
              {st.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Step 7: Photos ────────────────────────────────────────────────────────── */

function StepPhotos({ photos, onPhotos }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      const newPhotos = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      onPhotos([...photos, ...newPhotos])
    },
  })

  const removePhoto = (index) => onPhotos(photos.filter((_, i) => i !== index))

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        Add some photos of your place
      </h1>
      <p className="text-muted mb-8">
        Listings with at least 5 high-quality photos get significantly more bookings.
      </p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-brand bg-rose-50'
            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
          isDragActive ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'
        }`}>
          <Upload size={24} />
        </span>
        <p className="text-base font-semibold text-dark">
          {isDragActive ? 'Drop photos here' : 'Drag photos here, or click to browse'}
        </p>
        <p className="text-sm text-muted mt-1">PNG, JPG, WEBP up to 20 MB each</p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
              <img
                src={photo.preview}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={13} />
              </button>
              {i === 0 && (
                <div className="absolute bottom-2 left-2 bg-white/95 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm">
                  Cover photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Step 8: Pricing ───────────────────────────────────────────────────────── */

function StepPricing({ pricing, onUpdate }) {
  const { currency, formatCurrency } = useCurrency()
  const estimatedWeekly = Math.round(
    pricing.weekday * 5 * 0.97 + (pricing.weekend || pricing.weekday) * 2 * 0.97,
  )

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-dark mb-2">
        Set your price
      </h1>
      <p className="text-muted mb-8">
        You can always adjust pricing later — start with something competitive for your area.
      </p>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Base price per night
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">{currency}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pricing.weekday}
              onChange={(e) => onUpdate('weekday', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-2xl font-semibold text-center bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Weekend price <span className="normal-case font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">{currency}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pricing.weekend}
              onChange={(e) => onUpdate('weekend', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-2xl font-semibold text-center bg-[#fcfcfb] outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {pricing.weekday > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5 mt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-3">Estimated weekly earnings</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-dark">
                {formatCurrency(estimatedWeekly)}
              </span>
              <span className="text-muted text-sm">/ week after service fees</span>
            </div>
            <p className="mt-2 text-xs text-muted">Based on 5 weekday nights + 2 weekend nights at 97% occupancy.</p>
          </div>
        )}
      </div>
    </div>
  )
}
