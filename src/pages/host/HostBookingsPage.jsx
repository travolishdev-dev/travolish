import { useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, Clock3, MessageCircleMore, XCircle } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'

const bookingRows = [
  {
    id: 'REQ-1042',
    guest: 'Aarav Mehta',
    property: 'Lagoon Suite',
    room: 'Sunset Pool Residence',
    checkIn: 'Jun 02',
    checkOut: 'Jun 06',
    nights: 4,
    amount: '$7,440',
    status: 'Request',
    sla: '18h left',
    note: 'Requests airport transfer and late dinner setup.',
  },
  {
    id: 'BK-8841',
    guest: 'Sofia Rossi',
    property: 'Lakefront Glass Suite',
    room: 'Dock level suite',
    checkIn: 'Today',
    checkOut: 'May 31',
    nights: 2,
    amount: '$1,680',
    status: 'Check-in today',
    sla: 'Arrives 4:10 PM',
    note: 'Welcome note sent. Housekeeping marked ready.',
  },
  {
    id: 'REQ-1038',
    guest: 'Nolan Park',
    property: 'Tokyo Design Loft',
    room: 'Shibuya Studio Loft',
    checkIn: 'Jun 09',
    checkOut: 'Jun 12',
    nights: 3,
    amount: '$780',
    status: 'Request',
    sla: '6h left',
    note: 'Asks if luggage drop is possible before check-in.',
  },
  {
    id: 'BK-8796',
    guest: 'Maya Chen',
    property: 'Paris Penthouse',
    room: 'City terrace room',
    checkIn: 'Jun 14',
    checkOut: 'Jun 18',
    nights: 4,
    amount: '$2,080',
    status: 'Confirmed',
    sla: 'Paid',
    note: 'No action needed.',
  },
]

const filters = ['All', 'Request', 'Confirmed', 'Check-in today']

function toneForStatus(status) {
  if (status === 'Request') return 'warning'
  if (status === 'Confirmed') return 'success'
  if (status === 'Check-in today') return 'brand'
  return 'slate'
}

export default function HostBookingsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [notice, setNotice] = useState('')

  const visibleRows = useMemo(() => {
    if (activeFilter === 'All') return bookingRows
    return bookingRows.filter((booking) => booking.status === activeFilter)
  }, [activeFilter])

  const requestCount = bookingRows.filter((booking) => booking.status === 'Request').length
  const todayCount = bookingRows.filter((booking) => booking.status === 'Check-in today').length

  function handleAction(action, booking) {
    setNotice(`${action} selected for ${booking.id}. UI placeholder only; backend approval flow is not changed.`)
  }

  return (
    <HostShell
      eyebrow="Bookings"
      title="Bookings and reservation requests"
      mobileTitle="Bookings"
      description="Review incoming requests, track arrivals, and keep check-in / check-out work visible."
      actions={[
        { label: 'Availability', href: '/host/availability', secondary: true },
        { label: 'Messages', href: '/messages' },
      ]}
      stats={[
        { label: 'Requests', value: String(requestCount), note: 'Need host decision' },
        { label: 'Today', value: String(todayCount), note: 'Check-in attention' },
        { label: 'Confirmed', value: String(bookingRows.filter((booking) => booking.status === 'Confirmed').length), note: 'Upcoming stays' },
        { label: 'Value', value: '$11,980', note: 'Visible queue total' },
      ]}
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeading
            eyebrow="Reservations"
            title="Request and arrival queue"
            description="UI-only MVP queue for approve, reject, message, check-in, and checkout actions."
          />

          <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0">
            <div className="flex w-max gap-2">
              {filters.map((filter) => (
                <HostPillButton
                  key={filter}
                  active={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </HostPillButton>
              ))}
            </div>
          </div>
        </div>

        {notice ? (
          <div className="mt-5 rounded-2xl border border-brand/20 bg-rose-50 px-4 py-3 text-sm font-semibold text-brand">
            {notice}
          </div>
        ) : null}

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {visibleRows.map((booking) => (
            <div key={booking.id} className="py-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={toneForStatus(booking.status)}>
                      {booking.status}
                    </StatusPill>
                    <StatusPill tone="sky">{booking.id}</StatusPill>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f6f2] px-3 py-1 text-xs font-semibold text-muted">
                      <Clock3 size={13} />
                      {booking.sla}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                    {booking.guest}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {booking.property} · {booking.room}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-dark">
                    <span className="inline-flex items-center gap-2">
                      <CalendarCheck size={15} />
                      {booking.checkIn} → {booking.checkOut}
                    </span>
                    <span>{booking.nights} nights</span>
                    <span className="font-semibold">{booking.amount}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-dark">{booking.note}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {booking.status === 'Request' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAction('Approve request', booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Reject request', booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAction('Update stay status', booking)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                      <CalendarCheck size={16} />
                      Update status
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAction('Message guest', booking)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                  >
                    <MessageCircleMore size={16} />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
