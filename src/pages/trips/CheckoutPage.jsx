import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  CreditCard,
  MapPin,
  ShieldCheck,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe2,
  TicketPercent,
  UsersRound,
} from 'lucide-react'
import { addDays, format, differenceInCalendarDays, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { getHotel, listRooms, getHotelAddOns } from '../../services/hotelsApi'
import { checkAvailability, calculatePrice, createBooking } from '../../services/bookingsApi'
import useAuthStore from '../../stores/useAuthStore'
import useCurrency from '../../hooks/useCurrency'
import { formatCurrencyAmount, currencyConfig } from '../../lib/currency'

const CHECKOUT_ADDONS = [
  {
    id: 'addon-transfer',
    title: 'Private arrival transfer',
    description: 'Door-to-door pickup from the airport to the hotel in a private vehicle.',
    price: 3500,  // INR
  },
  {
    id: 'addon-checkout',
    title: 'Late check-out until 2 pm',
    description: 'Extend your stay and leave at your leisure without rushing in the morning.',
    price: 2500,  // INR
  },
  {
    id: 'addon-pantry',
    title: 'Pre-stocked pantry',
    description: 'Arrive to a curated selection of snacks, breakfast items, and beverages.',
    price: 5000,  // INR
  },
]

const SUPPORT_HIGHLIGHTS = [
  'Free cancellation up to 48 hours before check-in.',
  'Your payment details are encrypted and never stored.',
  'Message your host directly through the Travolish app.',
]

// Currency options for the selector — sourced from the shared currencyConfig so rates stay in sync
const CURRENCY_OPTIONS = Object.values(currencyConfig).map((c) => ({ code: c.code, label: c.code }))

// Delegate to the shared formatter so PropertyDetailPage and CheckoutPage agree on prices.
// Stored prices are in INR; formatCurrencyAmount converts using rateFromInr.
function formatMoney(value, currencyCode) {
  return formatCurrencyAmount(value, currencyCode)
}

const DEFAULT_CHECK_IN = addDays(new Date(), 1)
const DEFAULT_CHECK_OUT = addDays(new Date(), 4)

export default function CheckoutPage() {
  const { propertyId } = useParams()
  const location = useLocation()
  const { user, profile, backendUserId } = useAuthStore()
  const { currency: profileCurrency } = useCurrency()

  const incomingBooking = location.state?.booking ?? null
  const incomingRoomId = incomingBooking?.room?.id

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
  const [guestCount, setGuestCount] = useState(() =>
    Math.max(1, Number(incomingBooking?.adults || 0) + Number(incomingBooking?.children || 0) || 2),
  )
  const [currency, setCurrency] = useState(profileCurrency)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const [promoNotice, setPromoNotice] = useState('')
  const [bookingMode] = useState(() =>
    incomingBooking?.bookingMode || (Number(propertyId) % 2 === 0 ? 'request' : 'instant'),
  )

  useEffect(() => {
    setCurrency(profileCurrency)
  }, [profileCurrency])

  // ── Add-ons state ───────────────────────────────────────────────────────────
  const [addOns, setAddOns] = useState(CHECKOUT_ADDONS)
  const [selectedAddOns, setSelectedAddOns] = useState([])

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
        const [hotelData, hotelRooms, fetchedAddOns] = await Promise.all([
          getHotel(propertyId),
          listRooms(propertyId),
          getHotelAddOns(propertyId).catch(() => []),
        ])
        if (cancelled) return
        setHotel(hotelData)
        setRooms(hotelRooms)
        if (Array.isArray(fetchedAddOns) && fetchedAddOns.length > 0) {
          setAddOns(fetchedAddOns)
        }
        if (hotelRooms.length > 0) {
          const targetRoomId = incomingRoomId
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
  }, [propertyId, incomingRoomId])

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
  const addOnTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)

  const grossTotal = priceBreakdown
    ? Math.round(priceBreakdown.totalPrice) + addOnTotal
    : selectedRoom
      ? Math.round(selectedRoom.pricePerNight * nights) + addOnTotal
      : addOnTotal
  const promoDiscount = appliedPromo ? Math.min(75, Math.round(grossTotal * 0.08)) : 0
  const displayTotal = Math.max(0, grossTotal - promoDiscount)
  const buttonLabel = bookingMode === 'request' ? 'Send booking request' : 'Confirm and reserve'

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
        userId: backendUserId ?? null,
        guestName: `${firstName} ${lastName}`.trim(),
        guestEmail: email,
        guestPhone: phone,
        checkIn,
        checkOut,
        basePrice: selectedRoom.pricePerNight,
        // Include pricing breakdown fields so the backend stores the full picture
        seasonalAdjustment: priceBreakdown?.seasonalAdjustment ?? 0,
        dynamicPricingAdjustment: priceBreakdown?.dynamicPricingAdjustment ?? 0,
        // Promo code discount: stored as positive value, applied as reduction
        promotionalDiscount: priceBreakdown?.promotionalDiscount
          ? Math.abs(priceBreakdown.promotionalDiscount)
          : 0,
        // totalPrice already reflects any applied promo discount
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
        eyebrow={bookingMode === 'request' ? 'Booking request sent' : 'Booking confirmed'}
        title={bookingMode === 'request' ? 'Your request is with the host.' : "You're all set."}
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
              <h2 className="text-lg font-semibold text-dark">
                {bookingMode === 'request' ? 'Request sent' : 'Booking confirmed'}
              </h2>
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
      mobileBottomAction={{ label: buttonLabel, onClick: handleReserve }}
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
          value: isLoadingHotel ? '—' : formatMoney(displayTotal, currency),
          note: `${nights > 0 ? nights : '—'} nights`,
        },
        {
          label: 'Guests',
          value: String(guestCount),
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
              <StatusPill tone="brand">
                {bookingMode === 'request' ? 'Request to book' : 'Instant booking'}
              </StatusPill>
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
              action={(
                <label className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-dark">
                  <Globe2 size={15} />
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="bg-transparent outline-none"
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </label>
              )}
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
                      {formatMoney(priceBreakdown.basePrice, currency)} × {priceBreakdown.numberOfNights} night{priceBreakdown.numberOfNights !== 1 ? 's' : ''}
                    </span>
                    <span>{formatMoney(priceBreakdown.basePriceTotal, currency)}</span>
                  </div>
                  {priceBreakdown.seasonalAdjustment !== 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span>Seasonal adjustment</span>
                      <span>{priceBreakdown.seasonalAdjustment > 0 ? '+' : ''}{formatMoney(priceBreakdown.seasonalAdjustment, currency)}</span>
                    </div>
                  )}
                  {priceBreakdown.dynamicPricingAdjustment !== 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span>Dynamic pricing</span>
                      <span>{priceBreakdown.dynamicPricingAdjustment > 0 ? '+' : ''}{formatMoney(priceBreakdown.dynamicPricingAdjustment, currency)}</span>
                    </div>
                  )}
                  {priceBreakdown.promotionalDiscount !== 0 && (
                    <div className="flex items-center justify-between gap-4 text-emerald-700">
                      <span>Promotional discount</span>
                      <span>−{formatMoney(Math.abs(priceBreakdown.promotionalDiscount), currency)}</span>
                    </div>
                  )}
                </>
              ) : selectedRoom ? (
                <div className="flex items-center justify-between gap-4">
                  <span>{formatMoney(selectedRoom.pricePerNight, currency)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>{formatMoney(selectedRoom.pricePerNight * nights, currency)}</span>
                </div>
              ) : null}

              {addOnTotal > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span>Selected add-ons</span>
                  <span>{formatMoney(addOnTotal, currency)}</span>
                </div>
              )}

              <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <span className="relative flex-1">
                    <TicketPercent
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      value={promoCode}
                      onChange={(event) => {
                        setPromoCode(event.target.value)
                        setPromoNotice('')
                      }}
                      placeholder="Promo code"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-dark"
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const code = promoCode.trim().toUpperCase()
                      if (!code) {
                        setPromoNotice('Enter a promo code to preview a discount.')
                        return
                      }
                      setAppliedPromo(code)
                      setPromoNotice(`${code} preview applied. Final validation stays with checkout pricing.`)
                    }}
                    className="rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
                {promoNotice ? <p className="mt-2 text-xs font-medium text-muted">{promoNotice}</p> : null}
              </div>

              {promoDiscount > 0 && (
                <div className="flex items-center justify-between gap-4 text-emerald-700">
                  <span>Promo preview</span>
                  <span>−{formatMoney(promoDiscount, currency)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(displayTotal, currency)}</span>
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
                <><CreditCard size={16} /> {buttonLabel}</>
              )}
            </button>

            <div className="mt-5 rounded-[24px] bg-[#fcfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Included protection
              </p>
              <div className="mt-3 space-y-3">
                {SUPPORT_HIGHLIGHTS.map((highlight) => (
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
              eyebrow="Booking Flow"
              title={bookingMode === 'request' ? 'Host approval required' : 'Instant confirmation available'}
              description={
                bookingMode === 'request'
                  ? 'This stay is shown as request-to-book in the traveller flow. The host should approve or decline within 24 hours once backend workflow is connected.'
                  : 'This stay is shown as instant-bookable. Confirmation can be completed immediately when payment succeeds.'
              }
            />
          </SectionCard>

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
                          {formatMoney(room.pricePerNight, currency)}
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
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Guests</span>
                <span className="flex max-w-xs items-center justify-between rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                    <UsersRound size={16} />
                    Guest count
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={guestCount}
                    onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))}
                    className="w-16 bg-transparent text-right text-sm font-semibold text-dark outline-none"
                  />
                </span>
              </label>
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
              {addOns.map((addOn) => {
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
                      <p className="text-lg font-semibold">${addOn.price}</p>
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
