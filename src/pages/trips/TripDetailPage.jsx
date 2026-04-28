import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarRange,
  CreditCard,
  MapPinned,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { getBooking } from '../../services/bookingsApi'
import { getHotel } from '../../services/hotelsApi'

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

export default function TripDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const b = await getBooking(id)
        const h = await getHotel(b.hotelId).catch(() => ({ id: b.hotelId }))
        setBooking(b)
        setHotel(h)
      } catch {
        setError('Booking not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <PortalShell eyebrow="Trip" title="Loading…" actions={[{ label: 'Back to trips', href: '/trips', secondary: true }]}>
        <SectionCard>
          <div className="py-16 text-center text-sm text-muted">Fetching booking…</div>
        </SectionCard>
      </PortalShell>
    )
  }

  if (error || !booking) {
    return (
      <PortalShell eyebrow="Trip" title="Booking not found." actions={[{ label: 'Back to trips', href: '/trips' }]}>
        <SectionCard>
          <p className="text-sm text-muted">{error || 'This booking does not exist.'}</p>
        </SectionCard>
      </PortalShell>
    )
  }

  const status = API_STATUS_MAP[booking.status] ?? 'upcoming'
  const hotelName = hotel?.name || `Hotel #${booking.hotelId}`
  const image = placeholderImage(booking.hotelId)
  const paymentStatus =
    booking.status === 'PENDING' ? 'Payment pending'
    : booking.status === 'CONFIRMED' ? 'Payment confirmed'
    : booking.status
  const canReview = status === 'completed'

  return (
    <PortalShell
      eyebrow="Trip Detail"
      title={hotelName}
      mobileTitle="Trip details"
      description="Your booking details — dates, payment, and property info all in one place."
      actions={[
        { label: 'Back to trips', href: '/trips', secondary: true },
      ]}
      stats={[
        { label: 'Status', value: booking.status, note: paymentStatus },
        { label: 'Total', value: `$${Number(booking.totalPrice ?? 0).toFixed(2)}`, note: `Booking #${booking.id}` },
        { label: 'Dates', value: fmt(booking.checkInDate), note: `→ ${fmt(booking.checkOutDate)}` },
      ]}
      accent="from-sky-50 via-white to-amber-50"
    >
      <Link
        to="/trips"
        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-dark transition-colors hover:text-muted"
      >
        <ArrowLeft size={16} />
        Back to trips
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
            <p className="text-sm text-muted">Booking #{booking.id}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <CalendarRange size={16} />
                Dates
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {fmt(booking.checkInDate)} → {fmt(booking.checkOutDate)}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <CreditCard size={16} />
                Guest
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {booking.guestName}
                {booking.guestEmail ? <><br />{booking.guestEmail}</> : null}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <MapPinned size={16} />
                Destination
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {[hotel?.city, hotel?.country].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Timeline"
              title="Reservation progression"
            />
            <div className="mt-6 space-y-4">
              {[
                { label: 'Booking created', value: `#${booking.id}` },
                { label: 'Check-in', value: fmt(booking.checkInDate) },
                { label: 'Check-out', value: fmt(booking.checkOutDate) },
                { label: 'Status', value: booking.status },
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
            <SectionHeading eyebrow="Payment" title="Cost and protection" />

            <div className="mt-6 rounded-[24px] bg-dark p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Reservation total
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    ${Number(booking.totalPrice ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <CreditCard size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm text-white/80">{paymentStatus}</p>
            </div>

            {booking.basePrice && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Base price / night</span>
                  <span className="font-medium text-dark">${Number(booking.basePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-dark">
                  <span>Total</span>
                  <span>${Number(booking.totalPrice ?? 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 hidden rounded-[24px] border border-dashed border-gray-200 bg-white p-5 md:block">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Cancellation, refund, and support options can extend from this surface once those APIs are available.
                </p>
              </div>
            </div>

            {canReview && (
              <Link
                to={`/reviews/new?hotelId=${booking.hotelId}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
              >
                <Star size={16} />
                Leave a review
              </Link>
            )}
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
