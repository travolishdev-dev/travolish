import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  FileText,
  Info,
  Loader2,
} from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostSelect } from '../../components/host/HostFormFields'
import CountrySelect from '../../components/common/CountrySelect'
import { getTaxProfile, updateTaxProfile, getTaxDocuments } from '../../services/taxApi'
import useHostContext from '../../hooks/useHostContext'

// ── Country-aware tax configuration ──────────────────────────────────────────

const EU_COUNTRIES = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
  'IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
]

const TAX_ID_TYPES_BY_COUNTRY = {
  IN: [
    { value: 'PAN',   label: 'PAN (Permanent Account Number)' },
    { value: 'GSTIN', label: 'GSTIN (GST Registration Number)' },
  ],
  US: [
    { value: 'SSN',  label: 'SSN (Social Security Number)' },
    { value: 'EIN',  label: 'EIN (Employer Identification Number)' },
    { value: 'ITIN', label: 'ITIN (Individual Taxpayer ID Number)' },
  ],
  GB: [
    { value: 'UTR',  label: 'UTR (Unique Taxpayer Reference)' },
    { value: 'NINO', label: 'NINO (National Insurance Number)' },
  ],
  AU: [
    { value: 'TFN', label: 'TFN (Tax File Number)' },
    { value: 'ABN', label: 'ABN (Australian Business Number)' },
  ],
  AE: [
    { value: 'TRN', label: 'TRN (Tax Registration Number)' },
  ],
  CA: [
    { value: 'SIN', label: 'SIN (Social Insurance Number)' },
    { value: 'BN',  label: 'BN (Business Number)' },
  ],
  SG: [
    { value: 'NRIC', label: 'NRIC / FIN (National Registration ID)' },
    { value: 'UEN',  label: 'UEN (Unique Entity Number)' },
  ],
  NZ: [
    { value: 'IRD', label: 'IRD Number (Inland Revenue)' },
  ],
  DE: [
    { value: 'STEUERNUMMER', label: 'Steuernummer (Tax Number)' },
    { value: 'UST_ID',       label: 'Ust-IdNr. (VAT Identification Number)' },
  ],
  FR: [
    { value: 'SIRET',       label: 'SIRET / SIREN' },
    { value: 'NUMERO_TVA',  label: 'Numéro de TVA Intracommunautaire' },
  ],
}

function getTaxIdTypes(countryCode) {
  if (TAX_ID_TYPES_BY_COUNTRY[countryCode]) return TAX_ID_TYPES_BY_COUNTRY[countryCode]
  if (EU_COUNTRIES.includes(countryCode)) {
    return [
      { value: 'TIN', label: 'TIN (Tax Identification Number)' },
      { value: 'VAT', label: 'VAT Registration Number' },
    ]
  }
  return [
    { value: 'TIN', label: 'TIN (Tax Identification Number)' },
    { value: 'OTHER', label: 'Other national tax ID' },
  ]
}

const TAX_AUTHORITY_BY_COUNTRY = {
  IN: 'Income Tax Department (CBDT)',
  US: 'Internal Revenue Service (IRS)',
  GB: 'HM Revenue & Customs (HMRC)',
  AU: 'Australian Taxation Office (ATO)',
  AE: 'Federal Tax Authority (FTA)',
  CA: 'Canada Revenue Agency (CRA)',
  SG: 'Inland Revenue Authority of Singapore (IRAS)',
  NZ: 'Inland Revenue (IR)',
  DE: 'Bundeszentralamt für Steuern (BZSt)',
  FR: 'Direction Générale des Finances Publiques (DGFiP)',
  JP: 'National Tax Agency (NTA)',
  ZA: 'South African Revenue Service (SARS)',
}

function getTaxAuthority(countryCode) {
  if (TAX_AUTHORITY_BY_COUNTRY[countryCode]) return TAX_AUTHORITY_BY_COUNTRY[countryCode]
  if (EU_COUNTRIES.includes(countryCode)) return 'national tax authority (per DAC7 directive)'
  return 'local tax authority'
}

// ── Document builder — generates placeholder docs when backend has none ───────

const CURRENT_YEAR = new Date().getFullYear()

function getOfficialFormLabel(countryCode, year) {
  if (countryCode === 'US') return `${year} Form 1099-K`
  if (countryCode === 'IN') return `${year} Form 16A (TDS Certificate)`
  if (countryCode === 'AU') return `${year} SERR Report`
  if (countryCode === 'GB') return `${year} Earnings Summary (HMRC)`
  if (EU_COUNTRIES.includes(countryCode)) return `${year} DAC7 Report`
  return `${year} Annual Earnings Report`
}

