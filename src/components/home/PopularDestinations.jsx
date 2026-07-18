import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSearchContext } from '../../hooks/useSearchContext'
import useCurrency from '../../hooks/useCurrency'
import { searchHotels } from '../../services/hotelsApi'

const DESTINATION_CARD_ITEM_CLASS =
  'shrink-0 snap-start basis-[82%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)] 2xl:basis-[calc((100%-5rem)/5)]'

function smoothScrollBy(el, left) {
  const supportsSmooth = 'scrollBehavior' in document.documentElement.style
  if (supportsSmooth) {
    el.scrollBy({ left, behavior: 'smooth' })
    return
  }
  const start = el.scrollLeft
  const target = start + left
  const duration = 280
  let startTime = null
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    el.scrollLeft = start + (target - start) * ease
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function scrollDestinationTrack(trackRef, direction) {
  const track = trackRef.current
  if (!track) return

  const firstItem = track.querySelector('[data-destination-carousel-item]')
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 20
  const distance = firstItem
    ? firstItem.getBoundingClientRect().width + gap
    : track.clientWidth * 0.82

  smoothScrollBy(track, direction * distance)
}

function DestinationCarouselControls({ onPrevious, onNext }) {
  const { t } = useTranslation('home')
  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        type="button"
        onClick={onPrevious}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        aria-label={t('popularDestinations.scrollPrev')}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        aria-label={t('popularDestinations.scrollNext')}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

// Static images and search queries per destination
const CITY_DESTINATIONS = [
  { name: 'Mumbai',    query: 'Mumbai',    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&auto=format&fit=crop' },
  { name: 'Mussoorie', query: 'Mussoorie', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop' },
  { name: 'Rishikesh', query: 'Rishikesh', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop' },
  { name: 'Manali',    query: 'Manali',    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop' },
  { name: 'Jaipur',    query: 'Jaipur',    image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop' },
]

const REGIONAL_DESTINATIONS = [
  { name: 'Goa',       query: 'Goa',       image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop' },
  { name: 'Kerala',    query: 'Kerala',    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&auto=format&fit=crop' },
  { name: 'Rajasthan', query: 'Rajasthan', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop' },
  { name: 'Himachal',  query: 'Himachal',  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop' },
  { name: 'Ladakh',    query: 'Ladakh',    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=900&auto=format&fit=crop' },
]

export default function PopularDestinations() {
  const { t } = useTranslation('home')
  const [activeTab, setActiveTab] = useState('cities')
  const [liveCounts, setLiveCounts] = useState({})
  const trackRef = useRef(null)
  const navigate = useNavigate()
  const { updateSearchDraft } = useSearchContext()
  const { formatCurrency } = useCurrency()

  const allDestinations = [...CITY_DESTINATIONS, ...REGIONAL_DESTINATIONS]

  useEffect(() => {
    Promise.all(
      allDestinations.map(({ name, query }) =>
        searchHotels({ query, pageSize: 1 })
          .then((r) => [name, r.totalElements ?? 0])
          .catch(() => [name, null]),
      ),
    ).then((entries) => setLiveCounts(Object.fromEntries(entries)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const destinations = activeTab === 'cities' ? CITY_DESTINATIONS : REGIONAL_DESTINATIONS

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (trackRef.current) smoothScrollBy(trackRef.current, -trackRef.current.scrollLeft)
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t('popularDestinations.eyebrow')}
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight text-dark">
            {t('popularDestinations.heading')}
          </h2>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end md:flex-row md:items-center">
          <div className="flex w-full rounded-[14px] bg-gray-100 p-1 sm:w-auto">
            {[
              { id: 'cities', label: t('popularDestinations.cities') },
              { id: 'destinations', label: t('popularDestinations.destinations') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
                  activeTab === tab.id
                    ? 'bg-white text-dark shadow-sm'
                    : 'text-muted hover:text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <DestinationCarouselControls
            onPrevious={() => scrollDestinationTrack(trackRef, -1)}
            onNext={() => scrollDestinationTrack(trackRef, 1)}
          />
        </div>
      </div>

      <div
        ref={trackRef}
        className="hide-scrollbar -my-2 flex touch-pan-x snap-x snap-proximity gap-5 overflow-x-auto overscroll-x-contain py-2"
      >
        {destinations.map((destination) => (
          <button
            key={destination.name}
            type="button"
            data-destination-carousel-item
            onClick={() => {
              updateSearchDraft({ destination: destination.name })
              navigate('/search')
            }}
            className={`${DESTINATION_CARD_ITEM_CLASS} group overflow-hidden rounded-card border border-gray-200 bg-white text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] card-hover-lift`}
          >
            <div className="h-44 overflow-hidden bg-gray-100">
              <img
                src={destination.image}
                alt={destination.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
            <div className="flex items-end justify-between gap-4 p-4">
              <div>
                <h3 className="text-xl font-semibold text-dark">
                  {destination.name}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {liveCounts[destination.name] != null && liveCounts[destination.name] > 0 ? (
                    t('popularDestinations.hotel', { count: liveCounts[destination.name] })
                  ) : (
                    <span className="text-muted">{t('popularDestinations.exploreStays')}</span>
                  )}
                </p>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-dark transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <ArrowRight size={18} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
