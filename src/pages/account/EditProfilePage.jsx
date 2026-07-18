import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, CheckCheck, Loader2, UserRound } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import usePortalViewer from '../../hooks/usePortalViewer'
import { findUserByEmail, getUser, updateUser } from '../../services/usersApi'
import { getAvatarUploadUrl, uploadToGcs } from '../../services/storageApi'
import useAuthStore from '../../stores/useAuthStore'
import { normalizePhoneForStorage, parsePhoneValue } from '../../lib/phone'

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

const COMPLETENESS_FIELD_KEYS = ['preferredName', 'email', 'phone', 'city', 'travelStyle', 'bio']

function computeCompleteness(formState, hasPhoto) {
  const filled = COMPLETENESS_FIELD_KEYS.filter((key) => !!formState[key]?.trim()).length
  const total = COMPLETENESS_FIELD_KEYS.length + 1 // +1 for photo
  return Math.round(((filled + (hasPhoto ? 1 : 0)) / total) * 100)
}

export default function EditProfilePage() {
  const { t } = useTranslation(['account', 'common'])
  const { viewer } = usePortalViewer()
  // Use the auth-store userId directly — avoids a round-trip and race condition
  const storedBackendUserId = useAuthStore((s) => s.backendUserId)
  const updateAvatar = useAuthStore((s) => s.updateAvatar)
  const patchUser = useAuthStore((s) => s.patchUser)

  const [formState, setFormState] = useState({
    preferredName: viewer.preferredName ?? '',
    fullName: viewer.fullName ?? '',
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
        const name = [data.firstName, data.lastName].filter(Boolean).join(' ')
        setFormState((prev) => {
          const parsedPhone = parsePhoneValue(data.phone ?? prev.phone, prev.phoneCountryCode || '+91')
          return {
            ...prev,
            fullName: name || prev.fullName,
            preferredName: data.preferredName ?? data.firstName ?? prev.preferredName,
            email: data.email ?? prev.email,
            phone: parsedPhone.phoneNumber ? `${parsedPhone.countryCode} ${parsedPhone.phoneNumber}`.trim() : '',
            phoneCountryCode: parsedPhone.countryCode,
            city: data.city ?? prev.city,
            timeZone: data.timeZone ?? prev.timeZone,
            // Use ?? so an empty string from DB is still applied (distinguishes "not set" from "cleared")
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

    setUploadingPhoto(true)
    setPhotoError(null)
    setAvatarPreview(URL.createObjectURL(file))

    try {
      const { signedUrl, publicUrl } = await getAvatarUploadUrl(file.name, file.type)
      await uploadToGcs(signedUrl, file)
      await updateAvatar(publicUrl)
      if (storedBackendUserId) {
        await updateUser(storedBackendUserId, { avatarUrl: publicUrl })
      }
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

  const updatePhoneField = (event) => {
    const value = event.target.value
    setSaved(false)
    setFormState((current) => ({
      ...current,
      phone: value,
      phoneCountryCode: current.phoneCountryCode || '+91',
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
      const nameParts = (formState.fullName || '').trim().split(' ')
      const firstName = nameParts[0] ?? ''
      const lastName = nameParts.slice(1).join(' ')
      const normalizedPhone = normalizePhoneForStorage(formState.phone, formState.phoneCountryCode || '+91')
      const payload = {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        preferredName: formState.preferredName || undefined,
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
        firstName,
        lastName: lastName || undefined,
        preferredName: formState.preferredName || undefined,
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
    () => computeCompleteness(formState, hasPhoto),
    [formState, hasPhoto],
  )
  const completenessLabels = useMemo(() => ({
    preferredName: t('account:edit.fieldName'),
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label={t('account:edit.fieldPreferredName')} value={formState.preferredName} onChange={updateField('preferredName')} placeholder={t('account:edit.fieldPreferredNameHint')} />
                <Field label={t('account:edit.fieldFullName')} value={formState.fullName} onChange={updateField('fullName')} placeholder={t('account:edit.fieldFullNameHint')} />
                <Field label={t('account:edit.fieldEmail')} value={formState.email} onChange={updateField('email')} placeholder={t('account:edit.fieldEmailHint')} />
                <Field label={t('account:edit.fieldPhone')} value={formState.phone} onChange={updatePhoneField} placeholder={t('account:edit.fieldPhoneHint')} />
                <Field label={t('account:edit.fieldCity')} value={formState.city} onChange={updateField('city')} placeholder={t('account:edit.fieldCityHint')} />
                <Field label={t('account:edit.fieldTimeZone')} value={formState.timeZone} onChange={updateField('timeZone')} placeholder={t('account:edit.fieldTimeZoneHint')} />
              </div>

              <div className="mt-5 grid gap-5">
                <Field label={t('account:edit.fieldTravelStyle')} value={formState.travelStyle} onChange={updateField('travelStyle')} placeholder={t('account:edit.fieldTravelStyleHint')} />
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
                      {formState.preferredName || <span className="text-muted">Preferred name</span>}
                    </p>
                    <p className="text-sm text-muted">{formState.city || 'City'}</p>
                  </div>
                </div>
                {formState.travelStyle && (
                  <p className="mt-4 text-sm leading-6 text-muted">{formState.travelStyle}</p>
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
