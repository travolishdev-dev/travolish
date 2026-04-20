import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Map } from 'lucide-react'
import PropertyCard from '../components/home/PropertyCard'
import { properties } from '../data/mockData'
import useNativeAppLocationStore from '../stores/useNativeAppLocationStore'
import {
  formatCoordinates,
  formatPlatformLabel,
  sortPropertiesBySharedLocation,
} from '../lib/nativeAppLocation'

const SECTION_SIZE = 6

function PropertyCardSkeleton() {
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
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-gray-200" />
        <div className="h-8 w-72 rounded-full bg-gray-200" />
        <div className="h-4 w-[28rem] max-w-full rounded-full bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-6 gap-y-10">
        {Array.from({ length: SECTION_SIZE }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

function PropertySection({
  eyebrow,
  title,
  description,
  propertiesToShow,
}) {
  return (
    <section className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-6 gap-y-10">
        {propertiesToShow.map((property, index) => (
          <PropertyCard key={property.id} property={property} index={index} />
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const sharedLocation = useNativeAppLocationStore()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const platformLabel = formatPlatformLabel(sharedLocation.platform)
  const sharedCoordinates = formatCoordinates(
    sharedLocation.latitude,
    sharedLocation.longitude,
  )
  const nearbySource = sharedLocation.hasSharedLocation
    ? sortPropertiesBySharedLocation(properties, sharedLocation)
    : [...properties].sort((left, right) => {
        if (right.reviewCount !== left.reviewCount) {
          return right.reviewCount - left.reviewCount
        }

        return right.rating - left.rating
      })
  const nearbyProperties = nearbySource.slice(0, SECTION_SIZE)
  const nearbyIds = new Set(nearbyProperties.map((property) => property.id))
  const recommendedProperties = [...properties]
    .filter((property) => !nearbyIds.has(property.id))
    .sort((left, right) => {
      const hostDifference =
        Number(right.host.superhost) - Number(left.host.superhost)

      if (hostDifference !== 0) {
        return hostDifference
      }

      if (right.rating !== left.rating) {
        return right.rating - left.rating
      }

      return right.reviewCount - left.reviewCount
    })
    .slice(0, SECTION_SIZE)

  const nearbyTitle = sharedLocation.hasSharedLocation
    ? 'Frequently searched near you'
    : 'Frequently searched stays'
  const nearbyDescription = sharedLocation.hasSharedLocation
    ? `Sorted around ${sharedCoordinates} from your ${platformLabel.toLowerCase()} handoff so the first homes feel close, practical, and easy to open from mobile.`
    : 'A fast shortlist of places travelers usually open first when they begin browsing for a stay.'
  const recommendedDescription =
    'A second pass of standout homes with strong ratings, reliable hosts, and memorable experiences for longer browsing.'

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20">
        <div className="max-w-4xl mb-12">
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight text-dark">
            Find the right stay faster.
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted leading-7">
            The home feed is now focused on two things only: what feels close to
            you right now and what looks worth opening next.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-16">
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        ) : (
          <div className="space-y-16">
            <PropertySection
              eyebrow="Near You"
              title={nearbyTitle}
              description={nearbyDescription}
              propertiesToShow={nearbyProperties}
            />

            <div className="rounded-[32px] bg-gradient-to-br from-gray-50 via-white to-rose-50 border border-gray-200 px-6 py-8 md:px-8 md:py-10">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm text-brand">
                  <Sparkles size={22} />
                </div>
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Recommended
                  </p>
                  <h2 className="mt-2 text-[28px] leading-tight font-semibold text-dark">
                    Recommended for your next stay
                  </h2>
                  <p className="mt-2 text-sm md:text-[15px] leading-6 text-muted">
                    {recommendedDescription}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-6 gap-y-10">
                {recommendedProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

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
