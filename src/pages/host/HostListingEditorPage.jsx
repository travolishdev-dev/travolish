import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bot,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Film,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  ScrollText,
  Sparkles,
  Star,
  ToggleRight,
  Upload,
  Utensils,
  X,
} from 'lucide-react'
import { normalizePhoneForStorage } from '../../lib/phone'
import { PhoneField } from '../../components/common/PhoneField'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostSelect, HostToggle } from '../../components/host/HostFormFields'
import AmenitiesSelector from '../../components/host/AmenitiesSelector'
import PoliciesForm from '../../components/host/PoliciesForm'
import PhotoUploader from '../../components/host/PhotoUploader'
import BookingPaymentConfig from '../../components/host/BookingPaymentConfig'
import CountrySelect from '../../components/common/CountrySelect'
import StateSelect from '../../components/common/StateSelect'
import { generateListingDescription } from '../../services/listingsApi'
import {
  addNearbyAttraction,
  createHotel,
  deleteNearbyAttraction,
  getNearbyAttractions,
  getHotel,
  submitForReview,
  updateHotel,
  updatePolicies,
  updatePaymentConfig,
} from '../../services/hostListingsApi'
import { getAuthHeaders } from '../../lib/api'
import useHostContext from '../../hooks/useHostContext'
import {
  PROPERTY_CATEGORIES,
  TARGET_GUESTS,
  STAY_TYPES,
  getCategoryById,
  getSubTypesForCategory,
  showsStarRating,
} from '../../constants/propertyCategories'

// ─── constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'basics',    label: 'Basics',           icon: Layers },
  { id: 'location',  label: 'Location',         icon: MapPin },
  { id: 'details',   label: 'Property Details', icon: Building2 },
  { id: 'amenities', label: 'Amenities',        icon: Star },
  { id: 'policies',  label: 'Policies',         icon: ScrollText },
  { id: 'media',     label: 'Photos & Media',   icon: Camera },
  { id: 'pricing',   label: 'Pricing',          icon: CircleDollarSign },
  { id: 'booking',   label: 'Booking Rules',    icon: CalendarDays },
  { id: 'services',  label: 'Meals & Services', icon: Utensils },
  { id: 'seo',       label: 'AI & SEO',         icon: Sparkles },
  { id: 'payment',   label: 'Payment Config',   icon: CreditCard },
  { id: 'contact',   label: 'Contact',          icon: Phone },
  { id: 'status',    label: 'Status',           icon: ToggleRight },
]

// LIVE is intentionally absent — hosts cannot self-publish; publishing requires admin approval.
// LIVE appears as a selectable option only when the listing is already LIVE or PAUSED (toggling
// visibility of a previously-approved listing does not require a new review).
const HOTEL_STATUSES_APPROVED = [
  { value: 'LIVE',   label: 'Live',   description: 'Visible in search and bookable by guests.' },
  { value: 'DRAFT',  label: 'Draft',  description: 'Hidden from search. Your listing will not be visible to travellers.' },
  { value: 'PAUSED', label: 'Paused', description: 'Temporarily hidden from search. All existing bookings remain active.' },
]
const HOTEL_STATUSES_DRAFT = [
  { value: 'DRAFT',  label: 'Draft',  description: 'Save your progress. Submit for review when ready to publish.' },
  { value: 'PAUSED', label: 'Paused', description: 'Temporarily hidden from search. All existing bookings remain active.' },
]

const STAR_RATINGS = ['1', '2', '3', '4', '5']

const LANGUAGES = [
  'English', 'Hindi', 'French', 'Spanish', 'German',
  'Arabic', 'Japanese', 'Chinese', 'Portuguese', 'Russian',
]

const CURRENCIES = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
]

const MEAL_PLANS = [
  { id: 'room_only', label: 'Room Only' },
  { id: 'breakfast', label: 'Breakfast Included' },
  { id: 'half_board', label: 'Half Board' },
  { id: 'full_board', label: 'Full Board' },
  { id: 'all_inclusive', label: 'All Inclusive' },
]

const TRANSPORTATION = [
  { id: 'airport_shuttle', label: 'Airport Shuttle' },
  { id: 'car_rental', label: 'Car Rental' },
  { id: 'taxi_service', label: 'Taxi Service' },
  { id: 'bicycle_rental', label: 'Bicycle Rental' },
  { id: 'public_transport', label: 'Public Transport Nearby' },
]

const GUEST_SERVICES = [
  { id: 'concierge', label: 'Concierge' },
  { id: 'tour_desk', label: 'Tour Desk' },
  { id: 'currency_exchange', label: 'Currency Exchange' },
  { id: 'wakeup_service', label: 'Wake-up Service' },
  { id: 'ticket_booking', label: 'Ticket Booking' },
  { id: 'luggage_assistance', label: 'Luggage Assistance' },
]

const SUSTAINABILITY = [
  { id: 'eco_certification', label: 'Eco Certification' },
  { id: 'solar_energy', label: 'Solar Energy' },
  { id: 'recycling', label: 'Recycling Programme' },
  { id: 'water_saving', label: 'Water Saving Measures' },
  { id: 'plastic_free', label: 'Plastic-Free Initiatives' },
]

const TARGET_AUDIENCE = [
  { id: 'families', label: 'Families' },
  { id: 'couples', label: 'Couples' },
  { id: 'business', label: 'Business Travelers' },
  { id: 'solo', label: 'Solo Travelers' },
  { id: 'young', label: 'Young Travelers' },
  { id: 'seniors', label: 'Senior Citizens' },
]

const USP_OPTIONS = [
  { id: 'private_pool', label: 'Private Pool' },
  { id: 'airport_shuttle', label: 'Free Airport Shuttle' },
  { id: 'rooftop_pool', label: 'Rooftop Infinity Pool' },
  { id: 'ocean_view', label: 'Ocean View' },
  { id: 'city_center', label: 'City Center Location' },
  { id: 'free_breakfast', label: 'Free Breakfast' },
  { id: 'PET_FRIENDLY', label: 'Pet Friendly' },
  { id: 'spa', label: 'Spa & Wellness' },
]

const BASIC_FIELDS = [
  { key: 'guests',    label: 'Guests',    min: 1, max: 16 },
  { key: 'bedrooms',  label: 'Bedrooms',  min: 0, max: 20 },
  { key: 'beds',      label: 'Beds',      min: 1, max: 20 },
  { key: 'bathrooms', label: 'Bathrooms', min: 1, max: 10 },
]

