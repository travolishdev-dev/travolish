import {
  CheckCircle2,
  Compass,
  HeartHandshake,
  IdCard,
  ListChecks,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import usePortalViewer from '../../hooks/usePortalViewer'

export default function AccountPage() {
  const { t } = useTranslation('account')
  const { viewer, isPreview } = usePortalViewer()
  const isVerified = viewer.badges.includes('Identity verified') || isPreview
  const verificationStatus = isVerified ? t('verified') : t('notVerified')
  const completenessItems = [
    Boolean(viewer.fullName),
    Boolean(viewer.email),
    Boolean(viewer.phone),
    Boolean(viewer.bio),
    viewer.preferences.length > 0,
    Boolean(viewer.emergencyContact),
  ]
  const completedItems = completenessItems.filter(Boolean).length
  const profileCompletion = Math.round((completedItems / completenessItems.length) * 100)

  return (
    <AccountShell
      title={t('heading')}
      mobileTitle="Account"
      description={t('desc')}
      actions={[
        { label: t('editProfile'), href: '/account/edit' },
        { label: t('reviewSecurity'), href: '/account/security', secondary: true },
      ]}
    >
      <SectionCard className="hidden md:block">
        <div className="hidden md:block">
          <SectionHeading
            eyebrow={t('snapshot')}
            title={t('snapshotDesc')}
            description="A fast summary of who you are, how you travel, and what usually matters when you book."
          />
        </div>

        <div className="mt-0 md:mt-6">
          <div className="grid gap-0 divide-y divide-gray-200 border-y border-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
            {viewer.stats.map((stat) => (
              <div key={stat.label} className="py-4 md:px-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-dark">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl p-3 ${isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                <IdCard size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {t('idVerification')}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-dark">{verificationStatus}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isVerified
                    ? t('verifiedNote')
                    : t('verifyNote')}
                </p>
                <Link
                  to="/account/security"
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {t('reviewVerification')}
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {t('completeness')}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-dark">{profileCompletion}% {t('complete')}</h2>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                <ListChecks size={22} />
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-dark transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                [t('fields.nameEmail'), viewer.fullName && viewer.email],
                [t('fields.phone'), viewer.phone],
                [t('fields.bio'), viewer.bio],
                [t('fields.travelPrefs'), viewer.preferences.length > 0],
                [t('fields.emergencyContact'), viewer.emergencyContact],
                [t('fields.identity'), isVerified],
              ].map(([label, complete]) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={15} className={complete ? 'text-emerald-700' : 'text-gray-300'} />
                  <span className={complete ? 'text-dark' : 'text-muted'}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SectionCard>
          <SectionHeading
            eyebrow={t('identity')}
            title="Trust signals and account tone"
            description="These badges, labels, and notes shape the first impression hosts see before they even open a chat thread."
          />

          {viewer.badges.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {viewer.badges.map((badge) => (
                <StatusPill key={badge} tone="success">
                  {badge}
                </StatusPill>
              ))}
            </div>
          )}

          {viewer.bio ? (
            <p className="mt-6 text-[15px] leading-7 text-dark">{viewer.bio}</p>
          ) : (
            <p className="mt-6 text-sm text-muted">
              {t('noBio')}{' '}
              <Link to="/account/edit" className="font-medium text-dark underline underline-offset-2">
                {t('addBio')}
              </Link>
            </p>
          )}

          <div className="mt-6 grid gap-0 divide-y divide-gray-200 border-y border-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="py-5 md:px-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                  <Compass size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">{t('travelStyle')}</p>
                  <p className="text-sm text-muted">
                    {viewer.travelStyle ?? t('notConfigured')}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-5 md:px-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <MapPinned size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">Local context</p>
                  <p className="text-sm text-muted">
                    {viewer.city ? `${viewer.city} · ` : ''}{viewer.timeZone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            eyebrow={t('preferences')}
            title="Saved travel defaults"
            description="These choices can prefill checkout and host preferences."
          />

          <div className="mt-6 space-y-3">
            {viewer.preferences.length > 0 ? (
              viewer.preferences.map((preference) => (
                <div
                  key={preference}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3"
                >
                  <div className="mt-0.5 rounded-full bg-dark p-1 text-white">
                    <Sparkles size={12} />
                  </div>
                  <p className="text-sm leading-6 text-dark">{preference}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fcfcfb] px-4 py-6 text-center">
                <p className="text-sm text-muted">{t('noPrefs')}</p>
                <Link
                  to="/account/edit"
                  className="mt-2 inline-block text-sm font-medium text-dark underline underline-offset-2"
                >
                  {t('addPrefs')}
                </Link>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <SectionHeading
            eyebrow={t('savedAddresses')}
            title="Frequent places"
            description="Useful for prefilled billing, traveler details, and upcoming trip planning."
          />

          <div className="mt-6">
            {viewer.savedAddresses.length > 0 ? (
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {viewer.savedAddresses.map((address) => (
                  <div key={address.label} className="py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {address.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-dark">{address.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fcfcfb] px-4 py-6 text-center">
                <p className="text-sm text-muted">{t('noAddresses')}</p>
                <Link
                  to="/account/edit"
                  className="mt-2 inline-block text-sm font-medium text-dark underline underline-offset-2"
                >
                  {t('addAddress')}
                </Link>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            eyebrow="Support"
            title={t('emergency')}
            description="Used by booking and safety flows when an emergency contact is needed."
          />

          <div className="mt-6">
            {viewer.emergencyContact ? (
              <div className="border-y border-gray-200 py-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-dark">
                      {viewer.emergencyContact.name}
                    </p>
                    <p className="text-sm text-muted">
                      {viewer.emergencyContact.relation}
                    </p>
                    <p className="mt-3 text-sm font-medium text-dark">
                      {viewer.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fcfcfb] px-4 py-6 text-center">
                <p className="text-sm text-muted">{t('noEmergency')}</p>
                <Link
                  to="/account/edit"
                  className="mt-2 inline-block text-sm font-medium text-dark underline underline-offset-2"
                >
                  {t('addEmergency')}
                </Link>
              </div>
            )}

            <div className="mt-4 border-t border-dashed border-gray-200 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Government ID and traveler verification can be added from your profile settings.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AccountShell>
  )
}
