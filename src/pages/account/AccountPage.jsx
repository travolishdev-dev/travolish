import {
  Compass,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import {
  profileHighlights,
  previewAccountProfile,
} from '../../data/mockPortalData'
import usePortalViewer from '../../hooks/usePortalViewer'

export default function AccountPage() {
  const { viewer } = usePortalViewer()

  return (
    <AccountShell
      title="Your travel profile."
      mobileTitle="Account"
      description="This is the polished account hub for identity, preferences, and trip context. It is mock-first for now, but structured to connect cleanly to user, payment, notification, and review APIs later."
      actions={[
        { label: 'Edit profile', href: '/account/edit' },
        { label: 'Review security', href: '/account/security', secondary: true },
      ]}
    >
      <SectionCard className="hidden md:block">
        <div className="hidden md:block">
          <SectionHeading
            eyebrow="Profile Snapshot"
            title="Everything hosts need before arrival"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SectionCard>
          <SectionHeading
            eyebrow="Identity"
            title="Trust signals and account tone"
            description="These badges, labels, and notes shape the first impression hosts see before they even open a chat thread."
          />

          <div className="mt-6 flex flex-wrap gap-2">
            {viewer.badges.map((badge) => (
              <StatusPill key={badge} tone="success">
                {badge}
              </StatusPill>
            ))}
          </div>

          <p className="mt-6 text-[15px] leading-7 text-dark">{viewer.bio}</p>

          <div className="mt-6 grid gap-0 divide-y divide-gray-200 border-y border-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="py-5 md:px-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                  <Compass size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark">Travel style</p>
                  <p className="text-sm text-muted">{viewer.travelStyle}</p>
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
                    {viewer.city} · {viewer.timeZone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            eyebrow="Preferences"
            title="Saved travel defaults"
            description="These choices can later prefill checkout and host preferences."
          />

          <div className="mt-6 space-y-3">
            {viewer.preferences.map((preference) => (
              <div
                key={preference}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3"
              >
                <div className="mt-0.5 rounded-full bg-dark p-1 text-white">
                  <Sparkles size={12} />
                </div>
                <p className="text-sm leading-6 text-dark">{preference}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <SectionHeading
            eyebrow="Saved Addresses"
            title="Frequent places"
            description="Useful for prefilled billing, traveler details, and upcoming trip planning."
          />

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {viewer.savedAddresses.map((address) => (
              <div key={address.label} className="py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {address.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-dark">{address.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            eyebrow="Support"
            title="Emergency and recovery contact"
            description="Kept visible here because the future booking and safety flows will reuse it."
          />

          <div className="mt-6 border-y border-gray-200 py-5">
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

          <div className="mt-4 border-t border-dashed border-gray-200 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm leading-6 text-muted">
                Government ID, emergency settings, and traveler verification details
                can slot into this same area later without changing the page
                structure.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard className="hidden md:block">
        <SectionHeading
          eyebrow="Design Notes"
          title="Why this account hub is worth building first"
          description="This mock screen establishes the card, summary, and preference patterns that the rest of the guest-side product can reuse."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {profileHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5"
            >
              <p className="text-lg font-semibold text-dark">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          Preview profile owner: {previewAccountProfile.fullName}
        </p>
      </SectionCard>
    </AccountShell>
  )
}
