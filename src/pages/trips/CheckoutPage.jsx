import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  Check,
  ChevronDown,
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
import { normalizePhoneForStorage, parsePhoneValue } from '../../lib/phone'
import { PhoneField } from '../../components/common/PhoneField'

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


// Currency options for the selector — sourced from the shared currencyConfig so rates stay in sync
const CURRENCY_OPTIONS = Object.values(currencyConfig).map((c) => ({ code: c.code, label: c.code }))

// Delegate to the shared formatter so PropertyDetailPage and CheckoutPage agree on prices.
// Stored prices are in INR; formatCurrencyAmount converts using rateFromInr.
function formatMoney(value, currencyCode) {
  return formatCurrencyAmount(value, currencyCode)
}

export default function CheckoutPage() {
  const { t } = useTranslation(['booking', 'common'])
  const supportHighlights = useMemo(() => [
    t('freeCancellationNote'),
    t('paymentSecure'),
    t('messageHost'),
  ], [t])
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
    incomingBooking?.checkIn ? parseISO(incomingBooking.checkIn) : addDays(new Date(), 1),
  )
  const [checkOut, setCheckOut] = useState(() =>
    incomingBooking?.checkOut ? parseISO(incomingBooking.checkOut) : addDays(new Date(), 4),
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
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const currencyRef = useRef(null)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const [promoNotice, setPromoNotice] = useState('')
  const [bookingMode, setBookingMode] = useState(() =>
    incomingBooking?.bookingMode || 'instant',
  )

  useEffect(() => {
    setCurrency(profileCurrency)
  }, [profileCurrency])

  useEffect(() => {
    const handleClick = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) setCurrencyOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
        if (!incomingBooking?.bookingMode) {
          setBookingMode(
            hotelData.bookingMode ||
            (hotelData.instantBook === false ? 'request' : 'instant'),
          )
        }
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
      setPhone(gPhone ? normalizePhoneForStorage(gPhone, '+91') : '')
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
  const buttonLabel = bookingMode === 'request' ? t('sendRequest') : t('confirmReserve')

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
        guestPhone: normalizePhoneForStorage(phone, parsePhoneValue(phone, '+91').countryCode),
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
      setSubmitError(t('bookingFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!isLoadingHotel && (hotelError || !hotel)) {
    return (
      <PortalShell
        eyebrow={t('checkout')}
        title={t('propertyNotFound')}
        description={t('propertyNotFoundDesc')}
        actions={[{ label: t('backToSearch'), href: '/search' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            {t('tryBrowsing')}
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  // ── Booking confirmed ───────────────────────────────────────────────────────
  if (confirmedBooking) {
    return (
      <PortalShell
        eyebrow={bookingMode === 'request' ? t('requestSent') : t('bookingConfirmed')}
        title={bookingMode === 'request' ? t('requestWithHost') : t('allSet')}
        description={t('bookingCreated', { id: confirmedBooking.id })}
        actions={[
          { label: t('viewMyTrips'), href: '/trips' },
          { label: t('backToHome'), href: '/', secondary: true },
        ]}
      >
        <SectionCard>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark">
                {bookingMode === 'request' ? t('requestSent') : t('bookingConfirmed')}
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

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop'
  const propertyImage = hotel
    ? (hotel.imageUrl || hotel.thumbnailUrl || hotel.images?.[0] || FALLBACK_IMAGE)
    : null

  return (
    <PortalShell
      eyebrow={t('checkout')}
      title={isLoadingHotel ? t('common:status.loading') : t('reviewAndConfirm')}
      mobileTitle={t('checkout')}
      mobileBottomAction={{ label: buttonLabel, onClick: handleReserve }}
      description={
        hotel
          ? `${hotel.name} · ${hotel.city ?? ''}${hotel.country ? `, ${hotel.country}` : ''}`
          : ''
      }
      actions={[
        { label: t('backToProperty'), href: `/property/${propertyId}`, secondary: true },
        { label: t('needHelp'), href: '/messages' },
      ]}
      stats={[
        {
          label: t('stayTotal'),
          value: isLoadingHotel ? '—' : formatMoney(displayTotal, currency),
          note: `${nights > 0 ? nights : '—'} nights`,
        },
        {
          label: t('guestCount'),
          value: String(guestCount),
          note: dateLabel || t('selectDates'),
        },
        {
          label: 'Booking type',
          value: bookingMode === 'request' ? t('requestToBook') : t('instantBook'),
          note: bookingMode === 'request' ? 'Awaiting host approval' : 'Confirmed immediately',
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
                {bookingMode === 'request' ? t('requestToBook') : t('instantBook')}
              </StatusPill>
              <StatusPill tone="success">{t('flexiblePolicy')}</StatusPill>
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
                {dateLabel || t('selectDatesBelow')}
              </p>
            </div>
          </SectionCard>

          {/* ── Price summary ── */}
          <SectionCard>
            <SectionHeading
              eyebrow={t('pricePreview')}
              title={t('whatYouPay')}
              description={t('pricingNote')}
              action={(
                <div ref={currencyRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-dark"
                  >
                    <Globe2 size={15} />
                    <span>{currency}</span>
                    <ChevronDown size={13} className="shrink-0 text-muted" />
                  </button>
                  {currencyOpen && (
                    <div className="absolute right-0 top-[calc(100%+4px)] z-[80] max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                      {CURRENCY_OPTIONS.map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => { setCurrency(option.code); setCurrencyOpen(false) }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${currency === option.code ? 'text-dark' : 'text-muted'}`}
                        >
                          {option.label}
                          {currency === option.code && <Check size={13} className="shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />

            <div className="mt-6 space-y-4 text-sm text-dark">
              {isCalculating ? (
                <div className="flex items-center gap-2 text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  {t('calculatingPrice')}
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
                      <span>{t('seasonalAdj')}</span>
                      <span>{priceBreakdown.seasonalAdjustment > 0 ? '+' : ''}{formatMoney(priceBreakdown.seasonalAdjustment, currency)}</span>
                    </div>
                  )}
                  {priceBreakdown.dynamicPricingAdjustment !== 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span>{t('dynamicPricing')}</span>
                      <span>{priceBreakdown.dynamicPricingAdjustment > 0 ? '+' : ''}{formatMoney(priceBreakdown.dynamicPricingAdjustment, currency)}</span>
                    </div>
                  )}
                  {priceBreakdown.promotionalDiscount !== 0 && (
                    <div className="flex items-center justify-between gap-4 text-emerald-700">
                      <span>{t('promoDiscount')}</span>
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
                  <span>{t('addOns')}</span>
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
                      placeholder={t('promoCode')}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-dark"
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const code = promoCode.trim().toUpperCase()
                      if (!code) {
                        setPromoNotice(t('enterPromo'))
                        return
                      }
                      setAppliedPromo(code)
                      setPromoNotice(t('promoApplied', { code }))
                    }}
                    className="rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    {t('apply')}
                  </button>
                </div>
                {promoNotice ? <p className="mt-2 text-xs font-medium text-muted">{promoNotice}</p> : null}
              </div>

              {promoDiscount > 0 && (
                <div className="flex items-center justify-between gap-4 text-emerald-700">
                  <span>{t('promoPreview')}</span>
                  <span>−{formatMoney(promoDiscount, currency)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold">
                <span>{t('total')}</span>
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
                  <><CheckCircle2 size={14} /> {t('availableForDates')}</>
                ) : (
                  <><AlertCircle size={14} /> {t('notAvailableDates')}</>
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
                <><Loader2 size={16} className="animate-spin" /> {t('common:status.processing')}</>
              ) : (
                <><CreditCard size={16} /> {buttonLabel}</>
              )}
            </button>

            <div className="mt-5 rounded-[24px] bg-[#fcfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {t('protection')}
              </p>
              <div className="mt-3 space-y-3">
                {supportHighlights.map((highlight) => (
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
              eyebrow={t('bookingFlow')}
              title={bookingMode === 'request' ? t('hostApprovalRequired') : t('instantConfirmation')}
              description={
                bookingMode === 'request'
                  ? 'Your request will be sent to the host for approval. You will be notified within 24 hours.'
                  : 'Your booking will be confirmed immediately upon submission.'
              }
            />
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow={t('dates')}
              title={t('whenStaying')}
            />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {t('checkIn')}
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
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {t('checkOut')}
                </span>
                <input
                  type="date"
                  value={format(checkOut, 'yyyy-MM-dd')}
                  min={format(addDays(checkIn, 1), 'yyyy-MM-dd')}
                  onChange={(e) => setCheckOut(parseISO(e.target.value))}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
                />
              </label>
            </div>
          </SectionCard>

          {/* Room selection */}
          {!isLoadingHotel && rooms.length > 0 && (
            <SectionCard>
              <SectionHeading
                eyebrow={t('room')}
                title={t('selectRoom')}
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
                                : t('room')}{' '}
                              #{room.number}
                            </p>
                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted'}`}>
                              {room.available ? t('available') : t('unavailable')}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">
                          {formatMoney(room.pricePerNight, currency)}
                          <span className={`font-normal text-xs ${isSelected ? 'text-white/70' : 'text-muted'}`}>{t('common:perNight')}</span>
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
              eyebrow={t('traveler')}
              title={t('primaryTraveler')}
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{t('guests')}</span>
                <span className="flex max-w-xs items-center justify-between rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                    <UsersRound size={16} />
                    {t('guestCount')}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={guestCount}
                    onChange={(event) => { const v = event.target.value.replace(/\D/g, ''); setGuestCount(v ? Math.min(16, Math.max(1, Number(v))) : 1) }}
                    className="w-16 bg-transparent text-right text-base font-semibold text-dark outline-none"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{t('firstName')}</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{t('lastName')}</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{t('email')}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
                />
              </label>
              <PhoneField
                label={t('phone')}
                value={phone}
                onChange={setPhone}
                placeholder="98765 43210"
              />
            </div>
          </SectionCard>

          {/* Add-ons */}
          <SectionCard>
            <SectionHeading
              eyebrow={t('extras')}
              title={t('addOnsTitle')}
              description={t('addOnsDesc')}
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
                      <p className="text-lg font-semibold">{formatMoney(addOn.price, currency)}</p>
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
        {t('backToProperty')}
      </Link>
    </PortalShell>
  )
}
