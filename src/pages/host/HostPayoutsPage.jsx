import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getPayoutBalance, getPayoutHistory } from '../../services/payoutsApi'
import useHostContext from '../../hooks/useHostContext'

export default function HostPayoutsPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [payoutNotice, setPayoutNotice] = useState('')

  useEffect(() => {
    if (hostLoading || !hostId) return
    Promise.all([
      getPayoutBalance(hostId).catch(() => null),
      getPayoutHistory(hostId).catch(() => null),
    ]).then(([balanceData, historyData]) => {
      if (balanceData) {
        setSummary({
          available: balanceData.availableBalance ?? balanceData.available ?? '—',
          pending: balanceData.pendingBalance ?? balanceData.pending ?? '—',
          reserveHold: balanceData.reserveBalance ?? balanceData.reserveHold ?? '—',
          nextTransfer: balanceData.nextPayoutDate ?? balanceData.nextTransfer ?? '—',
        })
      }
      const items = historyData?.content ?? (Array.isArray(historyData) ? historyData : null)
      if (items?.length) {
        setHistory(
          items.map((p) => ({
            id: p.id,
            date: p.payoutDate ?? p.createdAt ?? p.date,
            amount: p.amount,
            status: p.status,
            destination: p.bankAccountName ?? p.destination ?? '—',
            note: p.description ?? p.note ?? '',
          })),
        )
      }
    }).finally(() => setLoading(false))
  }, [hostId, hostLoading])

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
        { label: 'Available', value: summary?.available ?? '—', note: 'Ready to transfer' },
        { label: 'Pending', value: summary?.pending ?? '—', note: 'Awaiting stay completion' },
        { label: 'Reserve', value: summary?.reserveHold ?? '—', note: 'Security / damage hold' },
        { label: 'Next transfer', value: summary?.nextTransfer ?? '—', note: 'Projected payout run' },
      ]}
    >
      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Balance"
            title="Manual payout request"
            description="UI-only request control for hosts who want to transfer available balance before the scheduled run."
          />
          <button
            type="button"
            onClick={() => setPayoutNotice('Manual payout request prepared. Backend payout initiation is unchanged.')}
            className="inline-flex items-center justify-center rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Request payout
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Schedule
            </p>
            <p className="mt-2 text-lg font-semibold text-dark">Weekly, every Friday</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Payouts are queued after checkout completion and reserve checks.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Default destination
            </p>
            <p className="mt-2 text-lg font-semibold text-dark">Primary bank account</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Change default payout account from Bank accounts.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Reserve release
            </p>
            <p className="mt-2 text-lg font-semibold text-dark">48h after checkout</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Security holds release when no incident is open.
            </p>
          </div>
        </div>

        {payoutNotice ? (
          <div className="mt-5 rounded-2xl border border-brand/20 bg-rose-50 px-4 py-3 text-sm font-semibold text-brand">
            {payoutNotice}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="History" title="Recent payouts" />

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading payout history…</div>
        )}

        {!loading && history.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-dark">No payouts yet</p>
            <p className="mt-1 text-sm text-muted">Completed payouts will appear here once transfers are initiated.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {history.map((entry) => (
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
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeading
          eyebrow="Tax"
          title="Tax documents"
          description="Placeholder document center for annual host tax forms."
        />

        <div className="mt-6 grid gap-3">
          {[
            ['2026 Form 1099-K', 'Preparing', 'Available after year-end reconciliation'],
            ['2025 Earnings summary', 'Ready', 'Downloadable PDF placeholder'],
            ['Tax profile', 'Needs review', 'Confirm legal name and payout country'],
          ].map(([title, status, note]) => (
            <div
              key={title}
              className="grid gap-3 rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
            >
              <div>
                <p className="text-sm font-semibold text-dark">{title}</p>
                <p className="mt-1 text-sm text-muted">{note}</p>
              </div>
              <StatusPill tone={status === 'Ready' ? 'success' : 'warning'}>{status}</StatusPill>
              <button
                type="button"
                onClick={() => setPayoutNotice(`${title} selected. Document download endpoint is not wired in this UI pass.`)}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
