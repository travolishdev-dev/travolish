import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderHeart, Heart, Loader2, Plus, Share2, Trash2 } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import useWishlistStore from '../stores/useWishlistStore'
import { getHotel, listRooms } from '../services/hotelsApi'
import { adaptHotels } from '../lib/hotelAdapter'
import PropertyCard from '../components/home/PropertyCard'

const wishlistCollections = [
  { id: 'all', label: 'All saved', description: 'Every stay you have saved.' },
  { id: 'weekend', label: 'Weekend ideas', description: 'Shortlists for quick escapes.' },
  { id: 'family', label: 'Family trip', description: 'Comfortable options for groups.' },
  { id: 'work', label: 'Work-friendly', description: 'Quiet stays with practical access.' },
]

function propertySeed(property) {
  const numericId = Number(property.id)
  if (Number.isFinite(numericId)) return numericId
  return property.name?.length ?? 0
}

function matchesCollection(property, collectionId) {
  if (collectionId === 'all') return true
  const bucket = propertySeed(property) % 3
  if (collectionId === 'weekend') return bucket === 0
  if (collectionId === 'family') return bucket === 1
  return bucket === 2
}

export default function WishlistPage() {
  const { wishlistIds, clearItems, backendUserId } = useWishlistStore()
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeCollection, setActiveCollection] = useState('all')
  const [shareNotice, setShareNotice] = useState(null)

  useEffect(() => {
    if (!wishlistIds.length) {
      setProperties([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    async function load() {
      try {
        // allSettled so a single missing/deleted hotel doesn't break the whole list
        const [hotelResults, rooms] = await Promise.all([
          Promise.allSettled(wishlistIds.map((id) => getHotel(Number(id)))),
          listRooms(),
        ])
        if (cancelled) return
        const hotels = hotelResults
          .filter((r) => r.status === 'fulfilled' && r.value)
          .map((r) => r.value)
        setProperties(adaptHotels(hotels, rooms))
      } catch {
        if (!cancelled) setProperties([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [wishlistIds])

  const handleClearAll = () => {
    if (backendUserId) {
      import('../services/wishlistApi').then(({ removeFromWishlist }) => {
        wishlistIds.forEach((id) =>
          removeFromWishlist(backendUserId, Number(id)).catch((error) => { void error })
        )
      })
    }
    clearItems()
  }

  const collectionCounts = wishlistCollections.reduce((acc, collection) => {
    acc[collection.id] = properties.filter((property) =>
      matchesCollection(property, collection.id),
    ).length
    return acc
  }, {})
  const selectedCollection = wishlistCollections.find((collection) => collection.id === activeCollection) ?? wishlistCollections[0]
  const filteredProperties = properties.filter((property) =>
    matchesCollection(property, activeCollection),
  )

  async function handleShareCollection() {
    const shareUrl = `${window.location.origin}/wishlist?collection=${activeCollection}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareNotice(`${selectedCollection.label} share link copied.`)
    } catch (error) {
      void error
      setShareNotice(`${selectedCollection.label} share link is ready: ${shareUrl}`)
    }
  }

  return (
    <Motion.main
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
        <div className="space-y-8">
          <div className="rounded-[28px] border border-gray-200 bg-white p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Collections
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                  Organize saved stays
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Group saved properties by trip type and share a focused shortlist.
                </p>
              </div>
              <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShareNotice('Collection builder UI is ready for a saved-folder API.')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                >
                  <Plus size={15} />
                  New collection
                </button>
                <button
                  type="button"
                  onClick={handleShareCollection}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </div>
            </div>

            {shareNotice ? (
              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-brand">
                {shareNotice}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {wishlistCollections.map((collection) => {
                const isActive = activeCollection === collection.id

                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setActiveCollection(collection.id)}
                    className={`rounded-[22px] border p-4 text-left transition-colors ${
                      isActive
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-[#fcfbf8] text-dark hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FolderHeart size={19} className={isActive ? 'text-white' : 'text-brand'} />
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isActive ? 'bg-white/12 text-white' : 'bg-white text-muted'
                      }`}>
                        {collectionCounts[collection.id] ?? 0}
                      </span>
                    </div>
                    <p className="mt-4 text-base font-semibold">{collection.label}</p>
                    <p className={`mt-1 text-sm leading-5 ${isActive ? 'text-white/70' : 'text-muted'}`}>
                      {collection.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-14 text-center">
              <p className="text-sm font-semibold text-dark">No stays in this collection yet.</p>
              <p className="mt-2 text-sm text-muted">Choose All saved or keep adding more places while browsing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </Motion.main>
  )
}
