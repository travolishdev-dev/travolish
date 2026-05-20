import { useEffect, useMemo, useState } from 'react'
import { Download, ReceiptText, RotateCcw, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { listBookings } from '../../services/bookingsApi'
import { getReceipt } from '../../services/paymentsApi'
import usePortalViewer from '../../hooks/usePortalViewer'

const STATUS_TONE = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'warning',
  COMPLETED: 'success',
}

function fmt(d) {
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

function adaptBooking(b) {
  const cancelled = b.status === 'CANCELLED'
  return {
    id: b.id,
    type: cancelled ? 'Booking Cancelled' : 'Hotel Booking',
    direction: cancelled ? 'credit' : 'debit',
    status: b.status,
    note: `Booking #${b.id} · Room ${b.roomId}`,
    date: fmt(b.checkInDate),
    method: 'Card on file',
    amount: `$${Number(b.totalPrice ?? 0).toFixed(2)}`,
    rawAmount: Number(b.totalPrice ?? 0),
  }
}

export default function TransactionsPage() {
  const { viewer } = usePortalViewer()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [receiptError, setReceiptError] = useState(null)

  useEffect(() => {
    listBookings(viewer.email || undefined)
      .then((data) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [viewer.email])

  const handleReceipt = async (bookingId) => {
    setReceiptError(null)
    try {
      const receipt = await getReceipt(bookingId)
      if (receipt.pdfUrl) {
        window.open(receipt.pdfUrl, '_blank')
      } else if (receipt.htmlUrl) {
        window.open(receipt.htmlUrl, '_blank')
      } else {
        setReceiptError(`Receipt #${receipt.receiptNumber ?? bookingId} — no PDF available yet.`)
      }
    } catch {
      setReceiptError('Receipt not available for this booking.')
    }
  }

  const transactions = useMemo(() => bookings.map(adaptBooking), [bookings])

  const visible = useMemo(() => {
    if (!query.trim()) return transactions
    const q = query.toLowerCase()
    return transactions.filter(
      (t) => t.note.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.date.toLowerCase().includes(q)
    )
  }, [transactions, query])

  const summary = useMemo(() => {
    const spent = transactions.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.rawAmount, 0)
    const refunds = transactions.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.rawAmount, 0)
    return [
      { label: 'Total spent', value: `$${spent.toFixed(2)}` },
      { label: 'Total bookings', value: String(transactions.length) },
      { label: 'Refunds / credits', value: refunds > 0 ? `$${refunds.toFixed(2)}` : '$0.00' },
    ]
  }, [transactions])

  return (
    <AccountShell
      title="Payments, refunds, and receipts."
      mobileTitle="Activity"
      description="Your full booking payment history."
      actions={[
        { label: 'Manage cards', href: '/account/payments', secondary: true },
      ]}
      accent="from-amber-50 via-white to-slate-100"
    >
      {/* Summary */}
      <SectionCard className="hidden md:block">
        <SectionHeading
          eyebrow="Summary"
          title="This year at a glance"
          description="A quick ledger overview so you can understand spend and credits without scrolling through every row."
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
            eyebrow="Ledger"
            title="Payment history"
            description="All your booking transactions in one place."
          />
          <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-3">
            <label className="relative min-w-0 flex-1 lg:flex-none">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by booking or date"
                className="w-full rounded-full border border-gray-200 bg-[#fcfcfb] py-3 pl-11 pr-4 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
              />
            </label>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading transactions…</div>
        )}

        {receiptError && (
          <p className="mt-4 text-sm text-red-600">{receiptError}</p>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            {query ? 'No transactions match your search.' : 'No transactions yet.'}
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {visible.map((t) => (
              <div key={t.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl p-3 ${t.direction === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {t.direction === 'credit' ? <RotateCcw size={18} /> : <ReceiptText size={18} />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-dark">{t.type}</p>
                        <StatusPill tone={STATUS_TONE[t.status] ?? 'slate'}>{t.status}</StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-muted">{t.note}</p>
                      <p className="mt-3 text-sm text-muted">{t.date} · {t.method}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className={`text-2xl font-semibold tracking-tight ${t.direction === 'credit' ? 'text-emerald-700' : 'text-dark'}`}>
                      {t.direction === 'credit' ? '+' : '-'}{t.amount}
                    </p>
                    <div className="grid w-full gap-2 sm:flex sm:w-auto sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                        onClick={() => handleReceipt(t.id)}
                      >
                        <Download size={14} />
                        Receipt
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
