import { properties } from './mockData'

const hostAvatars = {
  Sarah:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&h=320&fit=crop',
  'Jean-Pierre':
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop',
  Lorenzo:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop',
  Ahmed:
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=320&h=320&fit=crop',
  Yuki:
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=320&h=320&fit=crop',
}

const getPropertyById = (propertyId) =>
  properties.find((property) => property.id === propertyId)

const buildPropertySummary = (propertyId) => {
  const property = getPropertyById(propertyId)

  if (!property) {
    return null
  }

  return {
    id: property.id,
    title: property.title,
    location: property.location,
    country: property.country,
    image: property.images[0],
    price: property.price,
    rating: property.rating,
    host: {
      name: property.host.name,
      superhost: property.host.superhost,
      avatar:
        hostAvatars[property.host.name] ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=320&fit=crop',
    },
  }
}

export const previewAccountProfile = {
  fullName: 'Avery Morgan',
  preferredName: 'Avery',
  email: 'avery.morgan@travolish.com',
  phone: '+1 (415) 555-0142',
  avatar:
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=480&h=480&fit=crop',
  role: 'guest',
  city: 'Austin, Texas',
  timeZone: 'Central Time (US & Canada)',
  joinedLabel: 'Member since 2021',
  travelStyle: 'Design-forward coastal stays and long-weekend city escapes.',
  bio: 'I plan around great design, easy check-ins, and memorable host touches. Most of my trips are quick resets with one or two flexible work blocks built in.',
  badges: ['Identity verified', 'Email confirmed', 'Top reviewer', 'Fast responder'],
  stats: [
    { label: 'Trips completed', value: '18' },
    { label: 'Upcoming stays', value: '3' },
    { label: 'Countries visited', value: '11' },
    { label: 'Average review score', value: '4.9' },
  ],
  preferences: [
    'Self check-in whenever possible',
    'Quiet work nook with reliable wifi',
    'Late afternoon arrival windows',
    'Ocean, lake, or skyline views',
  ],
  emergencyContact: {
    name: 'Jordan Ellis',
    relation: 'Partner',
    phone: '+1 (415) 555-0199',
  },
  savedAddresses: [
    {
      label: 'Home base',
      value: 'South Congress, Austin, Texas',
    },
    {
      label: 'Work HQ',
      value: 'SoMa, San Francisco, California',
    },
  ],
}

export const profileHighlights = [
  {
    title: 'Trusted traveler profile',
    description:
      'All essentials are already filled in so checkout can stay lightweight on mobile.',
  },
  {
    title: 'Concierge-ready preferences',
    description:
      'Hosts can instantly see arrival style, amenity priorities, and travel cadence.',
  },
  {
    title: 'Clean financial history',
    description:
      'Payment methods, receipts, and refunds sit in one consistent account flow.',
  },
]

export const connectedAccounts = [
  {
    id: 'google',
    provider: 'Google',
    status: 'connected',
    detail: 'Connected for one-tap sign-in',
    lastUpdated: 'Updated 3 days ago',
  },
  {
    id: 'apple',
    provider: 'Apple',
    status: 'available',
    detail: 'Ready to connect for iPhone checkout',
    lastUpdated: 'Not connected yet',
  },
  {
    id: 'facebook',
    provider: 'Facebook',
    status: 'available',
    detail: 'Optional social sign-in backup',
    lastUpdated: 'Not connected yet',
  },
]

export const securitySignals = [
  {
    title: 'Two-step verification',
    status: 'On for sensitive actions',
    description: 'Used when payment methods, payouts, or account recovery details change.',
  },
  {
    title: 'Magic link login',
    status: 'Enabled',
    description: 'Email sign-in stays available as a fallback when social providers are unavailable.',
  },
  {
    title: 'Recent security review',
    status: 'Passed on Apr 10, 2026',
    description: 'No unusual sessions or payment risk events were detected.',
  },
]

export const trustedDevices = [
  {
    id: 'device-1',
    name: 'iPhone 15 Pro',
    location: 'Austin, Texas',
    activity: 'Active now',
    badge: 'Current device',
  },
  {
    id: 'device-2',
    name: 'MacBook Air',
    location: 'San Francisco, California',
    activity: 'Last active yesterday',
    badge: 'Trusted',
  },
  {
    id: 'device-3',
    name: 'iPad Mini',
    location: 'Seattle, Washington',
    activity: 'Last active 12 days ago',
    badge: 'Travel device',
  },
]

