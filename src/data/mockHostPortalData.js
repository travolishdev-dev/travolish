import { properties } from './mockData'

const fallbackImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=800&fit=crop'

const getPropertyById = (propertyId) =>
  properties.find((property) => Number(property.id) === Number(propertyId))

const buildListingMedia = (propertyId) => {
  const property = getPropertyById(propertyId)

  if (!property) {
    return {
      id: Number(propertyId),
      title: 'Untitled listing',
      subtitle: 'Private stay',
      location: 'Draft location',
      country: 'Draft country',
      image: fallbackImage,
      price: 0,
      rating: 4.8,
      reviewCount: 0,
      category: 'city',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
    }
  }

  return {
    id: property.id,
    title: property.title,
    subtitle: property.subtitle,
    location: property.location,
    country: property.country,
    image: property.images?.[0] || fallbackImage,
    price: property.price,
    rating: property.rating,
    reviewCount: property.reviewCount,
    category: property.category,
    guests: property.guests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: property.amenities,
    description: property.description,
  }
}

export const previewHostProfile = {
  fullName: 'Maya Chen',
  preferredName: 'Maya',
  email: 'maya.chen@travolishhost.com',
  phone: '+1 (628) 555-0107',
  avatar:
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=480&h=480&fit=crop',
  role: 'host',
  city: 'Lisbon, Portugal',
  timeZone: 'Western European Time',
  joinedLabel: 'Hosting since 2020',
  headline: 'Boutique host focused on design-led waterfront and city stays.',
}

const hostListingRecords = [
  {
    id: 13,
    status: 'Live',
    roomCount: 4,
    occupancy30: '91%',
    revenueMTD: '$18,420',
    nextArrival: 'Today · 4:10 PM',
    responseTime: '8 min',
    performanceNote: 'Sunset dinner upsell converted on 3/4 recent arrivals.',
    housekeeping: '2 turnovers today',
    pricingMode: 'AI + manual overrides',
    operationsStatus: 'High demand window',
    promoStatus: 'Island boost active',
    checkInMode: 'Boat transfer + villa host handoff',
    payoutHold: '$2,180 reserve hold',
    description:
      'Signature island villa with high ADR, concierge-heavy arrivals, and upsell-friendly guest journeys.',
    market: 'Maldives luxury',
  },
  {
    id: 10,
    status: 'Live',
    roomCount: 3,
    occupancy30: '84%',
    revenueMTD: '$11,860',
    nextArrival: 'May 09 · 2:30 PM',
    responseTime: '13 min',
    performanceNote: 'Boat pickup requests spiked for weekend arrivals.',
    housekeeping: '1 turnover tomorrow',
    pricingMode: 'Weekend premium active',
    operationsStatus: 'Healthy pace',
    promoStatus: 'No paid boosts',
    checkInMode: 'Dock pickup + digital guide',
    payoutHold: '$980 pending transfer',
    description:
      'High-value lakefront stay built around short premium weekends and concierge logistics.',
    market: 'Lake Como premium',
  },
  {
    id: 14,
    status: 'Live',
    roomCount: 2,
    occupancy30: '76%',
    revenueMTD: '$7,410',
    nextArrival: 'Tomorrow · 8:45 PM',
    responseTime: '11 min',
    performanceNote: 'Great midweek conversion from repeat guests.',
    housekeeping: '1 deep clean scheduled',
    pricingMode: 'City reset weekday strategy',
    operationsStatus: 'Steady demand',
    promoStatus: 'Loyalty offer active',
    checkInMode: 'Self check-in + host SMS backup',
    payoutHold: '$420 pending review release',
    description:
      'Compact city product performing best with short-stay remote workers and repeat couples.',
    market: 'Tokyo city stays',
  },
  {
    id: 4,
    status: 'Draft updates',
    roomCount: 2,
    occupancy30: '63%',
    revenueMTD: '$4,920',
    nextArrival: 'May 18 · 3:00 PM',
    responseTime: '17 min',
    performanceNote: 'Photo refresh and rules cleanup should lift conversion.',
    housekeeping: 'No urgent turns',
    pricingMode: 'Manual rate ladder',
    operationsStatus: 'Needs polish',
    promoStatus: 'Boost paused',
    checkInMode: 'Self check-in + concierge call',
    payoutHold: '$0',
    description:
      'Paris city penthouse with strong design appeal but softer conversion until copy and media are refreshed.',
    market: 'Paris urban premium',
  },
]

