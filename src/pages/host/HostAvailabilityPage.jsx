import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
} from '../../components/host/HostPortalUI'
import { getHotelAvailabilityRange, blockRoomDate, unblockRoomDate } from '../../services/availabilityApi'
import { getHostRooms } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'

const statusStyles = {
  open: 'bg-white text-dark border-gray-200',
  occupied: 'bg-dark text-white border-dark',
  limited: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  premium: 'bg-amber-50 text-amber-800 border-amber-200',
  turn: 'bg-sky-50 text-sky-800 border-sky-200',
  arrival: 'bg-teal-50 text-teal-800 border-teal-200',
}

const DAY_MS = 24 * 60 * 60 * 1000
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const statusMeta = {
  open: {
    label: 'Free',
    description: 'Available to book',
    cellClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  occupied: {
    label: 'Booked',
    description: 'Guest booking exists',
    cellClass: 'border-slate-800 bg-slate-900 text-white',
    dotClass: 'bg-slate-900',
  },
  blocked: {
    label: 'Blocked',
    description: 'Owner or maintenance hold',
    cellClass: 'border-rose-200 bg-rose-50 text-rose-800',
    dotClass: 'bg-rose-500',
  },
  premium: {
    label: 'Premium',
    description: 'Bookable high-rate day',
    cellClass: 'border-amber-200 bg-amber-50 text-amber-800',
    dotClass: 'bg-amber-500',
  },
  turn: {
    label: 'Turn',
    description: 'Cleaning or changeover',
    cellClass: 'border-sky-200 bg-sky-50 text-sky-800',
    dotClass: 'bg-sky-500',
  },
  arrival: {
    label: 'Arrival',
    description: 'Guest arrives that day',
    cellClass: 'border-teal-200 bg-teal-50 text-teal-800',
    dotClass: 'bg-teal-500',
  },
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, amount) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount, 1)
  return startOfMonth(next)
}

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return startOfDay(next)
}

function buildDates() {
  const dates = []
  const base = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      iso: d.toISOString().split('T')[0],
    })
  }
  return dates
}

