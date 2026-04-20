import { useParams, useNavigate } from 'react-router-dom'
import {
  Star, Heart, Share2, ChevronLeft, Users, BedDouble, Bath, Home,
  Wifi, Waves, Utensils, Car, AirVent, WashingMachine, Wind, Flame,
  Eye, Tv, Dumbbell, Coffee, MapPin, DoorOpen, Mountain, Sailboat,
  Snowflake, Thermometer, Monitor, Zap, PawPrint
} from 'lucide-react'
import { motion } from 'framer-motion'
import { properties, reviews } from '../data/mockData'
import useWishlistStore from '../stores/useWishlistStore'
import ImageGallery from '../components/property/ImageGallery'
import BookingWidget from '../components/property/BookingWidget'
import LocationMap from '../components/property/LocationMap'

const amenityIconMap = {
  'Wifi': Wifi, 'Pool': Waves, 'Kitchen': Utensils, 'Free parking': Car,
  'Air conditioning': AirVent, 'Washer': WashingMachine, 'Dryer': Wind,
  'Hot tub': Flame, 'BBQ grill': Flame, 'Ocean view': Eye, 'TV': Tv,
  'Gym': Dumbbell, 'Coffee maker': Coffee, 'Fireplace': Flame,
  'Balcony': DoorOpen, 'Mountain view': Mountain, 'Lake access': Sailboat,
  'Ski-in/ski-out': Snowflake, 'Heating': Thermometer, 'Workspace': Monitor,
  'EV charger': Zap, 'Pet friendly': PawPrint,
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const property = properties.find((p) => p.id === parseInt(id))
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(parseInt(id)))

  if (!property) {
    return (
      <div className="pt-28 text-center min-h-screen">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-brand underline font-semibold"
        >
          Go home
        </button>
      </div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-24 pb-16 px-6 md:px-10 xl:px-20 max-w-[1120px] mx-auto"
    >
      {/* Back Button (mobile) */}
      <button
        onClick={() => navigate(-1)}
        className="md:hidden flex items-center gap-1 text-sm text-dark font-semibold mb-4 -ml-1"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      {/* Title Section */}
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[28px] font-semibold text-dark leading-tight">
          {property.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-1.5 text-sm flex-wrap">
            <Star size={14} className="fill-dark text-dark" />
            <span className="font-semibold">{property.rating}</span>
            <span className="text-muted">·</span>
            <span className="text-dark underline cursor-pointer font-medium">
              {property.reviewCount} reviews
            </span>
            {property.host.superhost && (
              <>
                <span className="text-muted">·</span>
                <span className="text-dark font-medium">★ Superhost</span>
              </>
            )}
            <span className="text-muted">·</span>
            <span className="text-dark underline cursor-pointer font-medium">
              {property.location}, {property.country}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-semibold underline hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={() => toggleWishlist(property.id)}
              className="flex items-center gap-1.5 text-sm font-semibold underline hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <Heart
                size={16}
                className={isWishlisted ? 'fill-brand text-brand' : ''}
              />
              Save
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
          {/* Host Info */}
          <div className="flex items-center justify-between pb-8 border-b border-gray-200">
            <div>
              <h2 className="text-xl md:text-[22px] font-semibold text-dark">
                {property.subtitle} hosted by {property.host.name}
              </h2>
              <p className="text-muted mt-1 text-sm md:text-base">
                {property.guests} guests · {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''} · {property.beds} bed{property.beds !== 1 ? 's' : ''} · {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 ml-4">
              <span className="text-white font-semibold text-lg">
                {property.host.name[0]}
              </span>
            </div>
          </div>

          {/* Highlights */}
          <div className="py-8 border-b border-gray-200 space-y-6">
            {property.host.superhost && (
              <div className="flex gap-5">
                <Star size={26} className="text-dark flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-dark">{property.host.name} is a Superhost</p>
                  <p className="text-muted text-sm mt-1">
                    Superhosts are experienced, highly rated hosts who are committed to providing great stays.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-5">
              <MapPin size={26} className="text-dark flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-dark">Great location</p>
                <p className="text-muted text-sm mt-1">
                  95% of recent guests gave the location a 5-star rating.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <Home size={26} className="text-dark flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-dark">Self check-in</p>
                <p className="text-muted text-sm mt-1">
                  Check yourself in with the smart lock.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="py-8 border-b border-gray-200">
            <p className="text-dark leading-[1.7] text-[15px]">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-dark mb-6">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((amenity) => {
                const Icon = amenityIconMap[amenity] || Home
                return (
                  <div key={amenity} className="flex items-center gap-4 py-2.5">
                    <Icon size={24} className="text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-dark text-[15px]">{amenity}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reviews */}
          <div className="py-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-8">
              <Star size={20} className="fill-dark text-dark" />
              <h2 className="text-xl font-semibold text-dark">
                {property.rating} · {property.reviewCount} reviews
              </h2>
            </div>

            {/* Rating Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 mb-10">
              {[
                { label: 'Cleanliness', score: 4.9 },
                { label: 'Accuracy', score: 4.8 },
                { label: 'Communication', score: 5.0 },
                { label: 'Location', score: 4.9 },
                { label: 'Check-in', score: 5.0 },
                { label: 'Value', score: 4.7 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-dark w-28 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dark rounded-full"
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-dark w-6 text-right">{item.score}</span>
                </div>
              ))}
            </div>

            {/* Review Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {review.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">{review.author}</p>
                      <p className="text-xs text-muted">{review.date}</p>
                    </div>
                  </div>
                  <p className="text-sm text-dark leading-relaxed line-clamp-3">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="py-8">
            <h2 className="text-xl font-semibold text-dark mb-6">Where you'll be</h2>
            <LocationMap coordinates={property.coordinates} location={`${property.location}, ${property.country}`} />
          </div>
        </div>

        {/* Right Column - Booking Widget */}
        <div className="hidden lg:block">
          <BookingWidget property={property} />
        </div>
      </div>

      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between lg:hidden z-50">
        <div>
          <p className="text-[15px]">
            <span className="font-bold">${property.price}</span>
            <span className="text-muted"> night</span>
          </p>
          <p className="text-xs text-dark underline font-semibold">{property.dates}</p>
        </div>
        <button className="bg-gradient-to-r from-brand to-rose-500 text-white rounded-xl px-6 py-3 text-sm font-bold">
          Reserve
        </button>
      </div>
    </motion.main>
  )
}