export const paymentMethods = [
  {
    id: 'pm-1',
    label: 'Visa ending 4242',
    brand: 'Visa',
    last4: '4242',
    expiry: '09/28',
    type: 'Personal card',
    primary: true,
    color: 'from-slate-900 via-slate-800 to-slate-700',
  },
  {
    id: 'pm-2',
    label: 'Amex ending 3105',
    brand: 'American Express',
    last4: '3105',
    expiry: '12/27',
    type: 'Travel rewards',
    primary: false,
    color: 'from-cyan-700 via-sky-600 to-blue-500',
  },
  {
    id: 'pm-3',
    label: 'Mastercard ending 8901',
    brand: 'Mastercard',
    last4: '8901',
    expiry: '02/29',
    type: 'Backup card',
    primary: false,
    color: 'from-rose-600 via-orange-500 to-amber-400',
  },
]

export const transactionSummary = [
  { label: 'Booked this year', value: '$12,840' },
  { label: 'Refunds processed', value: '$640' },
  { label: 'Travel credits', value: '$275' },
]

export const paymentTransactions = [
  {
    id: 'txn-1001',
    type: 'Stay payment',
    amount: '$6,120.00',
    direction: 'debit',
    status: 'Paid',
    date: 'Jan 12, 2026',
    method: 'Visa ending 4242',
    propertyId: 13,
    bookingId: 'TRV-2048',
    note: 'Private Island Beach Villa',
  },
  {
    id: 'txn-1002',
    type: 'Partial refund',
    amount: '$640.00',
    direction: 'credit',
    status: 'Returned',
    date: 'Feb 03, 2026',
    method: 'Visa ending 4242',
    propertyId: 4,
    bookingId: 'TRV-1937',
    note: 'Rate adjustment after concierge upgrade',
  },
  {
    id: 'txn-1003',
    type: 'Stay payment',
    amount: '$2,940.00',
    direction: 'debit',
    status: 'Paid',
    date: 'Mar 08, 2026',
    method: 'Amex ending 3105',
    propertyId: 10,
    bookingId: 'TRV-2199',
    note: 'Lakefront Glass House',
  },
  {
    id: 'txn-1004',
    type: 'Travel credit applied',
    amount: '$275.00',
    direction: 'credit',
    status: 'Applied',
    date: 'Apr 01, 2026',
    method: 'Travel credits',
    propertyId: 14,
    bookingId: 'TRV-2288',
    note: 'Spring loyalty reward',
  },
]

export const notifications = [
  {
    id: 'ntf-1',
    section: 'Today',
    tone: 'brand',
    title: 'Check-in guide is ready',
    body: 'Ahmed shared arrival details, boat transfer timing, and villa access instructions for your Maldives stay.',
    time: '12 min ago',
    actionLabel: 'Open booking',
    actionHref: '/trips/TRV-2048',
  },
  {
    id: 'ntf-2',
    section: 'Today',
    tone: 'sky',
    title: 'New host message from Lorenzo',
    body: 'Your Lake Como host sent restaurant picks and recommended arrival times before the weekend.',
    time: '1 hr ago',
    actionLabel: 'View conversation',
    actionHref: '/messages/msg-102',
  },
  {
    id: 'ntf-3',
    section: 'This week',
    tone: 'emerald',
    title: 'Refund completed',
    body: '$640 was returned to Visa ending 4242 for your Paris reservation adjustment.',
    time: 'Yesterday',
    actionLabel: 'See receipt',
    actionHref: '/account/transactions',
  },
  {
    id: 'ntf-4',
    section: 'This week',
    tone: 'amber',
    title: 'Review reminder',
    body: 'You still have time to review your Tokyo loft stay and help future guests compare neighborhoods.',
    time: '2 days ago',
    actionLabel: 'Write review',
    actionHref: '/reviews/new?bookingId=TRV-1902',
  },
  {
    id: 'ntf-5',
    section: 'Earlier',
    tone: 'violet',
    title: 'Travel credit unlocked',
    body: 'Your spring loyalty reward is now available and can be applied at checkout.',
    time: 'Apr 01',
    actionLabel: 'Use credits',
    actionHref: '/checkout/10',
  },
]

