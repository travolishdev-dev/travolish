import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star, Heart, Share2, ChevronLeft, Users, BedDouble, Bath, Home,
  Wifi, Waves, Utensils, Car, AirVent, WashingMachine, Wind, Flame,
  Eye, Tv, Dumbbell, Coffee, MapPin, DoorOpen, Mountain, Sailboat,
  Snowflake, Thermometer, Monitor, Zap, PawPrint, ShieldCheck,
  BadgeCheck, Clock3, FileText, PlayCircle, ReceiptText, TrainFront,
  UserRound, Plane, Building2, Landmark, ShoppingBag, Hospital, Trees,
} from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { getHotel, listRooms, getHotelReviews, getNearbyAttractions } from '../services/hotelsApi'
import { getHotelRatingStats } from '../services/reviewsApi'
import { adaptHotel } from '../lib/hotelAdapter'
import useWishlistStore from '../stores/useWishlistStore'
import ImageGallery from '../components/property/ImageGallery'
import BookingWidget from '../components/property/BookingWidget'
import LocationMap from '../components/property/LocationMap'
import useCurrency from '../hooks/useCurrency'

const amenityIconMap = {
  'Wifi': Wifi, 'Pool': Waves, 'Kitchen': Utensils, 'Free parking': Car,
  'Air conditioning': AirVent, 'Washer': WashingMachine, 'Dryer': Wind,
  'Hot tub': Flame, 'BBQ grill': Flame, 'Ocean view': Eye, 'TV': Tv,
  'Gym': Dumbbell, 'Coffee maker': Coffee, 'Fireplace': Flame,
  'Balcony': DoorOpen, 'Mountain view': Mountain, 'Lake access': Sailboat,
  'Ski-in/ski-out': Snowflake, 'Heating': Thermometer, 'Workspace': Monitor,
  'EV charger': Zap, 'Pet friendly': PawPrint,
}

const HOUSE_RULES = [
  'Quiet hours after 10:00 PM',
  'No smoking inside rooms or shared indoor areas',
  'Visitors must be registered with the front desk',
  'Pets allowed only where the room policy confirms it',
]

const ATTRACTION_TYPE_ICON = {
  AIRPORT: Plane,
  TRAIN_STATION: TrainFront,
  METRO: TrainFront,
  BEACH: Waves,
  CITY_CENTRE: Building2,
  LANDMARK: Landmark,
  RESTAURANT: Utensils,
  SHOPPING: ShoppingBag,
  HOSPITAL: Hospital,
  PARK: Trees,
  OTHER: MapPin,
}

function normalizeConfigured(items) {
  return items.map((item) => ({
    id: String(item.id),
    title: item.name,
    detail: item.distanceText || '',
    icon: ATTRACTION_TYPE_ICON[item.attractionType] ?? MapPin,
  }))
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km) {
  if (km < 0.12) return 'Under 2 min walk'
  if (km < 0.5) return `${Math.round(km * 1000)} m walk`
  if (km < 2) return `${(Math.round(km * 10) / 10).toFixed(1)} km · ${Math.round(km * 12)} min walk`
  return `${(Math.round(km * 10) / 10).toFixed(1)} km · ${Math.round(km * 3)} min drive`
}

function osmTagToIcon(tags) {
  if (tags.aeroway === 'aerodrome') return Plane
  if (tags.railway === 'station' || tags.railway === 'halt') return TrainFront
  if (tags.public_transport === 'station') return TrainFront
  if (tags.highway === 'bus_stop') return TrainFront
  if (tags.natural === 'beach') return Waves
  if (tags.leisure === 'park' || tags.leisure === 'garden') return Trees
  if (tags.tourism === 'attraction' || tags.tourism === 'museum' || tags.tourism === 'gallery') return Landmark
  if (tags.amenity === 'shopping_mall') return ShoppingBag
  if (tags.amenity === 'hospital') return Hospital
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'bar' || tags.amenity === 'fast_food') return Utensils
  return MapPin
}

