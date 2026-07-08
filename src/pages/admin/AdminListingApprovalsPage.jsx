import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { approveHotelRequest, getHotelRequests, rejectHotelRequest } from '../../services/adminApi'

function mapRequestToRow(r) {
  const actionLabel = r.status === 'PENDING' ? 'Review' : 'View'
  return [
    r.name || `Hotel ${r.hotelId}`,
    r.email || '—',
    r.requestType || '—',
    r.city || '—',
    r.rating ? `${r.rating}★` : '—',
    '—',
    r.status || 'PENDING',
    actionLabel,
  ]
}

function statusTone(status) {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'danger'
  return 'warning'
}

function RequestDetailPanel({ record, rawMap, onSave, setNotice }) {
  const request = record ? rawMap.current[record[0]] : null
  const [saving, setSaving] = useState(false)

  if (!request) {
    return (
      <AdminCard>
        <AdminSectionHeading
          eyebrow="Request detail"
          title="Select a request"
          description="Click any row to review the hotel submission and approve or reject it."
        />
      </AdminCard>
    )
  }

  const isPending = request.status === 'PENDING'
  const isCreate = request.requestType === 'CREATE'

  async function handleApprove() {
    setSaving(true)
    try {
      await approveHotelRequest(request.id)
      toast.success(`${request.name} approved — ${isCreate ? 'hotel created' : 'hotel updated'}`)
      setNotice(`Approved: ${request.name}.${isCreate ? ' New hotel record created.' : ''}`)
      onSave()
    } catch {
      toast.error('Approval failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleReject() {
    setSaving(true)
    try {
      await rejectHotelRequest(request.id, 'Admin decision')
      toast.success(`${request.name} rejected`)
      setNotice(`Rejected: ${request.name}.`)
      onSave()
    } catch {
      toast.error('Rejection failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminCard className="space-y-5">
      <AdminSectionHeading
        eyebrow={isCreate ? 'New registration' : 'Change request'}
        title={request.name || `Hotel ${request.hotelId}`}
        description={request.email || '—'}
      />

      {/* Type + Status */}
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusPill tone={isCreate ? 'brand' : 'neutral'}>
          {request.requestType}
        </AdminStatusPill>
        <AdminStatusPill tone={statusTone(request.status)}>
          {request.status}
        </AdminStatusPill>
      </div>

      {/* Details */}
      <div className="space-y-2 rounded-card border border-gray-200 bg-[#fcfbf8] p-4 text-sm">
        {request.city && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">City</span>
            <span className="font-semibold text-dark">{request.city}</span>
          </div>
        )}
        {request.rating != null && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Proposed rating</span>
            <span className="font-semibold text-dark">{request.rating}★</span>
          </div>
        )}
        {request.hotelId && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Hotel ID</span>
            <span className="font-semibold text-dark">#{request.hotelId}</span>
          </div>
        )}
        {request.requestedAt && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Submitted</span>
            <span className="font-semibold text-dark">
              {new Date(request.requestedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {request.description && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Description</p>
          <p className="mt-2 text-sm leading-6 text-dark line-clamp-4">{request.description}</p>
        </div>
      )}

      {/* Admin comment (for processed requests) */}
      {request.adminComment && (
        <div className="rounded-card border border-gray-200 bg-[#fcfbf8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Admin note</p>
          <p className="mt-1 text-sm text-dark">{request.adminComment}</p>
        </div>
      )}

      {/* Action buttons — only for PENDING */}
      {isPending && (
        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            disabled={saving}
            onClick={handleApprove}
            className="flex-1 inline-flex h-10 items-center justify-center rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCreate ? 'Approve & publish' : 'Approve update'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleReject}
            className="flex-1 inline-flex h-10 items-center justify-center rounded-card border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject
          </button>
        </div>
      )}

      {!isPending && (
        <p className="text-xs text-muted border-t border-gray-200 pt-4">
          Processed {request.processedAt
            ? new Date(request.processedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'}
        </p>
      )}
    </AdminCard>
  )
}

export default function AdminListingApprovalsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const rawMap = useRef({})

  const load = useCallback(() => {
    setLoading(true)
    getHotelRequests()
      .then((data) => {
        const requests = Array.isArray(data) ? data : (data?.content ?? [])
        rawMap.current = Object.fromEntries(
          requests.map((r) => [r.name || `Hotel ${r.hotelId}`, r]),
        )
        setRows(requests.map(mapRequestToRow))
      })
      .catch(() => toast.error('Failed to load listing requests'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback((_row, _action, setNotice) => {
    setNotice('Use the panel on the right to approve or reject this request.')
  }, [])

  const renderDetailPanel = useCallback(({ record, setNotice }) => (
    <RequestDetailPanel
      record={record}
      rawMap={rawMap}
      onSave={load}
      setNotice={setNotice}
    />
  ), [load])

  return (
    <AdminManagementPage
      pageKey="listingApprovals"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
      detailContent={renderDetailPanel}
    />
  )
}
