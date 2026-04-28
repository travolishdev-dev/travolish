import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { hostKycChecklist, hostKycTimeline } from '../../data/mockHostPortalData'

export default function HostKycPage() {
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
      mobileAction={{ label: 'Upload', href: '/host/kyc' }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard>
          <SectionHeading eyebrow="Checklist" title="Verification items" />

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {hostKycChecklist.map((item) => (
              <div key={item.id} className="py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-dark">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                  </div>
                  <StatusPill
                    tone={
                      item.status === 'Approved'
                        ? 'success'
                        : item.status === 'In review'
                          ? 'sky'
                          : 'warning'
                    }
                  >
                    {item.status}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow="Timeline" title="Verification path" />

          <div className="mt-6 space-y-4">
            {hostKycTimeline.map((item, index) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-dark" />
                  {index < hostKycTimeline.length - 1 ? (
                    <div className="mt-2 h-full w-px bg-gray-200" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-dark">{item.label}</p>
                  <p className="text-sm text-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </HostShell>
  )
}
