import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { FileImage, History, IdCard, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import {
  approveKYC, assignKYCReviewer, getAllKYC, getAuditLogs, getKYCDetail, rejectKYC, requestKYCResubmit,
  getAllGuestKYC, getGuestKYCDetail, approveGuestKYC, rejectGuestKYC, requestGuestKYCResubmit, assignGuestKYCReviewer,
} from '../../services/adminApi'

function maskId(str) {
  if (!str) return '—'
  if (str.length <= 4) return '****'
  return str.slice(0, 2) + '****' + str.slice(-2)
}

// ─── Host KYC helpers ─────────────────────────────────────────────────────────

function mapKYCToRow(k) {
  const name = [k.firstName, k.lastName].filter(Boolean).join(' ') || `Host #${k.hostId}`
  const docType = k.businessType || 'Identity doc'
  const maskedId = maskId(k.nationalIdNumber || k.businessRegistrationNumber)
  const submitted = k.createdAt ? new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const status = k.kycStatus || 'PENDING'
  const actionLabel = status === 'PENDING' || status === 'UNDER_REVIEW' ? 'Approve' : 'View timeline'
  return [name, docType, maskedId, submitted, status, '—', actionLabel]
}

// ─── Guest KYC helpers ────────────────────────────────────────────────────────

function mapGuestKYCToRow(k) {
  const name = [k.firstName, k.lastName].filter(Boolean).join(' ') || `Guest #${k.guestId}`
  const docType = 'Personal ID'
  const maskedId = maskId(k.nationalIdNumber)
  const submitted = k.createdAt ? new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const status = k.kycStatus || 'PENDING'
  const actionLabel = status === 'PENDING' || status === 'UNDER_REVIEW' ? 'Approve' : 'View timeline'
  return [name, docType, maskedId, submitted, status, '—', actionLabel]
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const GOV_ID_TYPES = ['GOVERNMENT_ID', 'NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'ID']
const ADDR_TYPES = ['PROOF_OF_ADDRESS', 'BUSINESS_LICENSE', 'BUSINESS_REGISTRATION', 'HOTEL_LICENSE', 'TAX_DOCUMENT', 'TAX_CERTIFICATE']

function isValidFileUrl(url) {
  return typeof url === 'string' && url.startsWith('http')
}

// ─── Host KYC detail panel ────────────────────────────────────────────────────

function KYCDetailPanel({ kyc, record, setNotice, onRowAction }) {
  const [auditLogs, setAuditLogs] = useState([])
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!kyc?.id) { setAuditLogs([]); setDetail(null); return }
    getAuditLogs('KYC', kyc.id)
      .then((data) => setAuditLogs(Array.isArray(data) ? data : (data?.content ?? [])))
      .catch(() => setAuditLogs([]))
    getKYCDetail(kyc.id)
      .then(setDetail)
      .catch(() => setDetail(null))
  }, [kyc?.id])

  if (!kyc) {
    return (
      <AdminCard>
        <AdminSectionHeading
          eyebrow="Verification detail"
          title="Select a record"
          description="Click any row in the table to inspect submitted documents and audit history."
        />
      </AdminCard>
    )
  }

  const govIdUrl = detail?.documents?.find((d) => GOV_ID_TYPES.includes(d.documentType) && isValidFileUrl(d.fileUrl))?.fileUrl ?? null
  const addrUrl = detail?.documents?.find((d) => ADDR_TYPES.includes(d.documentType) && isValidFileUrl(d.fileUrl))?.fileUrl ?? null
  const anyDocUrl = detail?.documents?.find((d) => isValidFileUrl(d.fileUrl))?.fileUrl ?? null

  const history = auditLogs.length > 0
    ? auditLogs.map((e) => [
        e.action,
        e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        e.details || (e.actorName ? `by ${e.actorName}` : ''),
      ])
    : [
        ['Submitted', record?.[3] || '—', 'Documents received'],
        ['Screened', '—', 'Name and document metadata checked'],
        [record?.[4] || 'Pending', 'Now', 'Awaiting admin decision'],
      ]

  return (
    <AdminCard className="space-y-6">
      <AdminSectionHeading
        eyebrow="Verification detail"
        title="Document preview and decision history"
        description="Inspect submitted proof and keep a clear audit trail for every KYC action."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['Government ID', govIdUrl, IdCard],
          ['Address proof', addrUrl, FileImage],
        ].map(([label, url, Icon]) => (
          <div key={label} className="rounded-card border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-card bg-[#fff1f3] text-brand">
                {createElement(Icon, { size: 18 })}
              </span>
              <AdminStatusPill tone={url ? 'success' : 'warning'}>
                {url ? 'Preview ready' : 'Missing'}
              </AdminStatusPill>
            </div>
            <p className="mt-4 text-sm font-semibold text-dark">{label}</p>
            <div className="mt-3 overflow-hidden rounded-card border border-dashed border-gray-200 bg-[#fcfbf8]">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" title={`Open ${label} in new tab`}>
                  <img
                    src={url}
                    alt={label}
                    className="aspect-[4/3] w-full object-cover transition-opacity hover:opacity-90"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                  />
                  <div className="hidden aspect-[4/3] items-center justify-center text-center text-xs font-semibold text-muted">
                    Image could not load — click to open URL
                  </div>
                </a>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-center text-xs font-semibold text-muted">
                  No uploaded file URL
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <History size={17} className="text-brand" />
          <p className="text-sm font-semibold text-dark">Decision history</p>
        </div>
        <div className="mt-4 space-y-4">
          {history.map(([label, date, note], index) => (
            <div key={`${label}-${date}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-dark" />
                {index < history.length - 1 ? <span className="mt-2 h-full w-px bg-gray-200" /> : null}
              </div>
              <div className="pb-2">
                <p className="text-sm font-semibold text-dark">{label}</p>
                <p className="text-xs text-muted">{date} · {note}</p>
              </div>
            </div>
          ))}
        </div>
        {record?.[4] === 'REJECTED' && (
          <div className="mt-4 rounded-card border border-rose-200 bg-rose-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Rejection reason</p>
            <p className="mt-1 text-sm text-rose-800">
              {kyc.rejectionReason || kyc.notes || 'No reason recorded.'}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const docUrl = govIdUrl || addrUrl || anyDocUrl
          if (docUrl) {
            window.open(docUrl, '_blank', 'noopener,noreferrer')
          } else {
            const hasPending = detail?.documents?.some((d) => d.fileUrl === 'pending-upload')
            setNotice(hasPending
              ? 'Documents were uploaded before storage was configured — ask the host to re-upload their files.'
              : 'No document URL available for this KYC submission.')
          }
        }}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-dark px-4 text-sm font-semibold text-white"
      >
        <ShieldCheck size={16} />
        Open full review
      </button>

      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => onRowAction(record, 'Approve', setNotice)}
          className="flex-1 inline-flex h-10 items-center justify-center rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => onRowAction(record, 'Reject', setNotice)}
          className="inline-flex h-10 items-center justify-center rounded-card border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onRowAction(record, 'Request files', setNotice)}
          className="inline-flex h-10 items-center justify-center rounded-card border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
        >
          Request resubmit
        </button>
      </div>
    </AdminCard>
  )
}

// ─── Guest KYC detail panel ───────────────────────────────────────────────────

function GuestKYCDetailPanel({ kyc, record, setNotice, onRowAction }) {
  const [auditLogs, setAuditLogs] = useState([])
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!kyc?.id) { setAuditLogs([]); setDetail(null); return }
    getAuditLogs('GUEST_KYC', kyc.id)
      .then((data) => setAuditLogs(Array.isArray(data) ? data : (data?.content ?? [])))
      .catch(() => setAuditLogs([]))
    getGuestKYCDetail(kyc.id)
      .then(setDetail)
      .catch(() => setDetail(null))
  }, [kyc?.id])

  if (!kyc) {
    return (
      <AdminCard>
        <AdminSectionHeading
          eyebrow="Verification detail"
          title="Select a record"
          description="Click any row in the table to inspect submitted documents and audit history."
        />
      </AdminCard>
    )
  }

  const govIdUrl = detail?.documents?.find((d) => GOV_ID_TYPES.includes(d.documentType) && isValidFileUrl(d.fileUrl))?.fileUrl ?? null
  const addrUrl = detail?.documents?.find((d) => ADDR_TYPES.includes(d.documentType) && isValidFileUrl(d.fileUrl))?.fileUrl ?? null
  const anyDocUrl = detail?.documents?.find((d) => isValidFileUrl(d.fileUrl))?.fileUrl ?? null

  const history = auditLogs.length > 0
    ? auditLogs.map((e) => [
        e.action,
        e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        e.details || (e.actorName ? `by ${e.actorName}` : ''),
      ])
    : [
        ['Submitted', record?.[3] || '—', 'Documents received'],
        ['Screened', '—', 'Name and document metadata checked'],
        [record?.[4] || 'Pending', 'Now', 'Awaiting admin decision'],
      ]

  return (
    <AdminCard className="space-y-6">
      <AdminSectionHeading
        eyebrow="Guest verification detail"
        title="Document preview and decision history"
        description="Inspect submitted proof and keep a clear audit trail for every KYC action."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['Government ID', govIdUrl, IdCard],
          ['Address proof', addrUrl, FileImage],
        ].map(([label, url, Icon]) => (
          <div key={label} className="rounded-card border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-card bg-[#fff1f3] text-brand">
                {createElement(Icon, { size: 18 })}
              </span>
              <AdminStatusPill tone={url ? 'success' : 'warning'}>
                {url ? 'Preview ready' : 'Missing'}
              </AdminStatusPill>
            </div>
            <p className="mt-4 text-sm font-semibold text-dark">{label}</p>
            <div className="mt-3 overflow-hidden rounded-card border border-dashed border-gray-200 bg-[#fcfbf8]">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" title={`Open ${label} in new tab`}>
                  <img
                    src={url}
                    alt={label}
                    className="aspect-[4/3] w-full object-cover transition-opacity hover:opacity-90"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                  />
                  <div className="hidden aspect-[4/3] items-center justify-center text-center text-xs font-semibold text-muted">
                    Image could not load — click to open URL
                  </div>
                </a>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-center text-xs font-semibold text-muted">
                  No uploaded file URL
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <History size={17} className="text-brand" />
          <p className="text-sm font-semibold text-dark">Decision history</p>
        </div>
        <div className="mt-4 space-y-4">
          {history.map(([label, date, note], index) => (
            <div key={`${label}-${date}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-dark" />
                {index < history.length - 1 ? <span className="mt-2 h-full w-px bg-gray-200" /> : null}
              </div>
              <div className="pb-2">
                <p className="text-sm font-semibold text-dark">{label}</p>
                <p className="text-xs text-muted">{date} · {note}</p>
              </div>
            </div>
          ))}
        </div>
        {record?.[4] === 'REJECTED' && (
          <div className="mt-4 rounded-card border border-rose-200 bg-rose-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Rejection reason</p>
            <p className="mt-1 text-sm text-rose-800">
              {kyc.rejectionReason || kyc.notes || 'No reason recorded.'}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const docUrl = govIdUrl || addrUrl || anyDocUrl
          if (docUrl) {
            window.open(docUrl, '_blank', 'noopener,noreferrer')
          } else {
            const hasPending = detail?.documents?.some((d) => d.fileUrl === 'pending-upload')
            setNotice(hasPending
              ? 'Documents were uploaded before storage was configured — ask the guest to re-upload their files.'
              : 'No document URL available for this KYC submission.')
          }
        }}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-dark px-4 text-sm font-semibold text-white"
      >
        <ShieldCheck size={16} />
        Open full review
      </button>

      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => onRowAction(record, 'Approve', setNotice)}
          className="flex-1 inline-flex h-10 items-center justify-center rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => onRowAction(record, 'Reject', setNotice)}
          className="inline-flex h-10 items-center justify-center rounded-card border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onRowAction(record, 'Request files', setNotice)}
          className="inline-flex h-10 items-center justify-center rounded-card border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
        >
          Request resubmit
        </button>
      </div>
    </AdminCard>
  )
}

// ─── Tab bar component ────────────────────────────────────────────────────────

function TabBar({ activeTab, onChange }) {
  return (
    <div className="mb-4 flex gap-1 rounded-2xl border border-gray-200 bg-[#f8f6f2] p-1 w-fit">
      {[
        { id: 'hosts', label: 'Hosts' },
        { id: 'guests', label: 'Guests' },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-dark shadow-sm'
              : 'text-muted hover:text-dark'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminVerificationPage() {
  const [activeTab, setActiveTab] = useState('hosts')

  // Host KYC state
  const [hostRows, setHostRows] = useState([])
  const [hostLoading, setHostLoading] = useState(true)
  const hostRawMap = useRef({})

  // Guest KYC state
  const [guestRows, setGuestRows] = useState([])
  const [guestLoading, setGuestLoading] = useState(false)
  const guestRawMap = useRef({})
  const guestLoaded = useRef(false)

  const loadHosts = useCallback(() => {
    setHostLoading(true)
    getAllKYC()
      .then((data) => {
        const records = Array.isArray(data) ? data : (data?.content ?? [])
        hostRawMap.current = Object.fromEntries(
          records.map((k) => {
            const name = [k.firstName, k.lastName].filter(Boolean).join(' ') || `Host #${k.hostId}`
            return [name, k]
          }),
        )
        setHostRows(records.map(mapKYCToRow))
      })
      .catch(() => toast.error('Failed to load host KYC records'))
      .finally(() => setHostLoading(false))
  }, [])

  const loadGuests = useCallback(() => {
    setGuestLoading(true)
    getAllGuestKYC()
      .then((data) => {
        const records = Array.isArray(data) ? data : (data?.content ?? [])
        guestRawMap.current = Object.fromEntries(
          records.map((k) => {
            const name = [k.firstName, k.lastName].filter(Boolean).join(' ') || `Guest #${k.guestId}`
            return [name, k]
          }),
        )
        setGuestRows(records.map(mapGuestKYCToRow))
        guestLoaded.current = true
      })
      .catch(() => toast.error('Failed to load guest KYC records'))
      .finally(() => setGuestLoading(false))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadHosts, 0)
    return () => window.clearTimeout(timer)
  }, [loadHosts])

  useEffect(() => {
    if (activeTab === 'guests' && !guestLoaded.current) {
      loadGuests()
    }
  }, [activeTab, loadGuests])

  const handleHostRowAction = useCallback(async (row, action, setNotice) => {
    const kyc = hostRawMap.current[row[0]]
    if (!kyc) return

    if (action === 'Approve') {
      try {
        await approveKYC(kyc.id)
        toast.success(`${row[0]} KYC approved`)
        loadHosts()
      } catch {
        toast.error('Approval failed')
      }
    } else if (action === 'Reject') {
      const reason = window.prompt(`Reason for rejecting ${row[0]}:`, 'Document mismatch')
      if (reason === null) return
      try {
        await rejectKYC(kyc.id, reason || 'Document mismatch')
        toast.success(`${row[0]} KYC rejected`)
        loadHosts()
      } catch {
        toast.error('Rejection failed')
      }
    } else if (action === 'Request files') {
      const reason = window.prompt(`Reason for requesting resubmission from ${row[0]}:`, 'Additional documents required')
      if (reason === null) return
      try {
        await requestKYCResubmit(kyc.id, reason || 'Additional documents required')
        toast.success(`Resubmission requested for ${row[0]}`)
        loadHosts()
      } catch {
        toast.error('Request failed')
      }
    } else if (action === 'View timeline') {
      try {
        const data = await getAuditLogs('KYC', kyc.id)
        const logs = Array.isArray(data) ? data : (data?.content ?? [])
        if (logs.length > 0) {
          const latest = logs[0]
          setNotice(`${row[0]} audit: ${latest.action}${latest.actorName ? ` by ${latest.actorName}` : ''} — ${latest.details || ''}`)
        } else {
          const reason = kyc.rejectionReason || kyc.notes || null
          if (row[4] === 'REJECTED' && reason) {
            setNotice(`${row[0]} was rejected. Reason: "${reason}"`)
          } else {
            setNotice(`Viewing ${row[0]} — status: ${row[4]}. No audit entries yet.`)
          }
        }
      } catch {
        setNotice(`Viewing ${row[0]} — status: ${row[4]}`)
      }
    } else if (action === 'Assign reviewer') {
      const idStr = window.prompt(`Reviewer admin ID to assign to ${row[0]}:`)
      if (idStr === null || !idStr.trim()) return
      const reviewerId = parseInt(idStr.trim(), 10)
      if (isNaN(reviewerId)) { toast.error('Enter a valid numeric admin ID'); return }
      try {
        await assignKYCReviewer(kyc.id, reviewerId)
        toast.success(`Reviewer #${reviewerId} assigned to ${row[0]}`)
        setNotice(`Reviewer #${reviewerId} assigned to ${row[0]}.`)
        loadHosts()
      } catch {
        toast.error('Assignment failed')
      }
    } else {
      setNotice(`Viewing ${row[0]} — status: ${row[4]}`)
    }
  }, [loadHosts])

  const handleGuestRowAction = useCallback(async (row, action, setNotice) => {
    const kyc = guestRawMap.current[row[0]]
    if (!kyc) return

    if (action === 'Approve') {
      try {
        await approveGuestKYC(kyc.id)
        toast.success(`${row[0]} KYC approved`)
        loadGuests()
      } catch {
        toast.error('Approval failed')
      }
    } else if (action === 'Reject') {
      const reason = window.prompt(`Reason for rejecting ${row[0]}:`, 'Document mismatch')
      if (reason === null) return
      try {
        await rejectGuestKYC(kyc.id, reason || 'Document mismatch')
        toast.success(`${row[0]} KYC rejected`)
        loadGuests()
      } catch {
        toast.error('Rejection failed')
      }
    } else if (action === 'Request files') {
      const reason = window.prompt(`Reason for requesting resubmission from ${row[0]}:`, 'Additional documents required')
      if (reason === null) return
      try {
        await requestGuestKYCResubmit(kyc.id, reason || 'Additional documents required')
        toast.success(`Resubmission requested for ${row[0]}`)
        loadGuests()
      } catch {
        toast.error('Request failed')
      }
    } else if (action === 'View timeline') {
      try {
        const data = await getAuditLogs('GUEST_KYC', kyc.id)
        const logs = Array.isArray(data) ? data : (data?.content ?? [])
        if (logs.length > 0) {
          const latest = logs[0]
          setNotice(`${row[0]} audit: ${latest.action}${latest.actorName ? ` by ${latest.actorName}` : ''} — ${latest.details || ''}`)
        } else {
          const reason = kyc.rejectionReason || kyc.notes || null
          if (row[4] === 'REJECTED' && reason) {
            setNotice(`${row[0]} was rejected. Reason: "${reason}"`)
          } else {
            setNotice(`Viewing ${row[0]} — status: ${row[4]}. No audit entries yet.`)
          }
        }
      } catch {
        setNotice(`Viewing ${row[0]} — status: ${row[4]}`)
      }
    } else if (action === 'Assign reviewer') {
      const idStr = window.prompt(`Reviewer admin ID to assign to ${row[0]}:`)
      if (idStr === null || !idStr.trim()) return
      const reviewerId = parseInt(idStr.trim(), 10)
      if (isNaN(reviewerId)) { toast.error('Enter a valid numeric admin ID'); return }
      try {
        await assignGuestKYCReviewer(kyc.id, reviewerId)
        toast.success(`Reviewer #${reviewerId} assigned to ${row[0]}`)
        setNotice(`Reviewer #${reviewerId} assigned to ${row[0]}.`)
        loadGuests()
      } catch {
        toast.error('Assignment failed')
      }
    } else {
      setNotice(`Viewing ${row[0]} — status: ${row[4]}`)
    }
  }, [loadGuests])

  const renderHostDetailPanel = useCallback(({ record, setNotice }) => {
    const kyc = record ? hostRawMap.current[record[0]] : null
    return (
      <KYCDetailPanel
        kyc={kyc}
        record={record}
        setNotice={setNotice}
        onRowAction={handleHostRowAction}
      />
    )
  }, [handleHostRowAction])

  const renderGuestDetailPanel = useCallback(({ record, setNotice }) => {
    const kyc = record ? guestRawMap.current[record[0]] : null
    return (
      <GuestKYCDetailPanel
        kyc={kyc}
        record={record}
        setNotice={setNotice}
        onRowAction={handleGuestRowAction}
      />
    )
  }, [handleGuestRowAction])

  const isHosts = activeTab === 'hosts'

  return (
    <div>
      <div className="px-4 pt-4 md:px-6 lg:px-8">
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
      </div>
      <AdminManagementPage
        key={activeTab}
        pageKey={isHosts ? 'verification' : 'guest-verification'}
        rows={isHosts ? hostRows : guestRows}
        loading={isHosts ? hostLoading : guestLoading}
        onRowAction={isHosts ? handleHostRowAction : handleGuestRowAction}
        detailContent={isHosts ? renderHostDetailPanel : renderGuestDetailPanel}
      />
    </div>
  )
}
