// Single source of truth for property categories, sub-types, target guests, and stay types.
// Import from here — never hardcode these strings in components.

export const PROPERTY_CATEGORIES = [
  {
    id: 'hotel',
    label: 'Hotel',
    emoji: '🏨',
    description: 'Full-service hotels and branded properties',
    showStarRating: true,
    subTypes: [
      { id: 'luxury_hotel',     label: 'Luxury Hotel' },
      { id: 'boutique_hotel',   label: 'Boutique Hotel' },
      { id: 'business_hotel',   label: 'Business Hotel' },
      { id: 'resort_hotel',     label: 'Resort Hotel' },
      { id: 'airport_hotel',    label: 'Airport Hotel' },
      { id: 'city_hotel',       label: 'City Hotel' },
      { id: 'spa_hotel',        label: 'Spa Hotel' },
      { id: 'wellness_hotel',   label: 'Wellness Hotel' },
      { id: 'heritage_hotel',   label: 'Heritage Hotel' },
      { id: 'design_hotel',     label: 'Design Hotel' },
      { id: 'eco_hotel',        label: 'Eco Hotel' },
      { id: 'aparthotel',       label: 'Aparthotel' },
      { id: 'conference_hotel', label: 'Conference Hotel' },
      { id: 'palace_hotel',     label: 'Palace Hotel' },
    ],
  },
  {
    id: 'apartment',
    label: 'Apartment',
    emoji: '🏢',
    description: 'Self-contained apartments and serviced units',
    showStarRating: false,
    subTypes: [
      { id: 'apartment',            label: 'Apartment' },
      { id: 'serviced_apartment',   label: 'Serviced Apartment' },
      { id: 'studio_apartment',     label: 'Studio Apartment' },
      { id: 'loft',                 label: 'Loft' },
      { id: 'duplex',               label: 'Duplex' },
      { id: 'triplex',              label: 'Triplex' },
      { id: 'penthouse',            label: 'Penthouse' },
      { id: 'executive_apartment',  label: 'Executive Apartment' },
      { id: 'corporate_apartment',  label: 'Corporate Apartment' },
      { id: 'holiday_apartment',    label: 'Holiday Apartment' },
      { id: 'shared_apartment',     label: 'Shared Apartment' },
    ],
  },
  {
    id: 'holiday_rental',
    label: 'Holiday Rental',
    emoji: '🏡',
    description: 'Houses, villas, and standalone holiday properties',
    showStarRating: false,
    subTypes: [
      { id: 'house',         label: 'House' },
      { id: 'holiday_home',  label: 'Holiday Home' },
      { id: 'villa',         label: 'Villa' },
      { id: 'luxury_villa',  label: 'Luxury Villa' },
      { id: 'beach_house',   label: 'Beach House' },
      { id: 'bungalow',      label: 'Bungalow' },
      { id: 'chalet',        label: 'Chalet' },
      { id: 'cabin',         label: 'Cabin' },
      { id: 'cottage',       label: 'Cottage' },
      { id: 'farmhouse',     label: 'Farmhouse' },
      { id: 'country_house', label: 'Country House' },
      { id: 'mansion',       label: 'Mansion' },
    ],
  },
  {
    id: 'resort',
    label: 'Resort',
    emoji: '🌊',
    description: 'Full-amenity resorts with activities and experiences',
    showStarRating: true,
    subTypes: [
      { id: 'beach_resort',     label: 'Beach Resort' },
      { id: 'island_resort',    label: 'Island Resort' },
      { id: 'mountain_resort',  label: 'Mountain Resort' },
      { id: 'ski_resort',       label: 'Ski Resort' },
      { id: 'golf_resort',      label: 'Golf Resort' },
      { id: 'eco_resort',       label: 'Eco Resort' },
      { id: 'spa_resort',       label: 'Spa Resort' },
      { id: 'wellness_resort',  label: 'Wellness Resort' },
      { id: 'desert_resort',    label: 'Desert Resort' },
      { id: 'forest_resort',    label: 'Forest Resort' },
      { id: 'family_resort',    label: 'Family Resort' },
      { id: 'adventure_resort', label: 'Adventure Resort' },
    ],
  },
  {
    id: 'hostel',
    label: 'Hostel',
    emoji: '🛏',
    description: 'Shared and private rooms for budget travellers',
    showStarRating: false,
    subTypes: [
      { id: 'hostel',             label: 'Hostel' },
      { id: 'backpacker_hostel',  label: 'Backpacker Hostel' },
      { id: 'youth_hostel',       label: 'Youth Hostel' },
      { id: 'student_hostel',     label: 'Student Hostel' },
      { id: 'capsule_hostel',     label: 'Capsule Hostel' },
      { id: 'dormitory',          label: 'Dormitory' },
    ],
  },
  {
    id: 'guest_house_and_bb',
    label: 'Guest House & B&B',
    emoji: '🏠',
    description: 'Intimate stays with personal hospitality',
    showStarRating: false,
    subTypes: [
      { id: 'guest_house',      label: 'Guest House' },
      { id: 'bed_and_breakfast', label: 'Bed & Breakfast' },
      { id: 'pension',          label: 'Pension' },
      { id: 'boarding_house',   label: 'Boarding House' },
      { id: 'homestay',         label: 'Homestay' },
      { id: 'private_room',     label: 'Private Room' },
    ],
  },
  {
    id: 'nature_and_outdoor',
    label: 'Nature & Outdoor',
    emoji: '🌿',
    description: 'Eco-friendly and outdoor immersive stays',
    showStarRating: false,
    subTypes: [
      { id: 'eco_lodge',          label: 'Eco Lodge' },
      { id: 'safari_lodge',       label: 'Safari Lodge' },
      { id: 'jungle_lodge',       label: 'Jungle Lodge' },
      { id: 'farm_stay',          label: 'Farm Stay' },
      { id: 'agritourism_stay',   label: 'Agritourism Stay' },
      { id: 'tree_house',         label: 'Tree House' },
      { id: 'glamping',           label: 'Glamping' },
      { id: 'tent_camp',          label: 'Tent Camp' },
      { id: 'caravan_park',       label: 'Caravan Park' },
      { id: 'holiday_park',       label: 'Holiday Park' },
    ],
  },
  {
    id: 'unique_stay',
    label: 'Unique Stay',
    emoji: '✨',
    description: 'One-of-a-kind properties and extraordinary experiences',
    showStarRating: false,
    subTypes: [
      { id: 'castle',          label: 'Castle' },
      { id: 'cave_hotel',      label: 'Cave Hotel' },
      { id: 'ice_hotel',       label: 'Ice Hotel' },
      { id: 'igloo',           label: 'Igloo' },
      { id: 'houseboat',       label: 'Houseboat' },
      { id: 'floating_hotel',  label: 'Floating Hotel' },
      { id: 'yacht',           label: 'Yacht' },
      { id: 'lighthouse',      label: 'Lighthouse' },
      { id: 'monastery_stay',  label: 'Monastery Stay' },
      { id: 'tiny_house',      label: 'Tiny House' },
    ],
  },
]