const EMPTY_DRAFT = {
  // Basics
  title: '',
  description: '',
  houseRules: '',
  category: '',
  subTypes: [],
  targetGuests: [],
  stayType: 'ENTIRE_PROPERTY',
  starRating: '',
  brandChain: '',
  languagesSpoken: [],
  yearBuilt: '',
  lastRenovated: '',
  status: 'DRAFT',
  adminNote: '',

  // Location
  streetAddress: '',
  location: '',        // city
  state: '',
  country: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  nearbyAttractions: [],
  distanceToAirport: '',
  distanceToTrainMetro: '',
  distanceToBeachCityCentre: '',

  // Property Details
  basics: { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
  bedDetails: { primary: 'King bed', secondary: 'Sofa bed' },
  totalRooms: '',
  totalFloors: '',
  totalBuildings: '',
  propertySizeM2: '',
  receptionHours: '',
  is24HrFrontDesk: false,

  // Amenities
  amenities: [],

  // Policies
  policies: {
    cancellationPolicy: '',
    refundPolicy: '',
    childPolicy: '',
    petPolicy: '',
    smokingPolicy: '',
    visitorPolicy: '',
    damagePolicy: '',
    quietHours: '',
  },

  // Photos & Media
  photos: { cover: [], property: [], room: [], bathroom: [], restaurant: [], pool: [], lobby: [], drone: [] },
  video: null,
  tourUrl: '',

  // Pricing
  pricing: {
    weekday: '',
    weekend: '',
    seasonal: '',
    holiday: '',
    weeklyDiscount: '',
    monthlyDiscount: '',
    taxes: '',
    serviceCharges: '',
    securityDeposit: '',
    currency: 'USD',
  },

  // Booking Rules
  bookingSettings: {
    instantBooking: true,
    minimumStay: '1',
    maximumStay: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    bookingWindow: '',
    lastMinuteBooking: false,
    lastMinuteCutoffHours: '24',
    sameDayBooking: false,
  },

  // Meals & Services
  mealPlans: [],
  transportation: [],
  guestServices: [],
  sustainability: [],

  // AI & SEO
  targetAudience: [],
  usp: [],
  nearbyLandmark: '',
  aiTranslation: false,

  // Payment Config
  paymentConfig: {
    paymentMethods: [],
    advancePaymentPercent: 0,
    customAdvancePercent: '',
  },

  // Contact
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  websiteUrl: '',
  emergencyContact: '',
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function toggleArray(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

function PillToggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm transition-colors ${
        active
          ? 'border-dark bg-dark font-semibold text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
      }`}
    >
      {active && <Check size={11} className="shrink-0" />}
      {children}
    </button>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function HostListingEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hostId } = useHostContext()

  const [activeTab, setActiveTab] = useState('basics')
  const [formState, setFormState] = useState(EMPTY_DRAFT)
  const videoInputRef = useRef(null)
  const originalAttractionIds = useRef([])
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  // Load existing hotel
  useEffect(() => {
    if (!id) return
    getHotel(id)
      .then((h) => {
        if (!h) return
        setFormState((prev) => ({
          ...prev,
          title:       h.name             ?? prev.title,
          description: h.description      ?? prev.description,
          location:    h.city             ?? prev.location,
          state:       h.state            ?? prev.state,
          country:     h.country          ?? prev.country,
          postalCode:  h.postalCode       ?? prev.postalCode,
          streetAddress: h.streetAddress  ?? prev.streetAddress,
          latitude:    h.latitude != null ? String(h.latitude)  : prev.latitude,
          longitude:   h.longitude != null ? String(h.longitude) : prev.longitude,
          houseRules:  h.houseRules       ?? prev.houseRules,
          status:      h.status           ?? prev.status,
          adminNote:   h.adminNote        ?? prev.adminNote,
          category:     h.category        ?? prev.category,
          subTypes:     h.subTypes        ?? prev.subTypes,
          targetGuests: h.targetGuests    ?? prev.targetGuests,
          stayType:     h.stayType        ?? prev.stayType,
          starRating:  h.starRating != null ? String(h.starRating) : prev.starRating,
          brandChain:  h.brandChain       ?? prev.brandChain,
          yearBuilt:   h.yearBuilt != null ? String(h.yearBuilt)   : prev.yearBuilt,
          lastRenovated: h.lastRenovated != null ? String(h.lastRenovated) : prev.lastRenovated,
          languagesSpoken: h.languagesSpoken ?? prev.languagesSpoken,
          basics: {
            guests:    h.maxGuests    != null ? h.maxGuests    : prev.basics.guests,
            bedrooms:  h.numBedrooms  != null ? h.numBedrooms  : prev.basics.bedrooms,
            bathrooms: h.numBathrooms != null ? h.numBathrooms : prev.basics.bathrooms,
            beds:      h.numUnits     != null ? h.numUnits     : prev.basics.beds,
          },
          totalRooms:   h.totalRooms   != null ? String(h.totalRooms)   : prev.totalRooms,
          totalFloors:  h.totalFloors  != null ? String(h.totalFloors)  : prev.totalFloors,
          totalBuildings: h.totalBuildings != null ? String(h.totalBuildings) : prev.totalBuildings,
          propertySizeM2: h.propertySizeM2 != null ? String(h.propertySizeM2) : prev.propertySizeM2,
          receptionHours: h.receptionHours ?? prev.receptionHours,
          is24HrFrontDesk: h.is24HrFrontDesk ?? prev.is24HrFrontDesk,
          distanceToAirport:        h.distanceToAirport        ?? prev.distanceToAirport,
          distanceToTrainMetro:     h.distanceToTrainMetro     ?? prev.distanceToTrainMetro,
          distanceToBeachCityCentre: h.distanceToBeachCityCentre ?? prev.distanceToBeachCityCentre,
          amenities: h.amenities ?? prev.amenities,
          mealPlans:    h.mealPlans    ?? prev.mealPlans,
          transportation: h.transportation ?? prev.transportation,
          guestServices:  h.guestServices  ?? prev.guestServices,
          sustainability: h.sustainability ?? prev.sustainability,
          targetAudience: h.targetAudience ?? prev.targetAudience,
          usp:            h.usp            ?? prev.usp,
          nearbyLandmark: h.nearbyLandmark ?? prev.nearbyLandmark,
          aiTranslation:  h.aiTranslation  ?? prev.aiTranslation,
          bedDetails: {
            primary:   h.primaryBedType   ?? prev.bedDetails.primary,
            secondary: h.secondaryBedType ?? prev.bedDetails.secondary,
          },
          contactPerson:  h.contactPerson  ?? prev.contactPerson,
          contactPhone:   h.contactPhone   ?? prev.contactPhone,
          contactEmail:   h.contactEmail   ?? prev.contactEmail,
          websiteUrl:     h.websiteUrl     ?? prev.websiteUrl,
          emergencyContact: h.emergencyContact ?? prev.emergencyContact,
          policies: {
            ...prev.policies,
            ...(h.policies ?? {}),
          },
          pricing: {
            ...prev.pricing,
            weekday:       h.weekdayPrice    != null ? String(h.weekdayPrice)    : prev.pricing.weekday,
            weekend:       h.weekendPrice    != null ? String(h.weekendPrice)    : prev.pricing.weekend,
            seasonal:      h.seasonalPrice   != null ? String(h.seasonalPrice)   : prev.pricing.seasonal,
            holiday:       h.holidayPrice    != null ? String(h.holidayPrice)    : prev.pricing.holiday,
            weeklyDiscount: h.weeklyDiscount != null ? String(h.weeklyDiscount)  : prev.pricing.weeklyDiscount,
            monthlyDiscount: h.monthlyDiscount != null ? String(h.monthlyDiscount) : prev.pricing.monthlyDiscount,
            taxes:          h.taxes          != null ? String(h.taxes)           : prev.pricing.taxes,
            serviceCharges: h.serviceCharges != null ? String(h.serviceCharges)  : prev.pricing.serviceCharges,
            securityDeposit: h.securityDeposit != null ? String(h.securityDeposit) : prev.pricing.securityDeposit,
            currency: h.currency ?? prev.pricing.currency,
          },
          bookingSettings: {
            ...prev.bookingSettings,
            instantBooking:         h.instantBooking         ?? prev.bookingSettings.instantBooking,
            minimumStay:            String(h.minimumStay     ?? prev.bookingSettings.minimumStay),
            maximumStay:            h.maximumStay != null ? String(h.maximumStay) : prev.bookingSettings.maximumStay,
            checkInTime:            h.checkInTime            ?? prev.bookingSettings.checkInTime,
            checkOutTime:           h.checkOutTime           ?? prev.bookingSettings.checkOutTime,
            bookingWindow:          h.bookingWindow != null ? String(h.bookingWindow) : prev.bookingSettings.bookingWindow,
            lastMinuteBooking:      h.lastMinuteBooking      ?? prev.bookingSettings.lastMinuteBooking,
            lastMinuteCutoffHours:  h.lastMinuteCutoffHours != null ? String(h.lastMinuteCutoffHours) : prev.bookingSettings.lastMinuteCutoffHours,
            sameDayBooking:         h.sameDayBooking         ?? prev.bookingSettings.sameDayBooking,
          },
          paymentConfig: {
            ...prev.paymentConfig,
            ...(h.paymentConfig ?? {}),
          },
        }))
      })
      .catch(() => {})
    getNearbyAttractions(id)
      .then((attractions) => {
        if (!Array.isArray(attractions) || !attractions.length) return
        originalAttractionIds.current = attractions.map((a) => a.id).filter(Boolean)
        setFormState((prev) => ({ ...prev, nearbyAttractions: attractions }))
      })
      .catch(() => {})
  }, [id])

  // ── field updaters ────────────────────────────────────────────────────────

  const setField = (key, val) =>
    setFormState((prev) => ({ ...prev, [key]: val }))

  const fieldHandler = (key) => (e) => setField(key, e.target.value)

  const updateBasics = (key, val) =>
    setFormState((prev) => ({ ...prev, basics: { ...prev.basics, [key]: val } }))

  const updateBedDetail = (key) => (e) =>
    setFormState((prev) => ({ ...prev, bedDetails: { ...prev.bedDetails, [key]: e.target.value } }))

  const updatePricing = (key) => (e) =>
    setFormState((prev) => ({ ...prev, pricing: { ...prev.pricing, [key]: e.target.value } }))

  const updateBooking = (key) => (e) =>
    setFormState((prev) => ({
      ...prev,
      bookingSettings: {
        ...prev.bookingSettings,
        [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      },
    }))

  const updateBookingBool = (key) => (val) =>
    setFormState((prev) => ({ ...prev, bookingSettings: { ...prev.bookingSettings, [key]: val } }))

  const toggleListField = (key, val) =>
    setFormState((prev) => ({ ...prev, [key]: toggleArray(prev[key] ?? [], val) }))

  // Nearby attractions helpers
  const addAttraction = () =>
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: [...(prev.nearbyAttractions ?? []), { name: '', distance: '' }],
    }))

  const updateAttraction = (index, key, val) =>
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.map((a, i) =>
        i === index ? { ...a, [key]: val } : a
      ),
    }))

  const removeAttraction = (index) =>
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.filter((_, i) => i !== index),
    }))

  // ── AI description ────────────────────────────────────────────────────────

  async function handleGenerateDescription() {
    setGeneratingDesc(true)
    try {
      const location = [formState.location, formState.country].filter(Boolean).join(', ')
      const uspText = (formState.usp ?? []).join(', ')
      const audienceText = (formState.targetAudience ?? []).join(', ')
      const originalDescription =
        `${formState.title || 'A lovely property'}. ` +
        `Type: ${formState.category}. ` +
        `Location: ${location || 'great location'}. ` +
        (formState.nearbyLandmark ? `Near ${formState.nearbyLandmark}. ` : '') +
        `Sleeps ${formState.basics.guests}, ${formState.basics.bedrooms} bedroom(s), ${formState.basics.bathrooms} bathroom(s). ` +
        (uspText ? `Highlights: ${uspText}. ` : '') +
        (audienceText ? `Ideal for: ${audienceText}.` : '')

      const result = await generateListingDescription({
        hotelId: 0,
        roomId: 0,
        originalDescription,
        descriptionType: 'ROOM_DESCRIPTION',
        sourceLanguage: 'ENGLISH',
        targetLanguage: 'ENGLISH',
      })
      const generated = result?.generatedDescription
      if (generated) setField('description', generated)
    } catch {
      // keep existing
    } finally {
      setGeneratingDesc(false)
    }
  }

  // ── save ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!formState.state || !formState.state.trim()) {
      setSaveError('State / Province is required. Please fill it in on the Location tab.')
      setActiveTab('location')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      // ── Hotel payload — field names match backend Hotel entity ──────────────
      const payload = {
        hostId,
        // Basics
        name:                   formState.title,
        description:            formState.description,
        houseRules:             formState.houseRules || null,
        category:               formState.category,
        subTypes:               formState.subTypes,
        targetGuests:           formState.targetGuests,
        stayType:               formState.stayType,
        status:                 formState.status,
        starRating:             formState.starRating ? Number(formState.starRating) : null,
        brand:                  formState.brandChain || null,     // backend: brand
        languagesSpoken:        formState.languagesSpoken,
        yearBuilt:              formState.yearBuilt ? Number(formState.yearBuilt) : null,
        lastRenovated:          formState.lastRenovated ? Number(formState.lastRenovated) : null,
        // Location
        address:                formState.streetAddress || null,  // backend: address
        city:                   formState.location,
        state:                  formState.state || null,
        country:                formState.country,
        postalCode:             formState.postalCode || null,
        latitude:               formState.latitude ? Number(formState.latitude) : null,
        longitude:              formState.longitude ? Number(formState.longitude) : null,
        distanceToAirport:      formState.distanceToAirport ? Number(formState.distanceToAirport) : null,
        distanceToTrain:        formState.distanceToTrainMetro ? Number(formState.distanceToTrainMetro) : null,  // backend: distanceToTrain
        distanceToCityCentre:   formState.distanceToBeachCityCentre ? Number(formState.distanceToBeachCityCentre) : null,
        distanceToBeach:        formState.distanceToBeachCityCentre ? Number(formState.distanceToBeachCityCentre) : null,
        // Property details — capacity counters
        maxGuests:              formState.basics.guests    ? Number(formState.basics.guests)    : null,
        numBedrooms:            formState.basics.bedrooms  ? Number(formState.basics.bedrooms)  : null,
        numBathrooms:           formState.basics.bathrooms ? Number(formState.basics.bathrooms) : null,
        numUnits:               formState.basics.beds      ? Number(formState.basics.beds)      : null,
        totalRooms:             formState.totalRooms ? Number(formState.totalRooms) : null,
        totalFloors:            formState.totalFloors ? Number(formState.totalFloors) : null,
        totalBuildings:         formState.totalBuildings ? Number(formState.totalBuildings) : null,
        propertySize:           formState.propertySizeM2 ? Number(formState.propertySizeM2) : null,  // backend: propertySize
        receptionHours:         formState.receptionHours || null,
        twentyFourHourFrontDesk: formState.is24HrFrontDesk,                                         // backend: twentyFourHourFrontDesk
        threeSixtyTourUrl:      formState.tourUrl || null,                                           // backend: threeSixtyTourUrl
        // Booking settings
        instantBooking:         formState.bookingSettings.instantBooking,
        minimumStay:            parseInt(formState.bookingSettings.minimumStay, 10) || 1,
        maximumStay:            formState.bookingSettings.maximumStay ? parseInt(formState.bookingSettings.maximumStay, 10) : null,
        checkInTime:            formState.bookingSettings.checkInTime || null,
        checkOutTime:           formState.bookingSettings.checkOutTime || null,
        bookingWindow:          formState.bookingSettings.bookingWindow ? Number(formState.bookingSettings.bookingWindow) : null,
        lastMinuteBooking:      formState.bookingSettings.lastMinuteBooking,
        sameDayBooking:         formState.bookingSettings.sameDayBooking,
        // Amenities & services — backend field names
        amenities:              formState.amenities,
        mealOptions:            formState.mealPlans,            // backend: mealOptions
        transportationOptions:  formState.transportation,       // backend: transportationOptions
        guestServices:          formState.guestServices,
        sustainabilityFeatures: formState.sustainability,       // backend: sustainabilityFeatures
        // AI & SEO
        targetAudience:         formState.targetAudience,
        usp:                    formState.usp,
        nearbyLandmark:         formState.nearbyLandmark || null,
        aiTranslation:          formState.aiTranslation,
        // Bed details
        primaryBedType:         formState.bedDetails?.primary || null,
        secondaryBedType:       formState.bedDetails?.secondary || null,
        // Booking — last-minute cutoff
        lastMinuteCutoffHours:  formState.bookingSettings.lastMinuteCutoffHours
          ? Number(formState.bookingSettings.lastMinuteCutoffHours)
          : null,
        // Contact — backend has phone/email directly on Hotel
        phone:                  formState.contactPhone || null,
        email:                  formState.contactEmail || null,
        contactPerson:          formState.contactPerson || null,
        websiteUrl:             formState.websiteUrl || null,
        emergencyContact:       formState.emergencyContact || null,
      }

      let savedHotel
      if (id) {
        savedHotel = await updateHotel(id, payload)
      } else {
        savedHotel = await createHotel(payload)
      }

      const hotelId = savedHotel?.id ?? id
      if (hotelId) {
        // Cover photo → /images; rest → /gallery
        const allBuckets = Object.values(formState.photos)
        const coverPhotos = (formState.photos.cover ?? []).filter((p) => p.file instanceof File)
        const galleryPhotos = allBuckets
          .flat()
          .filter((p) => p.file instanceof File && !coverPhotos.includes(p))

        const authHdrs = getAuthHeaders()
        for (const photo of coverPhotos) {
          const form = new FormData()
          form.append('file', photo.file)
          if (photo.title) form.append('title', photo.title)
          await fetch(`/api/hotels/${hotelId}/images`, { method: 'POST', headers: authHdrs, body: form })
        }

        for (const photo of galleryPhotos) {
          const form = new FormData()
          form.append('file', photo.file)
          if (photo.title) form.append('title', photo.title)
          await fetch(`/api/hotels/${hotelId}/gallery`, { method: 'POST', headers: authHdrs, body: form })
        }

        if (formState.video?.file instanceof File) {
          const vForm = new FormData()
          vForm.append('file', formState.video.file)
          await fetch(`/api/hotels/${hotelId}/videos`, { method: 'POST', headers: authHdrs, body: vForm })
        }

        // ── Policies — separate endpoint ──────────────────────────────────────
        await updatePolicies(hotelId, formState.policies).catch(() => {})

        // ── Payment config — separate endpoint ────────────────────────────────
        const pm = formState.paymentConfig?.paymentMethods ?? []
        const advPct = formState.paymentConfig?.advancePaymentPercent === -1
          ? Number(formState.paymentConfig?.customAdvancePercent) || 0
          : Number(formState.paymentConfig?.advancePaymentPercent) || 0
        await updatePaymentConfig(hotelId, {
          payFullAtBooking:          pm.includes('pay_full'),
          payAtProperty:             pm.includes('pay_at_property'),
          secureWithPartialPayment:  pm.includes('partial_payment'),
          advancePaymentPercent:     advPct,
          acceptedPaymentMethods:    pm,
        }).catch(() => {})

        // ── Nearby attractions — diff and sync ────────────────────────────────
        const currentAttractionIds = new Set(
          formState.nearbyAttractions.filter((a) => a.id).map((a) => a.id)
        )
        const deletedIds = originalAttractionIds.current.filter((aid) => !currentAttractionIds.has(aid))
        await Promise.all(
          deletedIds.map((aid) => deleteNearbyAttraction(hotelId, aid).catch(() => {}))
        )
        const newAttractions = formState.nearbyAttractions.filter((a) => !a.id && a.name?.trim())
        const addedAttractions = await Promise.all(
          newAttractions.map((a) =>
            addNearbyAttraction(hotelId, { name: a.name, distance: a.distance }).catch(() => null)
          )
        )
        // Update ref so a second save without reload still diffs correctly
        const survivingIds = formState.nearbyAttractions.filter((a) => a.id).map((a) => a.id)
        const freshIds = addedAttractions.filter((a) => a?.id).map((a) => a.id)
        originalAttractionIds.current = [...survivingIds, ...freshIds]
      }

      navigate('/host/listings')
    } catch {
      setSaveError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitForReview() {
    if (!id) return
    setSubmitting(true)
    try {
      await submitForReview(id)
      setFormState((prev) => ({ ...prev, status: 'PENDING_REVIEW', adminNote: '' }))
    } catch {
      setSaveError('Could not submit for review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── sidebar preview ───────────────────────────────────────────────────────

  const selectedCategory = getCategoryById(formState.category)
  const coverPhoto = formState.photos.cover?.[0]?.preview

  const completionChecks = [
    !!formState.title.trim(),
    !!formState.category,
    formState.description.length > 50,
    !!(formState.location && formState.country),
    formState.amenities.length > 0,
    !!formState.pricing.weekday,
    Object.values(formState.photos).flat().length > 0,
  ]
  const completionPct = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100)

  // ── live location ─────────────────────────────────────────────────────────

  function handleLiveLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormState(prev => ({ ...prev, latitude, longitude }))
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const a = data.address ?? {}
          setFormState(prev => ({
            ...prev,
            streetAddress: [a.house_number, a.road].filter(Boolean).join(' '),
            location: a.city ?? a.town ?? a.village ?? a.county ?? '',
            state: a.state ?? '',
            country: a.country ?? '',
            postalCode: a.postcode ?? '',
          }))
        } catch {
          // lat/lng already set; address fill is best-effort
        }
        setGeoLoading(false)
      },
      (err) => {
        setGeoError(err.message ?? 'Unable to retrieve your location.')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── tab content ───────────────────────────────────────────────────────────

  function renderTab() {
    switch (activeTab) {

      // ── BASICS ─────────────────────────────────────────────────────────────
      case 'basics':
        return (
          <>
            <SectionCard>
              <SectionHeading eyebrow="Step 1" title="Property category" description="Choose the category that best describes your property." />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PROPERTY_CATEGORIES.map((cat) => {
                  const active = formState.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setField('category', cat.id)}
                      className={`relative flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                        active
                          ? 'border-dark bg-gray-50 ring-2 ring-dark ring-offset-1'
                          : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      {active && (
                        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-dark">
                          <Check size={11} className="text-white" />
                        </span>
                      )}
                      <span className="text-2xl">{cat.emoji}</span>
                      <span>
                        <span className="block text-sm font-semibold text-dark">{cat.label}</span>
                        <span className="mt-0.5 block text-xs text-muted leading-snug">{cat.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </SectionCard>

            {formState.category && getSubTypesForCategory(formState.category).length > 0 && (
              <SectionCard>
                <SectionHeading
                  eyebrow="Step 1b"
                  title="Property type"
                  description={`Select all types that apply to your ${getCategoryById(formState.category)?.label ?? 'property'}.`}
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {getSubTypesForCategory(formState.category).map((st) => (
                    <PillToggle
                      key={st.id}
                      active={(formState.subTypes ?? []).includes(st.id)}
                      onClick={() => {
                        const current = formState.subTypes ?? []
                        setField('subTypes', current.includes(st.id)
                          ? current.filter((s) => s !== st.id)
                          : [...current, st.id])
                      }}
                    >
                      {st.label}
                    </PillToggle>
                  ))}
                </div>
                {(formState.subTypes ?? []).length > 0 && (
                  <p className="mt-3 text-xs text-muted">{formState.subTypes.length} selected</p>
                )}
              </SectionCard>
            )}

            <SectionCard>
              <SectionHeading eyebrow="Step 2" title="Basic information" description="Name, category, and property identity." />
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Property Name</label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={fieldHandler('title')}
                    placeholder="e.g., Grand Harbor Hotel Hamburg"
                    maxLength={80}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                  <p className="mt-1 text-xs text-muted">{formState.title.length}/80</p>
                </div>

                {showsStarRating(formState.category) && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark">Star Rating</label>
                    <div className="flex flex-wrap gap-2">
                      {STAR_RATINGS.map((s) => (
                        <PillToggle
                          key={s}
                          active={formState.starRating === s}
                          onClick={() => setField('starRating', formState.starRating === s ? '' : s)}
                        >
                          {'★'.repeat(Number(s))} {s} Star
                        </PillToggle>
                      ))}
                    </div>
                  </div>
                )}

                <HostField
                  label="Brand / Chain (Optional)"
                  value={formState.brandChain}
                  onChange={fieldHandler('brandChain')}
                  placeholder="e.g., Marriott, IHG, independent"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <PillToggle
                        key={lang}
                        active={(formState.languagesSpoken ?? []).includes(lang)}
                        onClick={() => toggleListField('languagesSpoken', lang)}
                      >
                        {lang}
                      </PillToggle>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <HostField
                    label="Year Built"
                    value={formState.yearBuilt}
                    onChange={fieldHandler('yearBuilt')}
                    type="number"
                    placeholder="e.g., 1998"
                  />
                  <HostField
                    label="Last Renovated"
                    value={formState.lastRenovated}
                    onChange={fieldHandler('lastRenovated')}
                    type="number"
                    placeholder="e.g., 2022"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Step 2b" title="Target guests & stay type" description="Who is your property best suited for, and what access will guests have?" />
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-dark">Target Guests</p>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_GUESTS.map((g) => (
                      <PillToggle
                        key={g.id}
                        active={(formState.targetGuests ?? []).includes(g.id)}
                        onClick={() => toggleListField('targetGuests', g.id)}
                      >
                        {g.label}
                      </PillToggle>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-dark">Stay Type</p>
                  <div className="flex flex-wrap gap-2">
                    {STAY_TYPES.map((st) => (
                      <PillToggle
                        key={st.id}
                        active={formState.stayType === st.id}
                        onClick={() => setField('stayType', st.id)}
                      >
                        {st.label}
                      </PillToggle>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Step 3" title="Description" description="Guest-facing story. Keep it compelling and accurate." />
              <div className="mt-6 space-y-5">
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
                    onChange={fieldHandler('description')}
                    placeholder="Describe what makes your property special…"
                    rows={6}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                  <p className="mt-1 text-xs text-muted">{formState.description.length}/1000</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">House Rules</label>
                  <textarea
                    value={formState.houseRules}
                    onChange={fieldHandler('houseRules')}
                    placeholder="Quiet hours, arrival notes, general property rules…"
                    rows={4}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
                  />
                  <p className="mt-1 text-xs text-muted">{formState.houseRules.length}/500</p>
                </div>
              </div>
            </SectionCard>
          </>
        )

      // ── LOCATION ───────────────────────────────────────────────────────────
      case 'location':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Location" title="Property address" description="Full address and map coordinates." />
            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Use your device's GPS to auto-fill address and coordinates.</p>
                <button
                  type="button"
                  onClick={handleLiveLocation}
                  disabled={geoLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-dark px-4 py-2 text-sm font-semibold text-white hover:bg-dark/90 disabled:opacity-60"
                >
                  {geoLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Detecting…</>
                    : <><MapPin size={14} /> Use Live Location</>
                  }
                </button>
              </div>
              {geoError && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{geoError}</p>
              )}
              <HostField
                label="Street Address"
                value={formState.streetAddress}
                onChange={fieldHandler('streetAddress')}
                placeholder="e.g., 12 Harbour Road"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <HostField label="City" value={formState.location} onChange={fieldHandler('location')} placeholder="e.g., Hamburg" />
                <StateSelect
                  label="State / Province"
                  country={formState.country}
                  value={formState.state}
                  onChange={(v) => setFormState((s) => ({ ...s, state: v }))}
                  required
                  error={!formState.state.trim() ? 'Required' : ''}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <CountrySelect
                  label="Country"
                  value={formState.country}
                  onChange={(v) => setFormState((s) => ({ ...s, country: v, state: '' }))}
                  placeholder="Select country"
                />
                <HostField label="Postal Code" value={formState.postalCode} onChange={fieldHandler('postalCode')} placeholder="e.g., 20095" />
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-dark">Google Map Pin</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <HostField label="Latitude" value={formState.latitude} onChange={fieldHandler('latitude')} placeholder="e.g., 53.5511" type="number" />
                  <HostField label="Longitude" value={formState.longitude} onChange={fieldHandler('longitude')} placeholder="e.g., 9.9937" type="number" />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-dark">Nearby Attractions</p>
                  <button
                    type="button"
                    onClick={addAttraction}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-dark hover:bg-gray-50"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
                {(formState.nearbyAttractions ?? []).length === 0 && (
                  <p className="text-sm text-muted">No attractions added yet.</p>
                )}
                <div className="space-y-2">
                  {(formState.nearbyAttractions ?? []).map((attr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttraction(i, 'name', e.target.value)}
                        placeholder="Attraction name"
                        className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
                      />
                      <input
                        type="text"
                        value={attr.distance}
                        onChange={(e) => updateAttraction(i, 'distance', e.target.value)}
                        placeholder="Distance (e.g., 2 km)"
                        className="w-36 rounded-xl border border-gray-300 px-3 py-2.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
                      />
                      <button type="button" onClick={() => removeAttraction(i)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <HostField label="Distance to Airport" value={formState.distanceToAirport} onChange={fieldHandler('distanceToAirport')} placeholder="e.g., 15 min drive" />
                <HostField label="Distance to Train / Metro" value={formState.distanceToTrainMetro} onChange={fieldHandler('distanceToTrainMetro')} placeholder="e.g., 500 m walk" />
                <HostField label="Distance to Beach / City Centre" value={formState.distanceToBeachCityCentre} onChange={fieldHandler('distanceToBeachCityCentre')} placeholder="e.g., 2 km" />
              </div>
            </div>
          </SectionCard>
        )

      // ── PROPERTY DETAILS ──────────────────────────────────────────────────
      case 'details':
        return (
          <>
            <SectionCard>
              <SectionHeading eyebrow="Property Details" title="Capacity & structure" description="Physical dimensions of the property." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <HostField label="Total Rooms" value={formState.totalRooms} onChange={fieldHandler('totalRooms')} type="number" placeholder="e.g., 45" />
                <HostField label="Total Floors" value={formState.totalFloors} onChange={fieldHandler('totalFloors')} type="number" placeholder="e.g., 8" />
                <HostField label="Total Buildings" value={formState.totalBuildings} onChange={fieldHandler('totalBuildings')} type="number" placeholder="e.g., 2" />
                <HostField label="Property Size (m²)" value={formState.propertySizeM2} onChange={fieldHandler('propertySizeM2')} type="number" placeholder="e.g., 3500" />
                <HostField label="Reception Hours" value={formState.receptionHours} onChange={fieldHandler('receptionHours')} placeholder="e.g., 08:00 – 22:00" />
              </div>
              <div className="mt-4">
                <HostToggle
                  label="24-Hour Front Desk"
                  description="Reception is staffed around the clock."
                  checked={formState.is24HrFrontDesk}
                  onChange={(e) => setField('is24HrFrontDesk', e.target.checked)}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Property Details" title="Occupancy" description="Default guest counts for the property." />
              <div className="mt-6 space-y-0">
                {BASIC_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center justify-between border-b border-gray-200 py-4">
                    <span className="text-base font-medium text-dark">{field.label}</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => updateBasics(field.key, Math.max(field.min, formState.basics[field.key] - 1))}
                        disabled={formState.basics[field.key] <= field.min}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-base font-semibold">{formState.basics[field.key]}</span>
                      <button
                        type="button"
                        onClick={() => updateBasics(field.key, Math.min(field.max, formState.basics[field.key] + 1))}
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
                <p className="mb-4 text-sm font-semibold text-dark">Bed type details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <HostField label="Primary bed" value={formState.bedDetails.primary} onChange={updateBedDetail('primary')} placeholder="King bed" />
                  <HostField label="Additional beds" value={formState.bedDetails.secondary} onChange={updateBedDetail('secondary')} placeholder="Sofa bed, twin beds" />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Property Details" title="Check-in & check-out" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Check-in time</label>
                  <input type="time" value={formState.bookingSettings.checkInTime} onChange={updateBooking('checkInTime')} className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Check-out time</label>
                  <input type="time" value={formState.bookingSettings.checkOutTime} onChange={updateBooking('checkOutTime')} className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark" />
                </div>
              </div>
            </SectionCard>
          </>
        )

      // ── AMENITIES ──────────────────────────────────────────────────────────
      case 'amenities':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Amenities" title="Property amenities" description="Select all that apply. Guests filter by these." />
            <div className="mt-6">
              <AmenitiesSelector
                value={formState.amenities}
                onChange={(val) => setField('amenities', val)}
              />
            </div>
          </SectionCard>
        )

      // ── POLICIES ───────────────────────────────────────────────────────────
      case 'policies':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Policies" title="Property policies" description="Clear policies build trust and reduce disputes." />
            <div className="mt-6">
              <PoliciesForm
                value={formState.policies}
                onChange={(val) => setField('policies', val)}
              />
            </div>
          </SectionCard>
        )

      // ── PHOTOS & MEDIA ─────────────────────────────────────────────────────
      case 'media':
        return (
          <>
            <SectionCard>
              <SectionHeading eyebrow="Photos & Media" title="Property photos" description="Upload photos by category. First cover photo appears in search results." />
              <div className="mt-6">
                <PhotoUploader
                  value={formState.photos}
                  onChange={(val) => setField('photos', val)}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Photos & Media" title="Video walkthrough" description="Optional — short walkthrough video (MP4, MOV, max 200 MB)." />
              <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setField('video', { id: `video-${Date.now()}`, preview: URL.createObjectURL(file), file })
                e.target.value = ''
              }} className="hidden" />

              {formState.video ? (
                <div className="mt-6 space-y-3">
                  <div className="relative overflow-hidden rounded-2xl bg-black">
                    <video src={formState.video.preview} controls className="max-h-64 w-full object-contain" />
                    <button type="button" onClick={() => setField('video', null)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-muted">{formState.video.file?.name}</p>
                </div>
              ) : (
                <button type="button" onClick={() => videoInputRef.current?.click()} className="mt-6 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-10 text-center transition-colors hover:border-gray-500">
                  <Film size={34} className="text-gray-400" />
                  <span className="text-base font-semibold text-dark">Add video walkthrough</span>
                  <span className="text-sm text-muted">Optional — helps guests feel confident before booking</span>
                </button>
              )}
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Photos & Media" title="360° virtual tour" description="Embed a link to a 360° tour to increase bookings." />
              <div className="mt-6">
                <HostField
                  label="360° Tour URL"
                  value={formState.tourUrl}
                  onChange={fieldHandler('tourUrl')}
                  placeholder="https://my360tour.com/property-id"
                />
              </div>
            </SectionCard>
          </>
        )

      // ── PRICING ────────────────────────────────────────────────────────────
      case 'pricing':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Pricing" title="Rate configuration" description="Set base rates, discounts, taxes, and currency." />
            <div className="mt-6 space-y-6">
              <div>
                <HostSelect
                  label="Currency"
                  value={formState.pricing.currency}
                  onChange={(e) => updatePricing('currency')(e)}
                  options={CURRENCIES}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <HostField label="Base Price (per night)" value={formState.pricing.weekday} onChange={updatePricing('weekday')} type="number" placeholder="100" />
                <HostField label="Weekend Price (per night)" value={formState.pricing.weekend} onChange={updatePricing('weekend')} type="number" placeholder="120" />
                <HostField label="Seasonal Price (per night)" value={formState.pricing.seasonal} onChange={updatePricing('seasonal')} type="number" placeholder="150" />
                <HostField label="Holiday Price (per night)" value={formState.pricing.holiday} onChange={updatePricing('holiday')} type="number" placeholder="200" />
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="mb-4 text-sm font-semibold text-dark">Discounts (%)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <HostField label="Weekly Discount (%)" value={formState.pricing.weeklyDiscount} onChange={updatePricing('weeklyDiscount')} type="number" placeholder="10" />
                  <HostField label="Monthly Discount (%)" value={formState.pricing.monthlyDiscount} onChange={updatePricing('monthlyDiscount')} type="number" placeholder="20" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="mb-4 text-sm font-semibold text-dark">Taxes & fees</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <HostField label="Taxes (%)" value={formState.pricing.taxes} onChange={updatePricing('taxes')} type="number" placeholder="18" />
                  <HostField label="Service Charges (%)" value={formState.pricing.serviceCharges} onChange={updatePricing('serviceCharges')} type="number" placeholder="5" />
                  <HostField label="Security Deposit (flat)" value={formState.pricing.securityDeposit} onChange={updatePricing('securityDeposit')} type="number" placeholder="500" />
                </div>
              </div>
            </div>
          </SectionCard>
        )

      // ── BOOKING RULES ──────────────────────────────────────────────────────
      case 'booking':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Booking Rules" title="Availability & booking settings" />
            <div className="mt-6 space-y-4">
              <HostToggle
                label="Enable instant booking"
                description="Guests can confirm immediately without host approval."
                checked={formState.bookingSettings.instantBooking}
                onChange={(e) => updateBookingBool('instantBooking')(e.target.checked)}
              />
              <HostToggle
                label="Allow last-minute booking"
                description="Guests can book within the cutoff window below."
                checked={formState.bookingSettings.lastMinuteBooking}
                onChange={(e) => updateBookingBool('lastMinuteBooking')(e.target.checked)}
              />
              <HostToggle
                label="Allow same-day booking"
                description="Guests can book for the same calendar day."
                checked={formState.bookingSettings.sameDayBooking}
                onChange={(e) => updateBookingBool('sameDayBooking')(e.target.checked)}
              />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <HostField label="Minimum Stay (nights)" value={formState.bookingSettings.minimumStay} onChange={updateBooking('minimumStay')} type="number" placeholder="1" />
                <HostField label="Maximum Stay (nights)" value={formState.bookingSettings.maximumStay} onChange={updateBooking('maximumStay')} type="number" placeholder="30" />
                <HostField label="Booking Window (days ahead)" value={formState.bookingSettings.bookingWindow} onChange={updateBooking('bookingWindow')} type="number" placeholder="365" />
                {formState.bookingSettings.lastMinuteBooking && (
                  <HostField label="Last-Minute Cutoff (hours)" value={formState.bookingSettings.lastMinuteCutoffHours} onChange={updateBooking('lastMinuteCutoffHours')} type="number" placeholder="24" />
                )}
              </div>
            </div>
          </SectionCard>
        )

      // ── MEALS & SERVICES ───────────────────────────────────────────────────
      case 'services':
        return (
          <>
            <SectionCard>
              <SectionHeading eyebrow="Meals & Services" title="Meal plans" description="Select the meal options available at your property." />
              <div className="mt-5 flex flex-wrap gap-2">
                {MEAL_PLANS.map((m) => (
                  <PillToggle
                    key={m.id}
                    active={(formState.mealPlans ?? []).includes(m.id)}
                    onClick={() => toggleListField('mealPlans', m.id)}
                  >
                    {m.label}
                  </PillToggle>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Meals & Services" title="Transportation" description="Transport services available to guests." />
              <div className="mt-5 flex flex-wrap gap-2">
                {TRANSPORTATION.map((t) => (
                  <PillToggle
                    key={t.id}
                    active={(formState.transportation ?? []).includes(t.id)}
                    onClick={() => toggleListField('transportation', t.id)}
                  >
                    {t.label}
                  </PillToggle>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Meals & Services" title="Guest services" description="Additional services your team provides." />
              <div className="mt-5 flex flex-wrap gap-2">
                {GUEST_SERVICES.map((g) => (
                  <PillToggle
                    key={g.id}
                    active={(formState.guestServices ?? []).includes(g.id)}
                    onClick={() => toggleListField('guestServices', g.id)}
                  >
                    {g.label}
                  </PillToggle>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="Meals & Services" title="Sustainability" description="Eco-friendly initiatives at your property." />
              <div className="mt-5 flex flex-wrap gap-2">
                {SUSTAINABILITY.map((s) => (
                  <PillToggle
                    key={s.id}
                    active={(formState.sustainability ?? []).includes(s.id)}
                    onClick={() => toggleListField('sustainability', s.id)}
                  >
                    {s.label}
                  </PillToggle>
                ))}
              </div>
            </SectionCard>
          </>
        )

      // ── AI & SEO ───────────────────────────────────────────────────────────
      case 'seo':
        return (
          <>
            <SectionCard>
              <SectionHeading eyebrow="AI & SEO" title="Target audience & USP" description="Used to enrich AI-generated descriptions and search ranking." />
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-dark">Target Audience</label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_AUDIENCE.map((a) => (
                      <PillToggle
                        key={a.id}
                        active={(formState.targetAudience ?? []).includes(a.id)}
                        onClick={() => toggleListField('targetAudience', a.id)}
                      >
                        {a.label}
                      </PillToggle>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-dark">Unique Selling Points</label>
                  <div className="flex flex-wrap gap-2">
                    {USP_OPTIONS.map((u) => (
                      <PillToggle
                        key={u.id}
                        active={(formState.usp ?? []).includes(u.id)}
                        onClick={() => toggleListField('usp', u.id)}
                      >
                        {u.label}
                      </PillToggle>
                    ))}
                  </div>
                </div>

                <HostField
                  label="Nearest Landmark (for description context)"
                  value={formState.nearbyLandmark}
                  onChange={fieldHandler('nearbyLandmark')}
                  placeholder="e.g., 500 m from Hamburg Central Station"
                />

                <HostToggle
                  label="Enable AI Translation"
                  description="AI will auto-translate the listing into French, Spanish, Hindi, German, and Arabic."
                  checked={formState.aiTranslation}
                  onChange={(e) => setField('aiTranslation', e.target.checked)}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading eyebrow="AI & SEO" title="Auto-generated page metadata" description="These are generated from your listing data. No action required." />
              <div className="mt-6 space-y-4">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Page Title Preview</p>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-dark">
                    {[
                      formState.title,
                      formState.starRating ? `${formState.starRating}★` : null,
                      selectedCategory?.label,
                    ].filter(Boolean).join(' | ') || '—'}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">URL Structure Preview</p>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-dark">
                    /{formState.country?.toLowerCase().replace(/\s+/g, '-') || 'country'}/{formState.state?.toLowerCase().replace(/\s+/g, '-') || 'state'}/{formState.location?.toLowerCase().replace(/\s+/g, '-') || 'city'}/{formState.title?.toLowerCase().replace(/\s+/g, '-').slice(0, 30) || 'property-name'}/
                  </div>
                </div>
                <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                  <p className="text-xs font-semibold text-green-700">Schema Markup — Auto-generated</p>
                  <p className="mt-0.5 text-xs text-green-600">Hotel Schema and LocalBusiness Schema are automatically injected into the property detail page.</p>
                </div>
              </div>
            </SectionCard>
          </>
        )

      // ── PAYMENT CONFIG ─────────────────────────────────────────────────────
      case 'payment':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Payment Config" title="Booking & payment options" description="Configure how guests pay and what they see before booking." />
            <div className="mt-6">
              <BookingPaymentConfig
                value={formState.paymentConfig}
                onChange={(val) => setField('paymentConfig', val)}
                pricing={formState.pricing}
              />
            </div>
          </SectionCard>
        )

      // ── CONTACT ────────────────────────────────────────────────────────────
      case 'contact':
        return (
          <SectionCard>
            <SectionHeading eyebrow="Contact" title="Property contact details" description="Visible to Admin and Host only. Hidden from guests until booking is confirmed." />
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Lock size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                Contact details are hidden from travellers until a booking is confirmed. Exchange of phone numbers, email addresses, or any direct contact outside the Travolish messaging system is automatically restricted and monitored.
              </p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <HostField label="Contact Person" value={formState.contactPerson} onChange={fieldHandler('contactPerson')} placeholder="e.g., Rajiv Sharma" />
              <PhoneField label="Phone Number" value={formState.contactPhone} onChange={(v) => setField('contactPhone', v)} variant="host" placeholder="98765 43210" />
              <HostField label="Email Address" value={formState.contactEmail} onChange={fieldHandler('contactEmail')} type="email" placeholder="manager@myproperty.com" />
              <HostField label="Website URL" value={formState.websiteUrl} onChange={fieldHandler('websiteUrl')} placeholder="https://myproperty.com" />
              <PhoneField label="Emergency Contact" value={formState.emergencyContact} onChange={(v) => setField('emergencyContact', v)} variant="host" placeholder="98765 00000" />
            </div>
          </SectionCard>
        )

      // ── STATUS ─────────────────────────────────────────────────────────────
      case 'status': {
        const isPendingReview = formState.status === 'PENDING_REVIEW'
        // Previously-approved listings (LIVE/PAUSED) may freely toggle visibility without re-review.
        // DRAFT listings must go through submit-for-review to become LIVE.
        const editableStatuses = (formState.status === 'LIVE' || formState.status === 'PAUSED')
          ? HOTEL_STATUSES_APPROVED
          : HOTEL_STATUSES_DRAFT
        const statusCfg = {
          LIVE:           { dot: 'bg-emerald-500', border: 'border-emerald-500 bg-emerald-50', label: 'text-emerald-700' },
          DRAFT:          { dot: 'bg-amber-400',   border: 'border-amber-400 bg-amber-50',    label: 'text-amber-700' },
          PAUSED:         { dot: 'bg-rose-400',     border: 'border-rose-400 bg-rose-50',      label: 'text-rose-700' },
          PENDING_REVIEW: { dot: 'bg-sky-400',      border: 'border-sky-400 bg-sky-50',        label: 'text-sky-700' },
        }

        return (
          <SectionCard>
            <SectionHeading eyebrow="Status" title="Listing status" description="Control whether this property is visible to travellers." />

            {/* Admin note callout — shown when listing was returned to DRAFT with feedback */}
            {formState.status === 'DRAFT' && formState.adminNote && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span className="mt-0.5 shrink-0 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Action required from admin review</p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">{formState.adminNote}</p>
                </div>
              </div>
            )}

            {/* Read-only banner when under review */}
            {isPendingReview ? (
              <div className="mt-6 flex items-start gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${statusCfg.PENDING_REVIEW.dot}`} />
                <div>
                  <p className={`text-sm font-semibold ${statusCfg.PENDING_REVIEW.label}`}>Under review</p>
                  <p className="mt-1 text-sm text-muted">
                    Your listing has been submitted and is awaiting admin approval. You cannot change its
                    status while it is under review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {editableStatuses.map((s) => {
                  const selected = formState.status === s.value
                  const cfg = statusCfg[s.value]
                  return (
                    <label
                      key={s.value}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                        selected ? cfg.border : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hotelStatus"
                        value={s.value}
                        checked={selected}
                        onChange={() => setField('status', s.value)}
                        className="accent-brand shrink-0"
                      />
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
                      <span>
                        <span className={`block text-sm font-semibold ${selected ? cfg.label : 'text-dark'}`}>{s.label}</span>
                        <span className="mt-0.5 block text-sm text-muted">{s.description}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            {/* Submit for review — shown only when listing is DRAFT and has been saved (has an id) */}
            {formState.status === 'DRAFT' && id && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <p className="text-sm text-muted">
                  Once your listing is complete, submit it for admin review. You will be notified by
                  email when a decision is made.
                </p>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitForReview}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-dark px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? 'Submitting…' : 'Submit for review'}
                </button>
              </div>
            )}
          </SectionCard>
        )
      }

      default:
        return null
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <HostShell
      eyebrow={id ? 'Edit listing' : 'New listing'}
      title={id ? (formState.title ? `Edit ${formState.title}` : 'Edit listing') : 'New listing'}
      mobileTitle={id ? 'Edit listing' : 'New listing'}
      description="Complete all sections to maximise your listing's visibility and bookings."
      actions={[
        id
          ? { label: 'Open rooms', href: `/host/listings/${id}/rooms`, secondary: true }
          : { label: 'Back to listings', href: '/host/listings', secondary: true },
        { label: saving ? 'Saving…' : (id ? 'Save changes' : 'Save listing'), onClick: handleSave },
      ]}
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: saving ? 'Saving…' : (id ? 'Save changes' : 'Save listing'), onClick: handleSave }}
    >
      {/* Tab navigation */}
      <div className="mb-5 -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-0.5 border-b border-gray-200">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group shrink-0 inline-flex items-center gap-1.5 rounded-t-xl border-b-2 px-3.5 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-dark text-dark'
                    : 'border-transparent text-muted hover:text-dark'
                }`}
              >
                <Icon
                  size={13}
                  className={active ? 'text-dark' : 'text-gray-400 transition-colors group-hover:text-dark'}
                />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main content */}
        <div className="space-y-5">
          {renderTab()}

          {saveError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              {TABS.findIndex((t) => t.id === activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(TABS[TABS.findIndex((t) => t.id === activeTab) - 1].id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
              )}
              {TABS.findIndex((t) => t.id === activeTab) < TABS.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(TABS[TABS.findIndex((t) => t.id === activeTab) + 1].id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : id ? 'Save changes' : 'Save listing'}
            </button>
          </div>
        </div>

        {/* Sidebar preview */}
        <div className="hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <SectionCard>
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-dark">Listing completeness</span>
                  <span className={`font-bold tabular-nums ${completionPct >= 80 ? 'text-emerald-600' : completionPct >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>
                    {completionPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completionPct >= 80 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-[#f4f1ea]">
                {coverPhoto && (
                  <img src={coverPhoto} alt={formState.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill tone={formState.status === 'LIVE' ? 'success' : formState.status === 'PAUSED' ? 'sky' : 'warning'}>
                  {formState.status === 'LIVE' ? 'Live' : formState.status === 'PAUSED' ? 'Paused' : 'Draft'}
                </StatusPill>
                {selectedCategory && <StatusPill tone="sky">{selectedCategory.label}</StatusPill>}
                {formState.starRating && <StatusPill tone="sky">{'★'.repeat(Number(formState.starRating))}</StatusPill>}
              </div>
              <p className="mt-3 text-lg font-semibold tracking-tight text-dark">{formState.title || 'Untitled property'}</p>
              <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-muted">{formState.description}</p>

              <div className="mt-5 grid gap-2.5 border-t border-gray-200 pt-4">
                {[
                  ['Location', [formState.location, formState.country].filter(Boolean).join(', ') || '—'],
                  ['Booking mode', formState.bookingSettings.instantBooking ? 'Instant' : 'Request to book'],
                  ['Min stay', `${formState.bookingSettings.minimumStay || 1} night(s)`],
                  ['Check-in', formState.bookingSettings.checkInTime || '—'],
                  ['Guests', formState.basics.guests],
                  ['Base price', formState.pricing.weekday ? `${formState.pricing.currency} ${formState.pricing.weekday}` : '—'],
                  ['Weekend', formState.pricing.weekend ? `${formState.pricing.currency} ${formState.pricing.weekend}` : '—'],
                  ['Amenities', `${formState.amenities.length} selected`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-muted">{k}</span>
                    <span className="text-right font-semibold text-dark">{v}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="flex flex-col gap-2">
              {TABS.map((tab, i) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-dark font-semibold text-white' : 'text-muted hover:bg-gray-100 hover:text-dark'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${active ? 'bg-white text-dark' : 'bg-gray-200 text-gray-600'}`}>
                      {i + 1}
                    </span>
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </HostShell>
  )
}
