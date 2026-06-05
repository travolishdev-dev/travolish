import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AirVent,
  BedDouble,
  Bot,
  Building2,
  Car,
  Castle,
  Clock3,
  Coffee,
  Dumbbell,
  Film,
  Flame,
  Home,
  Hotel,
  Minus,
  PawPrint,
  Plus,
  Snowflake,
  Tent,
  TreePine,
  Tv,
  Upload,
  Utensils,
  WashingMachine,
  Waves,
  Warehouse,
  Wifi,
  X,
} from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { generateListingDescription } from '../../services/listingsApi'
import { createHotel, getHotel, updateHotel } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'

const HOTEL_STATUSES = [
  { value: 'LIVE',   label: 'Live',   description: 'Visible in search and bookable by guests.' },
  { value: 'DRAFT',  label: 'Draft',  description: 'Hidden from search. Complete your listing before publishing.' },
  { value: 'PAUSED', label: 'Paused', description: 'Temporarily hidden. All existing bookings remain.' },
]

const EMPTY_LISTING_DRAFT = {
  title: '',
  description: '',
  houseRules: '',
  propertyType: 'house',
  status: 'DRAFT',
  basics: { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
  bedDetails: { primary: 'King bed', secondary: 'Sofa bed' },
  amenities: [],
  photos: [],
  pricing: { weekday: '100', weekend: '120' },
  bookingSettings: {
    instantBooking: true,
    minimumStay: '1',
    checkInTime: '15:00',
    checkOutTime: '11:00',
  },
  location: '',
  country: '',
}

const propertyTypes = [
  { id: 'house', label: 'House', icon: Home },
  { id: 'apartment', label: 'Apartment', icon: Building2 },
  { id: 'guesthouse', label: 'Guesthouse', icon: Hotel },
  { id: 'cabin', label: 'Cabin', icon: TreePine },
  { id: 'tent', label: 'Tent', icon: Tent },
  { id: 'castle', label: 'Castle', icon: Castle },
  { id: 'barn', label: 'Barn', icon: Warehouse },
]

const amenityOptions = [
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

const basicFields = [
  { key: 'guests', label: 'Guests', min: 1, max: 16 },
  { key: 'bedrooms', label: 'Bedrooms', min: 1, max: 20 },
  { key: 'beds', label: 'Beds', min: 1, max: 20 },
  { key: 'bathrooms', label: 'Bathrooms', min: 1, max: 10 },
]

export default function HostListingEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hostId } = useHostContext()
  const [formState, setFormState] = useState({ ...EMPTY_LISTING_DRAFT, video: null })
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!id) return
    getHotel(id)
      .then((h) => {
        if (!h) return
        setFormState((prev) => ({
          ...prev,
          title: h.name ?? prev.title,
          description: h.description ?? prev.description,
          location: h.city ?? prev.location,
          country: h.country ?? prev.country,
          houseRules: h.houseRules ?? prev.houseRules,
          status: h.status ?? prev.status,
          bookingSettings: {
            ...prev.bookingSettings,
            instantBooking: h.instantBooking ?? prev.bookingSettings.instantBooking,
            minimumStay: String(h.minimumStay ?? prev.bookingSettings.minimumStay),
            checkInTime: h.checkInTime ?? prev.bookingSettings.checkInTime,
            checkOutTime: h.checkOutTime ?? prev.bookingSettings.checkOutTime,
          },
        }))
      })
      .catch(() => {})
  }, [id])

  const updateField = (field) => (event) =>
    setFormState((current) => ({ ...current, [field]: event.target.value }))

  const updatePricing = (field) => (event) =>
    setFormState((current) => ({
      ...current,
      pricing: {
        ...current.pricing,
        [field]: event.target.value,
      },
    }))

  const updateBookingSetting = (field) => (event) =>
    setFormState((current) => ({
      ...current,
      bookingSettings: {
        ...current.bookingSettings,
        [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      },
    }))

  const updateBedDetail = (field) => (event) =>
    setFormState((current) => ({
      ...current,
      bedDetails: {
        ...current.bedDetails,
        [field]: event.target.value,
      },
    }))

  const updateBasics = (field, nextValue) =>
    setFormState((current) => ({
      ...current,
      basics: {
        ...current.basics,
        [field]: nextValue,
      },
    }))

  const toggleAmenity = (amenityId) =>
    setFormState((current) => ({
      ...current,
      amenities: current.amenities.includes(amenityId)
        ? current.amenities.filter((item) => item !== amenityId)
        : [...current.amenities, amenityId],
    }))

  const handlePhotoPick = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) {
      return
    }

    const nextPhotos = files.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      preview: URL.createObjectURL(file),
      file,
    }))

    setFormState((current) => ({
      ...current,
      photos: [...current.photos, ...nextPhotos],
    }))

    event.target.value = ''
  }

  const removePhoto = (photoId) =>
    setFormState((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== photoId),
    }))

  const handleVideoPick = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFormState((current) => ({
      ...current,
      video: { id: `video-${Date.now()}`, preview: URL.createObjectURL(file), file },
    }))
    event.target.value = ''
  }

  const removeVideo = () =>
    setFormState((current) => ({ ...current, video: null }))

  async function handleGenerateDescription() {
    setGeneratingDesc(true)
    try {
      const result = await generateListingDescription({
        title: formState.title,
        propertyType: formState.propertyType,
        amenities: formState.amenities,
        location: formState.location,
        guests: formState.basics.guests,
        bedrooms: formState.basics.bedrooms,
        bathrooms: formState.basics.bathrooms,
      })
      const generated = result?.description ?? result?.text ?? result?.content
      if (generated) {
        setFormState((current) => ({ ...current, description: generated }))
      }
    } catch {
      // keep existing description
    } finally {
      setGeneratingDesc(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        hostId,
        name: formState.title,
        description: formState.description,
        city: formState.location,
        country: formState.country,
        houseRules: formState.houseRules || null,
        status: formState.status,
        instantBooking: formState.bookingSettings.instantBooking,
        minimumStay: parseInt(formState.bookingSettings.minimumStay, 10) || 1,
        checkInTime: formState.bookingSettings.checkInTime || null,
        checkOutTime: formState.bookingSettings.checkOutTime || null,
      }

      let savedHotel
      if (id) {
        savedHotel = await updateHotel(id, payload)
      } else {
        savedHotel = await createHotel(payload)
      }

      const hotelId = savedHotel?.id ?? id
      if (hotelId) {
        const newPhotos = formState.photos.filter((p) => p.file instanceof File)

        // First photo → cover image
        if (newPhotos.length > 0) {
          const imgForm = new FormData()
          imgForm.append('file', newPhotos[0].file)
          await fetch(`/api/hotels/${hotelId}/images`, { method: 'POST', body: imgForm })
        }

        // Remaining photos → gallery
        for (const photo of newPhotos.slice(1)) {
          const gForm = new FormData()
          gForm.append('file', photo.file)
          await fetch(`/api/hotels/${hotelId}/gallery`, { method: 'POST', body: gForm })
        }

        // Upload video if one was picked
        if (formState.video?.file instanceof File) {
          const vidForm = new FormData()
          vidForm.append('file', formState.video.file)
          await fetch(`/api/hotels/${hotelId}/videos`, { method: 'POST', body: vidForm })
        }
      }

      navigate('/host/listings')
    } catch {
      setSaveError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedPropertyType = propertyTypes.find(
    (type) => type.id === formState.propertyType,
  )

  return (
    <HostShell
      eyebrow={id ? 'Edit listing' : 'New listing'}
      title={id ? (formState.title ? `Edit ${formState.title}` : 'Edit listing') : 'New listing'}
      mobileTitle={id ? 'Edit listing' : 'New listing'}
      description="Same field model as host onboarding."
      actions={[
        id
          ? { label: 'Open rooms', href: `/host/listings/${id}/rooms`, secondary: true }
          : { label: 'Back to listings', href: '/host/listings', secondary: true },
        { label: saving ? 'Saving…' : (id ? 'Save changes' : 'Save listing'), onClick: handleSave },
      ]}
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: saving ? 'Saving…' : (id ? 'Save changes' : 'Save listing'), onClick: handleSave }}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <SectionCard>
            <SectionHeading
              eyebrow="Step 1"
              title="Property type"
              description="Choose the option that best describes your place."
            />

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {propertyTypes.map((type) => {
                const Icon = type.icon
                const isActive = formState.propertyType === type.id

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setFormState((current) => ({
                        ...current,
                        propertyType: type.id,
                      }))
                    }
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all ${
                      isActive
                        ? 'border-dark bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <Icon
                      size={28}
                      strokeWidth={1.7}
                      className={isActive ? 'text-dark' : 'text-gray-500'}
                    />
                    <span
                      className={`text-sm ${
                        isActive ? 'font-semibold text-dark' : 'font-medium text-gray-700'
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 2"
              title="Title and description"
              description="Keep the guest-facing story, location, and rules aligned with onboarding."
            />

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={updateField('title')}
                  placeholder="e.g., Cozy cottage with mountain views"
                  maxLength={80}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                />
                <p className="mt-1.5 text-xs text-muted">{formState.title.length}/80</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">City</label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={updateField('location')}
                    placeholder="e.g., Lisbon"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Country</label>
                  <input
                    type="text"
                    value={formState.country}
                    onChange={updateField('country')}
                    placeholder="e.g., Portugal"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="text-sm font-semibold text-dark">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generatingDesc}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Bot size={13} />
                    {generatingDesc ? 'Generating…' : 'AI generate'}
                  </button>
                </div>
                <textarea
                  value={formState.description}
                  onChange={updateField('description')}
                  placeholder="Describe what makes your place special, or use AI generate above…"
                  rows={5}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                />
                <p className="mt-1.5 text-xs text-muted">
                  {formState.description.length}/500
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">House rules</label>
                <textarea
                  value={formState.houseRules}
                  onChange={updateField('houseRules')}
                  placeholder="Quiet hours, pet policy, visitor rules, smoking policy, and any arrival notes guests should know."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                />
                <p className="mt-1.5 text-xs text-muted">{formState.houseRules.length}/500</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 3"
              title="Basics"
              description="Same counts shown during onboarding."
            />

            <div className="mt-6 space-y-6">
              {basicFields.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between border-b border-gray-200 py-4"
                >
                  <span className="text-base font-medium text-dark">{field.label}</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        updateBasics(
                          field.key,
                          Math.max(field.min, formState.basics[field.key] - 1),
                        )
                      }
                      disabled={formState.basics[field.key] <= field.min}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-base font-semibold">
                      {formState.basics[field.key]}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateBasics(
                          field.key,
                          Math.min(field.max, formState.basics[field.key] + 1),
                        )
                      }
                      disabled={formState.basics[field.key] >= field.max}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand">
                  <BedDouble size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dark">Bed type details</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    These labels are displayed in the editor preview for now and can map to room-level bed inventory later.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Primary bed</label>
                  <input
                    value={formState.bedDetails.primary}
                    onChange={updateBedDetail('primary')}
                    placeholder="King bed"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Additional beds</label>
                  <input
                    value={formState.bedDetails.secondary}
                    onChange={updateBedDetail('secondary')}
                    placeholder="Sofa bed, twin beds"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 4"
              title="Amenities"
              description="Select the same guest amenities used in onboarding."
            />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {amenityOptions.map((amenity) => {
                const Icon = amenity.icon
                const isActive = formState.amenities.includes(amenity.id)

                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      isActive
                        ? 'border-dark bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.6}
                      className={isActive ? 'text-dark' : 'text-gray-500'}
                    />
                    <span
                      className={`text-sm ${
                        isActive ? 'font-semibold text-dark' : 'text-gray-700'
                      }`}
                    >
                      {amenity.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 5"
              title="Photos"
              description="Keep the same photo section structure as create listing."
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoPick}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-gray-500"
            >
              <Upload size={34} className="text-gray-400" />
              <span className="text-base font-semibold text-dark">Add listing photos</span>
              <span className="text-sm text-muted">Click to browse or replace media</span>
            </button>

            {formState.photos.length ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {formState.photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-xl"
                  >
                    <img
                      src={photo.preview}
                      alt={`Listing media ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    {index === 0 ? (
                      <div className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold shadow-sm">
                        Cover photo
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 5b"
              title="Video walkthrough"
              description="Optional — upload a short walkthrough video (MP4, MOV, max 200 MB)."
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoPick}
              className="hidden"
            />

            {formState.video ? (
              <div className="mt-6 space-y-3">
                <div className="relative overflow-hidden rounded-2xl bg-black">
                  <video
                    src={formState.video.preview}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-sm text-muted">{formState.video.file?.name}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="mt-6 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-gray-500"
              >
                <Film size={34} className="text-gray-400" />
                <span className="text-base font-semibold text-dark">Add video walkthrough</span>
                <span className="text-sm text-muted">Optional — helps guests feel confident before booking</span>
              </button>
            )}
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 6"
              title="Pricing"
              description="Use the same weekday and weekend pricing fields."
            />

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Weekday price (per night)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-dark">
                    $
                  </span>
                  <input
                    type="number"
                    value={formState.pricing.weekday}
                    onChange={updatePricing('weekday')}
                    placeholder="100"
                    className="w-full rounded-xl border-2 border-gray-300 py-4 pl-10 pr-4 text-center text-2xl font-bold text-dark outline-none transition-all focus:border-dark"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Weekend price (per night)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-dark">
                    $
                  </span>
                  <input
                    type="number"
                    value={formState.pricing.weekend}
                    onChange={updatePricing('weekend')}
                    placeholder="120"
                    className="w-full rounded-xl border-2 border-gray-300 py-4 pl-10 pr-4 text-center text-2xl font-bold text-dark outline-none transition-all focus:border-dark"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 7"
              title="Booking rules"
              description="UI controls for instant booking, request-to-book, minimum stay, and check-in windows."
            />

            <div className="mt-6 grid gap-4">
              <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
                <span>
                  <span className="block text-sm font-semibold text-dark">
                    Enable instant booking
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    Guests can confirm immediately. Turn off to use booking requests that require host approval.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={formState.bookingSettings.instantBooking}
                  onChange={updateBookingSetting('instantBooking')}
                  className="mt-1 h-5 w-5 accent-brand"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Minimum stay</label>
                  <input
                    type="number"
                    min="1"
                    value={formState.bookingSettings.minimumStay}
                    onChange={updateBookingSetting('minimumStay')}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Check-in time</label>
                  <input
                    type="time"
                    value={formState.bookingSettings.checkInTime}
                    onChange={updateBookingSetting('checkInTime')}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Check-out time</label>
                  <input
                    type="time"
                    value={formState.bookingSettings.checkOutTime}
                    onChange={updateBookingSetting('checkOutTime')}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                </div>
              </div>

            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Step 8"
              title="Listing status"
              description="Control whether this property is visible to travellers."
            />
            <div className="mt-6 grid gap-3">
              {HOTEL_STATUSES.map((s) => (
                <label
                  key={s.value}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors ${
                    formState.status === s.value
                      ? 'border-dark bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="hotelStatus"
                    value={s.value}
                    checked={formState.status === s.value}
                    onChange={() => setFormState((prev) => ({ ...prev, status: s.value }))}
                    className="mt-1 accent-brand"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-dark">{s.label}</span>
                    <span className="mt-1 block text-sm text-muted">{s.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </SectionCard>

          {saveError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </p>
          )}
        </div>

        <div className="space-y-5">
          <SectionCard>
            <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-[#f4f1ea]">
              {formState.photos[0]?.preview ? (
                <img
                  src={formState.photos[0].preview}
                  alt={formState.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone={formState.status === 'LIVE' ? 'success' : formState.status === 'PAUSED' ? 'sky' : 'warning'}>
                {formState.status === 'LIVE' ? 'Live' : formState.status === 'PAUSED' ? 'Paused' : 'Draft'}
              </StatusPill>
              {selectedPropertyType ? (
                <StatusPill tone="sky">{selectedPropertyType.label}</StatusPill>
              ) : null}
            </div>

            <p className="mt-4 text-xl font-semibold tracking-tight text-dark">
              {formState.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{formState.description}</p>

            <div className="mt-6 grid gap-3 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Location</span>
                <span className="text-right text-sm font-semibold text-dark">
                  {[formState.location, formState.country].filter(Boolean).join(', ') || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Booking mode</span>
                <span className="text-right text-sm font-semibold text-dark">
                  {formState.bookingSettings.instantBooking ? 'Instant booking' : 'Request to book'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Minimum stay</span>
                <span className="text-right text-sm font-semibold text-dark">
                  {formState.bookingSettings.minimumStay || 1} night(s)
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Check-in window</span>
                <span className="text-right text-sm font-semibold text-dark">
                  <Clock3 size={14} className="mr-1 inline" />
                  {formState.bookingSettings.checkInTime} → {formState.bookingSettings.checkOutTime}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Beds</span>
                <span className="text-right text-sm font-semibold text-dark">
                  {[formState.bedDetails.primary, formState.bedDetails.secondary].filter(Boolean).join(' + ')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Guests</span>
                <span className="text-sm font-semibold text-dark">
                  {formState.basics.guests}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Weekday</span>
                <span className="text-sm font-semibold text-dark">
                  ${formState.pricing.weekday || 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Weekend</span>
                <span className="text-sm font-semibold text-dark">
                  ${formState.pricing.weekend || 0}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </HostShell>
  )
}
