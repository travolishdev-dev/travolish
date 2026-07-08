import { Link } from 'react-router-dom'
import { Clock, MapPin, ArrowRight, Train } from 'lucide-react'

const getaways = [
  {
    from: 'Mumbai',
    destinations: [
      { name: 'Lonavala', distance: '83 km', drive: '1.5 hrs', vibe: 'Hills & waterfalls', emoji: '⛰️' },
      { name: 'Alibaug', distance: '95 km', drive: '2 hrs', vibe: 'Beach retreat', emoji: '🌊' },
      { name: 'Mahabaleshwar', distance: '260 km', drive: '4.5 hrs', vibe: 'Strawberry hills', emoji: '🍓' },
    ],
  },
  {
    from: 'Bengaluru',
    destinations: [
      { name: 'Coorg', distance: '245 km', drive: '4 hrs', vibe: 'Coffee & mist', emoji: '☕' },
      { name: 'Ooty', distance: '266 km', drive: '5 hrs', vibe: 'Nilgiri hills', emoji: '🌿' },
      { name: 'Chikmagalur', distance: '245 km', drive: '4 hrs', vibe: 'Trekking & coffee', emoji: '🏕️' },
    ],
  },
  {
    from: 'Delhi',
    destinations: [
      { name: 'Rishikesh', distance: '240 km', drive: '5 hrs', vibe: 'Yoga & river', emoji: '🕉️' },
      { name: 'Agra', distance: '233 km', drive: '3 hrs', vibe: 'Taj & heritage', emoji: '🕌' },
      { name: 'Mussoorie', distance: '290 km', drive: '6 hrs', vibe: 'Queen of Hills', emoji: '🏔️' },
    ],
  },
  {
    from: 'Hyderabad',
    destinations: [
      { name: 'Hampi', distance: '375 km', drive: '6 hrs', vibe: 'Ruins & boulders', emoji: '🏛️' },
      { name: 'Warangal', distance: '148 km', drive: '2.5 hrs', vibe: 'Temple & fort', emoji: '⛩️' },
      { name: 'Araku Valley', distance: '730 km', drive: 'Overnight train', vibe: 'Tribal & tribal', emoji: '🌄' },
    ],
  },
]

const tips = [
  { emoji: '🎒', title: 'Pack light', body: 'A 2-night trip rarely needs more than a backpack. Less luggage = faster travel.' },
  { emoji: '🗓️', title: 'Book midweek', body: 'Friday/Saturday nights cost more. Book a Thursday–Sunday trip for better rates.' },
  { emoji: '🚗', title: 'Start Friday evening', body: 'Leave after work on Friday to maximise time at the destination.' },
  { emoji: '🌅', title: 'Check sunrise times', body: 'Hill stations look magical at dawn. Book a property with valley views.' },
]

export default function WeekendGetawaysPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Discover</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Weekend getaways</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Two nights. Infinite possibilities. Find the perfect short escape within driving distance of India's major cities.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-14">

        {/* Getaways by city */}
        {getaways.map((group) => (
          <div key={group.from}>
            <div className="flex items-center gap-2 mb-5">
              <Train size={16} className="text-brand" />
              <h2 className="text-xl font-bold text-dark">From {group.from}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {group.destinations.map((d) => (
                <Link
                  key={d.name}
                  to={`/search?location=${encodeURIComponent(d.name)}`}
                  className="group rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5 hover:border-rose-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{d.emoji}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-brand transition-colors" />
                  </div>
                  <h3 className="font-bold text-dark">{d.name}</h3>
                  <p className="text-xs text-brand font-medium mt-0.5 mb-2">{d.vibe}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={10} />{d.distance}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{d.drive}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Tips */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Pro tips</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Make the most of your weekend</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((t) => (
              <div key={t.title} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                <span className="text-2xl">{t.emoji}</span>
                <h3 className="mt-3 font-semibold text-dark text-sm">{t.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
