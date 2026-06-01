import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Map, Sparkles } from 'lucide-react'
import HomeSearchPanel from '../components/home/HomeSearchPanel'
import PropertyCard from '../components/home/PropertyCard'
import PopularDestinations from '../components/home/PopularDestinations'
import RecentSearches from '../components/home/RecentSearches'
import { searchHotels, listRooms } from '../services/hotelsApi'
import { adaptHotels } from '../lib/hotelAdapter'
import useNativeAppLocationStore from '../stores/useNativeAppLocationStore'
import {
  formatCoordinates,
  formatPlatformLabel,
  sortPropertiesBySharedLocation,
} from '../lib/nativeAppLocation'

const SECTION_SIZE = 8
const CARD_TRACK_ITEM_CLASS =
  'shrink-0 snap-start basis-[82%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)] xl:basis-[calc((100%-3.75rem)/4)] 2xl:basis-[calc((100%-5rem)/5)]'

const recommendationModes = [
  {
    id: 'trusted',
    label: 'Most trusted',
    signal: 'ratings, reviews, and booking confidence',
  },
  {
    id: 'value',
    label: 'Best value',
    signal: 'lower nightly rates with strong guest feedback',
  },
  {
    id: 'weekend',
    label: 'Weekend ready',
    signal: 'easy-to-book stays with broad appeal',
  },
]

function scrollCardTrack(trackRef, direction) {
  const track = trackRef.current
  if (!track) return

  const firstItem = track.querySelector('[data-carousel-item]')
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 20
  const distance = firstItem
    ? firstItem.getBoundingClientRect().width + gap
    : track.clientWidth * 0.82

  track.scrollBy({
    left: direction * distance,
    behavior: 'smooth',
  })
}

function CarouselControls({ onPrevious, onNext }) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        type="button"
        onClick={onPrevious}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        aria-label="Scroll to previous cards"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        aria-label="Scroll to next cards"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

function ViewAllCard({ title = 'View all stays', description = 'Open the full search page to compare more hotels, dates, and prices.' }) {
  return (
    <Link
      to="/search"
      className="group flex min-h-[356px] h-full flex-col justify-between rounded-card border border-dashed border-gray-300 bg-white p-5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          More options
        </p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight text-dark">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-300 text-dark transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
        <ArrowRight size={20} />
      </span>
    </Link>
  )
}

function PropertyCardSkeleton({ variant = 'default' }) {
  if (variant === 'deal') {
    return (
      <div className="overflow-hidden rounded-card border border-gray-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="h-48 skeleton-shimmer" />
        <div className="space-y-3 p-4">
          <div className="h-5 w-4/5 rounded-full bg-gray-200" />
          <div className="h-4 w-1/2 rounded-full bg-gray-200" />
          <div className="h-5 w-3/5 rounded-md bg-gray-200" />
          <div className="h-7 w-1/2 rounded-full bg-gray-200" />
          <div className="h-4 w-2/3 rounded-full bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-8" />
        </div>
        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-1" />
      </div>
    </div>
  )
}

function SectionSkeleton() {
  const trackRef = useRef(null)

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-full bg-gray-200" />
          <div className="h-8 w-72 rounded-full bg-gray-200" />
          <div className="h-4 w-[28rem] max-w-full rounded-full bg-gray-200" />
        </div>
        <CarouselControls
          onPrevious={() => scrollCardTrack(trackRef, -1)}
          onNext={() => scrollCardTrack(trackRef, 1)}
        />
      </div>

      <div
        ref={trackRef}
        className="hide-scrollbar -my-2 flex touch-pan-x snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-2"
      >
        {Array.from({ length: SECTION_SIZE }).map((_, index) => (
          <div key={index} data-carousel-item className={CARD_TRACK_ITEM_CLASS}>
            <PropertyCardSkeleton variant="deal" />
          </div>
        ))}
      </div>
    </section>
  )
}

function PropertySection({ eyebrow, title, description, propertiesToShow }) {
  const trackRef = useRef(null)

  if (!propertiesToShow.length) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-[28px] leading-tight font-semibold text-dark">
            {title}
          </h2>
          <p className="mt-2 text-sm md:text-[15px] leading-6 text-muted">
            {description}
          </p>
        </div>
        <CarouselControls
          onPrevious={() => scrollCardTrack(trackRef, -1)}
          onNext={() => scrollCardTrack(trackRef, 1)}
        />
      </div>

      <div
        ref={trackRef}
        className="hide-scrollbar -my-2 flex touch-pan-x snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-2"
      >
        {propertiesToShow.map((property, index) => (
          <div
            key={property.id}
            data-carousel-item
            className={CARD_TRACK_ITEM_CLASS}
          >
            <PropertyCard
              property={property}
              index={index}
              variant="deal"
            />
          </div>
        ))}
        <div data-carousel-item className={CARD_TRACK_ITEM_CLASS}>
          <ViewAllCard
            title={`View all ${eyebrow.toLowerCase()}`}
            description="See the complete hotel list with search filters, map view, and more stay options."
          />
        </div>
      </div>
    </section>
  )
}

