import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import useWishlistStore from '../../stores/useWishlistStore'

export default function PropertyCard({ property, index = 0 }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(property.id))

  const nextImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImage((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(property.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
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
            src={property.images[currentImage]}
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
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronLeft size={16} />
            </motion.button>
          )}
          {isHovered && currentImage < property.images.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronRight size={16} />
            </motion.button>
          )}

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {property.images.slice(0, 5).map((_, i) => (
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
            <span className="font-semibold">${property.price}</span>
            <span className="text-muted font-normal"> night</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
