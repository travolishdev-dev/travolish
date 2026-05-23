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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hostLoading || !hostId) {
      if (!hostLoading) setLoading(false)
      return
    }
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
    </HostShell>
  )
}
