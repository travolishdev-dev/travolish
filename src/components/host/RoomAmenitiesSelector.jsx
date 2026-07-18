import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'comfort',
    label: 'Room Comfort',
    items: [
      { id: 'ac_heating', label: 'AC / Heating' },
      { id: 'comfortable_bed', label: 'Comfortable Bed' },
      { id: 'fresh_linens', label: 'Fresh Linens & Pillows' },
      { id: 'blackout_curtains', label: 'Blackout Curtains' },
      { id: 'wardrobe', label: 'Wardrobe / Closet' },
      { id: 'iron', label: 'Iron & Ironing Board' },
      { id: 'in_room_safe', label: 'In-room Safe' },
      { id: 'work_desk', label: 'Work Desk & Chair' },
      { id: 'sofa', label: 'Seating Area / Sofa' },
      { id: 'extra_bedding', label: 'Extra Bedding (On Request)' },
      { id: 'soundproof', label: 'Soundproof Rooms' },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    items: [
      { id: 'private_bathroom', label: 'Private Bathroom' },
      { id: 'hot_cold_water', label: 'Hot & Cold Water' },
      { id: 'shower_bathtub', label: 'Shower / Bathtub' },
      { id: 'towels', label: 'Towels' },
      { id: 'shampoo', label: 'Shampoo' },
      { id: 'conditioner', label: 'Conditioner' },
      { id: 'body_wash', label: 'Body Wash' },
      { id: 'soap', label: 'Soap' },
      { id: 'dental_kit', label: 'Dental Kit' },
      { id: 'hair_dryer', label: 'Hair Dryer' },
      { id: 'slippers', label: 'Slippers' },
      { id: 'bathrobe', label: 'Bathrobe' },
    ],
  },
  {
    id: 'connectivity',
    label: 'Connectivity & Technology',
    items: [
      { id: 'high_speed_wifi', label: 'High-Speed Wi-Fi' },
      { id: 'smart_tv', label: 'Smart TV' },
      { id: 'cable_tv', label: 'Satellite / Cable Channels' },
      { id: 'charging_points', label: 'Charging Points Near Bed' },
      { id: 'usb_ports', label: 'USB Charging Ports' },
      { id: 'bluetooth_speaker', label: 'Bluetooth Speaker' },
      { id: 'smart_room', label: 'Smart Room Controls' },
      { id: 'laptop_workspace', label: 'Laptop-Friendly Workspace' },
    ],
  },
  {
    id: 'dining',
    label: 'Food & Dining',
    items: [
      { id: 'complimentary_breakfast', label: 'Complimentary Breakfast' },
      { id: 'in_room_dining', label: 'In-room Dining' },
      { id: 'restaurant_onsite', label: 'Restaurant On-site' },
      { id: 'cafe', label: 'Café / Coffee Shop' },
      { id: 'minibar', label: 'Mini Bar' },
      { id: 'kitchenette', label: 'Kitchen / Kitchenette' },
      { id: 'electric_kettle', label: 'Electric Kettle' },
      { id: 'coffee_machine', label: 'Coffee Machine' },
      { id: 'drinking_water', label: 'Complimentary Drinking Water' },
    ],
  },
  {
    id: 'cleaning',
    label: 'Cleaning & Laundry',
    items: [
      { id: 'daily_housekeeping', label: 'Daily Housekeeping' },
      { id: 'laundry_service', label: 'Laundry Service' },
      { id: 'dry_cleaning', label: 'Dry Cleaning' },
      { id: 'self_service_washer', label: 'Self-service Washing Machine' },
      { id: 'linen_change', label: 'Linen Change on Request' },
      { id: 'sanitization', label: 'Sanitization Services' },
    ],
  },
  {
    id: 'leisure',
    label: 'Leisure & Wellness',
    items: [
      { id: 'pool_access', label: 'Swimming Pool' },
      { id: 'gym_access', label: 'Gym / Fitness Centre' },
      { id: 'spa_access', label: 'Spa / Massage' },
      { id: 'sauna_steam', label: 'Sauna / Steam Room' },
      { id: 'yoga_area', label: 'Yoga Area' },
      { id: 'garden_terrace', label: 'Garden / Terrace' },
      { id: 'kids_play', label: 'Kids Play Area' },
      { id: 'game_room', label: 'Game Room / Entertainment Zone' },
    ],
  },
  {
    id: 'transport',
    label: 'Parking & Transport',
    items: [
      { id: 'free_parking', label: 'Free Parking' },
      { id: 'paid_parking', label: 'Paid Parking' },
      { id: 'valet_parking', label: 'Valet Parking' },
      { id: 'airport_shuttle', label: 'Airport Shuttle' },
      { id: 'taxi_assistance', label: 'Taxi / Cab Assistance' },
      { id: 'bicycle_rental', label: 'Bicycle Rental' },
      { id: 'ev_charging', label: 'EV Charging Station' },
    ],
  },
  {
    id: 'services',
    label: 'Services & Hospitality',
    items: [
      { id: 'reception_24_7', label: '24/7 Reception' },
      { id: 'concierge', label: 'Concierge Service' },
      { id: 'luggage_storage', label: 'Luggage Storage' },
      { id: 'express_checkin', label: 'Express Check-in / Check-out' },
      { id: 'tour_booking', label: 'Tour Booking Assistance' },
      { id: 'wakeup_service', label: 'Wake-up Service' },
      { id: 'multilingual_staff', label: 'Multilingual Staff' },
      { id: 'currency_exchange', label: 'Currency Exchange' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety & Security',
    items: [
      { id: 'cctv', label: 'CCTV Surveillance' },
      { id: 'security_staff', label: '24/7 Security Staff' },
      { id: 'fire_safety', label: 'Fire Safety Systems' },
      { id: 'smoke_detector', label: 'Smoke Detectors' },
      { id: 'emergency_exits', label: 'Emergency Exits' },
      { id: 'key_card', label: 'Key Card Access' },
      { id: 'secure_parking', label: 'Secure Parking Area' },
    ],
  },
  {
    id: 'family',
    label: 'Family & Accessibility',
    items: [
      { id: 'family_room', label: 'Family Rooms' },
      { id: 'extra_beds', label: 'Extra Beds / Baby Cots' },
      { id: 'child_friendly', label: 'Child-friendly Facilities' },
      { id: 'wheelchair_room', label: 'Wheelchair Accessible Rooms' },
      { id: 'elevator', label: 'Elevators / Lifts' },
      { id: 'accessible_bathroom', label: 'Accessible Bathrooms' },
    ],
  },
  {
    id: 'business',
    label: 'Business Facilities',
    items: [
      { id: 'meeting_rooms', label: 'Meeting Rooms' },
      { id: 'conference_hall', label: 'Conference Halls' },
      { id: 'business_centre', label: 'Business Centre' },
      { id: 'printing', label: 'Printing / Fax Services' },
      { id: 'av_equipment', label: 'Projector / AV Equipment' },
    ],
  },
  {
    id: 'extra',
    label: 'Extra Guest-Friendly',
    items: [
      { id: 'self_checkin', label: 'Self Check-in (Digital Lock / App)' },
      { id: 'contactless_payment', label: 'Contactless Payment' },
      { id: 'flexible_cancellation', label: 'Flexible Cancellation' },
      { id: 'pet_friendly', label: 'Pet-Friendly Option' },
    ],
  },
]

export default function RoomAmenitiesSelector({ value = [], onChange }) {
  const [open, setOpen] = useState({ comfort: true })

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
