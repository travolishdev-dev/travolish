import { useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Mail, Search, X } from 'lucide-react'
import {
  AdminCard,
  AdminSectionHeading,
  AdminShell,
  AdminStatusPill,
} from '../../components/admin/AdminPortalUI'
import { getEmailLogs, getEmailLogStats } from '../../services/adminApi'

const STATUS_TONE = { SENT: 'success', FAILED: 'danger', SKIPPED: 'warning' }
const TYPE_LABEL  = { PLAIN: 'Plain text', HTML: 'HTML', ATTACHMENT: 'Attachment', BATCH: 'Batch' }

function fmt(dt) {
  try { return format(parseISO(dt), 'dd MMM yyyy, HH:mm') } catch { return dt ?? '—' }
}

function truncate(str, n = 80) {
  if (!str) return '—'
  return str.length > n ? str.slice(0, n) + '…' : str
}

function StatPill({ label, value, tone }) {
  const tones = {
    brand:   'border-brand/20 bg-[#fff1f3] text-brand-dark',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    danger:  'border-rose-200 bg-rose-50 text-rose-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${tones[tone] ?? tones.brand}`}>
      <span className="text-2xl font-bold tabular-nums">{value ?? '—'}</span>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
    </div>
  )
}

function BodyDrawer({ log, onClose }) {
  if (!log) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="mr-4 min-w-0">
            <p className="truncate text-sm font-semibold text-dark">{log.subject || '(no subject)'}</p>
            <p className="mt-0.5 truncate text-xs text-muted">To: {log.recipient}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <AdminStatusPill tone={STATUS_TONE[log.status] ?? 'neutral'}>{log.status}</AdminStatusPill>
            <span className="rounded-full border border-gray-200 px-3 py-1 font-semibold text-muted">
              {TYPE_LABEL[log.emailType] ?? log.emailType}
            </span>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-muted">{fmt(log.sentAt)}</span>
          </div>
          {log.errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">
              <p className="font-semibold">Error</p>
              <p className="mt-1 whitespace-pre-wrap">{log.errorMessage}</p>
            </div>
          )}
          {log.body ? (
            log.emailType === 'HTML' ? (
              <iframe
                srcDoc={log.body}
                title="Email preview"
                className="h-[60vh] w-full rounded-xl border border-gray-200"
                sandbox=""
              />
            ) : (
              <pre className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-dark">
                {log.body}
              </pre>
            )
          ) : (
            <p className="text-sm text-muted">No body content recorded.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminEmailLogsPage() {
  const [logs, setLogs]         = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [page, setPage]         = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const PAGE_SIZE = 50

  function load(p = 0, recipient = search, status = statusFilter) {
    setLoading(true)
    const params = { page: p, size: PAGE_SIZE }
    if (status !== 'ALL') params.status = status
    if (recipient.trim()) params.recipient = recipient.trim()
    getEmailLogs(params)
      .then((data) => {
        setLogs(data?.content ?? [])
        setTotalPages(data?.totalPages ?? 0)
        setPage(data?.number ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(0)
    getEmailLogStats().then(setStats).catch(() => {})
  }, [])

  function applyFilter(status) {
    setStatusFilter(status)
    load(0, search, status)
  }

  function applySearch(e) {
    e.preventDefault()
    load(0, search, statusFilter)
  }

  const statuses = ['ALL', 'SENT', 'FAILED', 'SKIPPED']

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-dark">Email Activity Log</h1>
        <p className="mt-1 text-sm text-muted">Every outbound email the platform attempted to send.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 flex flex-wrap gap-3">
          <StatPill label="Total" value={stats.total?.toLocaleString()} tone="brand" />
          <StatPill label="Sent" value={stats.sent?.toLocaleString()} tone="success" />
          <StatPill label="Failed" value={stats.failed?.toLocaleString()} tone="danger" />
          <StatPill label="Skipped (no SMTP)" value={stats.skipped?.toLocaleString()} tone="warning" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={applySearch} className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient…"
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
          />
        </form>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => applyFilter(s)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-dark text-white'
                  : 'border border-gray-200 text-muted hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <AdminCard>
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Loading…</p>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Mail size={32} className="text-gray-300" />
            <p className="text-sm text-muted">No email logs found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Recipient', 'Subject', 'Type', 'Status', 'Sent at'].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelected(log)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4 font-medium text-dark">{truncate(log.recipient, 40)}</td>
                      <td className="py-3 pr-4 text-muted">{truncate(log.subject, 55)}</td>
                      <td className="py-3 pr-4 text-muted">{TYPE_LABEL[log.emailType] ?? log.emailType}</td>
                      <td className="py-3 pr-4">
                        <AdminStatusPill tone={STATUS_TONE[log.status] ?? 'neutral'}>
                          {log.status}
                        </AdminStatusPill>
                      </td>
                      <td className="py-3 text-muted">{fmt(log.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-xs text-muted">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => load(page - 1)}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-dark hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => load(page + 1)}
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-dark hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </AdminCard>

      <BodyDrawer log={selected} onClose={() => setSelected(null)} />
    </AdminShell>
  )
}
