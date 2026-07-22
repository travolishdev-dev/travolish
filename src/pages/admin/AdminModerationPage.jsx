import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { FileWarning, RotateCcw, ShieldAlert, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { approveReview, assignModerator, dismissReview, escalateReview, getFlaggedReviews, getPendingReviews, redactReview, rejectReview } from '../../services/adminApi'


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
    if (!review) { setNotice(`Viewing ${row[0]} — status: ${row[4]}`); return }

    if (action === 'Moderate' || action === 'Review') {
      try {
        await approveReview(review.id)
        toast.success(`${row[0]} approved`)
        load()
      } catch {
        toast.error('Action failed')
      }
    } else if (action === 'Reject') {
      const reason = window.prompt(`Reason for rejecting ${row[0]}:`, 'Policy violation')
      if (reason === null) return
      try {
        await rejectReview(review.id, reason || 'Policy violation')
        toast.success(`${row[0]} rejected`)
        load()
      } catch {
        toast.error('Action failed')
      }
    } else if (action === 'Redact') {
      if (!window.confirm(`Redact content for ${row[0]}? This will permanently remove the reported text.`)) return
      try {
        await redactReview(review.id)
        toast.success(`${row[0]} redacted`)
        load()
      } catch {
        toast.error('Redaction failed')
      }
    } else if (action === 'Escalate') {
      try {
        await escalateReview(review.id)
        toast.success(`${row[0]} escalated`)
        load()
      } catch {
        toast.error('Escalation failed')
      }
    } else if (action === 'Dismiss') {
      try {
        await dismissReview(review.id)
        toast.success(`${row[0]} dismissed`)
        setNotice(`${row[0]} dismissed — no policy violation found.`)
        load()
      } catch {
        toast.error('Dismiss failed')
      }
    } else if (action === 'Assign') {
      const idStr = window.prompt(`Moderator admin ID to assign ${row[0]}:`)
      if (idStr === null || !idStr.trim()) return
      const moderatorId = parseInt(idStr.trim(), 10)
      if (isNaN(moderatorId)) { toast.error('Enter a valid numeric admin ID'); return }
      try {
        await assignModerator(review.id, moderatorId)
        toast.success(`Moderator #${moderatorId} assigned to ${row[0]}`)
        setNotice(`Moderator #${moderatorId} assigned to ${row[0]}.`)
      } catch {
        toast.error('Assignment failed')
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
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Quick actions</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await approveReview(report.id)
                        toast.success(`${record[0]} approved`)
                        setNotice(`${record[0]} approved — content cleared.`)
                        load()
                      } catch { toast.error('Action failed') }
                    }}
                    className="inline-flex h-9 items-center rounded-card bg-dark px-3 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = window.prompt(`Reason for rejecting ${record[0]}:`, 'Policy violation')
                      if (reason === null) return
                      try {
                        await rejectReview(report.id, reason || 'Policy violation')
                        toast.success(`${record[0]} rejected`)
                        load()
                      } catch { toast.error('Action failed') }
                    }}
                    className="inline-flex h-9 items-center rounded-card border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Redact content for ${record[0]}?`)) return
                      try {
                        await redactReview(report.id)
                        toast.success(`${record[0]} redacted`)
                        load()
                      } catch { toast.error('Redaction failed') }
                    }}
                    className="inline-flex h-9 items-center rounded-card border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                  >
                    Redact
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await escalateReview(report.id)
                        toast.success(`${record[0]} escalated for appeal review`)
                        setNotice(`${record[0]} escalated — legal or safety team notified.`)
                        load()
                      } catch { toast.error('Escalation failed') }
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-card border border-gray-200 bg-white px-3 text-xs font-semibold text-dark transition-colors hover:border-brand hover:text-brand"
                  >
                    <ShieldAlert size={13} />
                    Prepare appeal review
                  </button>
                </div>
              </div>
            )}
          </AdminCard>
        )
      }}
    />
  )
}
