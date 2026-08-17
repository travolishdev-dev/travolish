import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, CheckCheck, ChevronDown, Loader2, UserRound } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import usePortalViewer from '../../hooks/usePortalViewer'
import { findUserByEmail, getUser, updateUser } from '../../services/usersApi'
import { uploadAvatar } from '../../services/storageApi'
import useAuthStore from '../../stores/useAuthStore'
import { normalizePhoneForStorage, parsePhoneValue } from '../../lib/phone'
import { PhoneField } from '../../components/common/PhoneField'
import { TimeZoneField } from '../../components/common/TimeZoneField'

function Field({ label, value, onChange, placeholder, textarea = false }) {
  const Component = textarea ? 'textarea' : 'input'

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <Component
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm ${
          textarea ? 'min-h-[132px] resize-none' : ''
        }`}
      />
    </label>
  )
}

// Predefined travel style options — stored as lowercase English keys in the DB.
// Display labels are resolved via i18n at render time (account:travelStyleOptions.*).
const TRAVEL_STYLE_OPTIONS = [
  'budget', 'luxury', 'business', 'leisure', 'adventure', 'nature', 'family',
]

// A <select> styled to match the existing Field component.
// Unknown/legacy free-text values are silently treated as unset (empty string).
function TravelStyleSelect({ label, value, onChange, placeholder }) {
  const { t } = useTranslation('account')
  // Normalise: if the stored value is not one of our predefined keys, treat as unset
  const safeValue = TRAVEL_STYLE_OPTIONS.includes(value) ? value : ''
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <div className="relative">
        <select
          value={safeValue}
          onChange={(e) => onChange({ target: { value: e.target.value } })}
          className="w-full appearance-none rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
        >
          <option value="" disabled>{placeholder}</option>
          {TRAVEL_STYLE_OPTIONS.map((key) => (
            <option key={key} value={key}>{t(`travelStyleOptions.${key}`)}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <ChevronDown size={15} className="text-muted" />
        </div>
      </div>
    </label>
  )
}

const COMPLETENESS_FIELD_KEYS = ['email', 'phone', 'city', 'travelStyle', 'bio']

function computeCompleteness(formState, nameMode, hasPhoto) {
  const filled = COMPLETENESS_FIELD_KEYS.filter((key) => !!formState[key]?.trim()).length
  // Count the name as filled if any name value is present in the active mode
  const hasName = nameMode === 'nickname'
    ? !!formState.nickname?.trim()
    : !!formState.firstName?.trim()
  const total = COMPLETENESS_FIELD_KEYS.length + 2 // +1 name, +1 photo
  return Math.round(((filled + (hasName ? 1 : 0) + (hasPhoto ? 1 : 0)) / total) * 100)
}

export default function EditProfilePage() {
  const { t } = useTranslation(['account', 'common'])
  const { viewer } = usePortalViewer()
  // Use the auth-store userId directly — avoids a round-trip and race condition
  const storedBackendUserId = useAuthStore((s) => s.backendUserId)
  const updateAvatar = useAuthStore((s) => s.updateAvatar)
  const patchUser = useAuthStore((s) => s.patchUser)

  // Name-entry mode: 'nickname' or 'formal' — detected from loaded backend data
  const [nameMode, setNameMode] = useState('formal')

  const [formState, setFormState] = useState({
    // nickname mode
    nickname: viewer.preferredName ?? '',
    // formal mode
    firstName: '',
    lastName: '',
    // shared
    email: viewer.email ?? '',
    phone: viewer.phone ?? '',
    phoneCountryCode: '+91',
    city: viewer.city ?? '',
    timeZone: viewer.timeZone ?? '',
    travelStyle: viewer.travelStyle ?? '',
    bio: viewer.bio ?? '',
  })
  const [formLoading, setFormLoading] = useState(true)  // disabled until backend data arrives
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const fileInputRef = useRef(null)

  // Load full profile from backend (travelStyle, bio, phone, city, etc.)
  useEffect(() => {
    // Prefer lookup by userId — reliable even if duplicate emails exist in test data.
    // Fall back to email lookup for unauthenticated edge cases.
    if (!storedBackendUserId && !viewer.email) { setFormLoading(false); return }

    const fetch = storedBackendUserId
      ? getUser(storedBackendUserId)
      : findUserByEmail(viewer.email)

    fetch
      .then((data) => {
        if (!data) return
        // Detect the name mode from stored data:
        //   nickname mode  → preferredName is set, firstName is absent
        //   formal mode    → firstName is set (default)
        const hasFirstName = !!data.firstName?.trim()
        const hasPreferred = !!data.preferredName?.trim()
        const detectedMode = (!hasFirstName && hasPreferred) ? 'nickname' : 'formal'
        setNameMode(detectedMode)

        setFormState((prev) => {
          const parsedPhone = parsePhoneValue(data.phone ?? prev.phone, prev.phoneCountryCode || '+91')
          return {
            ...prev,
            nickname: data.preferredName ?? prev.nickname,
            firstName: data.firstName ?? prev.firstName,
            lastName: data.lastName ?? prev.lastName,
            email: data.email ?? prev.email,
            phone: parsedPhone.phoneNumber ? `${parsedPhone.countryCode} ${parsedPhone.phoneNumber}`.trim() : '',
            phoneCountryCode: parsedPhone.countryCode,
            city: data.city ?? prev.city,
            timeZone: data.timeZone ?? prev.timeZone,
            travelStyle: data.travelStyle != null ? data.travelStyle : prev.travelStyle,
            bio: data.bio != null ? data.bio : prev.bio,
          }
        })
      })
      .catch(() => {})
      .finally(() => setFormLoading(false))
  }, [storedBackendUserId, viewer.email])

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) { setPhotoError(t('account:edit.photoTypeError')); return }
    if (file.size > 5 * 1024 * 1024) { setPhotoError(t('account:edit.photoSizeError')); return }
    // userId is required for the upload endpoint — guard early so we don't
    // set a preview that immediately gets cleared on failure.
    if (!storedBackendUserId) { setPhotoError(t('account:edit.photoUploadError')); return }

    setUploadingPhoto(true)
    setPhotoError(null)
    setAvatarPreview(URL.createObjectURL(file))

    try {
      // Single call: uploads the file to R2 via the backend and saves the
      // public URL in user.imageKey — no separate updateUser() call needed.
      const { avatarUrl } = await uploadAvatar(storedBackendUserId, file)
      await updateAvatar(avatarUrl)
    } catch {
      setPhotoError(t('account:edit.photoUploadError'))
      setAvatarPreview(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const updateField = (field) => (event) => {
    setSaved(false)
    setFormState((current) => ({ ...current, [field]: event.target.value }))
  }

  // For controlled components that call onChange(value) directly (not via event)
  const setFieldValue = (field) => (value) => {
    setSaved(false)
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const updatePhoneField = (combined) => {
    setSaved(false)
    const { countryCode } = parsePhoneValue(combined, '+91')
    setFormState((current) => ({
      ...current,
      phone: combined,
      phoneCountryCode: countryCode,
    }))
  }

  const handleSave = async () => {
    if (!storedBackendUserId) {
      setSaveError(t('account:edit.authError'))
      return
    }
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const normalizedPhone = normalizePhoneForStorage(formState.phone, formState.phoneCountryCode || '+91')

      // Build name fields based on active mode
      const nameFields = nameMode === 'nickname'
        ? {
            preferredName: formState.nickname?.trim() || undefined,
            firstName: '',   // clear formal fields when switching to nickname
            lastName: '',
          }
        : {
            firstName: formState.firstName?.trim() || undefined,
            lastName: formState.lastName?.trim() || undefined,
            preferredName: undefined,  // don't overwrite; leave whatever was previously stored
          }

      const payload = {
        ...nameFields,
        email: formState.email || undefined,
        phone: normalizedPhone || undefined,
        city: formState.city || undefined,
        timeZone: formState.timeZone || undefined,
        travelStyle: formState.travelStyle || undefined,
        bio: formState.bio || undefined,
      }
      await updateUser(storedBackendUserId, payload)
      // Sync saved values back into auth store so live preview and viewer reflect them
      patchUser({
        ...nameFields,
        phone: normalizedPhone || undefined,
        city: formState.city || undefined,
        timeZone: formState.timeZone || undefined,
        travelStyle: formState.travelStyle || undefined,
        bio: formState.bio || undefined,
      })
      setSaved(true)
    } catch {
      setSaveError(t('account:edit.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const hasPhoto = !!(avatarPreview || viewer.avatar)
  const completeness = useMemo(
    () => computeCompleteness(formState, nameMode, hasPhoto),
    [formState, nameMode, hasPhoto],
  )
  const completenessLabels = useMemo(() => ({
    email: t('account:edit.fieldEmail'),
    phone: t('account:edit.fieldPhone2'),
    city: t('account:edit.fieldCity'),
    travelStyle: t('account:edit.fieldTravelStyle2'),
    bio: t('account:edit.fieldBio2'),
  }), [t])
  const completenessLabel = completeness >= 80 ? t('account:edit.strong') : completeness >= 50 ? t('account:edit.good') : t('account:edit.needsWork')
  const completenessTone = completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'danger'
  const missingFields = COMPLETENESS_FIELD_KEYS.filter((key) => !formState[key]?.trim()).map((key) => completenessLabels[key])

  const canSave = !formLoading && !!storedBackendUserId

  return (
    <AccountShell
      title={t('account:edit.title')}
      mobileTitle={t('account:edit.mobileTitle')}
      description={t('account:edit.desc')}
      mobileAction={{ label: t('account:edit.saveProfile'), onClick: handleSave }}
      mobileBottomAction={{ label: t('account:edit.saveProfile'), onClick: handleSave }}
      actions={[
        { label: t('account:edit.previewAction'), href: '/account', secondary: true },
        {
          label: saving ? t('account:edit.saving') : t('account:edit.saveProfile'),
          onClick: handleSave,
          disabled: !canSave || saving,
        },
      ]}
      accent="from-sky-50 via-white to-rose-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <SectionCard>
          <SectionHeading
            eyebrow={t('account:edit.sectionEyebrow')}
            title={t('account:edit.sectionTitle')}
            description={t('account:edit.sectionDesc')}
          />

          {formLoading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              {t('account:edit.loading')}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5">
                {/* Name entry — mode toggle */}
                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {t('account:edit.nameMode')}
                  </span>
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setNameMode('nickname')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        nameMode === 'nickname'
                          ? 'bg-white text-dark shadow-sm'
                          : 'text-muted hover:text-dark'
                      }`}
                    >
                      {t('account:edit.nameModeNickname')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNameMode('formal')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        nameMode === 'formal'
                          ? 'bg-white text-dark shadow-sm'
                          : 'text-muted hover:text-dark'
                      }`}
                    >
                      {t('account:edit.nameModeFormal')}
                    </button>
                  </div>

                  {nameMode === 'nickname' ? (
                    <Field
                      label={t('account:edit.fieldNickname')}
                      value={formState.nickname}
                      onChange={updateField('nickname')}
                      placeholder={t('account:edit.fieldNicknameHint')}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label={t('account:edit.fieldFirstName')}
                        value={formState.firstName}
                        onChange={updateField('firstName')}
                        placeholder={t('account:edit.fieldFirstNameHint')}
                      />
                      <Field
                        label={t('account:edit.fieldLastName')}
                        value={formState.lastName}
                        onChange={updateField('lastName')}
                        placeholder={t('account:edit.fieldLastNameHint')}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label={t('account:edit.fieldEmail')} value={formState.email} onChange={updateField('email')} placeholder={t('account:edit.fieldEmailHint')} />
                <PhoneField label={t('account:edit.fieldPhone')} value={formState.phone} onChange={updatePhoneField} placeholder={t('account:edit.fieldPhoneHint')} />
                <Field label={t('account:edit.fieldCity')} value={formState.city} onChange={updateField('city')} placeholder={t('account:edit.fieldCityHint')} />
                <TimeZoneField
                  label={t('account:edit.fieldTimeZone')}
                  value={formState.timeZone}
                  onChange={setFieldValue('timeZone')}
                  detectLabel={t('account:edit.fieldTimeZoneDetect')}
                />
              </div>

              <div className="mt-5 grid gap-5">
                <TravelStyleSelect
                  label={t('account:edit.fieldTravelStyle')}
                  value={formState.travelStyle}
                  onChange={updateField('travelStyle')}
                  placeholder={t('account:edit.travelStylePlaceholder')}
                />
                <Field label={t('account:edit.fieldBio')} value={formState.bio} onChange={updateField('bio')} placeholder={t('account:edit.fieldBioHint')} textarea />
              </div>
            </>
          )}

          {/* Save bar */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-5 py-4">
            {saved ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCheck size={15} /> {t('account:edit.saved')}
              </p>
            ) : saveError ? (
              <p className="text-sm text-red-600">{saveError}</p>
            ) : (
              <p className="text-sm text-muted">
                {formLoading ? t('account:edit.loading') : t('account:edit.unsaved')}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className="inline-flex items-center gap-2 rounded-full bg-dark px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> {t('account:edit.saving')}</> : t('account:edit.saveProfile')}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading eyebrow={t('account:edit.photoEyebrow')} title={t('account:edit.photoTitle')} description={t('account:edit.photoDesc')} />

            <div className="mt-6 flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={avatarPreview || viewer.avatar}
                  alt={viewer.fullName}
                  className="h-32 w-32 rounded-[28px] object-cover shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-black/40">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                <Camera size={16} />
                {uploadingPhoto ? t('account:edit.uploading') : t('account:edit.replacePhoto')}
              </button>

              {photoError && <p className="mt-2 text-xs text-red-500">{photoError}</p>}
            </div>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <SectionHeading
              eyebrow={t('account:edit.previewEyebrow')}
              title={t('account:edit.previewTitle')}
              description={t('account:edit.previewDesc')}
            />

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-dark">
                      {nameMode === 'nickname'
                        ? (formState.nickname || <span className="text-muted">{t('account:edit.fieldNickname')}</span>)
                        : ([formState.firstName, formState.lastName].filter(Boolean).join(' ') || <span className="text-muted">{t('account:edit.fieldFirstName')}</span>)
                      }
                    </p>
                    <p className="text-sm text-muted">{formState.city || 'City'}</p>
                  </div>
                </div>
                {TRAVEL_STYLE_OPTIONS.includes(formState.travelStyle) && (
                  <p className="mt-4 text-sm leading-6 text-muted">
                    {t(`account:travelStyleOptions.${formState.travelStyle}`)}
                  </p>
                )}
                {formState.bio && (
                  <p className="mt-3 text-sm leading-6 text-dark line-clamp-3">{formState.bio}</p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <div className="flex items-center justify-between gap-4 rounded-[24px] bg-dark px-5 py-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  {t('account:edit.completenessEyebrow')}
                </p>
                <p className="mt-1 text-2xl font-semibold">{completeness}%</p>
              </div>
              <StatusPill tone={completenessTone}>{completenessLabel}</StatusPill>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-dark transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>

            {missingFields.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t('account:edit.missingLabel')}</p>
                {missingFields.map((field) => (
                  <div key={field} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <p className="text-sm text-muted">{field}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-emerald-600">
                <CheckCheck size={14} className="mr-1 inline" />
                {t('account:edit.allComplete')}
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </AccountShell>
  )
}
