import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { FileWarning, RotateCcw, ShieldAlert, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { approveReview, escalateReview, getFlaggedReviews, getPendingReviews, rejectReview } from '../../services/adminApi'


function mapReviewToRow(r) {
  const actionLabel = r.status === 'APPROVED' || r.status === 'REJECTED' ? 'View' : 'Moderate'
  return [
    String(r.id).startsWith('RPT-') ? r.id : `RPT-${r.id}`,
    r.contentType || 'Review',
    r.title || r.moderatorNotes || 'Reported content',
    r.reporter || (r.userId ? `User #${r.userId}` : 'System'),
    r.status || 'FLAGGED',
    r.severity || 'Medium',
    actionLabel,
  ]
}

export default function AdminModerationPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const rawMap = useRef({})

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      getFlaggedReviews().catch(() => ({ content: [] })),
      getPendingReviews().catch(() => ({ content: [] })),
    ])
      .then(([flagged, pending]) => {
        const flaggedList = flagged?.content ?? (Array.isArray(flagged) ? flagged : [])
        const pendingList = pending?.content ?? (Array.isArray(pending) ? pending : [])
        const seen = new Set()
        const merged = [...flaggedList, ...pendingList].filter((r) => {
          if (seen.has(r.id)) return false
          seen.add(r.id)
          return true
        })
        const source = merged
        rawMap.current = Object.fromEntries(
          source.map((r) => [String(r.id).startsWith('RPT-') ? r.id : `RPT-${r.id}`, r]),
        )
        setRows(source.map(mapReviewToRow))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const review = rawMap.current[row[0]]
    if (!review) return

    if (action === 'Moderate') {
      try {
        await approveReview(review.id)
        toast.success(`${row[0]} approved`)
        load()
      } catch {
        toast.error('Action failed')
      }
    } else if (action === 'Reject') {
      try {
        await rejectReview(review.id, 'Policy violation')
        toast.success(`${row[0]} rejected`)
        load()
      } catch {
        toast.error('Action failed')
      }
    } else if (action === 'Escalate') {
      try {
        await escalateReview(review.id)
        toast.success(`${row[0]} escalated`)
        load()
      } catch {
        toast.error('Escalation failed')
      }
    } else {
      setNotice(`Viewing ${row[0]} — status: ${row[4]}`)
    }
  }, [load])

  return (
    <AdminManagementPage
      pageKey="moderation"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
      detailContent={({ record, setNotice }) => {
        const report = record ? rawMap.current[record[0]] : null
        return (
          <AdminCard className="space-y-6">
            <AdminSectionHeading
              eyebrow="Moderation detail"
              title="Content report and appeals"
              description="Review listing, user, and review reports in one queue, with appeal readiness."
            />

            {report ? (
              <div className="rounded-card border border-brand/20 bg-[#fff1f3] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                      {record[0]}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-dark">{record[2]}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {report.source || record[3]} · {record[1]} · {record[5]} severity
                    </p>
                  </div>
                  <AdminStatusPill tone={record[4] === 'ESCALATED' ? 'danger' : 'warning'}>
                    {record[4]}
                  </AdminStatusPill>
                </div>
              </div>
            ) : (
              <p className="rounded-card border border-gray-200 bg-white p-4 text-sm text-muted">
                Select a report to inspect moderation context.
              </p>
            )}

            <div className="grid gap-3">
              {[
                ['Listing report workflow', 'Photos, description accuracy, amenity claims, and location disputes can be reviewed.', FileWarning],
                ['User report workflow', 'Risk or safety reports can be escalated without mixing them into review-only moderation.', UserX],
                ['Appeal path', 'Rejected hosts and users can submit an appeal with new evidence for re-review.', RotateCcw],
              ].map(([title, body, Icon]) => (
                <div key={title} className="rounded-card border border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-card bg-[#fff1f3] text-brand">
                      {createElement(Icon, { size: 17 })}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-dark">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {report && (
              <button
                type="button"
                onClick={() => setNotice(`Appeal window opened for ${record[0]} — status: ${record[4]}. Notify reporter and host when resolved.`)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-dark px-4 text-sm font-semibold text-white"
              >
                <ShieldAlert size={16} />
                Prepare appeal review
              </button>
            )}
          </AdminCard>
        )
      }}
    />
  )
}
