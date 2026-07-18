import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Building2, Hotel, TreePine, Tent, Castle, Warehouse,
  Minus, Plus, Upload, X,
  Wifi, Waves, Utensils, Car, AirVent, WashingMachine,
  Tv, Dumbbell, Coffee, Flame, PawPrint, Snowflake,
  Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import useOnboardingStore from '../stores/useOnboardingStore'
import { publishListing } from '../services/listingsApi'
import useCurrency from '../hooks/useCurrency'

const PROPERTY_TYPE_ICONS = [
  { id: 'house', icon: Home },
  { id: 'apartment', icon: Building2 },
  { id: 'guesthouse', icon: Hotel },
  { id: 'cabin', icon: TreePine },
  { id: 'tent', icon: Tent },
  { id: 'castle', icon: Castle },
  { id: 'barn', icon: Warehouse },
]

const AMENITY_ICONS = [
  { id: 'wifi', icon: Wifi },
  { id: 'pool', icon: Waves },
  { id: 'kitchen', icon: Utensils },
  { id: 'parking', icon: Car },
  { id: 'ac', icon: AirVent },
  { id: 'washer', icon: WashingMachine },
  { id: 'tv', icon: Tv },
  { id: 'gym', icon: Dumbbell },
  { id: 'coffee', icon: Coffee },
  { id: 'fireplace', icon: Flame },
  { id: 'pets', icon: PawPrint },
  { id: 'ski', icon: Snowflake },
]

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const {
    currentStep, draftData, setStep,
    updateDraft, updateBasics, updatePricing, resetDraft
  } = useOnboardingStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [published, setPublished] = useState(null) // { hotel, room }
  const { formatCurrency } = useCurrency()

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!draftData.propertyType
      case 2: return !!draftData.title
      case 3: return true
      case 4: return draftData.amenities.length > 0
      case 5: return draftData.photos.length > 0
      case 6: return !!draftData.pricing.weekday
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
      const result = await publishListing(draftData)
      setPublished(result)
      resetDraft()
    } catch {
      setSubmitError(t('common:onboarding.publishError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1)
    } else {
      navigate('/')
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (published) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-[28px] font-bold text-dark mb-3">{t('common:onboarding.successTitle')}</h1>
          <p className="text-muted mb-2">
            <span className="font-semibold text-dark">{published.hotel.name}</span>{' '}
            {t('common:onboarding.successPublished', { id: published.hotel.id })}
          </p>
          <p className="text-sm text-muted mb-8">
            {t('common:onboarding.successRoom', {
              number: published.room.number,
              type: published.room.type,
              price: formatCurrency(published.room.pricePerNight),
            })}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/property/${published.hotel.id}`)}
              className="px-6 py-3 bg-dark text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
            >
              {t('common:onboarding.viewListing')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-200 text-dark text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              {t('common:actions.back')}
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
          <button
            onClick={() => navigate('/')}
            className="text-brand text-xl font-extrabold tracking-tight"
          >
            travolish
          </button>
          <button
            onClick={() => { resetDraft(); navigate('/'); }}
            className="text-sm font-semibold text-dark underline hover:text-muted transition-colors"
          >
            {t('common:onboarding.saveExit')}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1 flex-shrink-0">
        <Motion.div
          className="h-full bg-dark"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 md:py-16">
          <AnimatePresence mode="wait">
            <Motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === 1 && (
                <StepPropertyType
                  selected={draftData.propertyType}
                  onSelect={(type) => updateDraft('propertyType', type)}
                />
              )}
              {currentStep === 2 && (
                <StepTitleDescription
                  title={draftData.title}
                  description={draftData.description}
                  location={draftData.location}
                  onTitleChange={(v) => updateDraft('title', v)}
                  onDescriptionChange={(v) => updateDraft('description', v)}
                  onLocationChange={(v) => updateDraft('location', { ...draftData.location, ...v })}
                />
              )}
              {currentStep === 3 && (
                <StepBasics
                  basics={draftData.basics}
                  onUpdate={updateBasics}
                />
              )}
              {currentStep === 4 && (
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
              {currentStep === 5 && (
                <StepPhotos
                  photos={draftData.photos}
                  onPhotos={(photos) => updateDraft('photos', photos)}
                />
              )}
              {currentStep === 6 && (
                <StepPricing
                  pricing={draftData.pricing}
                  onUpdate={updatePricing}
                />
              )}
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {submitError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-sm font-semibold text-dark underline hover:text-muted disabled:opacity-40 transition-colors"
            >
              {t('common:actions.back')}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-dark to-gray-800 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> {t('common:onboarding.publishing')}</>
              ) : currentStep === TOTAL_STEPS ? (
                t('common:onboarding.publishListing')
              ) : (
                t('common:actions.next')
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Step Components ─── */

function StepPropertyType({ selected, onSelect }) {
  const { t } = useTranslation('common')
  const propertyTypes = useMemo(() =>
    PROPERTY_TYPE_ICONS.map(({ id, icon }) => ({ id, icon, label: t(`common:propertyType.${id}`) })),
    [t]
  )
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        {t('common:onboarding.step1Title')}
      </h1>
      <p className="text-muted mb-8">{t('common:onboarding.step1Desc')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {propertyTypes.map(({ id, icon: Icon, label }) => {
          const isActive = selected === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:border-dark ${
                isActive
                  ? 'border-dark bg-gray-50 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={32} strokeWidth={1.5} className={isActive ? 'text-dark' : 'text-gray-500'} />
              <span className={`text-sm ${isActive ? 'font-bold text-dark' : 'font-medium text-gray-600'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepTitleDescription({ title, description, location, onTitleChange, onDescriptionChange, onLocationChange }) {
  const { t } = useTranslation('common')
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        {t('common:onboarding.step2Title')}
      </h1>
      <p className="text-muted mb-8">
        {t('common:onboarding.step2Desc')}
      </p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">{t('common:onboarding.titleLabel')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('common:onboarding.titlePlaceholder')}
            maxLength={80}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
          />
          <p className="text-xs text-muted mt-1.5">{title.length}/80</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">{t('common:onboarding.descLabel')}</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('common:onboarding.descPlaceholder')}
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
          />
          <p className="text-xs text-muted mt-1.5">{description.length}/500</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">{t('common:onboarding.cityLabel')}</label>
            <input
              type="text"
              value={location?.city || ''}
              onChange={(e) => onLocationChange({ city: e.target.value })}
              placeholder="e.g., Paris"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">{t('common:onboarding.countryLabel')}</label>
            <input
              type="text"
              value={location?.country || ''}
              onChange={(e) => onLocationChange({ country: e.target.value })}
              placeholder="e.g., France"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepBasics({ basics, onUpdate }) {
  const { t } = useTranslation('common')
  const fields = useMemo(() => [
    { key: 'guests', label: t('common:onboarding.basicsGuests'), min: 1, max: 16 },
    { key: 'bedrooms', label: t('common:onboarding.basicsBedrooms'), min: 1, max: 20 },
    { key: 'beds', label: t('common:onboarding.basicsBeds'), min: 1, max: 20 },
    { key: 'bathrooms', label: t('common:onboarding.basicsBathrooms'), min: 1, max: 10 },
  ], [t])

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        {t('common:onboarding.step3Title')}
      </h1>
      <p className="text-muted mb-10">{t('common:onboarding.step3Desc')}</p>
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center justify-between py-4 border-b border-gray-200">
            <span className="text-base font-medium text-dark">{field.label}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onUpdate(field.key, Math.max(field.min, basics[field.key] - 1))}
                disabled={basics[field.key] <= field.min}
                className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center hover:border-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-base font-semibold w-8 text-center">{basics[field.key]}</span>
              <button
                onClick={() => onUpdate(field.key, Math.min(field.max, basics[field.key] + 1))}
                disabled={basics[field.key] >= field.max}
                className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center hover:border-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepAmenities({ selected, onToggle }) {
  const { t } = useTranslation('common')
  const amenitiesList = useMemo(() =>
    AMENITY_ICONS.map(({ id, icon }) => ({ id, icon, label: t(`common:amenity.${id}`) })),
    [t]
  )
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        {t('common:onboarding.step4Title')}
      </h1>
      <p className="text-muted mb-8">{t('common:onboarding.step4Desc')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenitiesList.map(({ id, icon: Icon, label }) => {
          const isActive = selected.includes(id)
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? 'border-dark bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={1.5} className={isActive ? 'text-dark' : 'text-gray-500'} />
              <span className={`text-sm ${isActive ? 'font-semibold text-dark' : 'text-gray-700'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepPhotos({ photos, onPhotos }) {
  const { t } = useTranslation('common')
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

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index)
    onPhotos(updated)
  }

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        {t('common:onboarding.step5Title')}
      </h1>
      <p className="text-muted mb-8">
        {t('common:onboarding.step5Desc')}
      </p>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-brand bg-red-50'
            : 'border-gray-300 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={40} className="mx-auto text-gray-400 mb-4" />
        <p className="text-base font-semibold text-dark">
          {isDragActive ? t('common:onboarding.dropTitleActive') : t('common:onboarding.dropTitle')}
        </p>
        <p className="text-sm text-muted mt-1">{t('common:onboarding.dropBrowse')}</p>
      </div>

      {/* Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img
                src={photo.preview}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {i === 0 && (
                <div className="absolute bottom-2 left-2 bg-white/95 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm">
                  {t('common:onboarding.coverPhoto')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StepPricing({ pricing, onUpdate }) {
  const { t } = useTranslation('common')
  const { currency, formatCurrency } = useCurrency()
  const estimatedWeeklyEarnings = Math.round(
    pricing.weekday * 5 * 0.97 + (pricing.weekend || pricing.weekday) * 2 * 0.97,
  )

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        {t('common:onboarding.step6Title')}
      </h1>
      <p className="text-muted mb-8">{t('common:onboarding.step6Desc')}</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">{t('common:onboarding.weekdayPrice')}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-dark">{currency}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pricing.weekday}
              onChange={(e) => onUpdate('weekday', e.target.value.replace(/\D/g, ''))}
              placeholder="100"
              className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center focus:outline-none focus:border-dark transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">{t('common:onboarding.weekendPrice')}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-dark">{currency}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pricing.weekend}
              onChange={(e) => onUpdate('weekend', e.target.value.replace(/\D/g, ''))}
              placeholder="120"
              className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center focus:outline-none focus:border-dark transition-all"
            />
          </div>
        </div>

        {pricing.weekday && (
          <div className="bg-gray-50 rounded-xl p-5 mt-4">
            <h3 className="text-sm font-bold text-dark mb-3">{t('common:onboarding.estimatedEarnings')}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-dark">
                {formatCurrency(estimatedWeeklyEarnings)}
              </span>
              <span className="text-muted text-sm">{t('common:onboarding.perWeekAfterFees')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