export const hostListings = hostListingRecords.map((listing) => ({
  ...listing,
  property: buildListingMedia(listing.id),
}))

export const hostRooms = [
  {
    id: 'rm-1301',
    listingId: 13,
    name: 'Lagoon Suite',
    type: 'Villa suite',
    status: 'Ready',
    floor: 'Beachfront',
    capacity: '2 guests',
    beds: '1 king bed',
    baths: '1 indoor + 1 outdoor',
    baseRate: '$1,240',
    upsells: 'Dinner deck, reef picnic',
    housekeepingState: 'Turned at 11:20 AM',
    nightsSold: '24 / 30',
    note: 'Best review scores for arrival experience.',
  },
  {
    id: 'rm-1302',
    listingId: 13,
    name: 'Sunset Pool Residence',
    type: 'Pool residence',
    status: 'Occupied',
    floor: 'West deck',
    capacity: '4 guests',
    beds: '2 king beds',
    baths: '2.5 baths',
    baseRate: '$1,860',
    upsells: 'Private chef, transfer bundle',
    housekeepingState: 'Departure tomorrow',
    nightsSold: '26 / 30',
    note: 'Strongest ADR in portfolio.',
  },
  {
    id: 'rm-1001',
    listingId: 10,
    name: 'Lakefront Glass Suite',
    type: 'Suite',
    status: 'Ready',
    floor: 'Dock level',
    capacity: '2 guests',
    beds: '1 king bed',
    baths: '1 bath',
    baseRate: '$840',
    upsells: 'Boat transfer, tasting set',
    housekeepingState: 'Turned at 9:10 AM',
    nightsSold: '21 / 30',
    note: 'Highest direct-book repeat rate.',
  },
  {
    id: 'rm-1002',
    listingId: 10,
    name: 'Terrace Family Room',
    type: 'Family room',
    status: 'Blocked',
    floor: 'Upper terrace',
    capacity: '4 guests',
    beds: '1 king + 2 twins',
    baths: '2 baths',
    baseRate: '$1,020',
    upsells: 'Arrival pantry, late checkout',
    housekeepingState: 'Maintenance inspection',
    nightsSold: '15 / 30',
    note: 'Blocked for balcony seal repair.',
  },
  {
    id: 'rm-1401',
    listingId: 14,
    name: 'Shibuya Studio Loft',
    type: 'Studio loft',
    status: 'Ready',
    floor: 'Level 12',
    capacity: '2 guests',
    beds: '1 queen bed',
    baths: '1 bath',
    baseRate: '$390',
    upsells: 'Pocket wifi, late checkout',
    housekeepingState: 'Turned yesterday',
    nightsSold: '19 / 30',
    note: 'Best for remote-work couples.',
  },
  {
    id: 'rm-401',
    listingId: 4,
    name: 'Marais Signature Suite',
    type: 'Signature suite',
    status: 'Needs update',
    floor: 'Penthouse',
    capacity: '4 guests',
    beds: '2 queen beds',
    baths: '2 baths',
    baseRate: '$620',
    upsells: 'Airport transfer, cheese board',
    housekeepingState: 'No open turn',
    nightsSold: '12 / 30',
    note: 'Photo refresh pending before relaunch.',
  },
]

export const hostDashboardStats = [
  { label: 'Live listings', value: '4', note: '1 needs updates before next push' },
  { label: 'Upcoming arrivals', value: '7', note: '3 within the next 48 hours' },
  { label: 'Occupancy pace', value: '82%', note: 'Portfolio average for next 30 days' },
  { label: 'Net payouts', value: '$18.4k', note: 'Projected this month after fees' },
]

