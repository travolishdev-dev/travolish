import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react'
import useWishlistStore from '../../stores/useWishlistStore'

const fallbackImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'

function formatPrice(price) {
  if (price === null || price === undefined) return 'Price on request'
  return `Rs. ${Number(price).toLocaleString('en-IN')}`
}

function getRatingLabel(rating) {
  if (rating >= 4.8) return 'Excellent'
  if (rating >= 4.4) return 'Very good'
  if (rating >= 4) return 'Good'
  return 'Guest rated'
}

export default function SearchPropertyCard({ property }) {
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(property.id))
  const image = property.images?.[0] || fallbackImage
  const priceLabel = formatPrice(property.price)

  const handleWishlist = (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggleWishlist(property.id)
  }

  return (
    <Link
      to={`/property/${property.id}`}
      className="group grid overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:grid-cols-[180px_minmax(0,1fr)]"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100 md:h-full md:min-h-[140px]">
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-dark shadow-sm transition-transform active:scale-95"
          aria-label="Save property"
        >
          <Heart
            size={16}
            className={isWishlisted ? 'fill-brand text-brand' : 'text-dark'}
          />
        </button>
        {property.host?.superhost && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-dark shadow-sm">
            Superhost
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-2 p-3">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <MapPin size={13} className="text-brand" />
                <span className="truncate">
                  {[property.location, property.country].filter(Boolean).join(', ')}
                </span>
              </p>
              <h2 className="mt-1 line-clamp-1 text-[15px] font-semibold leading-5 text-dark">
                {property.title}
              </h2>
            </div>

            <div className="flex w-full flex-shrink-0 items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end sm:gap-1">
              <div className="text-left sm:text-right">
                <p className="text-base font-bold leading-tight text-dark">
                  {priceLabel}
                </p>
                {property.price !== null && property.price !== undefined && (
                  <p className="text-xs text-muted">per night</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-dark">
                <Star size={12} className="fill-dark text-dark" />
                {Number(property.rating || 0).toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-dark">
              {getRatingLabel(property.rating || 0)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-dark">
              <UsersRound size={12} />
              {property.guests || 2} guests
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck size={12} />
              Free cancellation
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2">
          <p className="text-xs text-muted">Taxes shown at checkout</p>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-dark">
            View details
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 text-dark transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
              <ArrowRight size={15} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
