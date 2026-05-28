import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
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

  useEffect(() => { load() }, [load])

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
    />
  )
}
