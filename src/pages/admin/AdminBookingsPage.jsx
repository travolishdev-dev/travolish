import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  AdminShell,
  AdminCard,
  AdminSectionHeading,
  AdminStatusPill,
} from '../../components/admin/AdminPortalUI'
import { get } from '../../lib/api'

const STATUS_TONE = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
}

function fmt(d) {
  try { return format(parseISO(d), 'dd MMM yyyy') } catch { return d ?? '—' }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    get('/api/bookings')
      .then((data) => setBookings(Array.isArray(data) ? data : data?.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      b.guestName?.toLowerCase().includes(q) ||
      b.guestEmail?.toLowerCase().includes(q) ||
      String(b.id).includes(q) ||
      String(b.hotelId).includes(q)
    return matchesStatus && matchesSearch
  })

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-dark">Bookings</h1>
        <p className="mt-1 text-sm text-muted">All platform bookings — search, filter, and review guest stays.</p>
      </div>

      {/* Summary pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s ? 'bg-dark text-white' : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
            }`}
          >
            {s === 'ALL' ? `All (${bookings.length})` : `${s} (${counts[s] ?? 0})`}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, ID…"
          className="ml-auto rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs outline-none focus:border-dark"
        />
      </div>

      <AdminCard>
        <AdminSectionHeading
          eyebrow="Bookings"
          title={`${filtered.length} booking${filtered.length !== 1 ? 's' : ''}`}
          description="Showing all platform reservations. Click status to filter."
        />

        {loading ? (
          <p className="mt-6 text-sm text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No bookings match the current filter.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  {['ID', 'Guest', 'Hotel ID', 'Check-in', 'Check-out', 'Total', 'Status'].map((h) => (
                    <th key={h} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted last:pr-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="py-3 pr-4 font-mono text-xs text-muted">#{b.id}</td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-dark">{b.guestName ?? '—'}</p>
                      <p className="text-xs text-muted">{b.guestEmail ?? ''}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted">{b.hotelId ?? '—'}</td>
                    <td className="py-3 pr-4">{fmt(b.checkInDate)}</td>
                    <td className="py-3 pr-4">{fmt(b.checkOutDate)}</td>
                    <td className="py-3 pr-4">
                      ₹{Number(b.totalPrice ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <AdminStatusPill tone={STATUS_TONE[b.status] ?? 'slate'}>
                        {b.status}
                      </AdminStatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminShell>
  )
}
