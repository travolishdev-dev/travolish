import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarRange,
  CreditCard,
  MapPinned,
  MessageCircleMore,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { findBooking } from '../../data/mockPortalData'

const statusTone = {
  upcoming: 'brand',
  completed: 'success',
  cancelled: 'warning',
}

export default function TripDetailPage() {
  const { id } = useParams()
  const booking = findBooking(id)

  if (!booking) {
    return (
      <PortalShell
        eyebrow="Trip"
        title="Booking not found."
        description="The detail screen is ready, but this mock booking id does not exist."
        actions={[{ label: 'Back to trips', href: '/trips' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            Use one of the mock booking ids from the trips page to preview the trip
            detail experience.
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  return (
    <PortalShell
      eyebrow="Trip Detail"
      title={booking.property.title}
      mobileTitle="Trip details"
      description="This page is meant to become the central guest booking view: itinerary, host context, payment state, and review or support actions all in one place."
      actions={[
        { label: 'Back to trips', href: '/trips', secondary: true },
        { label: 'Message host', href: '/messages' },
      ]}
      stats={[
        { label: 'Status', value: booking.status, note: booking.paymentStatus },
        { label: 'Guests', value: String(booking.guests), note: booking.dateLabel },
        { label: 'Total', value: booking.total, note: booking.confirmationCode },
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
            src={booking.property.image}
            alt={booking.property.title}
            className="aspect-[16/9] w-full rounded-[28px] object-cover"
          />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <StatusPill tone={statusTone[booking.status]}>{booking.status}</StatusPill>
            <StatusPill tone="sky">{booking.paymentStatus}</StatusPill>
            <p className="text-sm text-muted">
              Confirmation {booking.confirmationCode}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <CalendarRange size={16} />
                Dates
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">{booking.dateLabel}</p>
            </div>
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <Users size={16} />
                Travelers
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {booking.travelers.join(', ')}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-dark">
                <MapPinned size={16} />
                Destination
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {booking.property.location}, {booking.property.country}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <SectionHeading
              eyebrow="Itinerary"
              title="What is already lined up"
              description="These cards become especially useful once bookings, inventory, and host tools are connected."
            />

            <div className="mt-5 space-y-3">
              {booking.itinerary.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-4 py-3"
                >
                  <p className="text-sm leading-6 text-dark">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Timeline"
              title="Reservation progression"
              description="A visual structure already aligned with later booking status APIs."
            />

            <div className="mt-6 space-y-4">
              {booking.timeline.map((item, index) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-dark" />
                    {index < booking.timeline.length - 1 ? (
                      <div className="mt-2 h-full w-px bg-gray-200" />
                    ) : null}
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
            <SectionHeading
              eyebrow="Host"
              title={`Hosted by ${booking.property.host.name}`}
              description="This card can later bridge booking, messaging, and safety flows."
            />

            <div className="mt-6 flex items-center gap-4">
              <img
                src={booking.property.host.avatar}
                alt={booking.property.host.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <p className="text-lg font-semibold text-dark">
                  {booking.property.host.name}
                </p>
                <p className="text-sm text-muted">
                  {booking.property.host.superhost ? 'Superhost' : 'Host'}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-dark">{booking.hostNote}</p>

            <Link
              to="/messages"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
            >
              <MessageCircleMore size={16} />
              Open host conversation
            </Link>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Payment"
              title="Cost and protection"
              description="Simple, readable financial context is more useful here than a dense invoice table."
            />

            <div className="mt-6 rounded-[24px] bg-dark p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Reservation total
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{booking.total}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <CreditCard size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm text-white/80">{booking.paymentStatus}</p>
            </div>

            <div className="mt-4 hidden rounded-[24px] border border-dashed border-gray-200 bg-white p-5 md:block">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Cancellation, refund, safety, and emergency controls can later slot
                  into this same detail surface.
                </p>
              </div>
            </div>

            {booking.canReview ? (
              <Link
                to={`/reviews/new?bookingId=${booking.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
              >
                <Star size={16} />
                Leave a review
              </Link>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
