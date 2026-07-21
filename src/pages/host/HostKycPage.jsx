import { useEffect, useRef, useState } from 'react'
import { Check, CheckCircle2, ChevronDown, FileText, Loader2, Upload, X } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import CountrySelect from '../../components/common/CountrySelect'
import StateSelect from '../../components/common/StateSelect'
import {
  getKycProfile,
  getKycDocuments,
  getVerificationStatus,
  uploadKycDocument,
  submitKyc,
} from '../../services/kycApi'
import { getAvatarUploadUrl, uploadToGcs } from '../../services/storageApi'
import useHostContext from '../../hooks/useHostContext'

const DOC_TYPES = [
  { id: 'GOVERNMENT_ID', label: 'Government ID / Identity verification' },
  { id: 'PROOF_OF_ADDRESS', label: 'Proof of address' },
  { id: 'BUSINESS_REGISTRATION', label: 'Business registration' },
  { id: 'HOTEL_LICENSE', label: 'Hotel / Accommodation license' },
  { id: 'TAX_DOCUMENT', label: 'Tax document' },
]

function formatDocType(raw) {
  if (!raw) return 'Document'
  const MAP = {
    GOVERNMENT_ID: 'Government ID',
    PROOF_OF_ADDRESS: 'Proof of address',
    BUSINESS_REGISTRATION: 'Business registration',
    HOTEL_LICENSE: 'Hotel / Accommodation license',
    TAX_DOCUMENT: 'Tax document',
    PASSPORT: 'Passport',
    NATIONAL_ID: 'National ID',
    DRIVERS_LICENSE: "Driver's license",
  }
  return MAP[raw] ?? raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function tonePillForStatus(status) {
  if (['Approved', 'APPROVED', 'VERIFIED'].includes(status)) return 'success'
  if (['In review', 'PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(status)) return 'sky'
  return 'warning'
}

function normaliseStatus(raw) {
  if (!raw) return 'Pending'
  const MAP = {
    APPROVED: 'Approved', VERIFIED: 'Approved',
    PENDING: 'In review', SUBMITTED: 'In review', UNDER_REVIEW: 'In review',
    REJECTED: 'Rejected', EXPIRED: 'Needs refresh', NOT_STARTED: 'Not started',
  }
  return MAP[raw.toUpperCase()] ?? raw
}

function buildChecklist(profileData) {
  return (profileData?.documents ?? []).map((doc) => ({
    id: doc.id,
    label: formatDocType(doc.documentType),
    status: normaliseStatus(doc.verificationStatus),
    detail: doc.verificationNotes
      || (doc.fileUrl && doc.fileUrl !== 'pending-upload' ? 'File uploaded' : 'Awaiting file upload'),
  }))
}

function buildTimeline(vStatus) {
  if (!vStatus) return []
  const submitted = vStatus.documentsSubmitted ?? 0
  const required = vStatus.documentsRequired ?? 2
  const ks = (vStatus.kycStatus ?? vStatus.overallStatus ?? '').toUpperCase()
  const approved = ks === 'APPROVED' || ks === 'VERIFIED'
  return [
    { label: 'Application submitted', value: ks !== 'NOT_STARTED' ? 'Done' : 'Pending', done: ks !== 'NOT_STARTED' },
    { label: `Documents (${submitted}/${required} required)`, value: submitted >= required ? 'Complete' : 'In progress', done: submitted >= required },
    { label: 'Under review', value: approved ? 'Done' : ks === 'UNDER_REVIEW' ? 'In progress' : 'Pending', done: approved },
    { label: 'Verified', value: approved ? 'Approved' : 'Pending', done: approved },
  ]
}

export default function HostKycPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [checklist, setChecklist] = useState([])
  const [timeline, setTimeline] = useState([])
  const [documents, setDocuments] = useState([])
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const [uploadFile, setUploadFile] = useState(null)
  const [uploadDocType, setUploadDocType] = useState(DOC_TYPES[0].id)
  const [docTypeOpen, setDocTypeOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const [submitForm, setSubmitForm] = useState({ fullName: '', taxNumber: '', vatGstNumber: '', businessName: '', nationality: '', country: '', stateProvince: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fileInputRef = useRef(null)
  const docTypeRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (docTypeRef.current && !docTypeRef.current.contains(e.target)) setDocTypeOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (hostLoading || !hostId) return
    let cancelled = false

    async function load() {
      try {
        const [profileRes, docsRes, vStatusRes] = await Promise.allSettled([
          getKycProfile(hostId),
          getKycDocuments(hostId),
          getVerificationStatus(hostId),
        ])

        if (cancelled) return

        const profile = profileRes.status === 'fulfilled' ? profileRes.value : null
        const docsRaw = docsRes.status === 'fulfilled' ? docsRes.value : null
        const vStatus = vStatusRes.status === 'fulfilled' ? vStatusRes.value : null

        if (profile) {
          // Build checklist from profile.documents[]
          setChecklist(buildChecklist(profile))
          // Pre-populate submit form from existing profile data
          setSubmitForm({
            fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
            taxNumber: profile.taxId ?? profile.taxNumber ?? '',
            vatGstNumber: profile.vatGstNumber ?? profile.vatNumber ?? '',
            businessName: profile.businessName ?? '',
            nationality: profile.nationality ?? '',
            country: profile.country ?? '',
            stateProvince: profile.stateProvince ?? '',
          })
        }

        // Documents list — use issuedDate for display
        const docItems = Array.isArray(docsRaw) ? docsRaw : (docsRaw?.content ?? [])
        if (docItems.length) setDocuments(docItems)

        // Build timeline from verification status
        if (vStatus) {
          setVerificationStatus(vStatus)
          setTimeline(buildTimeline(vStatus))
        } else if (profile) {
          setTimeline(buildTimeline({
            kycStatus: profile.kycStatus,
            documentsSubmitted: profile.documents?.length ?? 0,
          }))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [hostId, hostLoading])

  function handleFilePick(event) {
    const file = event.target.files?.[0]
    if (file) { setUploadFile(file); setUploadError(null); setUploadSuccess(false) }
    event.target.value = ''
  }

  async function handleUpload() {
    if (!uploadFile) return
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    try {
      // Step 1: Upload file to GCS, fall back to metadata-only if GCS unavailable
      let fileUrl = 'pending-upload'
      try {
        const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const { signedUrl, publicUrl } = await getAvatarUploadUrl(
          `kyc-docs/${hostId}/${uploadDocType}_${Date.now()}_${safeName}`,
          uploadFile.type || 'application/octet-stream',
        )
        await uploadToGcs(signedUrl, uploadFile)
        fileUrl = publicUrl
      } catch {
        // GCS not configured — record metadata only
      }

      // Step 2: Register document with backend (DocumentUploadRequest.fileUrl supported)
      await uploadKycDocument(hostId, {
        documentType: uploadDocType,
        documentName: uploadFile.name,
        fileUrl,
      })
      setUploadSuccess(true)
      setUploadFile(null)

      // Refresh documents and checklist
      const [freshDocs, freshProfile] = await Promise.allSettled([
        getKycDocuments(hostId),
        getKycProfile(hostId),
      ])
      const items = freshDocs.status === 'fulfilled'
        ? (Array.isArray(freshDocs.value) ? freshDocs.value : (freshDocs.value?.content ?? []))
        : []
      if (items.length) setDocuments(items)
      if (freshProfile.status === 'fulfilled' && freshProfile.value) {
        setChecklist(buildChecklist(freshProfile.value))
      }
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function updateSubmitField(field) {
    return (e) => setSubmitForm((prev) => ({ ...prev, [field]: e.target.value }))
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
        taxId: submitForm.taxNumber,
        taxNumber: submitForm.taxNumber,
        vatGstNumber: submitForm.vatGstNumber,
        businessName: submitForm.businessName,
        nationality: submitForm.nationality || null,
        country: submitForm.country || null,
        stateProvince: submitForm.stateProvince || null,
      })
      setSubmitSuccess(true)
      const fresh = await getVerificationStatus(hostId).catch(() => null)
      if (fresh) { setVerificationStatus(fresh); setTimeline(buildTimeline(fresh)) }
    } catch {
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const overallStatus = verificationStatus
    ? normaliseStatus(verificationStatus.kycStatus ?? verificationStatus.overallStatus)
    : null
  const docsSubmitted = verificationStatus?.documentsSubmitted ?? 0
  const docsRequired = verificationStatus?.documentsRequired ?? 2

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
            <div className="flex items-start justify-between gap-4">
              <SectionHeading eyebrow="Checklist" title="Verification items" />
              {overallStatus && (
                <StatusPill tone={tonePillForStatus(overallStatus)}>{overallStatus}</StatusPill>
              )}
            </div>

            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Loader2 size={14} className="animate-spin" />
                Loading verification status…
              </div>
            ) : checklist.length === 0 ? (
              <p className="mt-6 text-sm text-muted">
                No verification items found. Submit your KYC application below to start the process.
              </p>
            ) : (
              <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
                {checklist.map((item) => (
                  <div key={item.id} className="py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-dark">{item.label}</p>
                        {item.detail && (
                          <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                        )}
                      </div>
                      <StatusPill tone={tonePillForStatus(item.status)}>{item.status}</StatusPill>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {verificationStatus && (
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-muted">
                  <span className="uppercase tracking-[0.16em]">Document progress</span>
                  <span>{docsSubmitted} / {docsRequired} submitted</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-dark transition-all duration-500"
                    style={{ width: `${Math.min(100, (docsSubmitted / docsRequired) * 100)}%` }}
                  />
                </div>
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

            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFilePick} className="hidden" />

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Document type</label>
                <div ref={docTypeRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDocTypeOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all"
                  >
                    <span>{DOC_TYPES.find((t) => t.id === uploadDocType)?.label ?? uploadDocType}</span>
                    <ChevronDown size={14} className="shrink-0 text-muted" />
                  </button>
                  {docTypeOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                      {DOC_TYPES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setUploadDocType(t.id); setDocTypeOpen(false) }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${uploadDocType === t.id ? 'text-dark' : 'text-muted'}`}
                        >
                          {t.label}
                          {uploadDocType === t.id && <Check size={14} className="shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                {uploadFile && <span className="text-xs text-muted">{(uploadFile.size / 1024).toFixed(0)} KB</span>}
              </button>

              {uploadFile && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-[#f8f6f2] px-4 py-3">
                  <FileText size={16} className="shrink-0 text-muted" />
                  <span className="flex-1 truncate text-sm text-dark">{uploadFile.name}</span>
                  <button type="button" onClick={() => setUploadFile(null)} className="text-muted hover:text-dark">
                    <X size={14} />
                  </button>
                </div>
              )}

              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
              {uploadSuccess && <p className="text-sm text-green-700">Document uploaded successfully.</p>}

              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : 'Upload document'}
              </button>
            </div>

            {documents.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Submitted documents</p>
                <div className="mt-3 divide-y divide-gray-200">
                  {documents.map((doc, i) => (
                    <div key={doc.id ?? i} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="shrink-0 text-muted" />
                        <div>
                          <p className="text-sm font-semibold text-dark">
                            {formatDocType(doc.documentType ?? doc.fileName ?? `Document ${i + 1}`)}
                          </p>
                          {/* issuedDate is the correct field, not submittedAt */}
                          {(doc.issuedDate ?? doc.submittedAt) && (
                            <p className="text-xs text-muted">
                              {new Date(doc.issuedDate ?? doc.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                          {doc.fileUrl && doc.fileUrl !== 'pending-upload' && (
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-brand hover:underline">
                              View file
                            </a>
                          )}
                        </div>
                      </div>
                      <StatusPill tone={tonePillForStatus(doc.verificationStatus ?? doc.status)}>
                        {normaliseStatus(doc.verificationStatus ?? doc.status)}
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
              <HostField label="Full legal name" value={submitForm.fullName} onChange={updateSubmitField('fullName')} placeholder="As it appears on your government ID" />
              <CountrySelect
                label="Nationality"
                value={submitForm.nationality}
                onChange={(v) => setSubmitForm((prev) => ({ ...prev, nationality: v }))}
                placeholder="Select nationality"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CountrySelect
                  label="Country of residence"
                  value={submitForm.country}
                  onChange={(v) => setSubmitForm((prev) => ({ ...prev, country: v, stateProvince: '' }))}
                  placeholder="Select country"
                />
                <StateSelect
                  label="State / Province"
                  country={submitForm.country}
                  value={submitForm.stateProvince}
                  onChange={(v) => setSubmitForm((prev) => ({ ...prev, stateProvince: v }))}
                />
              </div>
              <HostField label="Tax number" value={submitForm.taxNumber} onChange={updateSubmitField('taxNumber')} placeholder="Tax registration / PAN / TIN (optional)" />
              <HostField label="VAT / GST number" value={submitForm.vatGstNumber} onChange={updateSubmitField('vatGstNumber')} placeholder="VAT or GST number (optional)" />
              <HostField label="Business name (if applicable)" value={submitForm.businessName} onChange={updateSubmitField('businessName')} placeholder="Registered company name" />

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
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit KYC application'}
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Timeline sidebar */}
        <SectionCard>
          <SectionHeading eyebrow="Timeline" title="Verification path" />

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              Loading timeline…
            </div>
          ) : timeline.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Timeline will appear once your application is submitted.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {timeline.map((item, index) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${item.done ? 'bg-dark' : 'bg-gray-300'}`} />
                    {index < timeline.length - 1 && <div className="mt-2 h-full w-px bg-gray-200" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-dark">{item.label}</p>
                    <p className={`text-sm ${item.done ? 'text-emerald-600' : 'text-muted'}`}>
                      {item.done && <CheckCircle2 size={12} className="mr-1 inline" />}
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {verificationStatus?.riskScore != null && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-[#f8f6f2] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Risk assessment</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-dark">Score: {verificationStatus.riskScore}</p>
                <StatusPill
                  tone={verificationStatus.riskLevel === 'LOW' ? 'success' : verificationStatus.riskLevel === 'MEDIUM' ? 'warning' : 'danger'}
                >
                  {verificationStatus.riskLevel}
                </StatusPill>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </HostShell>
  )
}