function getOfficialFormDescription(countryCode, isCurrent) {
  if (isCurrent) return 'Available after year-end reconciliation'
  if (countryCode === 'US') return 'Filed with the IRS. Copy available for download.'
  if (countryCode === 'IN') return 'TDS deducted and deposited with the Income Tax Department.'
  if (countryCode === 'AU') return 'Report filed with the Australian Taxation Office (ATO).'
  if (EU_COUNTRIES.includes(countryCode)) return 'Platform income reported per EU DAC7 directive.'
  return 'Downloadable for local tax authority submission'
}

function buildDocuments(countryCode, backendDocs) {
  if (Array.isArray(backendDocs) && backendDocs.length) return backendDocs
  return [
    {
      id: `official-${CURRENT_YEAR}`,
      title: getOfficialFormLabel(countryCode || 'US', CURRENT_YEAR),
      description: getOfficialFormDescription(countryCode, true),
      status: 'PREPARING',
      year: CURRENT_YEAR,
      type: 'OFFICIAL_FORM',
    },
    {
      id: `earnings-${CURRENT_YEAR - 1}`,
      title: `${CURRENT_YEAR - 1} Earnings summary`,
      description: 'Downloadable PDF of annual host earnings and payout breakdown',
      status: 'READY',
      year: CURRENT_YEAR - 1,
      type: 'EARNINGS_SUMMARY',
    },
  ]
}

// ── Status → pill config ──────────────────────────────────────────────────────

const STATUS_CFG = {
  PREPARING:    { tone: 'warning', label: 'Preparing' },
  READY:        { tone: 'success', label: 'Ready' },
  NEEDS_REVIEW: { tone: 'warning', label: 'Needs review' },
  NOT_STARTED:  { tone: 'warning', label: 'Not started' },
  PENDING:      { tone: 'sky',     label: 'Pending verification' },
  VERIFIED:     { tone: 'success', label: 'Verified' },
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ENTITY_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual / Sole proprietor' },
  { value: 'BUSINESS',   label: 'Business / Company' },
]

const CURRENCIES = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'NZD', label: 'NZD — New Zealand Dollar' },
  { value: 'ZAR', label: 'ZAR — South African Rand' },
]

const EMPTY_PROFILE = {
  entityType:      'INDIVIDUAL',
  legalName:       '',
  countryCode:     '',
  taxIdType:       '',
  taxIdNumber:     '',
  payoutCurrency:  'USD',
  vatRegistered:   false,
  vatNumber:       '',
}

// ── Global compliance breakdown ───────────────────────────────────────────────

const COMPLIANCE_GRID = [
  { flag: '🇮🇳', country: 'India',          rule: 'TDS deducted at source on payouts. Form 16A (TDS Certificate) generated annually.' },
  { flag: '🇺🇸', country: 'United States',   rule: 'Form 1099-K filed with IRS for hosts earning over $600/year.' },
  { flag: '🇪🇺', country: 'European Union',  rule: 'DAC7 directive — platform income reported to each member-state tax authority.' },
  { flag: '🇦🇺', country: 'Australia',       rule: 'SERR reports filed with ATO under Sharing Economy Reporting Regime.' },
  { flag: '🇬🇧', country: 'United Kingdom',  rule: 'Annual earnings summaries provided for HMRC self-assessment filing.' },
  { flag: '🌍', country: 'All others',       rule: 'Annual earnings PDF available for submission to your local tax authority.' },
]

// ── Tax ID placeholder by type ────────────────────────────────────────────────

const TAX_ID_PLACEHOLDERS = {
  PAN:          'ABCDE1234F',
  SSN:          'XXX-XX-XXXX',
  EIN:          'XX-XXXXXXX',
  UTR:          '1234567890',
  TFN:          '123 456 789',
  ABN:          '12 345 678 901',
  TRN:          '100123456700003',
  SIN:          '123-456-789',
  IRD:          '123-456-789',
  STEUERNUMMER: '12/345/67890',
}

function getTaxIdPlaceholder(type) {
  return TAX_ID_PLACEHOLDERS[type] ?? 'Enter your tax ID number'
}

// ── Page component ────────────────────────────────────────────────────────────