export const hostPriorityTasks = [
  {
    title: 'Approve AI pricing changes for the island villa',
    context: '2 high-confidence suggestions for next weekend demand.',
    href: '/host/pricing-ai',
    tone: 'brand',
  },
  {
    title: 'Send updated check-in details to two arriving guests',
    context: 'Boat transfer windows were changed by the dock operator.',
    href: '/host/auto-replies',
    tone: 'sky',
  },
  {
    title: 'Finish KYC document refresh before Apr 30',
    context: 'One address proof document is still marked as expiring.',
    href: '/host/kyc',
    tone: 'warning',
  },
]

export const hostArrivalBoard = [
  {
    bookingId: 'HST-8801',
    guest: 'Avery Morgan',
    listingId: 13,
    roomName: 'Lagoon Suite',
    arrival: 'Today · 4:10 PM',
    status: 'Transfer confirmed',
    note: 'Chef welcome dinner already added.',
  },
  {
    bookingId: 'HST-8804',
    guest: 'Nora Silva',
    listingId: 10,
    roomName: 'Lakefront Glass Suite',
    arrival: 'Tomorrow · 2:30 PM',
    status: 'Guide sent',
    note: 'Waiting on dock pickup preference.',
  },
  {
    bookingId: 'HST-8812',
    guest: 'Kenji Watanabe',
    listingId: 14,
    roomName: 'Shibuya Studio Loft',
    arrival: 'Tomorrow · 8:45 PM',
    status: 'Self check-in',
    note: 'Late arrival support queued.',
  },
]

export const hostRevenueBlocks = [
  {
    label: 'Booked MTD',
    value: '$24,380',
    note: 'Across direct, boost, and repeat traffic',
  },
  {
    label: 'ADR',
    value: '$612',
    note: 'Portfolio average after weekend uplift',
  },
  {
    label: 'Upsell conversion',
    value: '31%',
    note: 'Dinner, transfer, and late checkout offers',
  },
]

export const hostServiceBoard = [
  {
    title: 'Housekeeping load',
    items: ['2 same-day turnovers', '1 deep clean tomorrow', 'Laundry pickup at 6:00 PM'],
  },
  {
    title: 'Guest sentiment',
    items: ['4.9 average communication score', 'One unread arrival question', 'No open service recovery tasks'],
  },
  {
    title: 'Compliance watch',
    items: ['KYC refresh due this week', 'One payout reserve hold', 'Emergency kit audit completed'],
  },
]

export const hostAvailabilityDays = [
  'Apr 27',
  'Apr 28',
  'Apr 29',
  'Apr 30',
  'May 01',
  'May 02',
  'May 03',
  'May 04',
  'May 05',
  'May 06',
  'May 07',
  'May 08',
  'May 09',
  'May 10',
]

export const hostAvailabilityRows = [
  {
    listingId: 13,
    pattern: ['occupied', 'occupied', 'turn', 'open', 'open', 'premium', 'premium', 'open', 'open', 'blocked', 'blocked', 'open', 'arrival', 'occupied'],
  },
  {
    listingId: 10,
    pattern: ['open', 'open', 'open', 'premium', 'premium', 'arrival', 'occupied', 'occupied', 'turn', 'open', 'open', 'premium', 'arrival', 'occupied'],
  },
  {
    listingId: 14,
    pattern: ['occupied', 'turn', 'open', 'open', 'open', 'premium', 'premium', 'open', 'arrival', 'occupied', 'occupied', 'turn', 'open', 'open'],
  },
  {
    listingId: 4,
    pattern: ['blocked', 'blocked', 'open', 'open', 'premium', 'premium', 'open', 'open', 'open', 'arrival', 'occupied', 'occupied', 'turn', 'open'],
  },
]

export const hostInventoryMetrics = [
  { label: 'Sellable nights', value: '94%', note: 'After maintenance blocks' },
  { label: 'Average LOS', value: '3.8 nights', note: 'Best on Fri-Mon stays' },
  { label: 'Turnover window', value: '4.6 hrs', note: 'Avg clean + inspection time' },
]

export const hostInventoryAlerts = [
  {
    title: 'Terrace Family Room is blocked for maintenance',
    detail: 'Balcony seal repair expected to finish by May 03.',
    tone: 'warning',
  },
  {
    title: 'Island villa weekend nearly sold out',
    detail: 'Only one premium residence left for May 09 arrival window.',
    tone: 'brand',
  },
  {
    title: 'Paris suite photos lag current product quality',
    detail: 'Updating media should improve conversion before next city break cycle.',
    tone: 'sky',
  },
]

