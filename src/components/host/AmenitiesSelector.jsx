import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    items: [
      { id: 'wifi', label: 'Free Wi-Fi' },
      { id: 'ac', label: 'Air Conditioning' },
      { id: 'heating', label: 'Heating' },
      { id: 'elevator', label: 'Elevator' },
      { id: 'parking', label: 'Parking' },
      { id: 'ev_charging', label: 'EV Charging' },
      { id: 'luggage_storage', label: 'Luggage Storage' },
      { id: 'laundry', label: 'Laundry' },
      { id: 'housekeeping', label: 'Daily Housekeeping' },
    ],
  },
  {
    id: 'food',
    label: 'Food & Beverage',
    items: [
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'bar', label: 'Bar' },
      { id: 'cafe', label: 'Café' },
      { id: 'breakfast_included', label: 'Breakfast Included' },
      { id: 'room_service', label: 'Room Service' },
      { id: 'kitchen', label: 'Kitchen' },
    ],
  },
  {
    id: 'recreation',
    label: 'Recreation',
    items: [
      { id: 'pool', label: 'Swimming Pool' },
      { id: 'indoor_pool', label: 'Indoor Pool' },
      { id: 'spa', label: 'Spa' },
      { id: 'sauna', label: 'Sauna' },
      { id: 'steam_room', label: 'Steam Room' },
      { id: 'gym', label: 'Gym' },
      { id: 'yoga', label: 'Yoga' },
      { id: 'garden', label: 'Garden' },
      { id: 'terrace', label: 'Terrace' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    items: [
      { id: 'meeting_room', label: 'Meeting Room' },
      { id: 'conference_hall', label: 'Conference Hall' },
      { id: 'business_centre', label: 'Business Centre' },
      { id: 'coworking', label: 'Co-working Space' },
    ],
  },
  {
    id: 'family',
    label: 'Family',
    items: [
      { id: 'family_rooms', label: 'Family Rooms' },
      { id: 'kids_club', label: 'Kids Club' },
      { id: 'baby_cot', label: 'Baby Cot' },
      { id: 'babysitting', label: 'Babysitting' },
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    items: [
      { id: 'wheelchair_access', label: 'Wheelchair Access' },
      { id: 'accessible_bathroom', label: 'Accessible Bathroom' },
      { id: 'visual_hearing_assist', label: 'Visual / Hearing Assistance' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    items: [
      { id: 'cctv', label: 'CCTV' },
      { id: 'smoke_detector', label: 'Smoke Detector' },
      { id: 'fire_extinguisher', label: 'Fire Extinguisher' },
      { id: 'first_aid', label: 'First Aid Kit' },
      { id: 'safe_deposit', label: 'Safe Deposit Box' },
    ],
  },
]

export default function AmenitiesSelector({ value = [], onChange }) {
  const [open, setOpen] = useState({ general: true })

  function toggle(id) {
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id]
    onChange(next)
  }

  function toggleCategory(catId) {
    setOpen((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const activeCount = cat.items.filter((i) => value.includes(i.id)).length
        const isOpen = open[cat.id] ?? false

        return (
          <div key={cat.id} className="overflow-hidden rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold text-dark">{cat.label}</span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-dark px-2 py-0.5 text-[11px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </span>
              {isOpen ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>

            {isOpen && (
              <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-4 sm:grid-cols-3">
                {cat.items.map((item) => {
                  const active = value.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? 'border-dark bg-dark font-semibold text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
