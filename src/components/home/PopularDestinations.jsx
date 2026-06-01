import { useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSearchContext } from '../../hooks/useSearchContext'
import useCurrency from '../../hooks/useCurrency'

const DESTINATION_CARD_ITEM_CLASS =
  'shrink-0 snap-start basis-[82%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)] 2xl:basis-[calc((100%-5rem)/5)]'

function scrollDestinationTrack(trackRef, direction) {
  const track = trackRef.current
  if (!track) return

  const firstItem = track.querySelector('[data-destination-carousel-item]')
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 20
  const distance = firstItem
    ? firstItem.getBoundingClientRect().width + gap
    : track.clientWidth * 0.82

  track.scrollBy({
    left: direction * distance,
    behavior: 'smooth',
  })
}

function DestinationCarouselControls({ onPrevious, onNext }) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        type="button"
        onClick={onPrevious}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        aria-label="Scroll to previous destinations"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        aria-label="Scroll to next destinations"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

const cityDestinations = [
  {
    name: 'Mumbai',
    count: '5,496 hotels',
    averagePrice: 6624,
    image:
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&auto=format&fit=crop',
  },
  {
    name: 'Mussoorie',
    count: '1,435 hotels',
    averagePrice: 7238,
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop',
  },
  {
    name: 'Rishikesh',
    count: '2,112 hotels',
    averagePrice: 5959,
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop',
  },
  {
    name: 'Manali',
    count: '3,803 hotels',
    averagePrice: 5070,
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop',
  },
  {
    name: 'Jaipur',
    count: '4,129 hotels',
    averagePrice: 4860,
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop',
  },
]

const regionalDestinations = [
  {
    name: 'Goa',
    count: '4,820 stays',
    averagePrice: 6180,
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop',
  },
  {
    name: 'Kerala',
    count: '3,214 stays',
    averagePrice: 5420,
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&auto=format&fit=crop',
  },
  {
    name: 'Rajasthan',
    count: '6,108 stays',
    averagePrice: 6980,
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop',
  },
  {
    name: 'Himachal',
    count: '2,944 stays',
    averagePrice: 5260,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop',
  },
  {
    name: 'Ladakh',
    count: '1,286 stays',
    averagePrice: 6740,
    image:
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=900&auto=format&fit=crop',
  },
]

export default function PopularDestinations() {
  const [activeTab, setActiveTab] = useState('cities')
  const trackRef = useRef(null)
  const navigate = useNavigate()
  const { updateSearchDraft } = useSearchContext()
  const { formatCurrency } = useCurrency()
  const destinations =
    activeTab === 'cities' ? cityDestinations : regionalDestinations

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Browse by place
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight text-dark">
            Popular searches
          </h2>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end md:flex-row md:items-center">
          <div className="flex w-full rounded-[14px] bg-gray-100 p-1 sm:w-auto">
            {[
              { id: 'cities', label: 'Cities' },
              { id: 'destinations', label: 'Destinations' },
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
        className="hide-scrollbar -my-2 flex touch-pan-x snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-2"
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
            className={`${DESTINATION_CARD_ITEM_CLASS} group overflow-hidden rounded-card border border-gray-200 bg-white text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)]`}
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
                  <span className="font-semibold text-dark">
                    {destination.count.split(' ')[0]}
                  </span>{' '}
                  {destination.count.split(' ').slice(1).join(' ')}
                </p>
                <p className="mt-1 text-sm text-muted">
                  <span className="font-semibold text-dark">
                    {formatCurrency(destination.averagePrice)}
                  </span>{' '}
                  avg.
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
