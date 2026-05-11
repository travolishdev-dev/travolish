import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { searchHotels, listRooms } from '../services/hotelsApi'
import { adaptHotels } from '../lib/hotelAdapter'
import PropertyCard from '../components/home/PropertyCard'
import useNativeAppLocationStore from '../stores/useNativeAppLocationStore'
import {
  formatCoordinates,
  formatPlatformLabel,
  sortPropertiesBySharedLocation,
} from '../lib/nativeAppLocation'

const DEBOUNCE_MS = 350

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [allProperties, setAllProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const sharedLocation = useNativeAppLocationStore()
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const [searchResult, rooms] = await Promise.all([
          searchHotels({ name: query || undefined, pageSize: 50 }),
          listRooms(),
        ])
        setAllProperties(adaptHotels(searchResult.content ?? [], rooms))
        setTotalResults(searchResult.totalElements ?? 0)
      } catch {
        setAllProperties([])
        setTotalResults(0)
      } finally {
        setIsLoading(false)
      }
    }, query ? DEBOUNCE_MS : 0)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Price filter stays client-side (API has no price param)
  const filtered = allProperties.filter((p) => {
    const matchesMin = !minPrice || (p.price !== null && p.price >= parseInt(minPrice))
    const matchesMax = !maxPrice || (p.price !== null && p.price <= parseInt(maxPrice))
    return matchesMin && matchesMax
  })

  const sortedResults = sortPropertiesBySharedLocation(filtered, sharedLocation)
  const sharedCoordinates = formatCoordinates(
    sharedLocation.latitude,
    sharedLocation.longitude,
  )

  const isEmptyState = !isLoading && sortedResults.length === 0
  const showSuggestions = !query && !isLoading && allProperties.length > 0

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-24 pb-16 min-h-screen"
    >
      {/* Search Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-6">
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hotels, cities, countries..."
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-dark focus:ring-1 focus:ring-dark transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 border rounded-full text-sm font-semibold transition-all ${
                showFilters ? 'border-dark bg-gray-50' : 'border-gray-300 hover:border-dark'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-3xl mx-auto mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Min price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-dark transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Max price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Any"
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-dark transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setMinPrice(''); setMaxPrice('') }}
                    className="text-sm font-semibold text-dark underline hover:text-muted transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {sharedLocation.isNativeAppLaunch && (
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 pt-8">
          <div
            className={`rounded-2xl border px-5 py-4 ${
              sharedLocation.hasSharedLocation
                ? 'border-brand/15 bg-rose-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 rounded-full p-2 ${
                  sharedLocation.hasSharedLocation
                    ? 'bg-white text-brand'
                    : 'bg-white text-amber-600'
                }`}
              >
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {formatPlatformLabel(sharedLocation.platform)} handoff
                </p>
                <h2 className="mt-1 text-lg font-semibold text-dark">
                  {sharedLocation.hasSharedLocation
                    ? 'Search results are sorted by your shared location'
                    : 'Location was not shared from the app'}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {sharedLocation.hasSharedLocation
                    ? `${sharedCoordinates} · Permission granted`
                    : `Permission status: ${
                        sharedLocation.locationPermission || 'unknown'
                      }. Showing the default result order.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Suggestions (when no query) */}
      {showSuggestions && !sharedLocation.hasSharedLocation && (
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-8">
          <h2 className="text-lg font-semibold text-dark mb-4">Popular destinations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Malibu', emoji: '🏖️' },
              { name: 'Paris', emoji: '🗼' },
              { name: 'Bora Bora', emoji: '🌴' },
              { name: 'Zermatt', emoji: '🏔️' },
              { name: 'Tokyo', emoji: '🏯' },
              { name: 'Tuscany', emoji: '🍷' },
            ].map((dest) => (
              <button
                key={dest.name}
                onClick={() => setQuery(dest.name)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-dark hover:shadow-md transition-all group"
              >
                <span className="text-2xl">{dest.emoji}</span>
                <span className="text-sm font-semibold text-dark group-hover:text-brand transition-colors">
                  {dest.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {(query || sharedLocation.hasSharedLocation) && !isEmptyState && (
              <p className="text-sm text-muted mb-6">
                {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''}
                {query ? ` for "${query}"` : ' closest to your shared location'}
              </p>
            )}

            {isEmptyState ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={48} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-dark mb-2">No results found</h2>
                <p className="text-muted text-sm max-w-md">
                  Try searching for a different destination or adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                {sortedResults.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.main>
  )
}
