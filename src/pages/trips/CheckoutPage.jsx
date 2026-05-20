import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  CreditCard,
  MapPin,
  ShieldCheck,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { addDays, format, differenceInCalendarDays, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { checkoutPreview } from '../../data/mockPortalData'
import { getHotel, listRooms } from '../../services/hotelsApi'
import { checkAvailability, calculatePrice, createBooking } from '../../services/bookingsApi'
import { adaptHotel } from '../../lib/hotelAdapter'
import useAuthStore from '../../stores/useAuthStore'

function buildPriceMap(rooms) {
  const map = {}
  rooms.forEach((r) => {
    if (r.hotelId == null) return
    if (map[r.hotelId] === undefined || r.pricePerNight < map[r.hotelId]) {
      map[r.hotelId] = r.pricePerNight
    }
  })
  return map
}

const DEFAULT_CHECK_IN = addDays(new Date(), 1)
const DEFAULT_CHECK_OUT = addDays(new Date(), 4)

export default function CheckoutPage() {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuthStore()

  const incomingBooking = location.state?.booking ?? null

  // ── Hotel / room state ──────────────────────────────────────────────────────
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [isLoadingHotel, setIsLoadingHotel] = useState(true)
  const [hotelError, setHotelError] = useState(false)

  // ── Date state ──────────────────────────────────────────────────────────────
  const [checkIn, setCheckIn] = useState(() =>
    incomingBooking?.checkIn ? parseISO(incomingBooking.checkIn) : DEFAULT_CHECK_IN,
  )
  const [checkOut, setCheckOut] = useState(() =>
    incomingBooking?.checkOut ? parseISO(incomingBooking.checkOut) : DEFAULT_CHECK_OUT,
  )

  // ── Price / availability state ──────────────────────────────────────────────
  const [priceBreakdown, setPriceBreakdown] = useState(null)
  const [isAvailable, setIsAvailable] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // ── Form state ──────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // ── Add-ons state ───────────────────────────────────────────────────────────
  const [selectedAddOns, setSelectedAddOns] = useState(['addon-transfer'])

  // ── Submit state ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  // ── Load hotel + rooms ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoadingHotel(true)
      try {
        const [hotelData, hotelRooms] = await Promise.all([
          getHotel(propertyId),
          listRooms(propertyId),
        ])
        if (cancelled) return
        setHotel(hotelData)
        setRooms(hotelRooms)
        if (hotelRooms.length > 0) {
          const targetRoomId = incomingBooking?.room?.id
          const match = targetRoomId ? hotelRooms.find((r) => r.id === targetRoomId) : null
          const cheapest = hotelRooms.reduce((min, r) =>
            r.pricePerNight < min.pricePerNight ? r : min,
          )
          setSelectedRoom(match ?? cheapest)
        }
      } catch {
        if (!cancelled) setHotelError(true)
      } finally {
        if (!cancelled) setIsLoadingHotel(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [propertyId])

  // ── Pre-fill form from booking widget state, falling back to auth ───────────
  useEffect(() => {
    if (incomingBooking?.guestDetails) {
      const { fullName, email: gEmail, phone: gPhone } = incomingBooking.guestDetails
      const parts = (fullName || '').trim().split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
      setEmail(gEmail || '')
      setPhone(gPhone || '')
      return
    }
    if (user?.email) setEmail(user.email)
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
    }
  }, [user, profile, incomingBooking])

  // ── Recalculate price + availability when room/dates change ─────────────────
  const recalculate = useCallback(async () => {
    if (!selectedRoom || !checkIn || !checkOut) return
    if (differenceInCalendarDays(checkOut, checkIn) < 1) return

    setIsCalculating(true)
    setPriceBreakdown(null)
    setIsAvailable(null)
    try {
      const [available, price] = await Promise.all([
        checkAvailability(selectedRoom.id, checkIn, checkOut),
        calculatePrice(selectedRoom.id, selectedRoom.pricePerNight, checkIn, checkOut),
      ])
      setIsAvailable(available)
      setPriceBreakdown(price)
    } catch {
      setIsAvailable(null)
      setPriceBreakdown(null)
    } finally {
      setIsCalculating(false)
    }
  }, [selectedRoom, checkIn, checkOut])

  useEffect(() => {
    recalculate()
  }, [recalculate])

  // ── Derived values ──────────────────────────────────────────────────────────
  const nights = differenceInCalendarDays(checkOut, checkIn)
  const addOnTotal = checkoutPreview.addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + Number(a.price.replace(/[^0-9]/g, '')), 0)

  const displayTotal = priceBreakdown
    ? Math.round(priceBreakdown.totalPrice) + addOnTotal
    : selectedRoom
      ? Math.round(selectedRoom.pricePerNight * nights) + addOnTotal
      : addOnTotal

  const dateLabel =
    checkIn && checkOut
      ? `${format(checkIn, 'MMM d')} – ${format(checkOut, 'MMM d, yyyy')}`
      : ''

  const canReserve =
    !isCalculating &&
    isAvailable !== false &&
    selectedRoom &&
    firstName.trim() &&
    email.trim() &&
    nights > 0

  // ── Submit booking ──────────────────────────────────────────────────────────
  async function handleReserve() {
    if (!canReserve || !hotel) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const booking = await createBooking({
        roomId: selectedRoom.id,
        hotelId: hotel.id,
        guestName: `${firstName} ${lastName}`.trim(),
        guestEmail: email,
        guestPhone: phone,
        checkIn,
        checkOut,
        basePrice: selectedRoom.pricePerNight,
        totalPrice: priceBreakdown ? priceBreakdown.totalPrice : selectedRoom.pricePerNight * nights,
      })
      setConfirmedBooking(booking)
    } catch {
      setSubmitError('Booking failed. Please check your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!isLoadingHotel && (hotelError || !hotel)) {
    return (
      <PortalShell
        eyebrow="Checkout"
        title="Property not found."
        description="We couldn't load this property. It may have been removed."
        actions={[{ label: 'Back to search', href: '/search' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            Try browsing available stays from the search page.
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  // ── Booking confirmed ───────────────────────────────────────────────────────
  if (confirmedBooking) {
    return (
      <PortalShell
        eyebrow="Booking confirmed"
        title="You're all set."
        description={`Booking #${confirmedBooking.id} has been created successfully.`}
        actions={[
          { label: 'View my trips', href: '/trips' },
          { label: 'Back to home', href: '/', secondary: true },
        ]}
      >
        <SectionCard>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark">Booking confirmed</h2>
              <p className="mt-1 text-sm text-muted">
                {hotel.name} · {dateLabel} · {nights} night{nights !== 1 ? 's' : ''}
              </p>
              <p className="mt-1 text-sm text-muted">
                Confirmation #{confirmedBooking.id} · Status:{' '}
                <span className="font-medium capitalize text-dark">
                  {confirmedBooking.status?.toLowerCase() ?? 'pending'}
                </span>
              </p>
            </div>
          </div>
        </SectionCard>
      </PortalShell>
    )
  }

  const propertyImage = hotel
    ? `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop`
    : null

  return (
    <PortalShell
      eyebrow="Checkout"
      title={isLoadingHotel ? 'Loading…' : 'Review and confirm your stay.'}
      mobileTitle="Checkout"
      mobileBottomAction={{ label: 'Confirm and reserve', onClick: handleReserve }}
      description={
        hotel
          ? `${hotel.name} · ${hotel.city ?? ''}${hotel.country ? `, ${hotel.country}` : ''}`
          : ''
      }
      actions={[
        { label: 'Back to property', href: `/property/${propertyId}`, secondary: true },
        { label: 'Need help?', href: '/messages' },
      ]}
      stats={[
        {
          label: 'Stay total',
          value: isLoadingHotel ? '—' : `$${displayTotal}`,
          note: `${nights > 0 ? nights : '—'} nights`,
        },
        {
          label: 'Guests',
          value: '2',
          note: dateLabel || 'Select dates',
        },
        {
          label: 'Reward ready',
          value: '$275',
          note: 'Can be applied later',
        },
      ]}
      accent="from-rose-50 via-white to-amber-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

        {/* ── Right column: property card + price summary ── */}
        <div className="order-first space-y-6 xl:order-last">
          <SectionCard>
            {isLoadingHotel ? (
              <div className="aspect-[4/3] w-full animate-pulse rounded-[24px] bg-gray-200" />
            ) : (
              <img
                src={propertyImage}
                alt={hotel?.name}
                className="aspect-[4/3] w-full rounded-[24px] object-cover"
              />
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">Live booking</StatusPill>
              <StatusPill tone="success">Flexible policy</StatusPill>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-dark">
              {isLoadingHotel ? (
                <span className="inline-block h-7 w-48 animate-pulse rounded bg-gray-200" />
              ) : (
                hotel?.name
              )}
            </h2>

            <div className="mt-4 space-y-3 text-sm text-muted">
              {hotel && (
                <p className="inline-flex items-center gap-2">
                  <MapPin size={15} />
                  {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
                </p>
              )}
              <p className="inline-flex items-center gap-2">
                <CalendarDays size={15} />
                {dateLabel || 'Select your dates below'}
              </p>
            </div>
          </SectionCard>

          {/* ── Price summary ── */}
          <SectionCard>
            <SectionHeading
              eyebrow="Price Summary"
              title="What you pay today"
              description="Pricing is calculated live from the booking engine."
            />

            <div className="mt-6 space-y-4 text-sm text-dark">
              {isCalculating ? (
                <div className="flex items-center gap-2 text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Calculating price…
                </div>
              ) : priceBreakdown ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      ${Math.round(priceBreakdown.basePrice)} × {priceBreakdown.numberOfNights} night{priceBreakdown.numberOfNights !== 1 ? 's' : ''}
                    </span>
                    <span>${Math.round(priceBreakdown.basePriceTotal)}</span>
                  </div>
                  {priceBreakdown.seasonalAdjustment !== 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span>Seasonal adjustment</span>
                      <span>{priceBreakdown.seasonalAdjustment > 0 ? '+' : ''}${Math.round(priceBreakdown.seasonalAdjustment)}</span>
                    </div>
                  )}
                  {priceBreakdown.dynamicPricingAdjustment !== 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span>Dynamic pricing</span>
                      <span>{priceBreakdown.dynamicPricingAdjustment > 0 ? '+' : ''}${Math.round(priceBreakdown.dynamicPricingAdjustment)}</span>
                    </div>
                  )}
                  {priceBreakdown.promotionalDiscount !== 0 && (
                    <div className="flex items-center justify-between gap-4 text-emerald-700">
                      <span>Promotional discount</span>
                      <span>−${Math.abs(Math.round(priceBreakdown.promotionalDiscount))}</span>
                    </div>
                  )}
                </>
              ) : selectedRoom ? (
                <div className="flex items-center justify-between gap-4">
                  <span>${Math.round(selectedRoom.pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>${Math.round(selectedRoom.pricePerNight * nights)}</span>
                </div>
              ) : null}

              {addOnTotal > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span>Selected add-ons</span>
                  <span>${addOnTotal}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>${displayTotal}</span>
              </div>
            </div>

            {/* Availability badge */}
            {!isCalculating && isAvailable !== null && (
              <div className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {isAvailable ? (
                  <><CheckCircle2 size={14} /> Available for your dates</>
                ) : (
                  <><AlertCircle size={14} /> Not available for selected dates</>
                )}
              </div>
            )}

            {submitError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                <AlertCircle size={14} />
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={handleReserve}
              disabled={!canReserve || isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : (
                <><CreditCard size={16} /> Confirm and reserve</>
              )}
            </button>

            <div className="mt-5 rounded-[24px] bg-[#fcfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Included protection
              </p>
              <div className="mt-3 space-y-3">
                {checkoutPreview.supportHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-50 p-1.5 text-emerald-700">
                      <ShieldCheck size={12} />
                    </div>
                    <p className="text-sm leading-6 text-dark">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Left column: dates, room, traveler form, add-ons ── */}
        <div className="space-y-6">

          {/* Dates */}
          <SectionCard>
            <SectionHeading
              eyebrow="Dates"
              title="When are you staying?"
            />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Check-in
                </span>
                <input
                  type="date"
                  value={format(checkIn, 'yyyy-MM-dd')}
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const d = parseISO(e.target.value)
                    setCheckIn(d)
                    if (d >= checkOut) setCheckOut(addDays(d, 1))
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Check-out
                </span>
                <input
                  type="date"
                  value={format(checkOut, 'yyyy-MM-dd')}
                  min={format(addDays(checkIn, 1), 'yyyy-MM-dd')}
                  onChange={(e) => setCheckOut(parseISO(e.target.value))}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-dark outline-none focus:border-dark"
                />
              </label>
            </div>
          </SectionCard>

          {/* Room selection */}
          {!isLoadingHotel && rooms.length > 0 && (
            <SectionCard>
              <SectionHeading
                eyebrow="Room"
                title="Select your room"
              />
              <div className="mt-6 grid gap-3">
                {rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id
                  return (
                    <button
                      key={room.id}
                      type="button"
                      disabled={!room.available}
                      onClick={() => setSelectedRoom(room)}
                      className={`rounded-[20px] border p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-dark bg-dark text-white'
                          : room.available
                            ? 'border-gray-200 bg-[#fcfcfb] hover:bg-white'
                            : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <BedDouble size={18} className={isSelected ? 'text-white' : 'text-gray-500'} />
                          <div>
                            <p className="text-sm font-semibold capitalize">
                              {room.type
                                ? room.type.charAt(0) + room.type.slice(1).toLowerCase()
                                : 'Room'}{' '}
                              #{room.number}
                            </p>
                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted'}`}>
                              {room.available ? 'Available' : 'Unavailable'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">
                          ${Math.round(room.pricePerNight)}
                          <span className={`font-normal text-xs ${isSelected ? 'text-white/70' : 'text-muted'}`}>/night</span>
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </SectionCard>
          )}

          {/* Traveler details */}
          <SectionCard>
            <SectionHeading
              eyebrow="Traveler"
              title="Primary traveler details"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">First name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Last name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-dark outline-none focus:border-dark"
                />
              </label>
            </div>
          </SectionCard>

          {/* Add-ons */}
          <SectionCard>
            <SectionHeading
              eyebrow="Extras"
              title="Add-ons worth considering"
              description="Optional services you can include with your stay."
            />
            <div className="mt-6 grid gap-4">
              {checkoutPreview.addOns.map((addOn) => {
                const isSelected = selectedAddOns.includes(addOn.id)
                return (
                  <button
                    key={addOn.id}
                    type="button"
                    onClick={() =>
                      setSelectedAddOns((curr) =>
                        isSelected
                          ? curr.filter((id) => id !== addOn.id)
                          : [...curr, addOn.id],
                      )
                    }
                    className={`rounded-[24px] border p-5 text-left transition-colors ${
                      isSelected
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-[#fcfcfb] text-dark hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{addOn.title}</p>
                        <p className={`mt-2 text-sm leading-6 ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                          {addOn.description}
                        </p>
                      </div>
                      <p className="text-lg font-semibold">{addOn.price}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      <Link
        to={`/property/${propertyId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-dark transition-colors hover:text-muted"
      >
        Back to property
      </Link>
    </PortalShell>
  )
}