async function fetchAutoAttractions(lat, lng) {
  const cacheKey = `overpass:${lat.toFixed(3)},${lng.toFixed(3)}`
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {}

  const query = `[out:json][timeout:10];(node["amenity"~"^(restaurant|cafe|bar|fast_food|shopping_mall|hospital)$"]["name"](around:1000,${lat},${lng});node["railway"~"^(station|halt)$"]["name"](around:1500,${lat},${lng});node["highway"="bus_stop"]["name"](around:600,${lat},${lng});node["leisure"~"^(park|garden)$"]["name"](around:1000,${lat},${lng});node["natural"="beach"]["name"](around:2500,${lat},${lng});node["tourism"~"^(attraction|museum|gallery)$"]["name"](around:1500,${lat},${lng});node["aeroway"="aerodrome"]["name"](around:8000,${lat},${lng}););out 16;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  if (!res.ok) return []
  const data = await res.json()
  const seen = new Set()
  const results = (data.elements ?? [])
    .map((el) => {
      const name = el.tags?.name || el.tags?.['name:en']
      if (!name || el.lat == null || el.lon == null) return null
      const km = haversineKm(lat, lng, el.lat, el.lon)
      return { id: `osm-${el.id}`, title: name, detail: formatDistance(km), icon: osmTagToIcon(el.tags ?? {}), km }
    })
    .filter((item) => {
      if (!item) return false
      const key = item.title.slice(0, 20).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.km - b.km)
    .slice(0, 6)
  try { sessionStorage.setItem(cacheKey, JSON.stringify(results)) } catch {}
  return results
}

function formatReviewDate(iso) {
  try {
    return format(parseISO(iso), 'MMMM yyyy')
  } catch {
    return ''
  }
}

function buildRoomSummary(rooms) {
  if (!rooms.length) return null
  const types = [...new Set(rooms.map((r) => r.type).filter(Boolean))]
  const typesLabel = types.length
    ? types.map((t) => t.charAt(0) + t.slice(1).toLowerCase()).join(', ')
    : 'Hotel'
  const cheapest = rooms.reduce((min, r) =>
    r.pricePerNight < min.pricePerNight ? r : min
  )
  return { typesLabel, cheapestPrice: Math.round(cheapest.pricePerNight) }
}

function buildPriceMap(rooms) {
  const map = {}
  rooms.forEach((r) => {
    if (r.hotelId == null) return
    if (map[r.hotelId] === undefined || r.pricePerNight < map[r.hotelId]) {
      map[r.hotelId] = r.pricePerNight
    }
  })
  return map
}

function buildHostProfile(property) {
  const hostName = property.host?.name && property.host.name !== 'Host'
    ? property.host.name
    : `${property.title.split(' ')[0]} host`

  return {
    name: hostName,
    joined: 'Hosting since 2021',
    rating: property.rating || 'New',
    reviews: property.reviewCount || 0,
    responseRate: '97%',
    responseTime: 'Usually replies within 1 hour',
    bio: 'Local hospitality team focused on clean arrivals, fast replies, and practical neighborhood guidance.',
    superhost: property.host?.superhost || Number(property.id) % 2 === 0,
  }
}

function buildPricePreview(property, rooms) {
  const nightly = Math.round(
    Number(
      rooms.find((room) => room.available)?.pricePerNight ??
        rooms[0]?.pricePerNight ??
        property.price ??
        0,
    ),
  )
  const nights = 3
  const base = nightly * nights
  const serviceFee = Math.round(base * 0.1)
  const taxes = Math.round(base * 0.08)

  return {
    nightly,
    nights,
    base,
    serviceFee,
    taxes,
    total: base + serviceFee + taxes,
  }
}

function DetailSkeleton() {
  return (
    <div className="pt-20 pb-16 px-6 md:px-10 xl:px-20 max-w-[1120px] mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_375px] gap-12">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="hidden lg:block h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
}

export default function PropertyDetailPage() {
  const { t } = useTranslation(['property', 'common'])
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [rooms, setRooms] = useState([])
  const [reviews, setReviews] = useState([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [ratingStats, setRatingStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [configuredAttractions, setConfiguredAttractions] = useState([])
  const [autoAttractions, setAutoAttractions] = useState([])
  const [attractionsLoading, setAttractionsLoading] = useState(false)

  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(id))
  const { formatCurrency } = useCurrency()

  const reviewsRef = useRef(null)
  const mapRef = useRef(null)
  const scrollToReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToMap = () => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setNotFound(false)
      try {
        const [hotel, hotelRooms, reviewsPage, stats, nearbyRaw] = await Promise.all([
          getHotel(id),
          listRooms(id),
          getHotelReviews(id),
          getHotelRatingStats(id).catch(() => null),
          getNearbyAttractions(id).catch(() => []),
        ])
        if (cancelled) return

        const priceMap = buildPriceMap(hotelRooms)
        const adapted = adaptHotel(hotel, priceMap)

        const approvedReviews = (reviewsPage.content ?? []).filter(
          (r) => r.status === 'APPROVED',
        )
        const count = stats?.totalReviews ?? reviewsPage.totalElements ?? 0
        const avg = stats?.averageRating
          ?? (approvedReviews.length > 0
            ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
            : hotel.rating ?? 0)

        adapted.reviewCount = count
        adapted.rating = Math.round(avg * 10) / 10 || hotel.rating || 0
        adapted.guests = hotelRooms.length > 0 ? hotelRooms.length * 2 : 2

        const configured = normalizeConfigured(Array.isArray(nearbyRaw) ? nearbyRaw : [])
        setConfiguredAttractions(configured)
        setProperty(adapted)
        setRooms(hotelRooms)
        setReviews(approvedReviews)
        setTotalReviews(count)
        setAvgRating(adapted.rating)
        setRatingStats(stats)

        if (configured.length === 0 && adapted.coordinates?.lat && adapted.coordinates?.lng) {
          setAttractionsLoading(true)
          fetchAutoAttractions(adapted.coordinates.lat, adapted.coordinates.lng)
            .then((results) => { if (!cancelled) setAutoAttractions(results) })
            .catch(() => {})
            .finally(() => { if (!cancelled) setAttractionsLoading(false) })
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // Must be before early returns to satisfy React hooks rules
  const roomSummary = useMemo(() => buildRoomSummary(rooms), [rooms])
  const hostProfile = useMemo(() => property ? buildHostProfile(property) : null, [property])
  const pricePreview = useMemo(() => property ? buildPricePreview(property, rooms) : null, [property, rooms])

  if (isLoading) return <DetailSkeleton />

  if (notFound || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-dark">
          <Home size={32} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-dark">{t('notFound')}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">This property may no longer be available or the link is incorrect.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t('goHome')}
        </button>
      </div>
    )
  }

  const hasAmenities = property.amenities?.length > 0
  const hasCoordinates =
    property.coordinates &&
    (property.coordinates.lat !== 0 || property.coordinates.lng !== 0)

  return (
    <Motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-20 pb-16 px-6 md:px-10 xl:px-20 max-w-[1120px] mx-auto"
    >
      {/* Back Button (mobile) */}
      <button
        onClick={() => navigate(-1)}
        className="md:hidden flex items-center gap-1 text-sm text-dark font-semibold mb-4 -ml-1"
      >
        <ChevronLeft size={20} />
        {t('back')}
      </button>

      {/* Title Section */}
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[28px] font-semibold text-dark leading-tight">
          {property.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-1.5 text-sm flex-wrap">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold">{avgRating}</span>
            {totalReviews > 0 && (
              <>
                <span className="text-muted">·</span>
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-dark underline font-medium hover:text-brand transition-colors"
                >
                  {t('common:review', { count: totalReviews })}
                </button>
              </>
            )}
            <span className="text-muted">·</span>
            <button
              type="button"
              onClick={scrollToMap}
              className="text-dark underline font-medium hover:text-brand transition-colors"
            >
              {property.location}{property.country ? `, ${property.country}` : ''}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1.5 text-sm font-semibold hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
              <Share2 size={16} />
              {t('share')}
            </button>
            <button
              onClick={() => toggleWishlist(property.id)}
              className="flex items-center gap-1.5 text-sm font-semibold hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
            >
              <Heart size={16} className={isWishlisted ? 'fill-brand text-brand' : ''} />
              {t('saveToWishlist')}
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={property.images} title={property.title} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_375px] gap-12 mt-10">
        {/* Left Column */}
        <div>
          {/* Property / Room header */}
          <div className="flex items-center justify-between pb-8 border-b border-gray-200">
            <div>
              <h2 className="text-xl md:text-[22px] font-semibold text-dark">
                {roomSummary ? `${roomSummary.typesLabel} rooms` : 'Hotel'} · {property.title}
              </h2>
              <p className="text-muted mt-1 text-sm md:text-base">
                {property.guests} guests
                {rooms.length > 0 && ` · ${t('room', { count: rooms.length })}`}
                {roomSummary && ` · from ${formatCurrency(roomSummary.cheapestPrice)}/${t('perNight')}`}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center flex-shrink-0 ml-4">
              <span className="text-white font-semibold text-lg">{property.title[0]}</span>
            </div>
          </div>

          {/* Host Info */}
          <div className="py-8 border-b border-gray-200">
            <div className="grid gap-5 rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5 sm:grid-cols-[auto_minmax(0,1fr)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark text-white flex-shrink-0">
                <UserRound size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-dark">{t('hostedBy')} {hostProfile.name}</h2>
                  {hostProfile.superhost && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck size={13} />
                      {t('verifiedHost')}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{hostProfile.bio}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: t('hostRating'), value: hostProfile.rating },
                    { label: t('responseRate'), value: hostProfile.responseRate },
                    { label: t('responseTime'), value: hostProfile.responseTime },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-dark">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">
                  {hostProfile.joined} · {t('common:review', { count: hostProfile.reviews })}
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="py-8 border-b border-gray-200 space-y-5">
            {[
              { Icon: MapPin, bg: 'bg-rose-50 text-brand', title: t('greatLocation'), desc: '95% of recent guests gave the location a 5-star rating.' },
              { Icon: Home, bg: 'bg-sky-50 text-sky-700', title: t('selfCheckIn'), desc: 'Check yourself in with the smart lock.' },
            ].map(({ Icon, bg, title, desc }) => (
              <div key={title} className="flex gap-5">
                <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${bg}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-semibold text-dark">{title}</p>
                  <p className="text-muted text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div className="py-8 border-b border-gray-200">
              <p className="text-dark leading-[1.75] text-[15px]">{property.description}</p>
            </div>
          )}

          {/* Video Walkthrough */}
          {property.videoUrl && (
            <div className="py-8 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <PlayCircle size={22} className="text-dark" />
                <h2 className="text-xl font-semibold text-dark">{t('videoWalkthrough')}</h2>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black">
                <video controls preload="metadata" poster={property.images?.[0]} className="aspect-video w-full bg-black object-cover">
                  <source src={property.videoUrl} />
                  Your browser does not support video playback.
                </video>
              </div>
            </div>
          )}

          {/* Amenities */}
          {hasAmenities && (
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-dark mb-5">{t('whatOffers')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {property.amenities.map((amenity) => {
                  const Icon = amenityIconMap[amenity] || Home
                  return (
                    <div key={amenity} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-dark">
                        <Icon size={17} strokeWidth={1.5} />
                      </span>
                      <span className="text-dark text-[15px]">{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rooms — horizontal scroll on mobile, 2-col grid on desktop */}
          {rooms.length > 0 && (
            <div className="py-8 border-b border-gray-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-1">{t('availableRooms')}</p>
              <h2 className="text-xl font-semibold text-dark mb-5">Choose your room</h2>
              <div className="-mx-6 px-6 sm:mx-0 sm:px-0">
                <div className="grid grid-flow-col auto-cols-[80%] sm:grid-flow-row sm:grid-cols-2 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
                  {rooms.map((room) => (
                    <div key={room.id} className="snap-start rounded-2xl border border-gray-200 bg-[#fcfcfb] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-dark">
                            <BedDouble size={18} strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-dark capitalize truncate">
                              {room.type ? room.type.charAt(0) + room.type.slice(1).toLowerCase() : 'Room'} · #{room.number}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${room.available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                              <p className="text-xs text-muted">{room.available ? t('available') : t('unavailable')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-dark tabular-nums">{formatCurrency(room.pricePerNight)}</p>
                          <p className="text-xs text-muted">/{t('perNight')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Price Preview */}
          <div className="py-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-dark">
                <ReceiptText size={17} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-dark">{t('pricePreview')}</h2>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">{formatCurrency(pricePreview.nightly)} × {pricePreview.nights} nights</span>
                  <span className="font-semibold text-dark tabular-nums">{formatCurrency(pricePreview.base)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">{t('serviceFee')}</span>
                  <span className="font-semibold text-dark tabular-nums">{formatCurrency(pricePreview.serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">{t('taxes')}</span>
                  <span className="font-semibold text-dark tabular-nums">{formatCurrency(pricePreview.taxes)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base">
                  <span className="font-semibold text-dark">{t('estimatedTotal')}</span>
                  <span className="font-bold text-dark tabular-nums">{formatCurrency(pricePreview.total)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">
                Final pricing is calculated again at checkout for exact dates, selected room, discounts, and live tax rules.
              </p>
            </div>
          </div>

          {/* House Rules + Cancellation */}
          <div className="py-8 border-b border-gray-200">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-dark">
                    <FileText size={17} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-semibold text-dark">{t('houseRules')}</h2>
                </div>
                <div className="space-y-2.5">
                  {HOUSE_RULES.map((rule) => (
                    <div key={rule} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3">
                      <ShieldCheck size={15} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                      <p className="text-sm leading-6 text-dark">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-dark">
                    <Clock3 size={17} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-semibold text-dark">{t('cancellationPolicy')}</h2>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5">
                  <p className="text-sm font-semibold text-dark">{t('freeCancellation')}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Cancel at least 48 hours before check-in for a strong refund estimate. Later cancellations may include host and service-fee deductions.
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Refund terms shown before final confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Attractions */}
          {(() => {
            const displayAttractions = configuredAttractions.length > 0 ? configuredAttractions : autoAttractions
            const isAuto = configuredAttractions.length === 0 && autoAttractions.length > 0
            if (!attractionsLoading && displayAttractions.length === 0) return null
            return (
              <div className="py-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-dark">{t('nearbyAttractions')}</h2>
                  {isAuto && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Auto-detected</span>
                  )}
                </div>
                {attractionsLoading ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-[88px] rounded-2xl skeleton-shimmer" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {displayAttractions.map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.id} className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-brand">
                            <Icon size={17} />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-dark">{item.title}</p>
                          <p className="mt-1 text-xs text-muted">{item.detail}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Reviews — horizontal scroll on mobile, 2-col grid on desktop */}
          <div ref={reviewsRef} className="py-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Star size={20} className="fill-amber-400 text-amber-400" />
              <h2 className="text-xl font-semibold text-dark">
                {avgRating}
                {totalReviews > 0 && ` · ${t('common:review', { count: totalReviews })}`}
              </h2>
            </div>

            {/* Rating Bars */}
            {ratingStats && ratingStats.totalReviews > 0 && (
              <div className="mb-8 space-y-2 max-w-xs">
                {[
                  { label: '5 ★', count: ratingStats.fiveStars ?? 0 },
                  { label: '4 ★', count: ratingStats.fourStars ?? 0 },
                  { label: '3 ★', count: ratingStats.threeStars ?? 0 },
                  { label: '2 ★', count: ratingStats.twoStars ?? 0 },
                  { label: '1 ★', count: ratingStats.oneStar ?? 0 },
                ].map((item) => {
                  const pct = ratingStats.totalReviews > 0
                    ? Math.round((item.count / ratingStats.totalReviews) * 100)
                    : 0
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-9 flex-shrink-0 text-sm font-medium text-dark">{item.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-dark rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-xs font-semibold tabular-nums text-muted">{item.count}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Review Cards */}
            {reviews.length > 0 ? (
              <div className="-mx-6 px-6 sm:mx-0 sm:px-0">
                <div className="grid grid-flow-col auto-cols-[80%] sm:grid-flow-row sm:grid-cols-2 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
                  {reviews.map((review) => (
                    <div key={review.id} className="snap-start rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">G</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark">{t('verifiedGuest')}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs text-muted mt-0.5">{formatReviewDate(review.createdAt)}</p>
                        </div>
                      </div>
                      {review.title && (
                        <p className="text-sm font-semibold text-dark mt-4">{review.title}</p>
                      )}
                      <p className="text-sm leading-relaxed text-dark line-clamp-4 mt-2">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">{t('noReviews')}</p>
            )}
          </div>

          {/* Location Map */}
          {hasCoordinates && (
            <div ref={mapRef} className="py-8">
              <h2 className="text-xl font-semibold text-dark mb-6">{t('location')}</h2>
              <LocationMap
                coordinates={property.coordinates}
                location={`${property.location}, ${property.country}`}
              />
            </div>
          )}
        </div>

        {/* Right Column — Booking Widget */}
        <div className="hidden lg:block">
          <BookingWidget property={property} rooms={rooms} />
        </div>
      </div>

      {/* Mobile Booking Bar */}
      {property.price !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white/95 px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div>
            <p className="text-[15px]">
              <span className="font-bold">{formatCurrency(property.price)}</span>
              <span className="text-muted"> {t('perNight')}</span>
            </p>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-dark">{avgRating}</span>
                {totalReviews > 0 && (
                  <span className="text-xs text-muted">· {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
                )}
              </div>
            )}
          </div>
          <button className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
            {t('reserve')}
          </button>
        </div>
      )}
    </Motion.main>
  )
}
