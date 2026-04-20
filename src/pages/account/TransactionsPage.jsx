import { Download, ReceiptText, RotateCcw, Search } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { paymentTransactions, transactionSummary } from '../../data/mockPortalData'

export default function TransactionsPage() {
  return (
    <AccountShell
      title="Payments, refunds, and receipts."
      mobileTitle="Activity"
      description="This page is ready for payment history and receipt endpoints later. For now it gives you the full mock UI and hierarchy for a premium transaction center."
      actions={[
        { label: 'Manage cards', href: '/account/payments', secondary: true },
        { label: 'Download summary', href: '/account/transactions' },
      ]}
      accent="from-amber-50 via-white to-slate-100"
    >
      <SectionCard className="hidden md:block">
        <SectionHeading
          eyebrow="Summary"
          title="This year at a glance"
          description="A quick ledger overview so guests can understand spend, refunds, and credits without scrolling through every row."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {transactionSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-dark">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Ledger"
            title="Payment history"
            description="Designed for future filters and export actions, but already useful as a complete mock screen."
          />

          <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-3">
            <label className="relative min-w-0 flex-1 lg:flex-none">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search by booking, property, or receipt"
                className="w-full rounded-full border border-gray-200 bg-[#fcfcfb] py-3 pl-11 pr-4 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
              />
            </label>
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              Last 12 months
            </button>
          </div>
        </div>

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {paymentTransactions.map((transaction) => (
            <div key={transaction.id} className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-2xl p-3 ${
                      transaction.direction === 'credit'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {transaction.direction === 'credit' ? (
                      <RotateCcw size={18} />
                    ) : (
                      <ReceiptText size={18} />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">
                        {transaction.type}
                      </p>
                      <StatusPill
                        tone={
                          transaction.direction === 'credit' ? 'success' : 'slate'
                        }
                      >
                        {transaction.status}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-muted">{transaction.note}</p>
                    <p className="mt-3 text-sm text-muted">
                      {transaction.date} · {transaction.method}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <p
                    className={`text-2xl font-semibold tracking-tight ${
                      transaction.direction === 'credit'
                        ? 'text-emerald-700'
                        : 'text-dark'
                    }`}
                  >
                    {transaction.direction === 'credit' ? '+' : '-'}
                    {transaction.amount}
                  </p>
                  <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                    >
                      <Download size={14} />
                      Receipt
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </AccountShell>
  )
}