export const notificationPreferences = [
  {
    id: 'pref-booking',
    label: 'Booking updates',
    description: 'Reservation confirmations, check-in instructions, and itinerary changes.',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'pref-messages',
    label: 'Messages from hosts',
    description: 'New messages, unread reminders, and concierge updates before a stay.',
    email: false,
    push: true,
    sms: false,
  },
  {
    id: 'pref-offers',
    label: 'Offers and credits',
    description: 'Seasonal rewards, destination suggestions, and limited promotional rates.',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'pref-safety',
    label: 'Safety and account alerts',
    description: 'Security checks, login activity, and emergency notifications while traveling.',
    email: true,
    push: true,
    sms: true,
  },
]

const bookingRecords = [
  {
    id: 'TRV-2048',
    propertyId: 13,
    status: 'upcoming',
    dateLabel: 'Jun 14 - 19, 2026',
    nights: 5,
    guests: 2,
    rooms: 1,
    total: '$6,120',
    paymentStatus: 'Paid in full',
    confirmationCode: 'TVL93R4',
    tripMood: 'Island reset',
    hostNote: 'Boat transfer reserved and sunset dinner pre-selected.',
    timeline: [
      { label: 'Reserved', value: 'Jan 12' },
      { label: 'Transfer confirmed', value: 'Apr 04' },
      { label: 'Check-in', value: 'Jun 14' },
    ],
    itinerary: [
      'Private speedboat pickup from Male at 4:10 PM',
      'Chef welcome dinner on the first evening',
      'Lagoon snorkeling kit reserved for day two',
    ],
    travelers: ['Avery Morgan', 'Jordan Ellis'],
    canReview: false,
  },
  {
    id: 'TRV-2199',
    propertyId: 10,
    status: 'upcoming',
    dateLabel: 'May 09 - 12, 2026',
    nights: 3,
    guests: 3,
    rooms: 1,
    total: '$2,940',
    paymentStatus: 'Paid in full',
    confirmationCode: 'TVL11X8',
    tripMood: 'Lake weekend',
    hostNote: 'Boat pickup timing still flexible until 24 hours before arrival.',
    timeline: [
      { label: 'Reserved', value: 'Mar 08' },
      { label: 'Arrival guide', value: 'Pending' },
      { label: 'Check-in', value: 'May 09' },
    ],
    itinerary: [
      'Concierge can arrange a private boat transfer from Como',
      'Late checkout requested for Sunday morning',
    ],
    travelers: ['Avery Morgan', 'Mina Patel', 'Jordan Ellis'],
    canReview: false,
  },
  {
    id: 'TRV-1902',
    propertyId: 14,
    status: 'completed',
    dateLabel: 'Mar 18 - 22, 2026',
    nights: 4,
    guests: 2,
    rooms: 1,
    total: '$1,518',
    paymentStatus: 'Closed',
    confirmationCode: 'TVL77M2',
    tripMood: 'City reset',
    hostNote: 'Smooth late arrival and quick neighborhood handoff.',
    timeline: [
      { label: 'Reserved', value: 'Jan 20' },
      { label: 'Checked in', value: 'Mar 18' },
      { label: 'Completed', value: 'Mar 22' },
    ],
    itinerary: [
      'Arrived after 10 PM using smart-lock access',
      'Host shared a short-list of coffee bars and design stores',
    ],
    travelers: ['Avery Morgan', 'Jordan Ellis'],
    canReview: true,
  },
  {
    id: 'TRV-1937',
    propertyId: 4,
    status: 'completed',
    dateLabel: 'Feb 02 - 06, 2026',
    nights: 4,
    guests: 2,
    rooms: 1,
    total: '$1,640',
    paymentStatus: 'Refund adjusted',
    confirmationCode: 'TVL42N1',
    tripMood: 'Gallery weekend',
    hostNote: 'Rebooked after a room servicing change and received a pricing adjustment.',
    timeline: [
      { label: 'Reserved', value: 'Dec 15' },
      { label: 'Adjusted', value: 'Jan 29' },
      { label: 'Completed', value: 'Feb 06' },
    ],
    itinerary: [
      'Concierge helped re-time the airport transfer',
      'Partial refund was issued after the room category change',
    ],
    travelers: ['Avery Morgan', 'Jordan Ellis'],
    canReview: true,
  },
  {
    id: 'TRV-1754',
    propertyId: 1,
    status: 'cancelled',
    dateLabel: 'Jan 09 - 12, 2026',
    nights: 3,
    guests: 4,
    rooms: 1,
    total: '$1,965',
    paymentStatus: 'Cancelled',
    confirmationCode: 'TVL18Q7',
    tripMood: 'Family escape',
    hostNote: 'Cancelled within the flexible window after a weather change.',
    timeline: [
      { label: 'Reserved', value: 'Nov 28' },
      { label: 'Cancelled', value: 'Dec 30' },
    ],
    itinerary: ['Travel credits were reissued for a future coastal stay.'],
    travelers: ['Avery Morgan', 'Jordan Ellis', 'Lena Morgan', 'Theo Morgan'],
    canReview: false,
  },
]

