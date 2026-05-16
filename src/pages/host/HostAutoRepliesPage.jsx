import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { get } from '../../lib/api'
import { hostAutoReplyTemplates } from '../../data/mockHostPortalData'

const HOST_ID = 1

function adaptTemplate(t) {
  return {
    id: t.id,
    title: t.title ?? t.templateName ?? 'Template',
    channel: t.channel ?? t.deliveryChannel ?? 'In-app',
    trigger: t.triggerType ?? t.trigger ?? '—',
    tone: t.category ?? t.tone ?? '—',
    preview: t.templateText ?? t.messagePreview ?? t.preview ?? '',
    performance: t.successRate != null ? `${t.successRate}% success rate` : (t.performance ?? '—'),
    isActive: t.isActive ?? t.active ?? true,
  }
}

export default function HostAutoRepliesPage() {
  const [templates, setTemplates] = useState(hostAutoReplyTemplates)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get(`/api/host/auto-reply/host/${HOST_ID}`)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) setTemplates(items.map(adaptTemplate))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
      stats={[
        { label: 'Templates', value: String(templates.length), note: 'Saved in library' },
        { label: 'Active', value: String(templates.filter((t) => t.isActive !== false).length), note: 'Currently enabled' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Templates" title="Message library" />

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading templates…</div>
        )}

        {!loading && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{template.title}</p>
                      <StatusPill tone="sky">{template.channel}</StatusPill>
                      {template.isActive !== undefined && (
                        <StatusPill tone={template.isActive !== false ? 'success' : 'slate'}>
                          {template.isActive !== false ? 'Active' : 'Inactive'}
                        </StatusPill>
                      )}
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
        )}
      </SectionCard>
    </HostShell>
  )
}