function scoreRecommendation(property, modeId) {
  const rating = Number(property.rating ?? 0)
  const reviews = Number(property.reviewCount ?? 0)
  const price = Number(property.price ?? property.displayPrice ?? 0)
  const valueBoost = price ? Math.max(0, 10000 - price) / 1000 : 0

  if (modeId === 'value') return rating * 8 + reviews / 25 + valueBoost
  if (modeId === 'weekend') return rating * 7 + reviews / 30 + (property.images?.length ?? 0)
  return rating * 10 + reviews / 18
}

function RecommendationControls({ activeMode, onModeChange }) {
  const selected = recommendationModes.find((mode) => mode.id === activeMode) ?? recommendationModes[0]

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <Sparkles size={14} className="text-brand" />
            AI recommendations
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-dark">
            Tune the shortlist
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ranking currently prioritizes {selected.signal}.
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {recommendationModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeMode === mode.id
                  ? 'bg-dark text-white'
                  : 'border border-gray-200 bg-[#fcfbf8] text-dark hover:bg-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [recommendationMode, setRecommendationMode] = useState('trusted')
  const sharedLocation = useNativeAppLocationStore()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [searchResult, rooms] = await Promise.all([
          searchHotels({ pageSize: 20 }),
          listRooms(),
        ])
        if (cancelled) return
        setProperties(adaptHotels(searchResult.content ?? [], rooms))
      } catch {
        // API unavailable — leave properties empty
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const platformLabel = formatPlatformLabel(sharedLocation.platform)
  const sharedCoordinates = formatCoordinates(
    sharedLocation.latitude,
    sharedLocation.longitude,
  )

  const nearbySource = sharedLocation.hasSharedLocation
    ? sortPropertiesBySharedLocation(properties, sharedLocation)
    : [...properties].sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount
        return b.rating - a.rating
      })

  const nearbyProperties = nearbySource.slice(0, SECTION_SIZE)
  const nearbyIds = new Set(nearbyProperties.map((p) => p.id))
  const recommendedProperties = [...properties]
    .filter((p) => !nearbyIds.has(p.id))
    .sort((a, b) => scoreRecommendation(b, recommendationMode) - scoreRecommendation(a, recommendationMode))
    .slice(0, SECTION_SIZE)
  const selectedRecommendationMode =
    recommendationModes.find((mode) => mode.id === recommendationMode) ?? recommendationModes[0]

  const nearbyTitle = sharedLocation.hasSharedLocation
    ? 'Hotel deals near your handoff'
    : 'Hotel deals worth opening'
  const nearbyDescription = sharedLocation.hasSharedLocation
    ? `Sorted around ${sharedCoordinates} from your ${platformLabel.toLowerCase()} handoff so nearby stays stay easy to compare.`
    : 'A focused shortlist of stays with strong ratings, useful details, and clear next steps.'
  const recommendedDescription =
    `A preference-aware shortlist ranked by ${selectedRecommendationMode.signal}.`

  return (
    <main className="pb-16">
      <HomeSearchPanel />

      <div className="max-w-[1760px] mx-auto space-y-16 px-6 pt-12 md:px-10 md:pt-14 xl:px-20">
        <RecentSearches />

        {isLoading ? (
          <div className="space-y-16">
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        ) : (
          <div className="space-y-16">
            <PropertySection
              eyebrow="Smart picks"
              title={nearbyTitle}
              description={nearbyDescription}
              propertiesToShow={nearbyProperties}
            />

            {recommendedProperties.length > 0 && (
              <RecommendationControls
                activeMode={recommendationMode}
                onModeChange={setRecommendationMode}
              />
            )}

            <PropertySection
              eyebrow="Recommended"
              title={`${selectedRecommendationMode.label} for your next stay`}
              description={recommendedDescription}
              propertiesToShow={recommendedProperties}
            />
          </div>
        )}

        <PopularDestinations />

        {!isLoading &&
          sharedLocation.hasSharedLocation &&
          nearbySource.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/map-view')}
            className="fixed bottom-6 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-gray-800"
          >
            <Map size={16} />
            Map view
          </button>
        )}
      </div>
    </main>
  )
}
