import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const cityDestinations = [
  {
    name: 'Mumbai',
    count: '5,496 hotels',
    average: 'Rs. 6,624 avg.',
    image:
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&auto=format&fit=crop',
  },
  {
    name: 'Mussoorie',
    count: '1,435 hotels',
    average: 'Rs. 7,238 avg.',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop',
  },
  {
    name: 'Rishikesh',
    count: '2,112 hotels',
    average: 'Rs. 5,959 avg.',
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop',
  },
  {
    name: 'Manali',
    count: '3,803 hotels',
    average: 'Rs. 5,070 avg.',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop',
  },
  {
    name: 'Jaipur',
    count: '4,129 hotels',
    average: 'Rs. 4,860 avg.',
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop',
  },
]

const regionalDestinations = [
  {
    name: 'Goa',
    count: '4,820 stays',
    average: 'Rs. 6,180 avg.',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop',
  },
  {
    name: 'Kerala',
    count: '3,214 stays',
    average: 'Rs. 5,420 avg.',
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&auto=format&fit=crop',
  },
  {
    name: 'Rajasthan',
    count: '6,108 stays',
    average: 'Rs. 6,980 avg.',
    image:
      'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&auto=format&fit=crop',
  },
  {
    name: 'Himachal',
    count: '2,944 stays',
    average: 'Rs. 5,260 avg.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop',
  },
  {
    name: 'Ladakh',
    count: '1,286 stays',
    average: 'Rs. 6,740 avg.',
    image:
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=900&auto=format&fit=crop',
  },
]

export default function PopularDestinations() {
  const [activeTab, setActiveTab] = useState('cities')
  const navigate = useNavigate()
  const destinations =
    activeTab === 'cities' ? cityDestinations : regionalDestinations

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

        <div className="flex w-full rounded-full bg-gray-100 p-1 sm:w-auto">
          {[
            { id: 'cities', label: 'Cities' },
            { id: 'destinations', label: 'Destinations' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
                activeTab === tab.id
                  ? 'bg-white text-dark shadow-sm'
                  : 'text-muted hover:text-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {destinations.map((destination) => (
          <button
            key={destination.name}
            type="button"
            onClick={() => navigate('/search')}
            className="group overflow-hidden rounded-card border border-gray-200 bg-white text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
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
                    {destination.average.split(' avg.')[0]}
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
