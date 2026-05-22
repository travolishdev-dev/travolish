import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { searchHotels, listRooms } from '../services/hotelsApi'
import { adaptHotels } from '../lib/hotelAdapter'
import { useSearchContext } from '../hooks/useSearchContext'
import SearchControls from '../components/search/SearchControls'
import SearchPropertyCard from '../components/search/SearchPropertyCard'
import SearchResultsMap from '../components/search/SearchResultsMap'
import useNativeAppLocationStore from '../stores/useNativeAppLocationStore'
import {
  formatCoordinates,
  formatPlatformLabel,
  sortPropertiesBySharedLocation,
} from '../lib/nativeAppLocation'

const DEBOUNCE_MS = 350

function SearchCardSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-sm md:grid-cols-[180px_minmax(0,1fr)]">
      <div className="h-40 bg-gray-200 skeleton-shimmer md:h-full md:min-h-[140px]" />
      <div className="space-y-2 p-3">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-5 w-3/4 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="h-5 w-24 rounded-full bg-gray-200" />
          <div className="h-5 w-28 rounded-full bg-gray-200" />
        </div>
        <div className="flex justify-end border-t border-gray-100 pt-2">
          <div className="h-6 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { searchDraft, updateSearchDraft } = useSearchContext()
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [allProperties, setAllProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)
  const sharedLocation = useNativeAppLocationStore()
  const debounceRef = useRef(null)
  const propertyCardRefs = useRef(new Map())

  const destination = searchDraft.destination.trim()

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const [searchResult, rooms] = await Promise.all([
          searchHotels({ query: destination || undefined, pageSize: 50 }),
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
    }, destination ? DEBOUNCE_MS : 0)

    return () => clearTimeout(debounceRef.current)
  }, [destination])

  const parsedMinPrice = minPrice ? parseInt(minPrice, 10) : null
  const parsedMaxPrice = maxPrice ? parseInt(maxPrice, 10) : null
  const parsedMinRating = Number(minRating) || 0

  const filteredResults = allProperties.filter((property) => {
    const matchesMin =
      parsedMinPrice === null ||
      (property.price !== null && property.price >= parsedMinPrice)
    const matchesMax =
      parsedMaxPrice === null ||
      (property.price !== null && property.price <= parsedMaxPrice)
    const matchesRating = !parsedMinRating || Number(property.rating || 0) >= parsedMinRating

    return matchesMin && matchesMax && matchesRating
  })

  const sortedResults = sortPropertiesBySharedLocation(
    filteredResults,
    sharedLocation,
  )
  const sharedCoordinates = formatCoordinates(
    sharedLocation.latitude,
    sharedLocation.longitude,
  )
  const isEmptyState = !isLoading && sortedResults.length === 0
  const visibleCount = sortedResults.length
  const resultScope = destination
    ? `for "${destination}"`
    : sharedLocation.hasSharedLocation
      ? 'near your shared location'
      : 'available now'

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
  }

  const setPropertyCardRef = (propertyId) => (node) => {
    const key = String(propertyId)
    if (node) {
      propertyCardRefs.current.set(key, node)
    } else {
      propertyCardRefs.current.delete(key)
    }
  }

  const handleMapPropertySelect = useCallback((property) => {
    setSelectedPropertyId(property.id)
    propertyCardRefs.current.get(String(property.id))?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [])

  return (
    <Motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 pt-20"
    >
      <SearchControls
        searchDraft={searchDraft}
        updateSearchDraft={updateSearchDraft}
        minPrice={minPrice}
        maxPrice={maxPrice}
        minRating={minRating}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onMinRatingChange={setMinRating}
        onClearFilters={clearFilters}
      />

      <div className="w-full px-4 py-5 md:px-8 xl:px-0 xl:py-0">
        {sharedLocation.isNativeAppLaunch && (
          <div
            className={`mb-5 rounded-2xl border px-5 py-4 xl:mx-12 xl:my-5 ${
              sharedLocation.hasSharedLocation
                ? 'border-brand/15 bg-rose-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 rounded-full p-2 ${
                  sharedLocation.hasSharedLocation
                    ? 'bg-white text-brand'
                    : 'bg-white text-amber-600'
                }`}
              >
                <MapPin size={18} />
              </span>
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
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(460px,42vw)] xl:gap-0">
          <section className="space-y-3 xl:py-6 xl:pl-12 xl:pr-5">
            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Search results
                </p>
                <h1 className="mt-0.5 text-lg font-semibold leading-snug text-dark md:text-xl">
                  {isLoading
                    ? 'Finding stays'
                    : `${visibleCount} stay${visibleCount === 1 ? '' : 's'} ${resultScope}`}
                </h1>
              </div>
              <p className="text-xs text-muted md:text-sm">
                {totalResults > 0
                  ? `${totalResults} total result${totalResults === 1 ? '' : 's'} before filters`
                  : 'Use the top search panel to refine destination, dates, guests, and filters.'}
              </p>
            </div>

            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <SearchCardSkeleton key={index} />
              ))
            ) : isEmptyState ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-gray-200 bg-white px-6 text-center shadow-sm">
                <Search size={48} className="text-gray-300" />
                <h2 className="mt-4 text-xl font-semibold text-dark">No results found</h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Try a different destination or loosen the price and rating filters.
                </p>
              </div>
            ) : (
              sortedResults.map((property) => (
                <div
                  key={property.id}
                  ref={setPropertyCardRef(property.id)}
                  className={`scroll-mt-48 transition-shadow duration-300 ${
                    selectedPropertyId === property.id
                      ? 'ring-2 ring-brand ring-offset-2 ring-offset-gray-50'
                      : ''
                  }`}
                >
                  <SearchPropertyCard property={property} />
                </div>
              ))
            )}
          </section>

          <aside className="hidden xl:block">
            <SearchResultsMap
              properties={isLoading ? [] : sortedResults}
              destination={destination}
              onPropertySelect={handleMapPropertySelect}
            />
          </aside>
        </div>

        {!isLoading && sortedResults.length > 0 && (
          <div className="mt-6 xl:hidden">
            <SearchResultsMap
              properties={sortedResults}
              destination={destination}
              compact
              onPropertySelect={handleMapPropertySelect}
            />
          </div>
        )}
      </div>
    </Motion.main>
  )
}
