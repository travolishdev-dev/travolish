import { useEffect, useMemo, useState } from 'react'
import { Download, ReceiptText, RotateCcw, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { listBookings } from '../../services/bookingsApi'
import { printReceipt } from '../../lib/receiptPrinter'
import usePortalViewer from '../../hooks/usePortalViewer'
import useAuthStore from '../../stores/useAuthStore'
import useCurrency from '../../hooks/useCurrency'

const STATUS_TONE = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'warning',
  COMPLETED: 'success',
}

function fmt(d) {
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

function adaptBooking(b, t) {
  const cancelled = b.status === 'CANCELLED'
  return {
    id: b.id,
    type: cancelled ? t('account:transactions.bookingCancelled') : t('account:transactions.hotelBooking'),
    direction: cancelled ? 'credit' : 'debit',
    status: b.status,
    note: `Booking #${b.id} · Room ${b.roomId}`,
    date: fmt(b.checkInDate),
    method: t('account:transactions.cardOnFile'),
    rawAmount: Number(b.totalPrice ?? 0),
  }
}

export default function TransactionsPage() {
  const { t } = useTranslation('account')
  const { viewer } = usePortalViewer()
  const backendUserId = useAuthStore((s) => s.backendUserId)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [receiptError, setReceiptError] = useState(null)
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    const queries = []
    if (backendUserId)   queries.push(listBookings({ userId: backendUserId }))
    if (viewer.email)    queries.push(listBookings({ guestEmail: viewer.email }))
    if (queries.length === 0) { setLoading(false); return }
    Promise.all(queries)
      .then((results) => {
        const seen = new Set()
        const all = results.flat().filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true })
        setBookings(all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [backendUserId, viewer.email])

  const handleReceipt = (bookingId) => {
    setReceiptError(null)
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      printReceipt(booking, { id: booking.hotelId }, formatCurrency)
    } else {
      setReceiptError(t('account:transactions.receiptError'))
    }
  }

  const transactions = useMemo(
    () =>
      bookings.map((b) => adaptBooking(b, t)).map((txn) => ({
        ...txn,
        amount: formatCurrency(txn.rawAmount),
      })),
    [bookings, formatCurrency, t],
  )

  const visible = useMemo(() => {
    if (!query.trim()) return transactions
    const q = query.toLowerCase()
    return transactions.filter(
      (txn) => txn.note.toLowerCase().includes(q) || txn.type.toLowerCase().includes(q) || txn.date.toLowerCase().includes(q)
    )
  }, [transactions, query])

  const summary = useMemo(() => {
    const spent = transactions.filter((txn) => txn.direction === 'debit').reduce((s, txn) => s + txn.rawAmount, 0)
    const refunds = transactions.filter((txn) => txn.direction === 'credit').reduce((s, txn) => s + txn.rawAmount, 0)
    return [
      { label: t('account:transactions.totalSpent'), value: formatCurrency(spent) },
      { label: t('account:transactions.totalBookings'), value: String(transactions.length) },
      { label: t('account:transactions.refunds'), value: refunds > 0 ? formatCurrency(refunds) : formatCurrency(0) },
    ]
  }, [formatCurrency, transactions, t])

  return (
    <AccountShell
      title={t('account:transactions.title')}
      mobileTitle={t('account:transactions.mobileTitle')}
      description={t('account:transactions.desc')}
      actions={[
        { label: t('account:transactions.manageCards'), href: '/account/payments', secondary: true },
      ]}
      accent="from-amber-50 via-white to-slate-100"
    >
      {/* Summary */}
      <SectionCard className="hidden md:block">
        <SectionHeading
          eyebrow={t('account:transactions.summaryEyebrow')}
          title={t('account:transactions.summaryTitle')}
          description={t('account:transactions.summaryDesc')}
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-dark">{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Ledger */}
      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={t('account:transactions.ledgerEyebrow')}
            title={t('account:transactions.ledgerTitle')}
            description={t('account:transactions.ledgerDesc')}
          />
          <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-3">
            <label className="relative min-w-0 flex-1 lg:flex-none">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('account:transactions.searchPlaceholder')}
                className="w-full rounded-full border border-gray-200 bg-[#fcfcfb] py-3 pl-11 pr-4 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
              />
            </label>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-muted">{t('account:transactions.loading')}</div>
        )}

        {receiptError && (
          <p className="mt-4 text-sm text-red-600">{receiptError}</p>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            {query ? t('account:transactions.noResults') : t('account:transactions.noTransactions')}
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {visible.map((txn) => (
              <div key={txn.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl p-3 ${txn.direction === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {txn.direction === 'credit' ? <RotateCcw size={18} /> : <ReceiptText size={18} />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-dark">{txn.type}</p>
                        <StatusPill tone={STATUS_TONE[txn.status] ?? 'slate'}>{txn.status}</StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-muted">{txn.note}</p>
                      <p className="mt-3 text-sm text-muted">{txn.date} · {txn.method}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className={`text-2xl font-semibold tracking-tight ${txn.direction === 'credit' ? 'text-emerald-700' : 'text-dark'}`}>
                      {txn.direction === 'credit' ? '+' : '-'}{txn.amount}
                    </p>
                    <div className="grid w-full gap-2 sm:flex sm:w-auto sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                        onClick={() => handleReceipt(txn.id)}
                      >
                        <Download size={14} />
                        {t('account:transactions.receipt')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AccountShell>
  )
}
