import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { hostPayoutHistory, hostPayoutSummary } from '../../data/mockHostPortalData'

export default function HostPayoutsPage() {
  return (
    <HostShell
      eyebrow="Payouts"
      title="Payouts"
      mobileTitle="Payouts"
      description="Available balance and recent transfers."
      actions={[
        { label: 'Bank accounts', href: '/host/bank-accounts', secondary: true },
        { label: 'KYC', href: '/host/kyc' },
      ]}
      stats={[
        { label: 'Available', value: hostPayoutSummary.available, note: 'Ready to transfer' },
        { label: 'Pending', value: hostPayoutSummary.pending, note: 'Awaiting stay completion' },
        { label: 'Reserve', value: hostPayoutSummary.reserveHold, note: 'Security / damage hold' },
        { label: 'Next transfer', value: hostPayoutSummary.nextTransfer, note: 'Projected payout run' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="History" title="Recent payouts" />

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {hostPayoutHistory.map((entry) => (
            <div key={entry.id} className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-dark">{entry.amount}</p>
                    <StatusPill tone={entry.status === 'Paid' ? 'success' : 'warning'}>
                      {entry.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-muted">{entry.date}</p>
                  <p className="mt-3 text-sm leading-6 text-dark">{entry.note}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Destination
                  </p>
                  <p className="mt-2 text-sm font-semibold text-dark">{entry.destination}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