export const bookings = bookingRecords.map((booking) => ({
  ...booking,
  property: buildPropertySummary(booking.propertyId),
}))

const conversationRecords = [
  {
    id: 'msg-101',
    propertyId: 13,
    bookingId: 'TRV-2048',
    title: 'Maldives arrival planning',
    participant: 'Ahmed',
    role: 'Host',
    unreadCount: 2,
    lastMessage: 'I locked in your sunset dinner and can still add a reef picnic if you want.',
    updatedAt: '12 min ago',
  },
  {
    id: 'msg-102',
    propertyId: 10,
    bookingId: 'TRV-2199',
    title: 'Lake Como host tips',
    participant: 'Lorenzo',
    role: 'Host',
    unreadCount: 1,
    lastMessage: 'I sent three restaurant picks that are easy to reach by boat after check-in.',
    updatedAt: '1 hr ago',
  },
  {
    id: 'msg-103',
    propertyId: 14,
    bookingId: 'TRV-1902',
    title: 'Tokyo neighborhood recap',
    participant: 'Yuki',
    role: 'Host',
    unreadCount: 0,
    lastMessage: 'Thanks again for leaving the loft spotless. Happy to host you anytime.',
    updatedAt: '3 days ago',
  },
]

export const conversations = conversationRecords.map((conversation) => ({
  ...conversation,
  property: buildPropertySummary(conversation.propertyId),
}))

export const conversationMessages = {
  'msg-101': [
    {
      id: 'm-1',
      sender: 'host',
      text: 'Welcome back, Avery. I have your transfer request and the villa is reserved from Jun 14.',
      time: 'Yesterday, 6:22 PM',
    },
    {
      id: 'm-2',
      sender: 'guest',
      text: 'Perfect. Could we aim for a later dinner on the first night after the transfer?',
      time: 'Yesterday, 6:41 PM',
    },
    {
      id: 'm-3',
      sender: 'host',
      text: 'Yes, I locked in a 7:45 PM sunset dinner. I can also set aside snorkeling gear for day two.',
      time: 'Yesterday, 7:02 PM',
    },
    {
      id: 'm-4',
      sender: 'host',
      text: 'I locked in your sunset dinner and can still add a reef picnic if you want.',
      time: '12 min ago',
    },
  ],
  'msg-102': [
    {
      id: 'm-5',
      sender: 'host',
      text: 'You are all set for Lake Como. Do you want a direct dock pickup or a driver from Como station?',
      time: 'Today, 8:18 AM',
    },
    {
      id: 'm-6',
      sender: 'guest',
      text: 'Dock pickup would be ideal if the weather holds.',
      time: 'Today, 8:33 AM',
    },
    {
      id: 'm-7',
      sender: 'host',
      text: 'I sent three restaurant picks that are easy to reach by boat after check-in.',
      time: '1 hr ago',
    },
  ],
  'msg-103': [
    {
      id: 'm-8',
      sender: 'host',
      text: 'Thanks again for staying in Shibuya. Your neighborhood notes were helpful.',
      time: '3 days ago',
    },
    {
      id: 'm-9',
      sender: 'guest',
      text: 'The loft felt great for a short work trip. I am still writing the review.',
      time: '3 days ago',
    },
    {
      id: 'm-10',
      sender: 'host',
      text: 'Thanks again for leaving the loft spotless. Happy to host you anytime.',
      time: '3 days ago',
    },
  ],
}

