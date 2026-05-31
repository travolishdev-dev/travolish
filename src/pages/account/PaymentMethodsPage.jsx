import { useEffect, useState } from 'react'
import { CreditCard, ShieldEllipsis, WalletCards } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { paymentMethods as mockPaymentMethods, transactionSummary } from '../../data/mockPortalData'
import { getUserPaymentMethods } from '../../services/paymentMethodsApi'

const NETWORK_COLORS = {
  VISA: 'from-slate-900 via-slate-800 to-slate-700',
  MASTERCARD: 'from-rose-600 via-orange-500 to-amber-400',
  AMEX: 'from-cyan-700 via-sky-600 to-blue-500',
  AMERICAN_EXPRESS: 'from-cyan-700 via-sky-600 to-blue-500',
  RUPAY: 'from-violet-700 via-purple-600 to-indigo-500',
  UPI: 'from-emerald-700 via-teal-600 to-cyan-500',
}

function adaptMethod(m) {
  const network = (m.cardNetwork ?? '').toUpperCase().replace(/\s+/g, '_')
  const color = NETWORK_COLORS[network] ?? 'from-slate-700 via-slate-600 to-slate-500'
  const expiry =
    m.cardExpiryMonth && m.cardExpiryYear
      ? `${String(m.cardExpiryMonth).padStart(2, '0')}/${String(m.cardExpiryYear).slice(-2)}`
      : '—'
  const type = m.cardType
    ? `${m.cardType.charAt(0)}${m.cardType.slice(1).toLowerCase()} card`
    : m.methodType ?? 'Card'

  return {
    id: m.id,
    type,
    brand: m.cardNetwork ?? m.methodName ?? m.methodType ?? 'Card',
    primary: m.isDefault ?? false,
    last4: m.cardLast4 ?? '••••',
    expiry,
    color,
  }
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState(mockPaymentMethods)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserPaymentMethods()
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) setMethods(items.map(adaptMethod))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AccountShell
      title="Wallet and payment methods."
      mobileTitle="Wallet"
      description="Saved cards, billing readiness, and security reassurance."
      mobileBottomAction={{ label: 'Save billing', href: '/account/payments' }}
      actions={[
        { label: 'See transactions', href: '/account/transactions', secondary: true },
        { label: 'Add payment method', href: '/account/payments' },
      ]}
      accent="from-slate-100 via-white to-rose-50"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard>
          <SectionHeading
            eyebrow="Wallet"
            title="Saved cards"
            description="Primary card is highlighted; backups are easy to scan."
          />

          {loading ? (
            <div className="mt-6 py-10 text-center text-sm text-muted">Loading payment methods…</div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${method.color} p-[1px] shadow-[0_18px_45px_rgba(15,23,42,0.18)]`}
                >
                  <div className="h-full rounded-[27px] bg-black/10 p-5 text-white backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                          {method.type}
                        </p>
                        <p className="mt-4 text-2xl font-semibold tracking-tight">
                          {method.brand}
                        </p>
                      </div>
                      {method.primary ? (
                        <StatusPill tone="success">Primary</StatusPill>
                      ) : (
                        <StatusPill tone="sky">Backup</StatusPill>
                      )}
                    </div>

                    <div className="mt-10 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                          Card ending
                        </p>
                        <p className="mt-1 text-lg font-semibold">•••• {method.last4}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                          Expires
                        </p>
                        <p className="mt-1 text-lg font-semibold">{method.expiry}</p>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/15"
                      >
                        {method.primary ? 'Edit card' : 'Set as primary'}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Snapshot"
              title="Wallet health"
              description="A compact financial summary."
            />

            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {transactionSummary.map((item) => (
                <div key={item.label} className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="rounded-[24px] bg-dark p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldEllipsis size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Security
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    Tokenized and masked
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/80">
                Card details are masked in transit. This layout is compatible with masked backend responses.
              </p>
            </div>

            <div className="mt-4 border-t border-dashed border-gray-200 pt-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <WalletCards size={20} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Gift cards, travel credits, and future wallet instruments can stack into this same area.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard>
        <SectionHeading
          eyebrow="Billing Details"
          title="Reusable billing form"
          description="Integration target for add-card and update-card endpoints."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            'Cardholder name',
            'Billing email',
            'Country / region',
            'Postal code',
          ].map((field) => (
            <label key={field} className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {field}
              </span>
              <input
                type="text"
                placeholder={`Add ${field.toLowerCase()}`}
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
          >
            <CreditCard size={16} />
            Save billing profile
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            Add new card
          </button>
        </div>
      </SectionCard>
    </AccountShell>
  )
}
