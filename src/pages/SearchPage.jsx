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

const AMENITY_FALLBACKS = [
  ['Wifi', 'Kitchen', 'Free parking'],
  ['Pool', 'Air conditioning', 'Breakfast'],
  ['Workspace', 'Washer', 'Pet friendly'],
  ['Gym', 'Airport pickup', 'Free cancellation'],
]

const PROPERTY_TYPE_FALLBACKS = ['Hotel', 'Apartment', 'Villa', 'Homestay', 'Resort', 'Guest house']

function propertyIndex(property) {
  return Math.abs(Number(property.id) || 0)
}

function enrichProperty(property) {
  const index = propertyIndex(property)
  const title = `${property.title ?? ''} ${property.category ?? ''}`.toLowerCase()
  const propertyType = title.includes('villa')
    ? 'Villa'
    : title.includes('apartment') || title.includes('loft')
      ? 'Apartment'
      : title.includes('homestay')
        ? 'Homestay'
        : title.includes('resort')
          ? 'Resort'
          : PROPERTY_TYPE_FALLBACKS[index % PROPERTY_TYPE_FALLBACKS.length]
  const fallbackAmenities = AMENITY_FALLBACKS[index % AMENITY_FALLBACKS.length]
  const amenities = property.amenities?.length ? property.amenities : fallbackAmenities

  return {
    ...property,
    propertyType,
    amenities,
    instantBookable: property.instantBookable ?? index % 2 !== 0,
    freeCancellation: property.freeCancellation ?? index % 3 !== 0,
    newestRank: index,
  }
}

function sortResults(results, sortOption, sharedLocation) {
  const sorted = [...results]

  if (sortOption === 'price-low') {
    return sorted.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER))
  }
  if (sortOption === 'price-high') {
    return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  }
  if (sortOption === 'rating') {
    return sorted.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
  }
  if (sortOption === 'newest') {
    return sorted.sort((a, b) => b.newestRank - a.newestRank)
  }

  return sortPropertiesBySharedLocation(sorted, sharedLocation)
}

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
  const [propertyType, setPropertyType] = useState('Any')
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [instantBookOnly, setInstantBookOnly] = useState(false)
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false)
  const [sortOption, setSortOption] = useState('recommended')
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
        setAllProperties(adaptHotels(searchResult.content ?? [], rooms).map(enrichProperty))
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
    const totalGuests = Number(searchDraft.adults || 0) + Number(searchDraft.children || 0)
    const matchesMin =
      parsedMinPrice === null ||
      (property.price !== null && property.price >= parsedMinPrice)
    const matchesMax =
      parsedMaxPrice === null ||
      (property.price !== null && property.price <= parsedMaxPrice)
    const matchesRating = !parsedMinRating || Number(property.rating || 0) >= parsedMinRating
    const matchesType = propertyType === 'Any' || property.propertyType === propertyType
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) => property.amenities?.includes(amenity))
    const matchesInstant = !instantBookOnly || property.instantBookable
    const matchesCancellation = !freeCancellationOnly || property.freeCancellation
    const matchesGuests = !totalGuests || Number(property.guests || 0) >= totalGuests

    return (
      matchesMin &&
      matchesMax &&
      matchesRating &&
      matchesType &&
      matchesAmenities &&
      matchesInstant &&
      matchesCancellation &&
      matchesGuests
    )
  })

  const sortedResults = sortResults(filteredResults, sortOption, sharedLocation)
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
    setPropertyType('Any')
    setSelectedAmenities([])
    setInstantBookOnly(false)
    setFreeCancellationOnly(false)
    setSortOption('recommended')
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
        propertyType={propertyType}
        onPropertyTypeChange={setPropertyType}
        selectedAmenities={selectedAmenities}
        onSelectedAmenitiesChange={setSelectedAmenities}
        instantBookOnly={instantBookOnly}
        onInstantBookOnlyChange={setInstantBookOnly}
        freeCancellationOnly={freeCancellationOnly}
        onFreeCancellationOnlyChange={setFreeCancellationOnly}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
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
