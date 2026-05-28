import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { approveReview, escalateReview, getFlaggedReviews, getPendingReviews, rejectReview } from '../../services/adminApi'

function mapReviewToRow(r) {
  const actionLabel = r.status === 'APPROVED' || r.status === 'REJECTED' ? 'View' : 'Moderate'
  return [
    `RPT-${r.id}`,
    'Review',
    r.title || r.moderatorNotes || 'Reported content',
    r.userId ? `User #${r.userId}` : 'System',
    r.status || 'FLAGGED',
    'Medium',
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
        rawMap.current = Object.fromEntries(merged.map((r) => [`RPT-${r.id}`, r]))
        setRows(merged.map(mapReviewToRow))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

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
    />
  )
}
