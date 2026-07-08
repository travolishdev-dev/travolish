import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getRecentSearches } from '../../lib/searchHistory'
import { useSearchContext } from '../../hooks/useSearchContext'

const FALLBACK_SEARCHES = [
  {
    city: 'Manali',
    dates: 'Flexible dates',
    guests: '2 guests, 1 room',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=700&auto=format&fit=crop',
  },
  {
    city: 'Goa',
    dates: 'Flexible dates',
    guests: '2 guests, 1 room',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&auto=format&fit=crop',
  },
  {
    city: 'Mumbai',
    dates: 'Flexible dates',
    guests: '2 guests, 1 room',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=700&auto=format&fit=crop',
  },
]

export default function RecentSearches() {
  const navigate = useNavigate()
  const { updateSearchDraft } = useSearchContext()
  const [searches, setSearches] = useState([])

  useEffect(() => {
    const saved = getRecentSearches()
    setSearches(saved.length ? saved : FALLBACK_SEARCHES)
  }, [])

  if (!searches.length) return null

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Clock3 size={16} />
            Pick up where you left off
          </div>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight text-dark">
            Recent searches
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="hidden items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark sm:inline-flex"
        >
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="hide-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
        {searches.map((item) => (
          <button
            key={item.city}
            type="button"
            onClick={() => {
              updateSearchDraft({ destination: item.city })
              navigate('/search')
            }}
            className="group w-[272px] flex-shrink-0 overflow-hidden rounded-card border border-gray-200 bg-white text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
              <div>
                <h3 className="text-lg font-semibold text-dark">{item.city}</h3>
                <p className="mt-1 text-sm text-muted">{item.dates}</p>
                <p className="mt-0.5 text-sm text-muted">{item.guests}</p>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-dark transition-colors group-hover:bg-brand group-hover:text-white">
                <Search size={18} />
              </span>
            </div>
            <div className="mx-3 mb-3 h-28 overflow-hidden rounded-[10px] bg-gray-100">
              <img
                src={item.image}
                alt={item.city}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
