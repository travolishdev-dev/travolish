import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { hostAutoReplyTemplates } from '../../data/mockHostPortalData'

export default function HostAutoRepliesPage() {
  return (
    <HostShell
      eyebrow="Auto replies"
      title="Auto replies"
      mobileTitle="Replies"
      description="Saved guest response templates."
      actions={[
        { label: 'Emergency', href: '/host/emergency', secondary: true },
        { label: 'Listings', href: '/host/listings' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Templates" title="Message library" />

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {hostAutoReplyTemplates.map((template) => (
            <div key={template.id} className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-dark">{template.title}</p>
                    <StatusPill tone="sky">{template.channel}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {template.trigger} · {template.tone}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-dark">{template.preview}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Performance
                  </p>
                  <p className="mt-2 text-lg font-semibold text-dark">{template.performance}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
