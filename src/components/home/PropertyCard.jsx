import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import useWishlistStore from '../../stores/useWishlistStore'
import useCurrency from '../../hooks/useCurrency'

const fallbackImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'

function getRatingLabel(rating) {
  if (rating >= 4.8) return 'Excellent'
  if (rating >= 4.4) return 'Very good'
  if (rating >= 4) return 'Good'
  return 'Guest rated'
}

function getFallbackPrice(id) {
  const seed = Number.parseInt(id, 10)
  const base = Number.isNaN(seed) ? 7 : seed
  return 2800 + ((base * 673) % 5200)
}

function getDisplayPrice(property) {
  return property.price ?? getFallbackPrice(property.id)
}

function getDealBadge(id) {
  const value = Number.parseInt(id, 10)
  const percentage = Number.isNaN(value) ? 18 : 16 + (value % 12)
  return `${percentage}% better value today`
}

export default function PropertyCard({ property, index = 0, variant = 'default' }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(property.id))
  const { formatCurrency } = useCurrency()
  const images = property.images?.length ? property.images : [fallbackImage]
  const revealDelay = `${Math.min(index, 8) * 35}ms`

  const nextImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(property.id)
  }

  if (variant === 'deal') {
    const formattedPrice = formatCurrency(getDisplayPrice(property))

    return (
      <div
        className="transition-all duration-300"
        style={{ transitionDelay: revealDelay }}
      >
        <Link
          to={`/property/${property.id}`}
          className="group block h-full overflow-hidden rounded-card border border-gray-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
        >
          <div
            className="relative h-40 overflow-hidden bg-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer" />
            )}
            <img
              src={images[currentImage]}
              alt={property.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.03] ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <button
              onClick={handleWishlist}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-dark shadow-sm transition-transform active:scale-95"
              aria-label="Save property"
            >
              <Heart
                size={18}
                strokeWidth={2}
                className={`transition-all ${
                  isWishlisted ? 'fill-brand text-brand' : 'text-dark'
                }`}
              />
            </button>

            {property.host?.superhost && (
              <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-dark shadow-sm">
                Superhost
              </div>
            )}

            {isHovered && currentImage > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-md transition-all hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft size={17} />
              </button>
            )}
            {isHovered && currentImage < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-md transition-all hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight size={17} />
              </button>
            )}
          </div>

          <div className="space-y-2.5 p-3.5">
            <div>
              <h3 className="truncate text-base font-semibold leading-6 text-dark">
                {property.title}
              </h3>
              <p className="mt-1 truncate text-sm text-muted">
                {[property.location, property.country].filter(Boolean).join(', ')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                {Number(property.rating || 0).toFixed(1)}
              </span>
              <span className="font-semibold text-dark">
                {getRatingLabel(property.rating || 0)}
              </span>
              <span className="text-muted">
                ({property.reviewCount || 'New'})
              </span>
            </div>

            <div className="inline-flex max-w-full rounded-md bg-rose-700 px-2 py-1 text-xs font-semibold text-white">
              <span className="truncate">{getDealBadge(property.id)}</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted">Travolish stay</p>
              <p className="text-xs text-muted">
                <span className="text-lg font-semibold text-dark">
                  {formattedPrice}
                </span>{' '}
                per night
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-xs text-muted">
                <p className="truncate">
                  {property.dates || 'Flexible dates'}
                </p>
                <p className="truncate">Free cancellation</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-300 text-dark transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <ArrowRight size={18} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div
      className="transition-all duration-300"
      style={{ transitionDelay: revealDelay }}
    >
      <Link to={`/property/${property.id}`} className="group block">
        <div
          className="relative aspect-square rounded-xl overflow-hidden mb-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
          )}
          <img
            src={images[currentImage]}
            alt={property.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Wishlist Heart */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 p-1 transition-transform active:scale-90"
          >
            <Heart
              size={24}
              strokeWidth={2}
              className={`drop-shadow-md transition-all duration-200 ${
                isWishlisted
                  ? 'fill-brand text-brand scale-110'
                  : 'fill-black/20 text-white hover:fill-black/40'
              }`}
            />
          </button>

          {/* Superhost Badge */}
          {property.host.superhost && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm">
              Superhost
            </div>
          )}

          {/* Navigation Arrows */}
          {isHovered && currentImage > 0 && (
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {isHovered && currentImage < images.length - 1 && (
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentImage
                    ? 'bg-white w-[7px] h-[7px]'
                    : 'bg-white/60 w-[5px] h-[5px]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] text-dark truncate">
              {property.location}, {property.country}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star size={13} className="fill-dark text-dark" />
              <span className="text-sm font-medium">{property.rating}</span>
            </div>
          </div>
          <p className="text-muted text-sm truncate">{property.title}</p>
          <p className="text-muted text-sm">{property.dates}</p>
          <p className="text-[15px] mt-1">
            <span className="font-semibold">{formatCurrency(getDisplayPrice(property))}</span>
            <span className="text-muted font-normal"> night</span>
          </p>
        </div>
      </Link>
    </div>
  )
}
