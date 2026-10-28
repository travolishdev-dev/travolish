import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { getPayoutBalance, getPayoutHistory, requestPayout } from '../../services/payoutsApi'
import { getBankAccounts } from '../../services/bankAccountsApi'
import { formatCurrencyAmount } from '../../lib/currency'
import toast from 'react-hot-toast'
import useHostContext from '../../hooks/useHostContext'

function formatInr(value) {
  if (value === null || value === undefined || value === '—') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return formatCurrencyAmount(n, 'INR')
}

function mapPayoutStatus(status) {
  if (!status) return '—'
  const s = String(status).toUpperCase()
  if (s === 'COMPLETED') return 'Paid'
  if (s === 'PENDING' || s === 'APPROVED' || s === 'PROCESSING') return 'In progress'
  if (s === 'FAILED' || s === 'CANCELLED') return s.charAt(0) + s.slice(1).toLowerCase()
  return status
}

export default function HostPayoutsPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [primaryBankAccountId, setPrimaryBankAccountId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)

  function applyBalance(balanceData) {
    if (!balanceData) return
    setSummary({
      available: balanceData.availableBalance ?? balanceData.available,
      pending: balanceData.pendingBalance ?? balanceData.pending,
      pendingRelease:
        balanceData.pendingReleaseBalance ?? balanceData.pendingRelease ?? balanceData.reserveBalance,
      currency: balanceData.currency ?? 'INR',
      minPayout: balanceData.minPayoutAmount,
      nextTransferDays: balanceData.nextPayoutDaysRemaining,
    })
  }

  useEffect(() => {
    if (hostLoading || !hostId) return
    setLoading(true)
    Promise.all([
      getPayoutBalance(hostId).catch(() => null),
      getPayoutHistory(hostId).catch(() => null),
      getBankAccounts(hostId).catch(() => null),
    ])
      .then(([balanceData, historyData, bankData]) => {
        applyBalance(balanceData)
        const items = historyData?.content ?? (Array.isArray(historyData) ? historyData : null)
        if (items?.length) {
          setHistory(
            items.map((p) => ({
              id: p.id,
              date: p.completedDate ?? p.requestedDate ?? p.payoutDate ?? p.createdAt,
              amount: p.netAmount ?? p.amount,
              status: mapPayoutStatus(p.status ?? p.payoutStatus),
              rawStatus: p.status ?? p.payoutStatus,
              destination: p.bankAccountName ?? p.destination ?? '—',
              note: p.description ?? p.note ?? '',
            })),
          )
        }
        const bankItems = bankData?.content ?? (Array.isArray(bankData) ? bankData : null)
        if (bankItems?.length) {
          const primary = bankItems.find((b) => b.isPrimary) ?? bankItems[0]
          if (primary) setPrimaryBankAccountId(primary.id)
        }
      })
      .finally(() => setLoading(false))
  }, [hostId, hostLoading])

  async function handleRequestPayout() {
    if (!primaryBankAccountId) {
      toast.error('Add a verified bank account before requesting a payout.')
      return
    }
    const availableAmount = Number(summary?.available ?? 0)
    const min = Number(summary?.minPayout ?? 100)
    if (availableAmount < min) {
      toast.error(`Minimum payout is ${formatInr(min)}.`)
      return
    }
    if (availableAmount <= 0) {
      toast.error('No available balance to transfer.')
      return
    }
    setRequesting(true)
    try {
      await requestPayout({
        bankAccountId: primaryBankAccountId,
        amount: availableAmount,
        description: 'Manual payout request',
      })
      toast.success('Payout request submitted. An admin will review before transfer.')
      const updated = await getPayoutBalance(hostId).catch(() => null)
      applyBalance(updated)
    } catch (err) {
      const msg = err?.message?.includes('400')
        ? 'Payout request failed — ensure your bank account is verified and balance is available.'
        : 'Payout request failed. Please try again.'
      toast.error(msg)
    } finally {
      setRequesting(false)
    }
  }

  const minNote =
    summary?.minPayout != null
      ? `Minimum transfer ${formatInr(summary.minPayout)}`
      : 'Minimum transfer ₹100'

  return (
    <HostShell
      eyebrow="Payouts"
      title="Payouts"
      mobileTitle="Payouts"
      description="Available balance and recent transfers (INR)."
      actions={[
        { label: 'Bank accounts', href: '/host/bank-accounts', secondary: true },
        { label: 'KYC', href: '/host/kyc' },
      ]}
      stats={[
        { label: 'Available', value: formatInr(summary?.available), note: 'Ready to transfer' },
        {
          label: 'Pending release',
          value: formatInr(summary?.pendingRelease),
          note: 'After guest check-out',
        },
        { label: 'In payout', value: formatInr(summary?.pending), note: 'Awaiting admin / bank' },
        {
          label: 'Next cycle',
          value: summary?.nextTransferDays != null ? `${summary.nextTransferDays}d` : '—',
          note: 'Since last completed payout',
        },
      ]}
    >
      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Balance"
            title="Manual payout request"
            description={`Transfer your available balance to your primary bank account via IMPS/NEFT. ${minNote}.`}
          />
          <button
            type="button"
            onClick={handleRequestPayout}
            disabled={requesting}
            className="inline-flex items-center justify-center rounded-2xl bg-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {requesting ? 'Requesting…' : 'Request payout'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Earnings timing
            </p>
            <p className="mt-2 text-lg font-semibold text-dark">After check-out</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Lodging earnings move to available once the stay has ended.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Default destination
            </p>
            <p className="mt-2 text-lg font-semibold text-dark">Primary bank account</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Must be verified; linked to Razorpay X for transfers.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Admin review
            </p>
            <p className="mt-2 text-lg font-semibold text-dark">Approve then process</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Payouts are not sent automatically; ops approves each request.
            </p>
          </div>
        </div>
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
                      <p className="text-lg font-semibold text-dark">{formatInr(entry.amount)}</p>
                      <StatusPill tone={entry.rawStatus === 'COMPLETED' ? 'success' : 'warning'}>
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