export const TARGET_GUESTS = [
  { id: 'family_friendly',  label: 'Family Friendly' },
  { id: 'adults_only',      label: 'Adults Only' },
  { id: 'pet_friendly',     label: 'Pet Friendly' },
  { id: 'business_friendly', label: 'Business Friendly' },
  { id: 'couples',          label: 'Couples' },
  { id: 'solo_travellers',  label: 'Solo Travellers' },
  { id: 'digital_nomads',   label: 'Digital Nomads' },
  { id: 'students',         label: 'Students' },
]

export const STAY_TYPES = [
  { id: 'entire_property', label: 'Entire Property' },
  { id: 'private_room',    label: 'Private Room' },
  { id: 'shared_room',     label: 'Shared Room' },
]

// Hostel-specific room types shown in HostRoomEditorPage when category === 'hostel'
export const HOSTEL_ROOM_TYPES = [
  'Mixed Dorm',
  'Female Dorm',
  'Male Dorm',
  'Private Room',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getCategoryById(id) {
  return PROPERTY_CATEGORIES.find((c) => c.id === id) ?? null
}

export function getSubTypesForCategory(categoryId) {
  return getCategoryById(categoryId)?.subTypes ?? []
}

export function showsStarRating(categoryId) {
  return getCategoryById(categoryId)?.showStarRating ?? false
}
