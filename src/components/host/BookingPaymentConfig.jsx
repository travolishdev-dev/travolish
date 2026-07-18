const PAYMENT_METHODS = [
  { id: 'pay_full', label: 'Pay Full Amount at Booking', description: 'Guest pays 100% upfront.' },
  { id: 'pay_at_property', label: 'Pay at Property', description: 'Guest pays on arrival.' },
  { id: 'partial_payment', label: 'Secure Booking with Partial Payment', description: 'Guest pays an advance to confirm, balance later.' },
]

const ADVANCE_OPTIONS = [
  { value: 0, label: 'No Advance Payment Required' },
  { value: 10, label: '10% Advance Payment' },
  { value: 20, label: '20% Advance Payment' },
  { value: 25, label: '25% Advance Payment' },
  { value: 30, label: '30% Advance Payment' },
  { value: -1, label: 'Custom Percentage' },
]

export default function BookingPaymentConfig({ value = {}, onChange, pricing = {} }) {
  const {
    paymentMethods = [],
    advancePaymentPercent = 0,
    customAdvancePercent = '',
  } = value

  function toggleMethod(id) {
    const next = paymentMethods.includes(id)
      ? paymentMethods.filter((m) => m !== id)
      : [...paymentMethods, id]
    onChange({ ...value, paymentMethods: next })
  }

  function setAdvance(val) {
    onChange({ ...value, advancePaymentPercent: val, customAdvancePercent: '' })
  }

  const effectivePercent =
    advancePaymentPercent === -1
      ? Number(customAdvancePercent) || 0
      : advancePaymentPercent

  const totalAmount = Number(pricing.weekday) || 0
  const advanceAmount = ((totalAmount * effectivePercent) / 100).toFixed(2)
  const remaining = (totalAmount - Number(advanceAmount)).toFixed(2)

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-sm font-semibold text-dark">Payment Methods</p>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors ${
                paymentMethods.includes(m.id)
                  ? 'border-dark bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={paymentMethods.includes(m.id)}
                onChange={() => toggleMethod(m.id)}
                className="mt-1 h-4 w-4 accent-brand"
              />
              <span>
                <span className="block text-sm font-semibold text-dark">{m.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{m.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-sm font-semibold text-dark">Booking Security (Advance Payment)</p>
        <div className="space-y-2">
          {ADVANCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
                advancePaymentPercent === opt.value
                  ? 'border-dark bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                checked={advancePaymentPercent === opt.value}
                onChange={() => setAdvance(opt.value)}
                className="accent-brand"
              />
              <span className="text-sm font-semibold text-dark">{opt.label}</span>
            </label>
          ))}
        </div>

        {advancePaymentPercent === -1 && (
          <div className="mt-3">
            <label className="mb-2 block text-sm font-semibold text-dark">Custom Percentage (%)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customAdvancePercent}
              onChange={(e) =>
                onChange({ ...value, customAdvancePercent: e.target.value.replace(/\D/g, '') })
              }
              placeholder="e.g., 15"
              className="w-40 rounded-xl border border-gray-300 px-4 py-3 text-base text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-5">
        <p className="mb-4 text-sm font-semibold text-dark">Payment Terms Preview</p>
        <p className="mb-4 text-xs text-muted">
          This is what travellers will see before confirming their reservation.
        </p>
        <dl className="space-y-2.5">
          {[
            ['Total Booking Amount', totalAmount > 0 ? `$${totalAmount}/night` : '—'],
            ['Advance Payment Required', effectivePercent > 0 ? `${effectivePercent}% ($${advanceAmount})` : 'None'],
            ['Remaining Balance', effectivePercent > 0 ? `$${remaining}` : 'Full amount at booking'],
            ['Due Date for Remaining Balance', 'At check-in (or as agreed)'],
            ['Taxes & Service Charges', pricing.taxes ? `${pricing.taxes}%` : 'Included in price'],
            ['Security Deposit', pricing.securityDeposit ? `$${pricing.securityDeposit}` : 'None'],
            ['Cancellation & Refund Terms', 'As per cancellation policy'],
            ['Payment Methods Accepted', paymentMethods.length > 0 ? paymentMethods.map((id) => PAYMENT_METHODS.find((m) => m.id === id)?.label).filter(Boolean).join(', ') : 'Not configured'],
          ].map(([key, val]) => (
            <div key={key} className="flex items-start justify-between gap-4 text-sm">
              <dt className="text-muted">{key}</dt>
              <dd className="text-right font-semibold text-dark">{val}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
