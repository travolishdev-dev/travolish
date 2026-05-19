import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import useWishlistStore from '../stores/useWishlistStore'
import { getHotel, listRooms } from '../services/hotelsApi'
import { adaptHotels } from '../lib/hotelAdapter'
import PropertyCard from '../components/home/PropertyCard'

export default function WishlistPage() {
  const { wishlistIds, clearItems, backendUserId } = useWishlistStore()
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!wishlistIds.length) {
      setProperties([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    async function load() {
      try {
        const [hotels, rooms] = await Promise.all([
          Promise.all(wishlistIds.map((id) => getHotel(Number(id)))),
          listRooms(),
        ])
        if (cancelled) return
        setProperties(adaptHotels(hotels.filter(Boolean), rooms))
      } catch {
        if (!cancelled) setProperties([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [wishlistIds.length])

  const handleClearAll = () => {
    if (backendUserId) {
      import('../services/wishlistApi').then(({ removeFromWishlist }) => {
        wishlistIds.forEach((id) =>
          removeFromWishlist(backendUserId, Number(id)).catch(() => {})
        )
      })
    }
    clearItems()
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-28 pb-16 px-6 md:px-10 xl:px-20 max-w-[1760px] mx-auto min-h-screen"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-dark">Wishlists</h1>
        {wishlistIds.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-sm text-muted hover:text-dark transition-colors"
          >
            <Trash2 size={16} />
            Clear all
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-muted" />
        </div>
      ) : wishlistIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Heart size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-dark mb-2">
            Create your first wishlist
          </h2>
          <p className="text-muted text-sm max-w-md mb-8">
            As you search, click the heart icon to save your favorite places and experiences to a wishlist.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-dark text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
          {properties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      )}
    </motion.main>
  )
}
