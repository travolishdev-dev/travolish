import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'

const destinations = [
  { city: 'Goa', state: 'Goa', description: 'Sun-drenched beaches, Portuguese heritage, and legendary nightlife.', properties: 480, emoji: '🌊' },
  { city: 'Jaipur', state: 'Rajasthan', description: 'The Pink City — palaces, bazaars, and royal heritage hotels.', properties: 320, emoji: '🏰' },
  { city: 'Manali', state: 'Himachal Pradesh', description: 'Snow peaks, adventure sports, and cosy mountain retreats.', properties: 210, emoji: '🏔️' },
  { city: 'Udaipur', state: 'Rajasthan', description: 'The City of Lakes — romance, history, and lake-view stays.', properties: 195, emoji: '🛶' },
  { city: 'Munnar', state: 'Kerala', description: 'Misty tea gardens and cool air in the Western Ghats.', properties: 140, emoji: '🍃' },
  { city: 'Rishikesh', state: 'Uttarakhand', description: 'Yoga, white-water rafting, and Ganges-side ashrams.', properties: 165, emoji: '🕉️' },
  { city: 'Coorg', state: 'Karnataka', description: 'Coffee estates, waterfalls, and rolling green hills.', properties: 130, emoji: '☕' },
  { city: 'Varanasi', state: 'Uttar Pradesh', description: "Ghats, spirituality, and one of the world's oldest living cities.", properties: 115, emoji: '🪔' },
  { city: 'Ooty', state: 'Tamil Nadu', description: 'Nilgiri hills, toy trains, and lush botanical gardens.', properties: 100, emoji: '🌿' },
  { city: 'Andaman Islands', state: 'A&N Islands', description: 'Crystal-clear water, coral reefs, and pristine beaches.', properties: 85, emoji: '🐠' },
  { city: 'Darjeeling', state: 'West Bengal', description: 'Himalayan panoramas, chai, and colonial-era bungalows.', properties: 95, emoji: '🫖' },
  { city: 'Hampi', state: 'Karnataka', description: 'UNESCO heritage ruins amid a dramatic boulder landscape.', properties: 60, emoji: '🏛️' },
]

const seasons = [
  { label: 'Best for beaches', items: ['Goa', 'Andaman Islands'], months: 'Oct – Mar' },
  { label: 'Best for mountains', items: ['Manali', 'Darjeeling', 'Munnar'], months: 'Mar – Jun' },
  { label: 'Best for culture', items: ['Jaipur', 'Udaipur', 'Varanasi'], months: 'Oct – Feb' },
  { label: 'Best for nature', items: ['Coorg', 'Ooty', 'Rishikesh'], months: 'Jul – Sep' },
]

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Discover</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Top destinations</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            From Himalayan hilltops to tropical coastlines — explore India's most beloved travel destinations, hand-curated by our team.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-14">

        {/* Destinations grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Browse by destination</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Popular destinations</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.map((d) => (
              <Link
                key={d.city}
                to={`/search?location=${encodeURIComponent(d.city)}`}
                className="group rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5 hover:border-rose-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{d.emoji}</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-brand transition-colors" />
                </div>
                <h3 className="font-bold text-dark">{d.city}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 mb-2">
                  <MapPin size={11} /> {d.state}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{d.description}</p>
                <p className="text-xs font-semibold text-brand">{d.properties} properties</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Seasonal guide */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">When to go</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Seasonal travel guide</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seasons.map((s) => (
              <div key={s.label} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                <p className="text-xs font-semibold text-brand mb-1">{s.months}</p>
                <h3 className="font-bold text-dark mb-2 text-sm">{s.label}</h3>
                <div className="space-y-1">
                  {s.items.map((item) => (
                    <Link
                      key={item}
                      to={`/search?location=${encodeURIComponent(item)}`}
                      className="block text-sm text-gray-500 hover:text-brand transition-colors"
                    >
                      → {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
