import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import {
  getKycProfile,
  getKycDocuments,
  getVerificationStatus,
  uploadKycDocument,
  submitKyc,
} from '../../services/kycApi'
import useHostContext from '../../hooks/useHostContext'

const DOC_TYPES = [
  { id: 'GOVERNMENT_ID', label: 'Government ID' },
  { id: 'PROOF_OF_ADDRESS', label: 'Proof of address' },
  { id: 'BUSINESS_REGISTRATION', label: 'Business registration' },
  { id: 'TAX_DOCUMENT', label: 'Tax document' },
]

function tonePillForStatus(status) {
  if (status === 'Approved' || status === 'APPROVED' || status === 'VERIFIED') return 'success'
  if (status === 'In review' || status === 'PENDING' || status === 'SUBMITTED') return 'sky'
  return 'warning'
}

function normaliseStatus(raw) {
  if (!raw) return 'Pending'
  const map = {
    APPROVED: 'Approved',
    VERIFIED: 'Approved',
    PENDING: 'In review',
    SUBMITTED: 'In review',
    REJECTED: 'Rejected',
    EXPIRED: 'Needs refresh',
  }
  return map[raw.toUpperCase()] ?? raw
}

export default function HostKycPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [checklist, setChecklist] = useState([])
  const [timeline, setTimeline] = useState([])
  const [documents, setDocuments] = useState([])
  const [verificationStatus, setVerificationStatus] = useState(null)

  const [uploadFile, setUploadFile] = useState(null)
  const [uploadDocType, setUploadDocType] = useState(DOC_TYPES[0].id)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const [submitForm, setSubmitForm] = useState({ fullName: '', taxId: '', businessName: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (hostLoading || !hostId) return
    getKycProfile(hostId)
      .then((data) => {
        if (data?.checklist?.length) {
          setChecklist(
            data.checklist.map((item, i) => ({
              id: item.id ?? i,
              label: item.label ?? item.documentType ?? item.name,
              status: normaliseStatus(item.status ?? item.verificationStatus),
              detail: item.detail ?? item.description ?? '',
            })),
          )
        }
        if (data?.timeline?.length) {
          setTimeline(
            data.timeline.map((item) => ({
              label: item.label ?? item.step,
              value: item.value ?? item.date ?? item.completedAt,
            })),
          )
        }
      })
      .catch(() => {})

    getKycDocuments(hostId)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) setDocuments(items)
      })
      .catch(() => {})

    getVerificationStatus(hostId)
      .then((data) => {
        if (data) setVerificationStatus(data)
      })
      .catch(() => {})
  }, [hostId, hostLoading])

  function handleFilePick(event) {
    const file = event.target.files?.[0]
    if (file) {
      setUploadFile(file)
      setUploadError(null)
      setUploadSuccess(false)
    }
    event.target.value = ''
  }

  async function handleUpload() {
    if (!uploadFile) return
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    try {
      await uploadKycDocument(hostId, {
        documentType: uploadDocType,
        documentName: uploadFile.name,
      })
      setUploadSuccess(true)
      setUploadFile(null)
      const fresh = await getKycDocuments(hostId).catch(() => null)
      const items = Array.isArray(fresh) ? fresh : (fresh?.content ?? [])
      if (items.length) setDocuments(items)
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function updateSubmitField(field) {
    return (event) => setSubmitForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmitKyc() {
    if (!submitForm.fullName) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      const nameParts = submitForm.fullName.trim().split(' ')
      await submitKyc(hostId, {
        firstName: nameParts[0] || submitForm.fullName,
        lastName: nameParts.slice(1).join(' ') || '',
        taxId: submitForm.taxId,
        businessName: submitForm.businessName,
      })
      setSubmitSuccess(true)
    } catch {
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <HostShell
      eyebrow="KYC"
      title="Verification"
      mobileTitle="KYC"
      description="Keep payout compliance current."
      actions={[
        { label: 'Bank accounts', href: '/host/bank-accounts', secondary: true },
        { label: 'Payouts', href: '/host/payouts' },
      ]}
      mobileAction={{ label: 'Upload', onClick: () => fileInputRef.current?.click() }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* Verification checklist */}
          <SectionCard>
            <SectionHeading eyebrow="Checklist" title="Verification items" />
            {checklist.length === 0 && (
              <p className="mt-6 text-sm text-muted">No verification items found. Submit your KYC application below to start the process.</p>
            )}
            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {checklist.map((item) => (
                <div key={item.id} className="py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-dark">{item.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                    </div>
                    <StatusPill tone={tonePillForStatus(item.status)}>{item.status}</StatusPill>
                  </div>
                </div>
              ))}
            </div>

            {verificationStatus && (
              <div className="mt-5 rounded-2xl border border-gray-200 bg-[#f8f6f2] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Overall status
                </p>
                <p className="mt-1 text-base font-semibold text-dark">
                  {normaliseStatus(verificationStatus.status ?? verificationStatus.overallStatus)}
                </p>
                {verificationStatus.message && (
                  <p className="mt-1 text-sm text-muted">{verificationStatus.message}</p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Document upload */}
          <SectionCard>
            <SectionHeading
              eyebrow="Documents"
              title="Upload verification document"
              description="Upload a clear scan or photo. Accepted formats: PDF, JPG, PNG."
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFilePick}
              className="hidden"
            />

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">
                  Document type
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
                >
                  {DOC_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-8 text-center transition-colors hover:border-gray-500"
              >
                <Upload size={28} className="text-gray-400" />
                <span className="text-sm font-semibold text-dark">
                  {uploadFile ? uploadFile.name : 'Click to select file'}
                </span>
                {uploadFile && (
                  <span className="text-xs text-muted">
                    {(uploadFile.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </button>

              {uploadFile && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-[#f8f6f2] px-4 py-3">
                  <FileText size={16} className="shrink-0 text-muted" />
                  <span className="flex-1 truncate text-sm text-dark">{uploadFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setUploadFile(null)}
                    className="text-muted hover:text-dark"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="text-sm text-green-700">Document uploaded successfully.</p>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload document'}
              </button>
            </div>

            {/* Uploaded documents list */}
            {documents.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Submitted documents
                </p>
                <div className="mt-3 divide-y divide-gray-200">
                  {documents.map((doc, i) => (
                    <div key={doc.id ?? i} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="shrink-0 text-muted" />
                        <div>
                          <p className="text-sm font-semibold text-dark">
                            {doc.documentType ?? doc.fileName ?? `Document ${i + 1}`}
                          </p>
                          {doc.submittedAt && (
                            <p className="text-xs text-muted">
                              {new Date(doc.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusPill
                        tone={tonePillForStatus(doc.status ?? doc.verificationStatus)}
                      >
                        {normaliseStatus(doc.status ?? doc.verificationStatus)}
                      </StatusPill>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Submit KYC form */}
          <SectionCard>
            <SectionHeading
              eyebrow="Submission"
              title="Submit KYC application"
              description="Provide your legal details and submit for review. You will be notified once approved."
            />
            <div className="mt-6 space-y-4">
              <HostField
                label="Full legal name"
                value={submitForm.fullName}
                onChange={updateSubmitField('fullName')}
                placeholder="As it appears on your ID"
              />
              <HostField
                label="Tax ID / VAT number"
                value={submitForm.taxId}
                onChange={updateSubmitField('taxId')}
                placeholder="Optional"
              />
              <HostField
                label="Business name (if applicable)"
                value={submitForm.businessName}
                onChange={updateSubmitField('businessName')}
                placeholder="Registered company name"
              />

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              {submitSuccess && (
                <p className="text-sm text-green-700">
                  KYC application submitted. You will receive an update within 2 business days.
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmitKyc}
                disabled={!submitForm.fullName || submitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit KYC application'}
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Timeline sidebar */}
        <SectionCard>
          <SectionHeading eyebrow="Timeline" title="Verification path" />
          {timeline.length === 0 && (
            <p className="mt-6 text-sm text-muted">Timeline will appear once your application is submitted.</p>
          )}
          <div className="mt-6 space-y-4">
            {timeline.map((item, index) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-dark" />
                  {index < timeline.length - 1 && (
                    <div className="mt-2 h-full w-px bg-gray-200" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-dark">{item.label}</p>
                  <p className="text-sm text-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </HostShell>
  )
}
