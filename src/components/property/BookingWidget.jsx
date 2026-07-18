import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Mail,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import HomeDateRangePicker from '../home/HomeDateRangePicker'
import { useSearchContext } from '../../hooks/useSearchContext'
import {
  formatDateRange,
  formatGuestSummary,
} from '../../lib/searchFormatting'
import useCurrency from '../../hooks/useCurrency'
import { normalizePhoneForStorage } from '../../lib/phone'

function parseDateValue(dateValue) {
  if (!dateValue) return null
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getNightCount(checkIn, checkOut) {
  const start = parseDateValue(checkIn)
  const end = parseDateValue(checkOut)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))
}

function getCheapestRoom(rooms) {
  if (!rooms.length) return null
  return rooms.reduce((cheapest, room) => {
    if (!cheapest) return room
    return Number(room.pricePerNight) < Number(cheapest.pricePerNight)
      ? room
      : cheapest
  }, null)
}

function CounterRow({
  label,
  description,
  value,
  min,
  max,
  onChange,
}) {
  const { t } = useTranslation('booking')
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-dark">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={t('decreaseLabel', { label })}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-dark">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={t('increaseLabel', { label })}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, isStrong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={isStrong ? 'font-semibold text-dark' : 'text-muted'}>
        {label}
      </span>
      <span className={isStrong ? 'font-bold text-dark' : 'font-medium text-dark'}>
        {value}
      </span>
    </div>
  )
}

