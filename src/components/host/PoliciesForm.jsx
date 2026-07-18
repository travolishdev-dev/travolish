const POLICIES = [
  {
    key: 'cancellationPolicy',
    label: 'Cancellation Policy',
    placeholder: 'e.g., Free cancellation up to 48 hours before check-in. No refund thereafter.',
  },
  {
    key: 'refundPolicy',
    label: 'Refund Policy',
    placeholder: 'e.g., Full refund if cancelled 7+ days before arrival. 50% refund within 3–7 days.',
  },
  {
    key: 'childPolicy',
    label: 'Child Policy',
    placeholder: 'e.g., Children under 5 stay free. Children 6–12 charged 50% of adult rate.',
  },
  {
    key: 'petPolicy',
    label: 'Pet Policy',
    placeholder: 'e.g., Pets not allowed. / Pets welcome with prior approval. ₹500 pet fee per night.',
  },
  {
    key: 'smokingPolicy',
    label: 'Smoking Policy',
    placeholder: 'e.g., Non-smoking property. Designated outdoor smoking area available.',
  },
  {
    key: 'visitorPolicy',
    label: 'Visitor Policy',
    placeholder: 'e.g., Registered guests only. Day visitors must be signed in at reception.',
  },
  {
    key: 'damagePolicy',
    label: 'Damage Policy',
    placeholder: 'e.g., Guests are liable for any damage caused during their stay. Security deposit may be held.',
  },
  {
    key: 'quietHours',
    label: 'Quiet Hours',
    placeholder: 'e.g., 22:00 – 07:00',
  },
]

export default function PoliciesForm({ value = {}, onChange }) {
  function update(key) {
    return (e) => onChange({ ...value, [key]: e.target.value })
  }

  return (
    <div className="space-y-5">
      {POLICIES.map((policy) => (
        <label key={policy.key} className="block">
          <span className="mb-2 block text-sm font-semibold text-dark">{policy.label}</span>
          <textarea
            value={value[policy.key] ?? ''}
            onChange={update(policy.key)}
            placeholder={policy.placeholder}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
          />
        </label>
      ))}
    </div>
  )
}