export const hostForecastBlocks = [
  {
    title: 'Next 7 days',
    value: '88%',
    note: 'Driven by two luxury arrivals and one city short stay.',
  },
  {
    title: 'Next 30 days',
    value: '82%',
    note: 'Healthy pacing with one soft midweek gap in Paris.',
  },
  {
    title: 'High-demand weekends',
    value: '5 / 6',
    note: 'Already priced above baseline rate ladder.',
  },
]

export const hostChannelMix = [
  { label: 'Direct / repeat', value: '42%' },
  { label: 'Travolish search', value: '36%' },
  { label: 'Boost campaigns', value: '12%' },
  { label: 'Referral / partner', value: '10%' },
]

export const hostReportCards = [
  {
    title: 'Revenue trend',
    amount: '$92,480',
    delta: '+12% vs last month',
    note: 'Island and lakefront inventory led the gain.',
  },
  {
    title: 'Occupancy trend',
    amount: '79%',
    delta: '+6 pts vs last month',
    note: 'Weekend pacing recovered after pricing reset.',
  },
  {
    title: 'Guest experience',
    amount: '4.91',
    delta: '+0.04 review score',
    note: 'Arrival communication was the strongest improvement.',
  },
]

export const hostMarketSegments = [
  { market: 'Luxury leisure', share: '38%', trend: '+9%' },
  { market: 'Remote-work city breaks', share: '24%', trend: '+5%' },
  { market: 'Repeat couples', share: '21%', trend: '+7%' },
  { market: 'Concierge referrals', share: '17%', trend: '+3%' },
]

export const hostTopMarkets = [
  { label: 'Top listing', value: 'Private Island Beach Villa', note: '$18.4k MTD' },
  { label: 'Fastest growth', value: 'Lakefront Glass House', note: '+18% ADR uplift' },
  { label: 'Best conversion fix', value: 'Paris penthouse refresh', note: 'Media update queued' },
]

export const hostPricingRules = [
  {
    id: 'rule-1',
    title: 'Weekend premium ladder',
    status: 'Active',
    scope: 'Lake Como + Maldives',
    change: '+18% Fri-Sun',
    note: 'Applies when occupancy pace exceeds 70%.',
  },
  {
    id: 'rule-2',
    title: 'Last-minute city fill',
    status: 'Active',
    scope: 'Tokyo + Paris',
    change: '-8% inside 5 days',
    note: 'Only for dates without direct repeat inquiries.',
  },
  {
    id: 'rule-3',
    title: 'Long-stay remote work',
    status: 'Draft',
    scope: 'Tokyo loft',
    change: '-12% after 5 nights',
    note: 'Waiting for wifi/performance copy refresh.',
  },
]

export const hostPromotions = [
  {
    id: 'promo-1',
    title: 'Island visibility boost',
    status: 'Running',
    spend: '$420',
    result: '+14 qualified views',
    note: 'Strongest lift on sunset-arrival dates.',
  },
  {
    id: 'promo-2',
    title: 'City loyalty offer',
    status: 'Scheduled',
    spend: '$0',
    result: 'Starts May 02',
    note: 'Targeting repeat guests and review prompts.',
  },
  {
    id: 'promo-3',
    title: 'Paris relaunch refresh',
    status: 'Paused',
    spend: '$120',
    result: 'Awaiting new photo set',
    note: 'Resume after copy and images go live.',
  },
]

export const hostPricingSuggestions = [
  {
    id: 'ai-1',
    listingId: 13,
    roomId: 'rm-1302',
    dateWindow: 'May 09 - 11',
    currentRate: '$1,860',
    suggestedRate: '$2,140',
    confidence: 'High',
    rationale: ['Search demand up 21%', 'Nearby luxury sellout pace', 'Transfer bundle interest rising'],
  },
  {
    id: 'ai-2',
    listingId: 10,
    roomId: 'rm-1001',
    dateWindow: 'May 02 - 04',
    currentRate: '$840',
    suggestedRate: '$910',
    confidence: 'Medium',
    rationale: ['Weekend pickup pattern', 'Restaurant event nearby', 'Boat transfer queries increased'],
  },
  {
    id: 'ai-3',
    listingId: 4,
    roomId: 'rm-401',
    dateWindow: 'May 18 - 20',
    currentRate: '$620',
    suggestedRate: '$575',
    confidence: 'Medium',
    rationale: ['Photo refresh pending', 'Lower direct conversion last 2 weeks', 'Comp set lowered midweek rates'],
  },
]

