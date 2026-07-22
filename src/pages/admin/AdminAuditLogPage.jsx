import { useEffect, useRef, useState } from 'react'
import { AdminShell, AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { getAuditLogs } from '../../services/adminApi'

const ENTITY_TYPES = ['ALL', 'USER', 'HOTEL', 'KYC', 'REVIEW', 'BOOKING', 'CATALOG']
const PAGE_SIZE = 30

const TONE_MAP = {
  APPROVED: 'success',
  REJECTED: 'danger',
  CREATED: 'neutral',
  UPDATED: 'neutral',
  DELETED: 'danger',
  SUSPENDED: 'warning',
  RESTORED: 'success',
  ASSIGNED: 'neutral',
  REORDERED: 'neutral',
  NOTIFIED: 'neutral',
}

function toneForAction(action) {
  if (!action) return 'neutral'
  const upper = action.toUpperCase()
  for (const [key, tone] of Object.entries(TONE_MAP)) {
    if (upper.includes(key)) return tone
  }
  return 'neutral'
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [entityType, setEntityType] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const timerRef = useRef(null)

  function doFetch(et, q, pg) {
    setLoading(true)
    setError(false)
    getAuditLogs(et === 'ALL' ? null : et, null, { search: q, page: pg, size: PAGE_SIZE })
      .then((data) => {
        setLogs(data.content ?? (Array.isArray(data) ? data : []))
        setTotalPages(data.totalPages ?? 1)
        setTotalElements(data.totalElements ?? (Array.isArray(data) ? data.length : 0))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { doFetch('ALL', '', 0) }, [])

  function handleEntityType(t) {
    clearTimeout(timerRef.current)
    setEntityType(t)
    setPage(0)
    doFetch(t, search, 0)
  }

  function handleSearchChange(e) {
    const q = e.target.value
    setSearch(q)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setPage(0)
      doFetch(entityType, q, 0)
    }, 350)
  }

  function goToPage(newPage) {
    setPage(newPage)
    doFetch(entityType, search, newPage)
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-dark">Audit log</h1>
        <p className="mt-1 text-sm text-muted">Platform-wide record of admin actions across all entities.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {ENTITY_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleEntityType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              entityType === t
                ? 'bg-dark text-white'
                : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search action, actor, details…"
          className="ml-auto rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs outline-none focus:border-dark"
        />
      </div>

      <AdminCard>
        <AdminSectionHeading
          eyebrow="Audit entries"
          title={`${totalElements} entr${totalElements !== 1 ? 'ies' : 'y'}`}
          description="All admin actions recorded on this platform."
        />

        {loading ? (
          <div className="mt-6 space-y-3 animate-pulse">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-card bg-gray-100" />)}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-card border border-rose-200 bg-rose-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-rose-700">Failed to load audit log</p>
            <button type="button" onClick={() => doFetch(entityType, search, page)} className="mt-3 text-xs font-semibold text-rose-600 underline">Retry</button>
          </div>
        ) : logs.length === 0 ? (
          <p className="mt-6 rounded-card border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-muted">
            No audit entries match the current filter.
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    {['Time', 'Entity', 'Action', 'Actor', 'Details'].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-4 text-xs text-muted tabular-nums whitespace-nowrap">
                        {fmt(entry.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs font-semibold text-muted uppercase">{entry.entityType}</span>
                          {entry.entityId != null && (
                            <span className="font-mono text-xs text-muted">#{entry.entityId}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <AdminStatusPill tone={toneForAction(entry.action)}>
                          {entry.action || '—'}
                        </AdminStatusPill>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-dark">{entry.actorName || '—'}</p>
                        {entry.actorId != null && (
                          <p className="text-xs text-muted">ID {entry.actorId}</p>
                        )}
                      </td>
                      <td className="py-3 text-sm text-muted max-w-xs truncate">
                        {entry.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-200 pt-4 text-xs font-semibold text-muted">
                <span>Page {page + 1} of {totalPages} · {totalElements} entries</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => goToPage(page - 1)}
                    className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 transition-colors hover:border-dark disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => goToPage(page + 1)}
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
