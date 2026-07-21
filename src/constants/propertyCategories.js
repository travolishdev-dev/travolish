// Single source of truth for property categories, sub-types, target guests, and stay types.
// Import from here — never hardcode these strings in components.

export const PROPERTY_CATEGORIES = [
  {
    id: 'HOTEL',
    label: 'Hotel',
    emoji: '🏨',
    description: 'Full-service hotels and branded properties',
    showStarRating: true,
    subTypes: [
      { id: 'LUXURY_HOTEL',     label: 'Luxury Hotel' },
      { id: 'BOUTIQUE_HOTEL',   label: 'Boutique Hotel' },
      { id: 'BUSINESS_HOTEL',   label: 'Business Hotel' },
      { id: 'RESORT_HOTEL',     label: 'Resort Hotel' },
      { id: 'AIRPORT_HOTEL',    label: 'Airport Hotel' },
      { id: 'CITY_HOTEL',       label: 'City Hotel' },
      { id: 'SPA_HOTEL',        label: 'Spa Hotel' },
      { id: 'WELLNESS_HOTEL',   label: 'Wellness Hotel' },
      { id: 'HERITAGE_HOTEL',   label: 'Heritage Hotel' },
      { id: 'DESIGN_HOTEL',     label: 'Design Hotel' },
      { id: 'ECO_HOTEL',        label: 'Eco Hotel' },
      { id: 'APARTHOTEL',       label: 'Aparthotel' },
      { id: 'CONFERENCE_HOTEL', label: 'Conference Hotel' },
      { id: 'PALACE_HOTEL',     label: 'Palace Hotel' },
    ],
  },
  {
    id: 'APARTMENT',
    label: 'Apartment',
    emoji: '🏢',
    description: 'Self-contained apartments and serviced units',
    showStarRating: false,
    subTypes: [
      { id: 'APARTMENT',            label: 'Apartment' },
      { id: 'SERVICED_APARTMENT',   label: 'Serviced Apartment' },
      { id: 'STUDIO_APARTMENT',     label: 'Studio Apartment' },
      { id: 'LOFT',                 label: 'Loft' },
      { id: 'DUPLEX',               label: 'Duplex' },
      { id: 'TRIPLEX',              label: 'Triplex' },
      { id: 'PENTHOUSE',            label: 'Penthouse' },
      { id: 'EXECUTIVE_APARTMENT',  label: 'Executive Apartment' },
      { id: 'CORPORATE_APARTMENT',  label: 'Corporate Apartment' },
      { id: 'HOLIDAY_APARTMENT',    label: 'Holiday Apartment' },
      { id: 'SHARED_APARTMENT',     label: 'Shared Apartment' },
    ],
  },
  {
    id: 'HOLIDAY_RENTAL',
    label: 'Holiday Rental',
    emoji: '🏡',
    description: 'Houses, villas, and standalone holiday properties',
    showStarRating: false,
    subTypes: [
      { id: 'HOUSE',         label: 'House' },
      { id: 'HOLIDAY_HOME',  label: 'Holiday Home' },
      { id: 'VILLA',         label: 'Villa' },
      { id: 'LUXURY_VILLA',  label: 'Luxury Villa' },
      { id: 'BEACH_HOUSE',   label: 'Beach House' },
      { id: 'BUNGALOW',      label: 'Bungalow' },
      { id: 'CHALET',        label: 'Chalet' },
      { id: 'CABIN',         label: 'Cabin' },
      { id: 'COTTAGE',       label: 'Cottage' },
      { id: 'FARMHOUSE',     label: 'Farmhouse' },
      { id: 'COUNTRY_HOUSE', label: 'Country House' },
      { id: 'MANSION',       label: 'Mansion' },
    ],
  },
  {
    id: 'RESORT',
    label: 'Resort',
    emoji: '🌊',
    description: 'Full-amenity resorts with activities and experiences',
    showStarRating: true,
    subTypes: [
      { id: 'BEACH_RESORT',     label: 'Beach Resort' },
      { id: 'ISLAND_RESORT',    label: 'Island Resort' },
      { id: 'MOUNTAIN_RESORT',  label: 'Mountain Resort' },
      { id: 'SKI_RESORT',       label: 'Ski Resort' },
      { id: 'GOLF_RESORT',      label: 'Golf Resort' },
      { id: 'ECO_RESORT',       label: 'Eco Resort' },
      { id: 'SPA_RESORT',       label: 'Spa Resort' },
      { id: 'WELLNESS_RESORT',  label: 'Wellness Resort' },
      { id: 'DESERT_RESORT',    label: 'Desert Resort' },
      { id: 'FOREST_RESORT',    label: 'Forest Resort' },
      { id: 'FAMILY_RESORT',    label: 'Family Resort' },
      { id: 'ADVENTURE_RESORT', label: 'Adventure Resort' },
    ],
  },
  {
    id: 'HOSTEL',
    label: 'Hostel',
    emoji: '🛏',
    description: 'Shared and private rooms for budget travellers',
    showStarRating: false,
    subTypes: [
      { id: 'HOSTEL',             label: 'Hostel' },
      { id: 'BACKPACKER_HOSTEL',  label: 'Backpacker Hostel' },
      { id: 'YOUTH_HOSTEL',       label: 'Youth Hostel' },
      { id: 'STUDENT_HOSTEL',     label: 'Student Hostel' },
      { id: 'CAPSULE_HOSTEL',     label: 'Capsule Hostel' },
      { id: 'DORMITORY',          label: 'Dormitory' },
    ],
  },
  {
    id: 'GUEST_HOUSE_AND_BB',
    label: 'Guest House & B&B',
    emoji: '🏠',
    description: 'Intimate stays with personal hospitality',
    showStarRating: false,
    subTypes: [
      { id: 'GUEST_HOUSE',       label: 'Guest House' },
      { id: 'BED_AND_BREAKFAST', label: 'Bed & Breakfast' },
      { id: 'PENSION',           label: 'Pension' },
      { id: 'BOARDING_HOUSE',    label: 'Boarding House' },
      { id: 'HOMESTAY',          label: 'Homestay' },
      { id: 'PRIVATE_ROOM',      label: 'Private Room' },
    ],
  },
  {
    id: 'NATURE_AND_OUTDOOR',
    label: 'Nature & Outdoor',
    emoji: '🌿',
    description: 'Eco-friendly and outdoor immersive stays',
    showStarRating: false,
    subTypes: [
      { id: 'ECO_LODGE',          label: 'Eco Lodge' },
      { id: 'SAFARI_LODGE',       label: 'Safari Lodge' },
      { id: 'JUNGLE_LODGE',       label: 'Jungle Lodge' },
      { id: 'FARM_STAY',          label: 'Farm Stay' },
      { id: 'AGRITOURISM_STAY',   label: 'Agritourism Stay' },
      { id: 'TREE_HOUSE',         label: 'Tree House' },
      { id: 'GLAMPING',           label: 'Glamping' },
      { id: 'TENT_CAMP',          label: 'Tent Camp' },
      { id: 'CARAVAN_PARK',       label: 'Caravan Park' },
      { id: 'HOLIDAY_PARK',       label: 'Holiday Park' },
    ],
  },
  {
    id: 'UNIQUE_STAY',
    label: 'Unique Stay',
    emoji: '✨',
    description: 'One-of-a-kind properties and extraordinary experiences',
    showStarRating: false,
    subTypes: [
      { id: 'CASTLE',          label: 'Castle' },
      { id: 'CAVE_HOTEL',      label: 'Cave Hotel' },
      { id: 'ICE_HOTEL',       label: 'Ice Hotel' },
      { id: 'IGLOO',           label: 'Igloo' },
      { id: 'HOUSEBOAT',       label: 'Houseboat' },
      { id: 'FLOATING_HOTEL',  label: 'Floating Hotel' },
      { id: 'YACHT',           label: 'Yacht' },
      { id: 'LIGHTHOUSE',      label: 'Lighthouse' },
      { id: 'MONASTERY_STAY',  label: 'Monastery Stay' },
      { id: 'TINY_HOUSE',      label: 'Tiny House' },
    ],
  },
]

export const TARGET_GUESTS = [
  { id: 'FAMILY_FRIENDLY',  label: 'Family Friendly' },
  { id: 'ADULTS_ONLY',      label: 'Adults Only' },
  { id: 'PET_FRIENDLY',     label: 'Pet Friendly' },
  { id: 'BUSINESS_FRIENDLY', label: 'Business Friendly' },
  { id: 'COUPLES',          label: 'Couples' },
  { id: 'SOLO_TRAVELLERS',  label: 'Solo Travellers' },
  { id: 'DIGITAL_NOMADS',   label: 'Digital Nomads' },
  { id: 'STUDENTS',         label: 'Students' },
]

export const STAY_TYPES = [
  { id: 'ENTIRE_PROPERTY', label: 'Entire Property' },
  { id: 'PRIVATE_ROOM',    label: 'Private Room' },
  { id: 'SHARED_ROOM',     label: 'Shared Room' },
]

// Hostel-specific room types shown in HostRoomEditorPage when category === 'HOSTEL'
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
