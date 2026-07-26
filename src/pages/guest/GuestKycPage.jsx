import { useEffect, useRef, useState } from 'react'
import { Check, CheckCircle2, ChevronDown, FileText, Loader2, Upload, X } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import CountrySelect from '../../components/common/CountrySelect'
import StateSelect from '../../components/common/StateSelect'
import {
  getGuestKycProfile,
  getGuestKycDocuments,
  getGuestVerificationStatus,
  uploadGuestKycDocument,
  submitGuestKyc,
} from '../../services/guestKycApi'
import { getAvatarUploadUrl, uploadToGcs } from '../../services/storageApi'
import useAuthStore from '../../stores/useAuthStore'

const DOC_TYPES = [
  { id: 'GOVERNMENT_ID', label: 'Government ID / Passport / National ID' },
  { id: 'PROOF_OF_ADDRESS', label: 'Proof of address' },
]

function formatDocType(raw) {
  if (!raw) return 'Document'
  const MAP = {
    GOVERNMENT_ID: 'Government ID',
    PROOF_OF_ADDRESS: 'Proof of address',
    PASSPORT: 'Passport',
    NATIONAL_ID: 'National ID',
    DRIVERS_LICENSE: "Driver's license",
  }
  return MAP[raw] ?? raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function tonePill(status) {
  if (['Approved', 'APPROVED', 'VERIFIED'].includes(status)) return 'success'
  if (['In review', 'PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(status)) return 'sky'
  if (['Rejected', 'REJECTED'].includes(status)) return 'danger'
  return 'warning'
}

function normaliseStatus(raw) {
  if (!raw) return 'Pending'
  const MAP = {
    APPROVED: 'Approved', VERIFIED: 'Approved',
    PENDING: 'In review', SUBMITTED: 'In review', UNDER_REVIEW: 'In review',
    REJECTED: 'Rejected', EXPIRED: 'Needs refresh', NOT_STARTED: 'Not started',
    RESUBMIT_REQUESTED: 'Resubmit required',
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

export default function GuestKycPage() {
  const guestId = useAuthStore((s) => s.backendUserId)
  const isLoading = useAuthStore((s) => s.isLoading)

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

  const [submitForm, setSubmitForm] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    stateProvince: '',
    phoneNumber: '',
    nationalIdNumber: '',
  })
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
    if (isLoading || !guestId) return
    let cancelled = false

    async function load() {
      try {
        const [profileRes, docsRes, vStatusRes] = await Promise.allSettled([
          getGuestKycProfile(guestId),
          getGuestKycDocuments(guestId),
          getGuestVerificationStatus(guestId),
        ])

        if (cancelled) return

        const profile = profileRes.status === 'fulfilled' ? profileRes.value : null
        const docsRaw = docsRes.status === 'fulfilled' ? docsRes.value : null
        const vStatus = vStatusRes.status === 'fulfilled' ? vStatusRes.value : null

        if (profile) {
          setChecklist(buildChecklist(profile))
          setSubmitForm({
            fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
            dateOfBirth: profile.dateOfBirth ?? '',
            nationality: profile.nationality ?? '',
            country: profile.country ?? '',
            stateProvince: profile.stateProvince ?? '',
            phoneNumber: profile.phoneNumber ?? '',
            nationalIdNumber: profile.nationalIdNumber ?? '',
          })
        }

        const docItems = Array.isArray(docsRaw) ? docsRaw : (docsRaw?.content ?? [])
        if (docItems.length) setDocuments(docItems)

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
  }, [guestId, isLoading])

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
      let fileUrl = 'pending-upload'
      try {
        const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const { signedUrl, publicUrl } = await getAvatarUploadUrl(
          `guest-kyc-docs/${guestId}/${uploadDocType}_${Date.now()}_${safeName}`,
          uploadFile.type || 'application/octet-stream',
        )
        await uploadToGcs(signedUrl, uploadFile)
        fileUrl = publicUrl
      } catch {
        // GCS not configured — store metadata only
      }

      await uploadGuestKycDocument(guestId, {
        documentType: uploadDocType,
        documentName: uploadFile.name,
        fileUrl,
      })
      setUploadSuccess(true)
      setUploadFile(null)

      const [freshDocs, freshProfile] = await Promise.allSettled([
        getGuestKycDocuments(guestId),
        getGuestKycProfile(guestId),
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

  function updateField(field) {
    return (e) => {
      const value = typeof e === 'string' ? e : e.target.value
      setSubmitForm((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmitKyc() {
    if (!submitForm.fullName) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      const nameParts = submitForm.fullName.trim().split(' ')
      await submitGuestKyc(guestId, {
        firstName: nameParts[0] || submitForm.fullName,
        lastName: nameParts.slice(1).join(' ') || '',
        dateOfBirth: submitForm.dateOfBirth || null,
        phoneNumber: submitForm.phoneNumber || null,
        nationality: submitForm.nationality || null,
        nationalIdNumber: submitForm.nationalIdNumber || null,
        country: submitForm.country || null,
        stateProvince: submitForm.stateProvince || null,
      })
      setSubmitSuccess(true)
      const fresh = await getGuestVerificationStatus(guestId).catch(() => null)
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
    <AccountShell
      title="Identity Verification"
      mobileTitle="KYC"
      description="Verify your identity to unlock all booking features and build trust with hosts."
      actions={[{ label: 'Back to account', href: '/account', secondary: true }]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">

          {/* Verification checklist */}
          <SectionCard>
            <div className="flex items-start justify-between gap-4">
              <SectionHeading eyebrow="Checklist" title="Verification items" />
              {overallStatus && (
                <StatusPill tone={tonePill(overallStatus)}>{overallStatus}</StatusPill>
              )}
            </div>

            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Loader2 size={14} className="animate-spin" />
                Loading verification status…
              </div>
            ) : checklist.length === 0 ? (
              <p className="mt-6 text-sm text-muted">
                No documents uploaded yet. Upload a government ID and proof of address below to start verification.
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
                      <StatusPill tone={tonePill(item.status)}>{item.status}</StatusPill>
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
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
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
                      <StatusPill tone={tonePill(doc.verificationStatus ?? doc.status)}>
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
              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Full legal name</label>
                <input
                  type="text"
                  value={submitForm.fullName}
                  onChange={updateField('fullName')}
                  placeholder="As it appears on your government ID"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Date of birth</label>
                <input
                  type="date"
                  value={submitForm.dateOfBirth}
                  onChange={updateField('dateOfBirth')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-gray-500"
                />
              </div>

              <CountrySelect
                label="Nationality"
                value={submitForm.nationality}
                onChange={updateField('nationality')}
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
                  onChange={updateField('stateProvince')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">Phone number <span className="font-normal text-muted">(optional)</span></label>
                <input
                  type="tel"
                  value={submitForm.phoneNumber}
                  onChange={updateField('phoneNumber')}
                  placeholder="+1 555 000 0000"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-gray-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-dark">National ID number <span className="font-normal text-muted">(optional)</span></label>
                <input
                  type="text"
                  value={submitForm.nationalIdNumber}
                  onChange={updateField('nationalIdNumber')}
                  placeholder="Passport, national ID, or driver's license number"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-gray-500"
                />
              </div>

              {verificationStatus?.kycStatus === 'RESUBMIT_REQUESTED' && verificationStatus?.notes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Resubmission requested</p>
                  <p className="mt-1 text-sm text-amber-800">{verificationStatus.notes}</p>
                </div>
              )}

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
    </AccountShell>
  )
}