function isSameMonth(date, monthDate) {
  return (
    date.getFullYear() === monthDate.getFullYear() &&
    date.getMonth() === monthDate.getMonth()
  )
}

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function buildMonthDays(monthDate) {
  const firstDay = startOfMonth(monthDate)
  const days = []
  const cursor = new Date(firstDay)

  while (cursor.getMonth() === firstDay.getMonth()) {
    days.push(startOfDay(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function buildCalendarGrid(monthDate) {
  const firstDay = startOfMonth(monthDate)
  const gridStart = addDays(firstDay, -firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

function getPropertyTitle(listing) {
  return listing.property?.title ?? `Listing ${listing.id}`
}

function getPropertyLocation(listing) {
  return listing.market ?? listing.property?.location ?? 'Location not set'
}

function normalizeStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (['open', 'free', 'available'].includes(normalized)) return 'open'
  if (['occupied', 'booked', 'reserved', 'sold'].includes(normalized)) return 'occupied'
  if (['blocked', 'hold', 'maintenance'].includes(normalized)) return 'blocked'
  if (['premium', 'surge', 'high-demand'].includes(normalized)) return 'premium'
  if (['turn', 'turnover', 'changeover'].includes(normalized)) return 'turn'
  if (['arrival', 'check-in', 'checkin'].includes(normalized)) return 'arrival'

  return null
}

function mapStatus(availability) {
  if (!availability) return 'open'

  // Check blocked first — API returns blockedRooms (not blockedCount) and status:"FULL"
  // Checking before explicitStatus so a blocked day doesn't fallback to 'occupied'
  if (Number(availability.blockedRooms ?? availability.blockedCount ?? 0) > 0 || availability.isBlocked) return 'blocked'

  const explicitStatus = normalizeStatus(
    availability.status ??
      availability.availabilityStatus ??
      availability.state ??
      availability.type,
  )

  if (explicitStatus) return explicitStatus
  if (Number(availability.availableRooms) === 0 || availability.available === false) return 'occupied'
  if (availability.isPremiumDate) return 'premium'
  if (availability.isTurnoverDay) return 'turn'
  if (availability.hasArrival) return 'arrival'
  return 'open'
}

function statusLabel(s) {
  if (s === 'occupied') return 'Full'
  if (s === 'blocked') return 'Blk'
  if (s === 'limited') return 'Low'
  return ''
}

function roomLabel(room) {
  return room.number ?? room.roomNumber ?? room.name ?? `Room ${room.id}`
}

function roomSub(room) {
  return room.type ?? room.roomType ?? ''
}

function getAvailabilityItems(data) {
  if (Array.isArray(data)) return data
  return data?.availabilityList ?? data?.items ?? data?.data ?? []
}

function getAvailabilityDateKey(item) {
  const value =
    item.date ??
    item.availabilityDate ??
    item.stayDate ??
    item.calendarDate ??
    item.day

  if (!value) return null
  return String(value).split('T')[0]
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

function getFallbackStatus() {
  return 'open'
}

function getStatusForListingDate(availabilityByListingDate, listingId, date) {
  const dateKey = toDateKey(date)
  return availabilityByListingDate[String(listingId)]?.[dateKey] ?? getFallbackStatus(listingId, date)
}

function countStatuses(dates, availabilityByListingDate, listings = []) {
  const counts = Object.keys(statusMeta).reduce((acc, status) => {
    acc[status] = 0
    return acc
  }, {})

  listings.forEach((listing) => {
    dates.forEach((date) => {
      const status = getStatusForListingDate(availabilityByListingDate, listing.id, date)
      counts[status] += 1
    })
  })

  return counts
}

function buildEventsForDate(date, availabilityByListingDate, listings = []) {
  return listings.map((listing) => {
    const status = getStatusForListingDate(
      availabilityByListingDate,
      listing.id,
      date,
    )

    return {
      listing,
      status,
      meta: statusMeta[status] ?? statusMeta.open,
    }
  })
}

function hotelsToListings(hotels) {
  return hotels.map((h) => ({
    id: h.id,
    property: { title: h.name ?? `Property ${h.id}`, location: h.city ?? '' },
    market: h.city ?? h.country ?? '',
  }))
}

export default function HostAvailabilityPage() {
  const { primaryHotelId, hotels, loading: hostLoading } = useHostContext()
  const [dates] = useState(buildDates)
  const [rows, setRows] = useState([])
  const [hotelRooms, setHotelRooms] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const today = useMemo(() => startOfDay(new Date()), [])
  const [availabilityAction, setAvailabilityAction] = useState(() => ({
    start: toDateKey(today),
    end: toDateKey(addDays(today, 2)),
    action: 'Block dates',
    minimumStay: '2',
    rateOverride: '',
  }))
  const [availabilityNotice, setAvailabilityNotice] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedListingId, setSelectedListingId] = useState('all')
  const [availabilityByListingDate, setAvailabilityByListingDate] = useState({})
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [hasLiveAvailability, setHasLiveAvailability] = useState(false)

  const listings = useMemo(() => hotelsToListings(hotels), [hotels])
  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth])
  const calendarDays = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth])
  const selectedListings = useMemo(() => {
    if (selectedListingId === 'all') return listings
    return listings.filter((listing) => String(listing.id) === String(selectedListingId))
  }, [selectedListingId, listings])
  const monthStartKey = toDateKey(monthDays[0])
  const monthEndKey = toDateKey(monthDays[monthDays.length - 1])
  const selectedMonthLabel = formatMonthLabel(currentMonth)
  const selectedScopeLabel =
    selectedListingId === 'all'
      ? 'All host properties'
      : getPropertyTitle(selectedListings[0] ?? listings[0])
  const monthlyCounts = useMemo(
    () => countStatuses(monthDays, availabilityByListingDate, selectedListings),
    [availabilityByListingDate, monthDays, selectedListings],
  )

  // Load 14-day room grid data
  useEffect(() => {
    if (hostLoading || !primaryHotelId) return

    const startDate = dates[0].iso
    const endDate = dates[dates.length - 1].iso

    Promise.all([
      getHostRooms(primaryHotelId).catch(() => []),
      getHotelAvailabilityRange(primaryHotelId, startDate, endDate).catch(() => []),
    ]).then(([roomsData, availData]) => {
      const rooms = Array.isArray(roomsData)
        ? roomsData
        : roomsData?.content ?? roomsData?.rooms ?? []
      const items = Array.isArray(availData)
        ? availData
        : availData?.availabilityList ?? availData?.content ?? []

      const byRoomDate = {}
      items.forEach((item) => {
        const rid = item.roomId
        if (!rid) return
        if (!byRoomDate[rid]) byRoomDate[rid] = {}
        const iso = String(item.availabilityDate)
        byRoomDate[rid][iso] = item
      })

      if (rooms.length) setHotelRooms(rooms)
      // Always show all rooms; mapStatus(undefined) returns 'open' for dates with no record
      const sourceRooms = rooms

      const newRows = sourceRooms.map((room) => ({
        roomId: room.id,
        label: roomLabel(room),
        sub: roomSub(room),
        pattern: dates.map((d) => mapStatus(byRoomDate[room.id]?.[d.iso])),
      }))

      if (newRows.length) setRows(newRows)
    }).finally(() => setDataLoading(false))
  }, [primaryHotelId, hostLoading, dates])

  // Load monthly calendar availability per listing
  useEffect(() => {
    if (!primaryHotelId) return

    let isCurrent = true

    async function loadAvailability() {
      setIsLoadingAvailability(true)

      const results = await Promise.allSettled(
        listings.map(async (listing) => {
          const data = await getHotelAvailabilityRange(
            listing.id,
            monthStartKey,
            monthEndKey,
          )
          return {
            listingId: listing.id,
            items: getAvailabilityItems(data),
          }
        }),
      )

      if (!isCurrent) return

      const nextAvailability = {}
      let foundLiveItems = false

      results.forEach((result) => {
        if (result.status !== 'fulfilled') return

        const { listingId, items } = result.value
        if (!items?.length) return

        foundLiveItems = true

        items.forEach((item) => {
          const dateKey = getAvailabilityDateKey(item)
          const itemListingId = String(item.hotelId ?? item.listingId ?? listingId)

          if (!dateKey) return
          if (!nextAvailability[itemListingId]) nextAvailability[itemListingId] = {}

          nextAvailability[itemListingId][dateKey] = mapStatus(item)
        })
      })

      setAvailabilityByListingDate(foundLiveItems ? nextAvailability : {})
      setHasLiveAvailability(foundLiveItems)
      setIsLoadingAvailability(false)
    }

    loadAvailability().catch(() => {
      if (isCurrent) {
        setAvailabilityByListingDate({})
        setHasLiveAvailability(false)
        setIsLoadingAvailability(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [monthEndKey, monthStartKey, primaryHotelId, listings])

  function handleMonthInputChange(event) {
    const [year, month] = event.target.value.split('-').map(Number)
    if (!year || !month) return

    setCurrentMonth(startOfMonth(new Date(year, month - 1, 1)))
  }

  function goToToday() {
    setCurrentMonth(startOfMonth(today))
  }

  function updateAvailabilityAction(field) {
    return (event) => {
      setAvailabilityAction((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  async function handleApplyAvailabilityAction() {
    const action = availabilityAction.action
    const isBlock = action === 'Block dates'
    const isOpen = action === 'Open dates'

    if (!isBlock && !isOpen) {
      // Set minimum stay and rate override don't have a direct availability API endpoint
      setAvailabilityNotice(`"${action}" saved locally. Minimum stay and rate override require a pricing rule — use Pricing rules to persist.`)
      return
    }

    if (!hotelRooms.length) {
      // Proactive banner handles this — no need to duplicate via notice
      return
    }

    setApplying(true)
    setAvailabilityNotice('')

    const start = new Date(availabilityAction.start)
    const end = new Date(availabilityAction.end)
    const dateList = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateList.push(toDateKey(new Date(d)))
    }

    try {
      const calls = hotelRooms.flatMap((room) =>
        dateList.map((date) =>
          isBlock
            ? blockRoomDate(room.id, date, 1, 'owner hold', primaryHotelId).catch(() => null)
            : unblockRoomDate(room.id, date, 1, primaryHotelId).catch(() => null),
        ),
      )
      await Promise.all(calls)
      const verb = isBlock ? 'Blocked' : 'Opened'
      setAvailabilityNotice(`${verb} ${dateList.length} date${dateList.length !== 1 ? 's' : ''} across ${hotelRooms.length} room${hotelRooms.length !== 1 ? 's' : ''}.`)
    } catch {
      setAvailabilityNotice('Some dates could not be updated. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const stats = [
    {
      label: 'Booked nights',
      value: String(monthlyCounts.occupied + monthlyCounts.arrival),
      note: `${selectedScopeLabel} in ${selectedMonthLabel}`,
    },
    {
      label: 'Free nights',
      value: String(monthlyCounts.open + monthlyCounts.premium),
      note: 'Bookable dates',
    },
    {
      label: 'Blocked',
      value: String(monthlyCounts.blocked),
      note: 'Not bookable',
    },
    {
      label: 'Turns',
      value: String(monthlyCounts.turn),
      note: 'Cleaning or changeover',
    },
  ]

  return (
    <HostShell
      eyebrow="Availability"
      title="Property booking calendar"
      mobileTitle="Calendar"
      description="Event-style host calendar showing booked, blocked, and free property days."
      actions={[
        { label: 'Inventory', href: '/host/inventory', secondary: true },
        { label: 'Pricing rules', href: '/host/pricing' },
      ]}
      stats={stats}
    >
      <SectionCard>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Calendar"
            title="Event calendar"
            description="Move to any month and scan each day for booked properties and free count."
          />

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => setCurrentMonth((month) => addMonths(month, -1))}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
              aria-label="Previous month"
              title="Previous month"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <input
              type="month"
              value={monthInputValue(currentMonth)}
              onChange={handleMonthInputChange}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
              aria-label="Choose month"
            />
            <button
              type="button"
              onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
              aria-label="Next month"
              title="Next month"
            >
              Next
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-dark px-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              title="Return to current month"
            >
              <RefreshCw size={15} />
              Today
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {Object.entries(statusMeta).map(([status, meta]) => (
            <div
              key={status}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-dark"
              title={meta.description}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
              {meta.label}
            </div>
          ))}
          <span className="text-xs leading-5 text-muted">
            {isLoadingAvailability
              ? 'Checking inventory...'
              : hasLiveAvailability
                ? 'Live inventory loaded where available.'
                : 'Sign in to load your live availability data.'}
          </span>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeading
          eyebrow="Bulk controls"
          title="Date range actions"
          description="Block or open dates across a selected range. Set minimum stay and rate override via Pricing rules."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <label>
            <span className="mb-2 block text-sm font-semibold text-dark">Start date</span>
            <input
              type="date"
              value={availabilityAction.start}
              onChange={updateAvailabilityAction('start')}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-dark">End date</span>
            <input
              type="date"
              value={availabilityAction.end}
              onChange={updateAvailabilityAction('end')}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-dark">Action</span>
            <select
              value={availabilityAction.action}
              onChange={updateAvailabilityAction('action')}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
            >
              <option>Block dates</option>
              <option>Open dates</option>
              <option>Set minimum stay</option>
              <option>Set rate override</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-semibold text-dark">Min nights</span>
              <input
                type="number"
                min="1"
                value={availabilityAction.minimumStay}
                onChange={updateAvailabilityAction('minimumStay')}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-dark">Rate</span>
              <input
                type="number"
                min="0"
                value={availabilityAction.rateOverride}
                onChange={updateAvailabilityAction('rateOverride')}
                placeholder="Optional"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleApplyAvailabilityAction}
            disabled={applying || !hotelRooms.length}
            className="h-12 self-end rounded-xl bg-dark px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {applying ? 'Applying…' : 'Apply'}
          </button>
        </div>

        {/* No-listing banner — host hasn't created a property yet */}
        {!hostLoading && !primaryHotelId && (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">
              You haven&apos;t created a listing yet. Create your first property to manage availability.
            </span>
            <Link
              to="/host/listings/new"
              className="shrink-0 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-900"
            >
              Create listing →
            </Link>
          </div>
        )}

        {/* No-rooms proactive banner — shown immediately on load, not just on Apply */}
        {!hostLoading && !dataLoading && primaryHotelId && hotelRooms.length === 0 && (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">
              This property has no rooms yet. Add at least one room to manage availability.
            </span>
            <Link
              to={`/host/listings/${primaryHotelId}/rooms`}
              className="shrink-0 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-900"
            >
              Add a room →
            </Link>
          </div>
        )}

        {/* Success / error notice from Apply action */}
        {availabilityNotice && hotelRooms.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {availabilityNotice}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {selectedListingId === 'all' ? 'All host properties' : 'Filtered property'}
            </p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-tight text-dark">
              {selectedMonthLabel}
            </h2>
          </div>
          <p className="text-sm leading-6 text-muted">
            {selectedScopeLabel}
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-3 xl:sticky xl:top-28 xl:self-start">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Properties
            </p>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setSelectedListingId('all')}
                className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                  selectedListingId === 'all'
                    ? 'border-dark bg-dark text-white'
                    : 'border-gray-200 bg-white text-dark hover:bg-gray-50'
                }`}
              >
                <span className="block text-sm font-semibold">All properties</span>
                <span className={`mt-1 block text-xs ${selectedListingId === 'all' ? 'text-white/70' : 'text-muted'}`}>
                  Show every property event
                </span>
              </button>

              {listings.map((listing) => {
                const isSelected = String(selectedListingId) === String(listing.id)
                const listingCounts = countStatuses(
                  monthDays,
                  availabilityByListingDate,
                  [listing],
                )
                const bookedCount = listingCounts.occupied + listingCounts.arrival

                return (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSelectedListingId(String(listing.id))}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    <span className="block truncate text-sm font-semibold">
                      {getPropertyTitle(listing)}
                    </span>
                    <span className={`mt-1 block truncate text-xs ${isSelected ? 'text-white/70' : 'text-muted'}`}>
                      {getPropertyLocation(listing)}
                    </span>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      isSelected ? 'bg-white/15 text-white' : 'bg-[#f8f6f2] text-muted'
                    }`}
                    >
                      {bookedCount} booked
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {weekdayLabels.map((day) => (
                <div
                  key={day}
                  className="border-b border-gray-200 bg-[#fcfbf8] px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((date) => {
                const dateKey = toDateKey(date)
                const isToday = dateKey === toDateKey(today)
                const isOutsideMonth = !isSameMonth(date, currentMonth)
                const dayEvents = buildEventsForDate(
                  date,
                  availabilityByListingDate,
                  selectedListings,
                )
                const visibleEvents = dayEvents.filter(({ status }) => status !== 'open')
                const freeCount = dayEvents.filter(({ status }) => status === 'open').length

                return (
                  <div
                    key={dateKey}
                    className={`min-h-[170px] border-b border-r border-gray-200 p-2 ${
                      isOutsideMonth ? 'bg-[#f8f6f2] text-muted' : 'bg-white text-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday ? 'bg-dark text-white' : ''
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {freeCount === selectedListings.length ? 'Free' : `${freeCount} free`}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {visibleEvents.length ? (
                        visibleEvents.map(({ listing, meta }) => (
                          <div
                            key={`${dateKey}-${listing.id}`}
                            className={`rounded-lg border px-2 py-1.5 ${meta.cellClass}`}
                            title={`${getPropertyTitle(listing)} on ${dateKey}: ${meta.description}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-[11px] font-semibold">
                                {getPropertyTitle(listing)}
                              </span>
                              <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.1em] opacity-80">
                                {meta.label}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[10px] opacity-75">
                              {getPropertyLocation(listing)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-[11px] font-semibold text-emerald-800">
                          {selectedListingId === 'all' ? 'No bookings' : 'Free'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[200px_repeat(14,minmax(0,1fr))] gap-2">
              <div />
              {dates.map((d) => (
                <div
                  key={d.iso}
                  className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  {d.label}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {dataLoading && (
                <div className="py-12 text-center text-sm text-muted">Loading calendar…</div>
              )}
              {!dataLoading && rows.length === 0 && (
                <div className="py-12 text-center text-sm text-muted">
                  No availability data for this period.
                </div>
              )}
              {rows.map((row) => (
                <div
                  key={row.roomId}
                  className="grid grid-cols-[200px_repeat(14,minmax(0,1fr))] gap-2"
                >
                  <div className="border-r border-gray-200 pr-4">
                    <p className="text-sm font-semibold text-dark">{row.label}</p>
                    {row.sub && <p className="mt-0.5 text-xs text-muted">{row.sub}</p>}
                  </div>
                  {row.pattern.map((status, idx) => (
                    <div
                      key={`${row.roomId}-${dates[idx].iso}`}
                      className={`flex min-h-[52px] items-center justify-center rounded-xl border text-[11px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status] ?? statusStyles.open}`}
                    >
                      {statusLabel(status)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-gray-200 bg-white" />
            <span className="text-xs text-muted">Open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-dark bg-dark" />
            <span className="text-xs text-muted">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-amber-200 bg-amber-50" />
            <span className="text-xs text-muted">Limited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-rose-200 bg-rose-50" />
            <span className="text-xs text-muted">Blocked</span>
          </div>
        </div>

        {rows.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Showing {rows.length} room{rows.length !== 1 ? 's' : ''} · {dates[0].label} – {dates[dates.length - 1].label}
          </p>
        )}
      </SectionCard>
    </HostShell>
  )
}