export const reviewCategories = [
  'Cleanliness',
  'Accuracy',
  'Communication',
  'Location',
  'Check-in',
  'Value',
]

export const reviewTags = [
  'Beautiful design',
  'Great wifi',
  'Easy arrival',
  'Calm at night',
  'Would stay again',
  'Host was proactive',
  'Perfect for couples',
  'Walkable area',
]

export const submittedReviews = [
  {
    id: 'rev-301',
    bookingId: 'TRV-1937',
    propertyId: 4,
    rating: 5,
    title: 'Polished stay in a perfect neighborhood',
    summary:
      'The apartment felt calm, bright, and unusually well thought through for a short city stay.',
    submittedAt: 'Feb 11, 2026',
    status: 'Published',
    categoryScores: {
      Cleanliness: 5,
      Accuracy: 5,
      Communication: 5,
      Location: 5,
      'Check-in': 4,
      Value: 4,
    },
    hostResponse:
      'Thank you, Avery. I appreciated how clearly you communicated your late arrival.',
  },
  {
    id: 'rev-302',
    bookingId: 'TRV-1881',
    propertyId: 7,
    rating: 4,
    title: 'Memorable desert getaway',
    summary:
      'The dome looked incredible at sunset and the outdoor setup felt private without being isolated.',
    submittedAt: 'Jan 07, 2026',
    status: 'Published',
    categoryScores: {
      Cleanliness: 4,
      Accuracy: 4,
      Communication: 5,
      Location: 5,
      'Check-in': 4,
      Value: 4,
    },
    hostResponse:
      'Come back anytime. Next time I can reserve the stargazing platform for you in advance.',
  },
]

export const pendingReviewPrompts = bookings.filter(
  (booking) =>
    booking.status === 'completed' &&
    !submittedReviews.some((review) => review.bookingId === booking.id),
)

export const checkoutPreview = {
  travelerDetails: {
    firstName: previewAccountProfile.preferredName,
    lastName: 'Morgan',
    email: previewAccountProfile.email,
    phone: previewAccountProfile.phone,
  },
  addOns: [
    {
      id: 'addon-transfer',
      title: 'Private arrival transfer',
      description: 'Coordinated pickup aligned to your arrival time.',
      price: '$120',
    },
    {
      id: 'addon-late',
      title: 'Late checkout',
      description: 'Keep the room until 2 PM when scheduling allows.',
      price: '$85',
    },
    {
      id: 'addon-stock',
      title: 'Arrival pantry stock',
      description: 'A light breakfast setup and house essentials before you land.',
      price: '$60',
    },
  ],
  supportHighlights: [
    'Free cancellation within the flexible window',
    'Secure payment with masked card details',
    'In-app message thread opens as soon as the booking is confirmed',
  ],
}

export const accountInsights = [
  {
    label: 'Next departure',
    value: '26 days',
    note: 'Maldives island stay',
  },
  {
    label: 'Unread host updates',
    value: '3',
    note: 'Across two conversations',
  },
  {
    label: 'Rewards ready',
    value: '$275',
    note: 'Available on next checkout',
  },
]

export function findBooking(bookingId) {
  return bookings.find((booking) => booking.id === bookingId)
}

export function findConversation(conversationId) {
  return conversations.find((conversation) => conversation.id === conversationId)
}

export function findReview(reviewId) {
  return submittedReviews.find((review) => review.id === reviewId)
}

export function findBookingByReview(reviewId) {
  const review = findReview(reviewId)
  return review ? findBooking(review.bookingId) : null
}

export function buildCheckoutState(propertyId) {
  const property = buildPropertySummary(Number(propertyId))

  if (!property) {
    return null
  }

  const baseNightCount = 4
  const nightlySubtotal = property.price * baseNightCount
  const serviceFee = Math.round(nightlySubtotal * 0.13)
  const taxes = Math.round(nightlySubtotal * 0.11)

  return {
    property,
    nights: baseNightCount,
    guests: 2,
    dateLabel: 'Jun 14 - 18, 2026',
    nightlySubtotal,
    serviceFee,
    taxes,
    total: nightlySubtotal + serviceFee + taxes,
  }
}
