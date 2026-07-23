import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import {
  AdminShell,
  AdminCard,
  AdminSectionHeading,
  AdminStatusPill,
} from '../../components/admin/AdminPortalUI'
import { confirmAdminBooking, getAdminBookings } from '../../services/adminApi'
import { post } from '../../lib/api'

const PAGE_SIZE = 20

const STATUS_TONE = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
}

function fmt(d) {
  try { return format(parseISO(d), 'dd MMM yyyy') } catch { return d ?? '—' }
}

function fmtTotal(b) {
  const amount = Number(b.totalPrice ?? 0).toLocaleString()
  const currency = b.currency ?? ''
  return currency ? `${currency} ${amount}` : amount
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Debounce search input by 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 0 when filters change
  useEffect(() => { setPage(0) }, [debouncedSearch, statusFilter])

  // Fetch whenever page, filters, or a manual refresh changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getAdminBookings({ page, size: PAGE_SIZE, search: debouncedSearch, status: statusFilter })
      .then((data) => {
        if (cancelled) return
        setBookings(Array.isArray(data?.content) ? data.content : [])
        setTotalElements(data?.totalElements ?? 0)
        setTotalPages(data?.totalPages ?? 1)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, debouncedSearch, statusFilter, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  async function handleCancel(b) {
    if (!window.confirm(`Cancel booking #${b.id} for ${b.guestName ?? 'this guest'}?`)) return
    setActionLoading(b.id)
    try {
      await post(`/api/bookings/${b.id}/cancel`)
      toast.success(`Booking #${b.id} cancelled`)
      refresh()
    } catch {
      toast.error('Cancellation failed')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleConfirm(b) {
    setActionLoading(b.id)
    try {
      await confirmAdminBooking(b.id)
      toast.success(`Booking #${b.id} confirmed`)
      refresh()
    } catch {
      toast.error('Confirmation failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-dark">Bookings</h1>
        <p className="mt-1 text-sm text-muted">All platform bookings — search, filter, and review guest stays.</p>
      </div>

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
            {s === 'ALL' ? `All (${totalElements})` : s}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email…"
          className="ml-auto rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs outline-none focus:border-dark"
        />
      </div>

      <AdminCard>
        <AdminSectionHeading
          eyebrow="Bookings"
          title={`${totalElements} booking${totalElements !== 1 ? 's' : ''}`}
          description="Platform reservations with cancel and confirm actions."
        />

        {loading ? (
          <div className="mt-6 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-card bg-gray-100" />)}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-card border border-rose-200 bg-rose-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-rose-700">Failed to load bookings</p>
            <button type="button" onClick={refresh} className="mt-3 text-xs font-semibold text-rose-600 underline">Retry</button>
          </div>
        ) : bookings.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No bookings match the current filter.</p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    {['ID', 'Guest', 'Hotel', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-4 font-mono text-xs text-muted">#{b.id}</td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-dark">{b.guestName ?? '—'}</p>
                        <p className="text-xs text-muted">{b.guestEmail ?? ''}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-dark">{b.hotelName ?? (b.hotelId ? `Hotel #${b.hotelId}` : '—')}</p>
                        {b.hotelName && b.hotelId && <p className="text-xs text-muted">ID {b.hotelId}</p>}
                      </td>
                      <td className="py-3 pr-4">{fmt(b.checkInDate)}</td>
                      <td className="py-3 pr-4">{fmt(b.checkOutDate)}</td>
                      <td className="py-3 pr-4 tabular-nums">{fmtTotal(b)}</td>
                      <td className="py-3 pr-4">
                        <AdminStatusPill tone={STATUS_TONE[b.status] ?? 'neutral'}>
                          {b.status}
                        </AdminStatusPill>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {b.status === 'PENDING' && (
                            <button
                              type="button"
                              disabled={actionLoading === b.id}
                              onClick={() => handleConfirm(b)}
                              className="inline-flex h-7 items-center rounded-card border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
                            >
                              {actionLoading === b.id ? '…' : 'Confirm'}
                            </button>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(b.status) && (
                            <button
                              type="button"
                              disabled={actionLoading === b.id}
                              onClick={() => handleCancel(b)}
                              className="inline-flex h-7 items-center rounded-card border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-40"
                            >
                              {actionLoading === b.id ? '…' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-200 pt-4 text-xs font-semibold text-muted">
                <span>Page {page + 1} of {totalPages} · {totalElements} records</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 transition-colors hover:border-dark disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 transition-colors hover:border-dark disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </AdminShell>
  )
}