export default function HostTaxDocumentsPage() {
  const { hostId, loading: hostLoading } = useHostContext()

  const [documents, setDocuments] = useState([])
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [profileStatus, setProfileStatus] = useState('NEEDS_REVIEW')
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    if (hostLoading || !hostId) return
    Promise.all([
      getTaxProfile(hostId).catch(() => null),
      getTaxDocuments(hostId).catch(() => null),
    ]).then(([profileData, docsData]) => {
      if (profileData) {
        setProfile((prev) => ({ ...prev, ...profileData }))
        setProfileStatus(
          profileData.verificationStatus ??
          (profileData.legalName?.trim() ? 'PENDING' : 'NEEDS_REVIEW')
        )
      }
      const country = profileData?.countryCode ?? ''
      setDocuments(buildDocuments(country, docsData))
    }).finally(() => setLoading(false))
  }, [hostId, hostLoading])

  function handleCountryChange(val) {
    const types = getTaxIdTypes(val)
    setProfile((prev) => ({
      ...prev,
      countryCode: val,
      taxIdType: types[0]?.value ?? '',
    }))
  }

  async function handleSaveProfile() {
    if (!profile.legalName.trim() || !profile.countryCode || !profile.taxIdType || !profile.taxIdNumber.trim()) {
      setProfileError('Please fill in all required fields.')
      return
    }
    setProfileSaving(true)
    setProfileError('')
    try {
      await updateTaxProfile({ ...profile, hostId })
      setProfileStatus('PENDING')
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 4000)
      setProfileOpen(false)
      setDocuments(buildDocuments(profile.countryCode, null))
    } catch {
      setProfileError('Failed to save. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleDownload(doc) {
    if (doc.status !== 'READY') return
    setDownloadingId(doc.id)
    try {
      const res = await fetch(`/api/tax/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('travolish_access') ?? ''}` },
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.title.replace(/\s+/g, '_')}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // Silently handle — backend placeholder not yet live
    } finally {
      setDownloadingId(null)
    }
  }

  const taxIdOptions = getTaxIdTypes(profile.countryCode)
  const authority = getTaxAuthority(profile.countryCode)
  const needsVat =
    EU_COUNTRIES.includes(profile.countryCode) ||
    profile.countryCode === 'AE' ||
    (profile.countryCode === 'IN' && profile.entityType === 'BUSINESS')
  const profileStatusCfg = STATUS_CFG[profileStatus] ?? STATUS_CFG.NEEDS_REVIEW

  const profileRowDescription =
    profileStatus === 'VERIFIED'   ? `${profile.legalName} · ${profile.countryCode}`
    : profileStatus === 'PENDING'  ? 'Submitted — under verification'
    : 'Confirm legal name and payout country'

  return (
    <HostShell
      eyebrow="Tax"
      title="Tax documents"
      description="Annual tax forms, earnings summaries, and your tax profile — all in one place."
    >
      {/* ── Documents + profile card ───────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading
          eyebrow="Documents"
          title="Your tax documents"
          description={`${CURRENT_YEAR} forms are prepared after year-end reconciliation. Prior-year documents are available for download.`}
        />

        <div className="mt-2">
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Loading documents…
            </div>
          ) : (
            <>
              {/* Document rows */}
              {documents.map((doc) => {
                const cfg = STATUS_CFG[doc.status] ?? STATUS_CFG.PREPARING
                const isDownloading = downloadingId === doc.id
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-0"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <FileText size={17} className="mt-0.5 shrink-0 text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-dark">{doc.title}</p>
                        <p className="mt-0.5 text-sm text-muted">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusPill tone={cfg.tone}>{cfg.label}</StatusPill>
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        disabled={doc.status !== 'READY' || isDownloading}
                        className="inline-flex h-8 min-w-[4.5rem] items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:cursor-default disabled:opacity-50"
                      >
                        {isDownloading
                          ? <Loader2 size={13} className="animate-spin" />
                          : doc.status === 'READY' ? 'Download' : 'View'}
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Tax profile row */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText size={17} className="mt-0.5 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-dark">Tax profile</p>
                    <p className="mt-0.5 text-sm text-muted">{profileRowDescription}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill tone={profileStatusCfg.tone}>{profileStatusCfg.label}</StatusPill>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="inline-flex h-8 min-w-[4.5rem] items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                  >
                    {profileOpen ? 'Close' : 'View'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* ── Inline Tax Profile editor ─────────────────────────────────────── */}
      {profileOpen && (
        <SectionCard>
          <SectionHeading
            eyebrow="Tax Profile"
            title="Legal & tax identity"
            description="Required for generating your tax documents. All data is encrypted and never shared with guests."
          />

          {profileSaved && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-700">
                Tax profile saved. Your details are under verification.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            {/* Entity type */}
            <div>
              <p className="mb-2.5 text-sm font-semibold text-dark">Entity type</p>
              <div className="grid grid-cols-2 gap-3">
                {ENTITY_TYPES.map((et) => (
                  <label
                    key={et.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition-colors ${
                      profile.entityType === et.value
                        ? 'border-dark bg-gray-50 font-semibold text-dark'
                        : 'border-gray-200 text-muted hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="entityType"
                      value={et.value}
                      checked={profile.entityType === et.value}
                      onChange={() => setProfile((prev) => ({ ...prev, entityType: et.value }))}
                      className="accent-dark"
                    />
                    {et.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Legal name */}
            <HostField
              label="Legal name *"
              value={profile.legalName}
              onChange={(e) => setProfile((prev) => ({ ...prev, legalName: e.target.value }))}
              placeholder={
                profile.entityType === 'BUSINESS'
                  ? 'e.g., Sharma Hotels Pvt. Ltd.'
                  : 'e.g., Rajiv Kumar Sharma'
              }
            />

            {/* Country + currency */}
            <div className="grid gap-4 sm:grid-cols-2">
              <CountrySelect
                label="Country of tax residence *"
                value={profile.countryCode}
                onChange={handleCountryChange}
                placeholder="Select country"
              />
              <HostSelect
                label="Payout currency"
                value={profile.payoutCurrency}
                onChange={(e) => setProfile((prev) => ({ ...prev, payoutCurrency: e.target.value }))}
                options={CURRENCIES}
              />
            </div>

            {/* Tax ID type + number */}
            {profile.countryCode && (
              <div className="grid gap-4 sm:grid-cols-2">
                <HostSelect
                  label="Tax ID type *"
                  value={profile.taxIdType}
                  onChange={(e) => setProfile((prev) => ({ ...prev, taxIdType: e.target.value }))}
                  options={taxIdOptions}
                />
                <HostField
                  label="Tax ID number *"
                  value={profile.taxIdNumber}
                  onChange={(e) => setProfile((prev) => ({ ...prev, taxIdNumber: e.target.value }))}
                  placeholder={getTaxIdPlaceholder(profile.taxIdType)}
                />
              </div>
            )}

            {/* VAT / GST registration (EU, UAE, India businesses) */}
            {needsVat && (
              <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={profile.vatRegistered}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, vatRegistered: e.target.checked }))
                    }
                    className="h-4 w-4 accent-dark"
                  />
                  <span className="text-sm font-semibold text-dark">
                    {profile.countryCode === 'IN' ? 'GST registered' : 'VAT registered'}
                  </span>
                </label>
                {profile.vatRegistered && (
                  <div className="mt-4">
                    <HostField
                      label={profile.countryCode === 'IN' ? 'GSTIN' : 'VAT registration number'}
                      value={profile.vatNumber}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, vatNumber: e.target.value }))
                      }
                      placeholder={
                        profile.countryCode === 'IN' ? '27AAPFU0939F1ZV' : 'DE123456789'
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tax authority info banner */}
            {profile.countryCode && (
              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
                <p className="text-sm leading-6 text-blue-700">
                  For {profile.countryCode} residents, Travolish reports payout data to the{' '}
                  <span className="font-semibold">{authority}</span>. Your tax ID is used
                  exclusively for compliance filings — it is never visible to guests.
                </p>
              </div>
            )}

            {profileError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {profileError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="inline-flex items-center gap-2 rounded-2xl bg-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {profileSaving && <Loader2 size={13} className="animate-spin" />}
                {profileSaving ? 'Saving…' : 'Save tax profile'}
              </button>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); setProfileError('') }}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Global compliance breakdown ───────────────────────────────────── */}
      <SectionCard>
        <SectionHeading
          eyebrow="Compliance"
          title="How Travolish handles global tax reporting"
          description="Platform obligations differ by jurisdiction. Travolish automatically files the right report in the right format."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPLIANCE_GRID.map((item) => (
            <div
              key={item.country}
              className="rounded-2xl border border-gray-100 bg-[#fcfbf8] p-4"
            >
              <p className="text-sm font-semibold text-dark">
                {item.flag} {item.country}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted">{item.rule}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted">
          Tax laws change frequently. Always confirm your obligations with a qualified tax advisor
          in your jurisdiction. Travolish is not a tax advisor and this page does not constitute
          tax advice.
        </p>
      </SectionCard>
    </HostShell>
  )
}
