import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { approveHotel, getHotelsPendingReview, rejectHotel, requestHotelFiles } from '../../services/adminApi'

function mapHotelToRow(hotel) {
  return [
    hotel.name || `Hotel ${hotel.id}`,
    hotel.hostId ? `Host #${hotel.hostId}` : '—',
    hotel.category || '—',
    [hotel.city, hotel.country].filter(Boolean).join(', ') || '—',
    hotel.weekdayPrice ? `${hotel.currency ?? ''} ${hotel.weekdayPrice}`.trim() : '—',
    hotel.totalRooms != null ? String(hotel.totalRooms) : '—',
    hotel.status || 'PENDING_REVIEW',
    'Review',
  ]
}

function statusTone(status) {
  if (status === 'LIVE') return 'success'
  if (status === 'DRAFT') return 'danger'
  return 'warning'
}

function HotelDetailPanel({ record, rawMap, onSave, setNotice }) {
  const hotel = record ? rawMap.current[record[0]] : null
  const [saving, setSaving] = useState(false)

  if (!hotel) {
    return (
      <AdminCard>
        <AdminSectionHeading
          eyebrow="Listing detail"
          title="Select a listing"
          description="Click any row to review the hotel submission and approve or return it to the host."
        />
      </AdminCard>
    )
  }

  const isPending = hotel.status === 'PENDING_REVIEW'

  async function handleApprove() {
    setSaving(true)
    try {
      await approveHotel(hotel.id)
      toast.success(`${hotel.name} approved — now live`)
      setNotice(`Approved: ${hotel.name}. Status set to LIVE.`)
      onSave()
    } catch {
      toast.error('Approval failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleReject() {
    const reason = window.prompt(
      `Reason for returning "${hotel.name}" to the host:`,
      'Please complete all required fields and resubmit.',
    )
    if (reason === null) return
    if (!window.confirm(`Return "${hotel.name}" to the host as DRAFT? They will need to revise and resubmit.`)) return
    setSaving(true)
    try {
      await rejectHotel(hotel.id, reason || 'Please complete all required fields and resubmit.')
      toast.success(`${hotel.name} returned to host as DRAFT`)
      setNotice(`Returned: ${hotel.name}. Reason: "${reason || 'Please complete all required fields.'}"`)
      onSave()
    } catch {
      toast.error('Action failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminCard className="space-y-5">
      <AdminSectionHeading
        eyebrow="New listing"
        title={hotel.name || `Hotel ${hotel.id}`}
        description={hotel.email || (hotel.hostId ? `Host ID: ${hotel.hostId}` : '—')}
      />

      {/* Category + Status */}
      <div className="flex flex-wrap items-center gap-2">
        {hotel.category && (
          <AdminStatusPill tone="neutral">{hotel.category}</AdminStatusPill>
        )}
        <AdminStatusPill tone={statusTone(hotel.status)}>
          {hotel.status === 'PENDING_REVIEW' ? 'Pending review' : hotel.status}
        </AdminStatusPill>
      </div>

      {/* Details */}
      <div className="space-y-2 rounded-card border border-gray-200 bg-[#fcfbf8] p-4 text-sm">
        {(hotel.city || hotel.country) && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Location</span>
            <span className="font-semibold text-dark">
              {[hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {hotel.starRating != null && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Star rating</span>
            <span className="font-semibold text-dark">{'★'.repeat(hotel.starRating)}</span>
          </div>
        )}
        {hotel.weekdayPrice != null && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Base price</span>
            <span className="font-semibold text-dark">{hotel.currency ?? ''} {hotel.weekdayPrice}/night</span>
          </div>
        )}
        {hotel.totalRooms != null && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Total rooms</span>
            <span className="font-semibold text-dark">{hotel.totalRooms}</span>
          </div>
        )}
        {hotel.stayType && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Stay type</span>
            <span className="font-semibold text-dark">{hotel.stayType}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-muted">Hotel ID</span>
          <span className="font-semibold text-dark">#{hotel.id}</span>
        </div>
        {hotel.createdAt && (
          <div className="flex justify-between gap-3">
            <span className="text-muted">Submitted</span>
            <span className="font-semibold text-dark">
              {new Date(hotel.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {hotel.description && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Description</p>
          <p className="mt-2 text-sm leading-6 text-dark line-clamp-4">{hotel.description}</p>
        </div>
      )}

      {hotel.adminNote && (
        <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Previous admin note</p>
          <p className="mt-1 text-sm text-amber-800">{hotel.adminNote}</p>
        </div>
      )}

      {/* Action buttons — only for PENDING_REVIEW */}
      {isPending && (
        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          <button
            type="button"
            disabled={saving}
            onClick={handleApprove}
            className="flex-1 inline-flex h-10 items-center justify-center rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve & publish
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              const reason = window.prompt(`What documents are needed from "${hotel.name}"?`, 'Please upload the required supporting documents.')
              if (reason === null) return
              setSaving(true)
              try {
                await requestHotelFiles(hotel.id, reason || 'Please upload the required supporting documents.')
                toast.success(`Document request sent`)
                setNotice(`Document request sent to "${hotel.name}": "${reason}"`)
                onSave()
              } catch { toast.error('Request failed') } finally { setSaving(false) }
            }}
            className="inline-flex h-10 items-center justify-center rounded-card border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Request docs
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleReject}
            className="inline-flex h-10 items-center justify-center rounded-card border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Return to host
          </button>
        </div>
      )}

      {!isPending && (
        <p className="text-xs text-muted border-t border-gray-200 pt-4">
          This listing has already been processed (status: {hotel.status}).
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
    getHotelsPendingReview()
      .then((data) => {
        const hotels = Array.isArray(data) ? data : (data?.content ?? [])
        rawMap.current = Object.fromEntries(
          hotels.map((h) => [h.name || `Hotel ${h.id}`, h]),
        )
        setRows(hotels.map(mapHotelToRow))
      })
      .catch(() => toast.error('Failed to load listing requests'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const hotel = rawMap.current[row[0]]
    if (!hotel) {
      setNotice('Use the panel on the right to approve or return this listing.')
      return
    }

    if (action === 'Approve') {
      try {
        await approveHotel(hotel.id)
        toast.success(`${hotel.name || row[0]} approved — now live`)
        setNotice(`Approved: ${hotel.name || row[0]}.`)
        load()
      } catch {
        toast.error('Approval failed')
      }
    } else if (action === 'Request files') {
      const reason = window.prompt(
        `What documents are needed from "${hotel.name || row[0]}"?`,
        'Please upload the required supporting documents.',
      )
      if (reason === null) return
      try {
        await requestHotelFiles(hotel.id, reason || 'Please upload the required supporting documents.')
        toast.success(`Document request sent to host of ${hotel.name || row[0]}`)
        setNotice(`Document request sent: "${reason}". Listing returned to DRAFT pending re-submission.`)
        load()
      } catch {
        toast.error('Request failed')
      }
    } else if (action === 'Reject') {
      const reason = window.prompt(
        `Reason for rejecting "${hotel.name || row[0]}":`,
        'Please complete all required fields and resubmit.',
      )
      if (reason === null) return
      try {
        await rejectHotel(hotel.id, reason || 'Please complete all required fields and resubmit.')
        toast.success(`${hotel.name || row[0]} returned to host`)
        setNotice(`Returned: ${hotel.name || row[0]}. Reason: "${reason}"`)
        load()
      } catch {
        toast.error('Action failed')
      }
    } else {
      setNotice('Use the panel on the right to approve or return this listing.')
    }
  }, [load])

  const renderDetailPanel = useCallback(({ record, setNotice }) => (
    <HotelDetailPanel
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