export default function BookingWidget({ property, rooms = [], sticky = true }) {
  const { t } = useTranslation(['booking', 'common', 'property'])
  const navigate = useNavigate()
  const { searchDraft, updateSearchDraft } = useSearchContext()
  const { formatCurrency } = useCurrency()
  const [checkIn, setCheckIn] = useState(searchDraft.checkIn || '')
  const [checkOut, setCheckOut] = useState(searchDraft.checkOut || '')
  const [adults, setAdults] = useState(searchDraft.adults || 2)
  const [children, setChildren] = useState(searchDraft.children || 0)
  const [activePanel, setActivePanel] = useState(null)
  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    note: '',
  })
  const [errors, setErrors] = useState({})
  const [reviewBooking, setReviewBooking] = useState(null)

  const cheapestRoom = useMemo(() => getCheapestRoom(rooms), [rooms])
  const maxGuests = Math.max(1, Number(property.guests) || 2)
  const nights = getNightCount(checkIn, checkOut)
  const chargeableNights = Math.max(nights, 1)
  const basePrice = Math.round(
    Number(cheapestRoom?.pricePerNight ?? property.price ?? 0) || 0,
  )
  const roomTotal = basePrice * chargeableNights
  const serviceFee = Math.round(roomTotal * 0.1)
  const taxes = Math.round(roomTotal * 0.08)
  const total = roomTotal + serviceFee + taxes
  const guestLabel = formatGuestSummary(adults, children)
  const dateLabel = formatDateRange(checkIn, checkOut)
  const roomLabel = cheapestRoom?.type
    ? `${cheapestRoom.type.charAt(0)}${cheapestRoom.type.slice(1).toLowerCase()} room`
    : t('bestRoom')

  const updateDates = (nextDates) => {
    setCheckIn(nextDates.checkIn)
    setCheckOut(nextDates.checkOut)
    updateSearchDraft({
      checkIn: nextDates.checkIn,
      checkOut: nextDates.checkOut,
    })
    setErrors((current) => ({ ...current, dates: '' }))
  }

  const updateGuests = (nextAdults, nextChildren) => {
    setAdults(nextAdults)
    setChildren(nextChildren)
    updateSearchDraft({ adults: nextAdults, children: nextChildren })
  }

  const updateGuestDetails = (field, value) => {
    setGuestDetails((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!checkIn || !checkOut || nights <= 0) {
      nextErrors.dates = t('invalidDates')
    }
    if (!guestDetails.fullName.trim()) {
      nextErrors.fullName = t('enterName')
    }
    if (!guestDetails.email.trim() || !guestDetails.email.includes('@')) {
      nextErrors.email = t('invalidEmail')
    }
    if (!guestDetails.phone.trim() || guestDetails.phone.trim().length < 8) {
      nextErrors.phone = t('invalidPhone')
    }
    if (!basePrice) {
      nextErrors.price = t('noPriceYet')
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setReviewBooking({
      propertyId: property.id,
      propertyTitle: property.title,
      location: `${property.location}${property.country ? `, ${property.country}` : ''}`,
      room: cheapestRoom
        ? {
          id: cheapestRoom.id,
          type: cheapestRoom.type,
          number: cheapestRoom.number,
        }
        : null,
      checkIn,
      checkOut,
      dateLabel,
      nights,
      adults,
      children,
      guestLabel,
      guestDetails: {
        fullName: guestDetails.fullName.trim(),
        email: guestDetails.email.trim(),
        phone: normalizePhoneForStorage(guestDetails.phone.trim(), '+91'),
        note: guestDetails.note.trim(),
      },
      pricing: {
        basePrice,
        roomTotal,
        serviceFee,
        taxes,
        total,
      },
    })
  }

  const handleContinueToPayment = () => {
    if (!reviewBooking) return
    navigate(`/checkout/${reviewBooking.propertyId}`, {
      state: { booking: reviewBooking },
    })
  }

  return (
    <div className={sticky ? 'sticky top-28' : ''}>
      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {t('directBooking')}
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              {basePrice ? (
                <>
                  <span className="text-2xl font-bold text-dark">
                    {formatCurrency(basePrice)}
                  </span>
                  <span className="text-sm text-muted">{t('property:perNight')}</span>
                </>
              ) : (
                <span className="text-xl font-bold text-dark">{t('common:priceOnRequest')}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{roomLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-semibold text-dark">
            <Star size={13} className="fill-dark text-dark" />
            {property.rating || t('common:ratingNew')}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePanel(activePanel === 'dates' ? null : 'dates')}
              className={`grid w-full grid-cols-2 overflow-hidden rounded-2xl border text-left transition-colors ${
                errors.dates ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="border-r border-gray-200 px-4 py-3">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t('checkIn')}
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-dark">
                  {checkIn ? formatDateRange(checkIn, '').split(' - ')[0] : t('selectDate')}
                </span>
              </span>
              <span className="px-4 py-3">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t('checkOut')}
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-dark">
                  {checkOut ? formatDateRange(checkOut, '').split(' - ')[0] : t('selectDate')}
                </span>
              </span>
            </button>

            {activePanel === 'dates' && (
              <HomeDateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={updateDates}
                onClose={() => setActivePanel(null)}
                panelClassName="absolute right-0 top-[calc(100%+10px)] z-[70] w-[min(720px,calc(100vw-2rem))] rounded-[24px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
              />
            )}
          </div>

          {errors.dates && (
            <p className="text-xs font-medium text-red-600">{errors.dates}</p>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setActivePanel(activePanel === 'guests' ? null : 'guests')}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-left transition-colors hover:border-gray-300"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-dark">
                  <Users size={18} />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {t('guestCount')}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-dark">
                    {guestLabel}
                  </span>
                </span>
              </span>
              {activePanel === 'guests' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {activePanel === 'guests' && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                <CounterRow
                  label={t('adults')}
                  description={t('agesAdults')}
                  value={adults}
                  min={1}
                  max={Math.max(1, maxGuests - children)}
                  onChange={(value) => updateGuests(
                    Math.min(Math.max(1, value), Math.max(1, maxGuests - children)),
                    children,
                  )}
                />
                <div className="border-t border-gray-100" />
                <CounterRow
                  label={t('children')}
                  description={t('agesChildren')}
                  value={children}
                  min={0}
                  max={Math.max(0, maxGuests - adults)}
                  onChange={(value) => updateGuests(
                    adults,
                    Math.min(Math.max(0, value), Math.max(0, maxGuests - adults)),
                  )}
                />
                <p className="border-t border-gray-100 py-3 text-xs text-muted">
                  {t('maximum')} {t('common:guest', { count: maxGuests })} {t('forThisProperty')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <UserRound size={17} className="text-dark" />
            <p className="text-sm font-semibold text-dark">{t('guestCount')}</p>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted">{t('primaryGuestName')}</span>
              <input
                type="text"
                value={guestDetails.fullName}
                onChange={(event) => updateGuestDetails('fullName', event.target.value)}
                className={`mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-base text-dark outline-none transition-colors focus:border-dark ${
                  errors.fullName ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder={t('fullName')}
              />
              {errors.fullName && (
                <span className="mt-1 block text-xs font-medium text-red-600">
                  {errors.fullName}
                </span>
              )}
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label className="block">
                <span className="text-xs font-semibold text-muted">{t('email')}</span>
                <span className="relative mt-1 block">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="email"
                    value={guestDetails.email}
                    onChange={(event) => updateGuestDetails('email', event.target.value)}
                    className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-base text-dark outline-none transition-colors focus:border-dark ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="name@example.com"
                  />
                </span>
                {errors.email && (
                  <span className="mt-1 block text-xs font-medium text-red-600">
                    {errors.email}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted">{t('mobileNumber')}</span>
                <span className="relative mt-1 block">
                  <Phone
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="tel"
                    value={guestDetails.phone}
                    onChange={(event) => updateGuestDetails('phone', event.target.value)}
                    className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-base text-dark outline-none transition-colors focus:border-dark ${
                      errors.phone ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </span>
                {errors.phone && (
                  <span className="mt-1 block text-xs font-medium text-red-600">
                    {errors.phone}
                  </span>
                )}
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-muted">{t('specialRequest')}</span>
              <textarea
                value={guestDetails.note}
                onChange={(event) => updateGuestDetails('note', event.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base text-dark outline-none transition-colors focus:border-dark"
                placeholder={t('optional')}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
          <SummaryRow
            label={`${formatCurrency(basePrice)} x ${t('common:night', { count: chargeableNights })}`}
            value={formatCurrency(roomTotal)}
          />
          <SummaryRow label={t('serviceFee')} value={formatCurrency(serviceFee)} />
          <SummaryRow label={t('taxes')} value={formatCurrency(taxes)} />
          <SummaryRow label={t('total')} value={formatCurrency(total)} isStrong />
        </div>

        {errors.price && (
          <p className="mt-3 text-xs font-medium text-red-600">{errors.price}</p>
        )}

        <button
          type="submit"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-brand/20 transition-opacity hover:opacity-90"
        >
          <CreditCard size={17} />
          {t('reviewBooking')}
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck size={14} />
          {t('finalPriceNote')}
        </div>
      </form>

      {reviewBooking && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4 py-6">
          <div
            className="max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
            style={{ maxHeight: 'calc(100dvh - 3rem)' }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={18} />
                  </span>
                  <h2 className="text-xl font-semibold text-dark">{t('reviewBooking')}</h2>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {t('reviewBookingDesc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-dark transition-colors hover:bg-gray-50"
                aria-label={t('closeReview')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-base font-semibold text-dark">
                  {reviewBooking.propertyTitle}
                </p>
                <p className="mt-1 text-sm text-muted">{reviewBooking.location}</p>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-dark">
                    <CalendarDays size={16} />
                    {t('dates')}
                  </div>
                  <p className="mt-2 text-sm text-muted">{reviewBooking.dateLabel}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t('common:night', { count: reviewBooking.nights })}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-dark">
                    <Users size={16} />
                    {t('guestCount')}
                  </div>
                  <p className="mt-2 text-sm text-muted">{reviewBooking.guestLabel}</p>
                  <p className="mt-1 text-xs text-muted">
                    {reviewBooking.guestDetails.fullName}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-dark">{t('contact')}</p>
                <p className="mt-2 text-sm text-muted">{reviewBooking.guestDetails.email}</p>
                <p className="mt-1 text-sm text-muted">{reviewBooking.guestDetails.phone}</p>
                {reviewBooking.guestDetails.note && (
                  <p className="mt-2 text-xs text-muted">
                    {t('note')} {reviewBooking.guestDetails.note}
                  </p>
                )}
              </section>

              <section className="space-y-3 rounded-2xl border border-gray-100 p-4">
                <SummaryRow
                  label={t('roomTotal')}
                  value={formatCurrency(reviewBooking.pricing.roomTotal)}
                />
                <SummaryRow
                  label={t('serviceFee')}
                  value={formatCurrency(reviewBooking.pricing.serviceFee)}
                />
                <SummaryRow
                  label={t('taxes')}
                  value={formatCurrency(reviewBooking.pricing.taxes)}
                />
                <div className="border-t border-gray-100 pt-3">
                  <SummaryRow
                    label={t('finalPrice')}
                    value={formatCurrency(reviewBooking.pricing.total)}
                    isStrong
                  />
                </div>
              </section>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
              >
                {t('editDetails')}
              </button>
              <button
                type="button"
                onClick={handleContinueToPayment}
                className="rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                {t('continueToPayment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