export const hostPayoutSummary = {
  available: '$8,240',
  pending: '$4,980',
  reserveHold: '$2,180',
  nextTransfer: 'May 03 · $5,820',
}

export const hostPayoutHistory = [
  {
    id: 'pay-1',
    date: 'Apr 24, 2026',
    amount: '$4,920',
    status: 'Paid',
    destination: 'Mercury Business Checking',
    note: 'Tokyo + Paris stays',
  },
  {
    id: 'pay-2',
    date: 'Apr 17, 2026',
    amount: '$6,180',
    status: 'Paid',
    destination: 'Mercury Business Checking',
    note: 'Lakefront weekend releases',
  },
  {
    id: 'pay-3',
    date: 'Apr 10, 2026',
    amount: '$3,460',
    status: 'Reserve hold',
    destination: 'Mercury Business Checking',
    note: 'Island villa security reserve still open',
  },
]

export const hostKycChecklist = [
  { id: 'kyc-1', label: 'Government ID', status: 'Approved', detail: 'Passport verified on Apr 05' },
  { id: 'kyc-2', label: 'Proof of address', status: 'Needs refresh', detail: 'Upload a current utility bill' },
  { id: 'kyc-3', label: 'Business registration', status: 'Approved', detail: 'Company certificate accepted' },
  { id: 'kyc-4', label: 'Tax profile', status: 'In review', detail: 'Review expected within 2 business days' },
]

export const hostKycTimeline = [
  { label: 'Profile created', value: 'Apr 02' },
  { label: 'ID approved', value: 'Apr 05' },
  { label: 'Tax profile submitted', value: 'Apr 21' },
  { label: 'Address refresh due', value: 'Apr 30' },
]

export const hostBankAccounts = [
  {
    id: 'bank-1',
    label: 'Mercury Business Checking',
    type: 'Primary payout account',
    last4: '2048',
    currency: 'USD',
    status: 'Verified',
    transferSpeed: '2 business days',
  },
  {
    id: 'bank-2',
    label: 'Wise EUR Collection',
    type: 'International fallback',
    last4: '4481',
    currency: 'EUR',
    status: 'Pending micro-deposits',
    transferSpeed: '3 business days',
  },
]

export const hostAutoReplyTemplates = [
  {
    id: 'reply-1',
    title: 'Arrival guide follow-up',
    trigger: '24 hours before check-in',
    channel: 'In-app + email',
    tone: 'Calm and premium',
    preview:
      'Your arrival details are set. Reply here if you want us to coordinate transport or a late check-in handoff.',
    performance: 'Opened by 92% of guests',
  },
  {
    id: 'reply-2',
    title: 'Late-night self check-in',
    trigger: 'Check-in after 9 PM',
    channel: 'In-app',
    tone: 'Short and practical',
    preview:
      'Your self check-in is active. I attached the lock code, elevator notes, and the fastest route from the station.',
    performance: 'Cuts repeat questions by 38%',
  },
  {
    id: 'reply-3',
    title: 'Review thank-you',
    trigger: 'Morning after checkout',
    channel: 'In-app + email',
    tone: 'Warm and concise',
    preview:
      'Thank you for staying with us. If anything could have felt even smoother, reply here and I will follow up personally.',
    performance: 'Drives 24% more review completions',
  },
]

export const hostEmergencyContacts = [
  { label: 'Property operations lead', value: 'Ines Duarte · +351 910 555 010' },
  { label: 'Security / overnight escalation', value: 'Victor Hale · +351 910 555 014' },
  { label: 'Boat transfer desk', value: 'Lagoon dock control · +960 555 1842' },
]

