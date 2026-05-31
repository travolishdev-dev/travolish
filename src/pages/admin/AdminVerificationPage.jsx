import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { FileImage, History, IdCard, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { approveKYC, getAllKYC, rejectKYC, requestKYCResubmit } from '../../services/adminApi'

function maskId(str) {
  if (!str) return '—'
  if (str.length <= 4) return '****'
  return str.slice(0, 2) + '****' + str.slice(-2)
}

function mapKYCToRow(k) {
  const name = [k.firstName, k.lastName].filter(Boolean).join(' ') || `Host #${k.hostId}`
  const docType = k.businessType || 'Identity doc'
  const maskedId = maskId(k.nationalIdNumber || k.businessRegistrationNumber)
  const submitted = k.createdAt ? new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const status = k.kycStatus || 'PENDING'
  const actionLabel = status === 'PENDING' || status === 'UNDER_REVIEW' ? 'Approve' : 'View timeline'
  return [name, docType, maskedId, submitted, status, '—', actionLabel]
}

export default function AdminVerificationPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const rawMap = useRef({})

  const load = useCallback(() => {
    setLoading(true)
    getAllKYC()
      .then((data) => {
        const records = Array.isArray(data) ? data : (data?.content ?? [])
        rawMap.current = Object.fromEntries(
          records.map((k) => {
            const name = [k.firstName, k.lastName].filter(Boolean).join(' ') || `Host #${k.hostId}`
            return [name, k]
          }),
        )
        setRows(records.map(mapKYCToRow))
      })
      .catch(() => toast.error('Failed to load KYC records'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const kyc = rawMap.current[row[0]]
    if (!kyc) return

    if (action === 'Approve') {
      try {
        await approveKYC(kyc.id)
        toast.success(`${row[0]} KYC approved`)
        load()
      } catch {
        toast.error('Approval failed')
      }
    } else if (action === 'Reject') {
      try {
        await rejectKYC(kyc.id, 'Document mismatch')
        toast.success(`${row[0]} KYC rejected`)
        load()
      } catch {
        toast.error('Rejection failed')
      }
    } else if (action === 'Request files') {
      try {
        await requestKYCResubmit(kyc.id)
        toast.success(`Resubmission requested for ${row[0]}`)
        load()
      } catch {
        toast.error('Request failed')
      }
    } else {
      setNotice(`Viewing ${row[0]} — status: ${row[4]}`)
    }
  }, [load])

  return (
    <AdminManagementPage
      pageKey="verification"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
      detailContent={({ record, setNotice }) => {
        const kyc = record ? rawMap.current[record[0]] : null
        const history = [
          ['Submitted', record?.[3] || '—', 'Documents received'],
          ['Screened', 'Today', 'Name and document metadata checked'],
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
                ['Government ID', kyc?.nationalIdDocumentUrl || kyc?.idDocumentUrl, IdCard],
                ['Address proof', kyc?.addressProofUrl || kyc?.businessDocumentUrl, FileImage],
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
                  <div className="mt-3 flex aspect-[4/3] items-center justify-center rounded-card border border-dashed border-gray-200 bg-[#fcfbf8] text-center text-xs font-semibold text-muted">
                    {url ? 'Secure document preview' : 'No uploaded file URL'}
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
            </div>

            <button
              type="button"
              onClick={() => setNotice('KYC preview and history opened for admin review.')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-dark px-4 text-sm font-semibold text-white"
            >
              <ShieldCheck size={16} />
              Open full review
            </button>
          </AdminCard>
        )
      }}
    />
  )
}
