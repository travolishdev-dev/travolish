import { useNavigate } from 'react-router-dom'
import {
  Home, Building2, Hotel, TreePine, Tent, Castle, Warehouse,
  ChevronLeft, ChevronRight, Minus, Plus, Upload, X,
  Wifi, Waves, Utensils, Car, AirVent, WashingMachine,
  Tv, Dumbbell, Coffee, Flame, PawPrint, Snowflake
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import useOnboardingStore from '../stores/useOnboardingStore'

const propertyTypes = [
  { id: 'house', label: 'House', icon: Home },
  { id: 'apartment', label: 'Apartment', icon: Building2 },
  { id: 'guesthouse', label: 'Guesthouse', icon: Hotel },
  { id: 'cabin', label: 'Cabin', icon: TreePine },
  { id: 'tent', label: 'Tent', icon: Tent },
  { id: 'castle', label: 'Castle', icon: Castle },
  { id: 'barn', label: 'Barn', icon: Warehouse },
]

const amenitiesList = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'pool', label: 'Pool', icon: Waves },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'parking', label: 'Free parking', icon: Car },
  { id: 'ac', label: 'Air conditioning', icon: AirVent },
  { id: 'washer', label: 'Washer', icon: WashingMachine },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'coffee', label: 'Coffee maker', icon: Coffee },
  { id: 'fireplace', label: 'Fireplace', icon: Flame },
  { id: 'pets', label: 'Pet friendly', icon: PawPrint },
  { id: 'ski', label: 'Ski-in/ski-out', icon: Snowflake },
]

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const navigate = useNavigate()
  const {
    currentStep, draftData, setStep,
    updateDraft, updateBasics, updatePricing, resetDraft
  } = useOnboardingStore()

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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setStep(currentStep + 1)
    } else {
      // Submit
      alert('Your listing has been submitted! 🎉')
      resetDraft()
      navigate('/')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1)
    } else {
      navigate('/')
    }
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
            Save & exit
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1 flex-shrink-0">
        <motion.div
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
            <motion.div
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
                  onTitleChange={(v) => updateDraft('title', v)}
                  onDescriptionChange={(v) => updateDraft('description', v)}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm font-semibold text-dark underline hover:text-muted transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-8 py-3 bg-gradient-to-r from-dark to-gray-800 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {currentStep === TOTAL_STEPS ? 'Publish listing' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  )
}

/* ─── Step Components ─── */

function StepPropertyType({ selected, onSelect }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        What type of place will guests have?
      </h1>
      <p className="text-muted mb-8">Choose the option that best describes your place.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {propertyTypes.map((type) => {
          const Icon = type.icon
          const isActive = selected === type.id
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:border-dark ${
                isActive
                  ? 'border-dark bg-gray-50 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={32} strokeWidth={1.5} className={isActive ? 'text-dark' : 'text-gray-500'} />
              <span className={`text-sm ${isActive ? 'font-bold text-dark' : 'font-medium text-gray-600'}`}>
                {type.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepTitleDescription({ title, description, onTitleChange, onDescriptionChange }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        Give your place a title & description
      </h1>
      <p className="text-muted mb-8">
        Catchy titles and descriptions work best. Have fun with it!
      </p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Cozy cottage with mountain views"
            maxLength={80}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
          />
          <p className="text-xs text-muted mt-1.5">{title.length}/80</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe what makes your place special..."
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
          />
          <p className="text-xs text-muted mt-1.5">{description.length}/500</p>
        </div>
      </div>
    </div>
  )
}

function StepBasics({ basics, onUpdate }) {
  const fields = [
    { key: 'guests', label: 'Guests', min: 1, max: 16 },
    { key: 'bedrooms', label: 'Bedrooms', min: 1, max: 20 },
    { key: 'beds', label: 'Beds', min: 1, max: 20 },
    { key: 'bathrooms', label: 'Bathrooms', min: 1, max: 10 },
  ]

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        Share some basics about your place
      </h1>
      <p className="text-muted mb-10">You'll add more details later.</p>
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center justify-between py-4 border-b border-gray-200">
            <span className="text-base font-medium text-dark">{field.label}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onUpdate(field.key, Math.max(field.min, basics[field.key] - 1))}
                disabled={basics[field.key] <= field.min}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-base font-semibold w-8 text-center">{basics[field.key]}</span>
              <button
                onClick={() => onUpdate(field.key, Math.min(field.max, basics[field.key] + 1))}
                disabled={basics[field.key] >= field.max}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        What amenities do you offer?
      </h1>
      <p className="text-muted mb-8">Select all that apply. You can add more later.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenitiesList.map((amenity) => {
          const Icon = amenity.icon
          const isActive = selected.includes(amenity.id)
          return (
            <button
              key={amenity.id}
              onClick={() => onToggle(amenity.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? 'border-dark bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={1.5} className={isActive ? 'text-dark' : 'text-gray-500'} />
              <span className={`text-sm ${isActive ? 'font-semibold text-dark' : 'text-gray-700'}`}>
                {amenity.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

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

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index)
    onPhotos(updated)
  }

  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        Add some photos of your place
      </h1>
      <p className="text-muted mb-8">
        You'll need at least 1 photo to get started. You can add more later.
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
          {isDragActive ? 'Drop your photos here' : 'Drag & drop your photos here'}
        </p>
        <p className="text-sm text-muted mt-1">or click to browse</p>
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

function StepPricing({ pricing, onUpdate }) {
  return (
    <div>
      <h1 className="text-[28px] md:text-[32px] font-bold text-dark mb-2">
        Set your price
      </h1>
      <p className="text-muted mb-8">You can change this anytime.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">Weekday price (per night)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-dark">$</span>
            <input
              type="number"
              value={pricing.weekday}
              onChange={(e) => onUpdate('weekday', e.target.value)}
              placeholder="100"
              className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center focus:outline-none focus:border-dark transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">Weekend price (per night)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-dark">$</span>
            <input
              type="number"
              value={pricing.weekend}
              onChange={(e) => onUpdate('weekend', e.target.value)}
              placeholder="120"
              className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center focus:outline-none focus:border-dark transition-all"
            />
          </div>
        </div>

        {pricing.weekday && (
          <div className="bg-gray-50 rounded-xl p-5 mt-4">
            <h3 className="text-sm font-bold text-dark mb-3">Estimated earnings</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-dark">
                ${Math.round(pricing.weekday * 5 * 0.97 + (pricing.weekend || pricing.weekday) * 2 * 0.97)}
              </span>
              <span className="text-muted text-sm">per week (after fees)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