export const hostEmergencyIncidents = [
  {
    id: 'sos-1',
    title: 'Guest requested after-hours arrival support',
    listingId: 14,
    status: 'Open',
    severity: 'Medium',
    note: 'Late-night self check-in backup assigned to local runner.',
  },
  {
    id: 'sos-2',
    title: 'Dock timing changed due to weather',
    listingId: 13,
    status: 'Monitoring',
    severity: 'Low',
    note: 'Guests notified and transfer vendor confirmed alternate slot.',
  },
]

export const hostEmergencyProtocols = [
  'Keep property operations lead and security escalation numbers visible for every arrival team.',
  'Send guest-safe transport updates inside the conversation thread before changing arrival instructions.',
  'Document every active incident inside the host dashboard before closing it out.',
]

export function findHostListing(listingId) {
  return hostListings.find((listing) => String(listing.id) === String(listingId))
}

export function findRoomsByListing(listingId) {
  return hostRooms.filter((room) => String(room.listingId) === String(listingId))
}

export function findHostRoom(roomId) {
  return hostRooms.find((room) => room.id === roomId)
}

export function buildListingDraft(listingId) {
  const listing = listingId ? findHostListing(listingId) : null
  const property = listing?.property
  const mapAmenityToId = {
    Wifi: 'wifi',
    Pool: 'pool',
    Kitchen: 'kitchen',
    'Free parking': 'parking',
    'Air conditioning': 'ac',
    Washer: 'washer',
    TV: 'tv',
    Gym: 'gym',
    'Coffee maker': 'coffee',
    Fireplace: 'fireplace',
    'Pet friendly': 'pets',
    'Ski-in/ski-out': 'ski',
  }

  const inferPropertyType = () => {
    const subtitle = property?.subtitle?.toLowerCase() || ''
    const category = property?.category || ''

    if (subtitle.includes('apartment')) return 'apartment'
    if (subtitle.includes('guesthouse')) return 'guesthouse'
    if (subtitle.includes('cabin') || category === 'cabin') return 'cabin'
    if (subtitle.includes('tent') || category === 'camping') return 'tent'
    if (subtitle.includes('castle') || category === 'castle') return 'castle'
    if (subtitle.includes('barn')) return 'barn'
    return 'house'
  }

  return {
    listingId: listing?.id || null,
    propertyType: inferPropertyType(),
    title: property?.title || 'New signature stay',
    description:
      property?.description ||
      'A design-led stay focused on clear arrival flows, strong amenities, and pricing confidence.',
    basics: {
      guests: Number(property?.guests || 4),
      bedrooms: Number(property?.bedrooms || 2),
      beds: Number(property?.beds || 2),
      bathrooms: Number(property?.bathrooms || 2),
    },
    amenities:
      property?.amenities
        ?.map((amenity) => mapAmenityToId[amenity])
        .filter(Boolean)
        .slice(0, 12) || ['wifi', 'kitchen', 'parking', 'ac'],
    photos:
      property?.images?.slice(0, 5).map((preview, index) => ({
        id: `existing-${index}`,
        preview,
        existing: true,
      })) || [],
    pricing: {
      weekday: String(property?.price || 420),
      weekend: String(Math.round((property?.price || 420) * 1.15)),
    },
    status: listing?.status || 'Draft',
    location: property?.location || 'City, region',
    country: property?.country || 'Country',
    market: listing?.market || 'New host launch',
  }
}

export function buildRoomDraft(roomId, listingId) {
  const room = roomId ? findHostRoom(roomId) : null
  const listing = room ? findHostListing(room.listingId) : findHostListing(listingId)

  return {
    roomId: room?.id || null,
    listingId: room?.listingId || listing?.id || Number(listingId) || hostListings[0].id,
    listingName: listing?.property.title || 'Unassigned listing',
    name: room?.name || 'Signature room',
    type: room?.type || 'Suite',
    status: room?.status || 'Draft',
    capacity: room?.capacity || '2 guests',
    beds: room?.beds || '1 king bed',
    baths: room?.baths || '1 bath',
    floor: room?.floor || 'Main floor',
    baseRate: room?.baseRate?.replace(/[^0-9]/g, '') || '360',
    note:
      room?.note ||
      'Use this room form to shape rate, occupancy, and guest promise before the API is wired in.',
  }
}
