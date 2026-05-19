import { useEffect, useState } from 'react'
import { Camera, CheckCheck, Loader2, MapPinned, PencilLine, UserRound } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import usePortalViewer from '../../hooks/usePortalViewer'
import { findUserByEmail, createUser, updateUser } from '../../services/usersApi'

function Field({ label, value, onChange, placeholder, textarea = false }) {
  const Component = textarea ? 'textarea' : 'input'

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <Component
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm ${
          textarea ? 'min-h-[132px] resize-none' : ''
        }`}
      />
    </label>
  )
}

export default function EditProfilePage() {
  const { viewer } = usePortalViewer()
  const [backendUserId, setBackendUserId] = useState(null)
  const [formState, setFormState] = useState({
    preferredName: viewer.preferredName,
    fullName: viewer.fullName,
    email: viewer.email,
    phone: viewer.phone,
    city: viewer.city,
    timeZone: viewer.timeZone,
    travelStyle: viewer.travelStyle,
    bio: viewer.bio,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    const email = viewer.email
    if (!email) return

    const nameParts = viewer.fullName?.trim().split(' ') ?? []
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ')

    findUserByEmail(email)
      .catch(async (err) => {
        if (!err.message?.includes('404')) throw err
        // User doesn't exist in backend yet — create them from auth profile
        return createUser({ firstName, lastName, email, phone: viewer.phone ?? null })
      })
      .then((data) => {
        if (!data) return
        setBackendUserId(data.id)
        const name = [data.firstName, data.lastName].filter(Boolean).join(' ')
        setFormState((prev) => ({
          ...prev,
          fullName: name || prev.fullName,
          preferredName: data.preferredName || data.firstName || prev.preferredName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          city: data.city || prev.city,
          timeZone: data.timeZone || prev.timeZone,
          travelStyle: data.travelStyle || prev.travelStyle,
          bio: data.bio || prev.bio,
        }))
      })
      .catch(() => {})
  }, [viewer.email])

  const updateField = (field) => (event) => {
    setSaved(false)
    setFormState((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSave = async () => {
    if (!backendUserId) {
      setSaveError('User account not found. Please sign in again.')
      return
    }
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const nameParts = formState.fullName.trim().split(' ')
      const firstName = nameParts[0] ?? ''
      const lastName = nameParts.slice(1).join(' ')
      await updateUser(backendUserId, {
        firstName,
        lastName,
        preferredName: formState.preferredName,
        email: formState.email,
        phone: formState.phone,
        city: formState.city,
        timeZone: formState.timeZone,
        travelStyle: formState.travelStyle,
        bio: formState.bio,
      })
      setSaved(true)
    } catch {
      setSaveError('Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccountShell
      title="Edit your traveler profile."
      mobileTitle="Edit profile"
      description="Update your name, email, phone, and travel details."
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: 'Save profile', onClick: handleSave }}
      actions={[
        { label: 'Preview profile', href: '/account', secondary: true },
        { label: 'Save profile', href: '/account' },
      ]}
      accent="from-sky-50 via-white to-rose-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard>
          <SectionHeading
            eyebrow="Profile Details"
            title="Edit the story travelers and hosts see"
            description="Strong spacing, low visual noise, and just enough context to make the preview believable."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field
              label="Preferred name"
              value={formState.preferredName}
              onChange={updateField('preferredName')}
              placeholder="How should hosts greet you?"
            />
            <Field
              label="Full name"
              value={formState.fullName}
              onChange={updateField('fullName')}
              placeholder="Full legal or profile name"
            />
            <Field
              label="Email"
              value={formState.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
            />
            <Field
              label="Phone"
              value={formState.phone}
              onChange={updateField('phone')}
              placeholder="+1 (555) 555-0000"
            />
            <Field
              label="City"
              value={formState.city}
              onChange={updateField('city')}
              placeholder="Austin, Texas"
            />
            <Field
              label="Time zone"
              value={formState.timeZone}
              onChange={updateField('timeZone')}
              placeholder="Central Time"
            />
          </div>

          <div className="mt-5 grid gap-5">
            <Field
              label="Travel style"
              value={formState.travelStyle}
              onChange={updateField('travelStyle')}
              placeholder="A short line about how you travel"
            />
            <Field
              label="About you"
              value={formState.bio}
              onChange={updateField('bio')}
              placeholder="Tell hosts what usually matters most before you arrive"
              textarea
            />
          </div>

          {/* Save bar */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-5 py-4">
            {saved ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCheck size={15} /> Profile saved
              </p>
            ) : saveError ? (
              <p className="text-sm text-red-600">{saveError}</p>
            ) : (
              <p className="text-sm text-muted">Changes are not saved until you click below.</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-dark px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save profile'}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Profile Photo"
              title="Current preview"
              description="The upload action stays mock-only for now."
            />

            <div className="mt-6 flex flex-col items-center text-center">
              <img
                src={viewer.avatar}
                alt={viewer.fullName}
                className="h-32 w-32 rounded-[28px] object-cover shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
              />
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
              >
                <Camera size={16} />
                Replace photo
              </button>
            </div>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <SectionHeading
              eyebrow="Live Preview"
              title="How this profile reads"
              description="Updates as you type."
            />

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-dark">
                      {formState.preferredName}
                    </p>
                    <p className="text-sm text-muted">{formState.city}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {formState.travelStyle}
                </p>
              </div>

              <div className="rounded-[24px] border border-dashed border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                    <MapPinned size={18} />
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    Location, profile completeness, and image upload controls can all connect later without reshaping the card hierarchy here.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <div className="flex items-center justify-between gap-4 rounded-[24px] bg-dark px-5 py-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Profile completeness
                </p>
                <p className="mt-1 text-2xl font-semibold">92%</p>
              </div>
              <StatusPill tone="success">Strong</StatusPill>
            </div>

            <div className="mt-4 space-y-3">
              {[
                'Photo and public intro are ready',
                'Contact details are in place for checkout',
                'A few future trust badges can be appended here',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3"
                >
                  <div className="rounded-full bg-rose-100 p-1.5 text-brand">
                    <PencilLine size={12} />
                  </div>
                  <p className="text-sm leading-6 text-dark">{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AccountShell>
  )
}
