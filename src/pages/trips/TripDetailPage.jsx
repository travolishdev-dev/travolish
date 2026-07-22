import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarRange,
  CreditCard,
  Download,
  KeyRound,
  Loader2,
  MapPinned,
  MessageSquareText,
  ShieldCheck,
  Star,
  Timer,
  XCircle,
} from 'lucide-react'
import { differenceInCalendarDays, differenceInHours, format, parseISO, startOfToday } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { cancelBooking, getBooking } from '../../services/bookingsApi'
import { getHotel } from '../../services/hotelsApi'
import useCurrency from '../../hooks/useCurrency'
import { printReceipt } from '../../lib/receiptPrinter'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop',
]

const API_STATUS_MAP = {
  PENDING: 'upcoming',
  CONFIRMED: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const STATUS_TONE = {
  upcoming: 'brand',
  completed: 'success',
  cancelled: 'warning',
}

function placeholderImage(hotelId) {
  return PLACEHOLDER_IMAGES[(Number(hotelId) || 0) % PLACEHOLDER_IMAGES.length]
}

function fmt(dateStr) {
  try { return format(parseISO(dateStr), 'MMM d, yyyy') } catch { return dateStr }
}

function buildCountdown(dateStr, t) {
  try {
    const checkIn = parseISO(dateStr)
    const days = differenceInCalendarDays(checkIn, startOfToday())
    const hours = differenceInHours(checkIn, new Date())

    if (days > 1) return t('detail.daysToCheckIn', { count: days })
    if (days === 1) return t('detail.checkInTomorrow')
    if (hours > 0) return t('detail.hoursToCheckIn', { count: hours })
    return t('detail.checkInOpen')
  } catch {
    return t('detail.countdownUnavailable')
  }
}

function buildRefundEstimate(booking) {
  // Prefer an explicit refund amount from the backend
  if (booking.refundAmount != null) return Number(booking.refundAmount)
  const total = Number(booking.totalPrice ?? 0)
  if (!total) return 0
  const daysUntilCheckIn = booking.checkInDate
    ? Math.ceil((new Date(booking.checkInDate) - Date.now()) / 86_400_000)
    : 0
  if (daysUntilCheckIn > 7) return total          // full refund
  if (daysUntilCheckIn > 2) return Math.round(total * 0.5)  // 50%
  return 0                                          // non-refundable
}

export default function TripDetailPage() {
  const { t } = useTranslation(['trips', 'common'])
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const { formatCurrency } = useCurrency()

  const handleDownloadReceipt = () => printReceipt(booking, hotel, formatCurrency)

  useEffect(() => {
    async function load() {
      try {
        const b = await getBooking(id)
        const h = await getHotel(b.hotelId).catch(() => ({ id: b.hotelId }))
        setBooking(b)
        setHotel(h)
      } catch {
        setError(t('detail.notFound'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <PortalShell eyebrow={t('detail.tripLabel')} title={t('common:status.loading')} actions={[{ label: t('browseStays'), href: '/trips', secondary: true }]}>
        <SectionCard>
          <div className="py-16 text-center text-sm text-muted">{t('common:status.loading')}</div>
        </SectionCard>
      </PortalShell>
    )
  }

  if (error || !booking) {
    return (
      <PortalShell eyebrow={t('detail.tripLabel')} title={t('detail.notFound')} actions={[{ label: t('browseStays'), href: '/trips' }]}>
        <SectionCard>
          <p className="text-sm text-muted">{error || t('detail.notFoundDesc')}</p>
        </SectionCard>
      </PortalShell>
    )
  }

  const handleCancel = async () => {
    setCancelling(true)
    setCancelError(null)
    try {
      const updated = await cancelBooking(booking)
      setBooking(updated)
      setConfirmCancel(false)
    } catch {
      setCancelError(t('detail.cancelError'))
    } finally {
      setCancelling(false)
    }
  }

  const status = API_STATUS_MAP[booking.status] ?? 'upcoming'
  const hotelName = hotel?.name || `Hotel #${booking.hotelId}`
  const image = hotel?.imageUrl || hotel?.thumbnailUrl || hotel?.images?.[0] || placeholderImage(booking.hotelId)
  const paymentStatus =
    booking.status === 'PENDING' ? t('detail.paymentPending')
    : booking.status === 'CONFIRMED' ? t('detail.paymentConfirmed')
    : booking.status
  const canReview = status === 'completed'
  const countdownLabel = buildCountdown(booking.checkInDate, t)
  const refundEstimate = buildRefundEstimate(booking)

  return (
    <PortalShell
      eyebrow={t('detail.eyebrow')}
      title={hotelName}
      mobileTitle={t('detail.mobiletitle')}
      description={t('detail.desc')}
      actions={[
        { label: t('browseStays'), href: '/trips', secondary: true },
        {
          label: t('detail.downloadReceipt'),
          onClick: handleDownloadReceipt,
        },
      ]}
      stats={[
        { label: t('labels.status'), value: booking.status, note: paymentStatus },
        { label: t('detail.total'), value: formatCurrency(Number(booking.totalPrice ?? 0)), note: t('detail.bookingNumber', { id: booking.id }) },
        { label: t('labels.checkIn'), value: fmt(booking.checkInDate), note: countdownLabel },
      ]}
      accent="from-sky-50 via-white to-amber-50"
    >
      <Link
        to="/trips"
        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-dark transition-colors hover:text-muted"
      >
        <ArrowLeft size={16} />
        {t('browseStays')}
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SectionCard>
          <img
            src={image}
            alt={hotelName}
            className="aspect-[16/9] w-full rounded-[28px] object-cover"
          />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <StatusPill tone={STATUS_TONE[status]}>{status}</StatusPill>
            <StatusPill tone="sky">{paymentStatus}</StatusPill>
            <StatusPill tone="brand">{countdownLabel}</StatusPill>
            <p className="text-sm text-muted">{t('detail.bookingNumber', { id: booking.id })}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <CalendarRange size={16} />
                {t('detail.dates')}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {fmt(booking.checkInDate)} → {fmt(booking.checkOutDate)}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <CreditCard size={16} />
                {t('detail.guest')}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {booking.guestName}
                {booking.guestEmail ? <><br />{booking.guestEmail}</> : null}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <MapPinned size={16} />
                {t('detail.destination')}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {[hotel?.city, hotel?.country].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
            <div className="flex items-center gap-3">
              <Timer size={20} className="text-dark" />
              <h2 className="text-lg font-semibold text-dark">{t('detail.checkInInstructions')}</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: t('detail.arrivalWindow'),
                  detail: [
                    hotel?.checkInTime ? `Check-in from ${hotel.checkInTime}` : null,
                    hotel?.checkOutTime ? `Check-out by ${hotel.checkOutTime}` : null,
                  ].filter(Boolean).join(' · ') || t('detail.arrivalWindowDetail'),
                  icon: CalendarRange,
                },
                {
                  title: t('detail.accessNotes'),
                  detail: hotel?.houseRules || t('detail.accessNotesDetail'),
                  icon: KeyRound,
                },
                {
                  title: t('detail.hostMessage'),
                  detail: hotel?.receptionHours
                    ? `Reception: ${hotel.receptionHours}`
                    : hotel?.twentyFourHourFrontDesk
                      ? '24-hour front desk available'
                      : t('detail.hostMessageDetail'),
                  icon: MessageSquareText,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <Icon size={18} className="text-brand" />
                    <p className="mt-3 text-sm font-semibold text-dark">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow={t('detail.timelineEyebrow')}
              title={t('detail.timeline')}
            />
            <div className="mt-6 space-y-4">
              {[
                { label: t('detail.timelineItems.created'), value: `#${booking.id}` },
                { label: t('detail.timelineItems.checkIn'), value: fmt(booking.checkInDate) },
                { label: t('detail.timelineItems.checkOut'), value: fmt(booking.checkOutDate) },
                { label: t('labels.status'), value: booking.status },
              ].map((item, index, arr) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-dark" />
                    {index < arr.length - 1 && (
                      <div className="mt-2 h-full w-px bg-gray-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-dark">{item.label}</p>
                    <p className="text-sm text-muted">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow={t('detail.paymentEyebrow')} title={t('detail.payment')} />

            <div className="mt-6 rounded-[24px] bg-dark p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    {t('detail.reservationTotal')}
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    {formatCurrency(Number(booking.totalPrice ?? 0))}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <CreditCard size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm text-white/80">{paymentStatus}</p>
            </div>

            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
            >
              <Download size={15} />
              {t('detail.downloadReceipt')}
            </button>

            {booking.basePrice && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>{t('detail.basePrice')}</span>
                  <span className="font-medium text-dark">{formatCurrency(Number(booking.basePrice))}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-dark">
                  <span>{t('detail.total')}</span>
                  <span>{formatCurrency(Number(booking.totalPrice ?? 0))}</span>
                </div>
              </div>
            )}

            {/* Cancel / review actions */}
            {status === 'upcoming' && !confirmCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
              >
                <XCircle size={15} />
                {t('detail.cancelBooking')}
              </button>
            )}

            {status === 'upcoming' && confirmCancel && (
              <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">{t('detail.cancelConfirm')}</p>
                <p className="text-sm text-red-600">
                  {t('detail.estimatedRefund')} {formatCurrency(refundEstimate)}. {t('detail.refundNote')}
                </p>
                {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {cancelling ? <><Loader2 size={13} className="animate-spin" /> {t('detail.cancelling')}</> : t('detail.yesCancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmCancel(false); setCancelError(null) }}
                    disabled={cancelling}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {t('detail.keepBooking')}
                  </button>
                </div>
              </div>
            )}

            {status === 'cancelled' && (
              <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-dashed border-gray-200 bg-white p-4">
                <div className="rounded-2xl bg-gray-100 p-3 text-gray-500">
                  <XCircle size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">{t('detail.cancelled')}</p>
              </div>
            )}

            {status === 'completed' && (
              <div className="mt-4 hidden rounded-[24px] border border-dashed border-gray-200 bg-white p-5 md:block">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-sm leading-6 text-muted">{t('detail.completed')}</p>
                </div>
              </div>
            )}

            {canReview && (
              <Link
                to={`/reviews/new?hotelId=${booking.hotelId}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
              >
                <Star size={16} />
                {t('detail.leaveReview')}
              </Link>
            )}
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
