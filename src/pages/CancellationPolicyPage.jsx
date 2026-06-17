import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const policies = [
  {
    name: 'Flexible',
    color: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    rules: [
      { label: 'Cancel before check-in', value: 'Full refund' },
      { label: 'Cancel within 24 hrs of booking (if >48 hrs before check-in)', value: 'Full refund' },
      { label: 'Cancel within 48 hrs of check-in', value: 'No refund (first night)' },
    ],
    note: 'Best for travellers who need flexibility.',
  },
  {
    name: 'Moderate',
    color: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
    rules: [
      { label: 'Cancel ≥ 5 days before check-in', value: 'Full refund' },
      { label: 'Cancel 1–4 days before check-in', value: '50% refund' },
      { label: 'Cancel within 24 hrs of check-in', value: 'No refund' },
    ],
    note: 'Common for boutique properties and guesthouses.',
  },
  {
    name: 'Strict',
    color: 'border-rose-200 bg-rose-50',
    badge: 'bg-rose-100 text-brand',
    icon: XCircle,
    iconColor: 'text-brand',
    rules: [
      { label: 'Cancel ≥ 14 days before check-in', value: '50% refund' },
      { label: 'Cancel 7–13 days before check-in', value: '25% refund' },
      { label: 'Cancel < 7 days before check-in', value: 'No refund' },
    ],
    note: 'Typical for peak-season properties and premium stays.',
  },
  {
    name: 'Non-refundable',
    color: 'border-gray-200 bg-gray-50',
    badge: 'bg-gray-200 text-gray-700',
    icon: XCircle,
    iconColor: 'text-gray-500',
    rules: [
      { label: 'Any cancellation', value: 'No refund' },
      { label: 'Usually offered at a discounted rate', value: '~10–15% off' },
    ],
    note: 'Best when you\'re certain of your travel plans.',
  },
]

const extenuating = [
  'Death of a guest, host, or immediate family member',
  'Serious illness requiring hospitalisation',
  'Natural disasters, declared emergencies, or government travel bans',
  'Severe property damage making the stay impossible',
]

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Cancellation options</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Each property sets its own cancellation policy. Here's what each one means for your refund.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-12">

        {/* Policy cards */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Policy types</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Cancellation policies explained</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {policies.map(({ name, color, badge, icon: Icon, iconColor, rules, note }) => (
              <div key={name} className={`rounded-[28px] border p-6 ${color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={22} className={iconColor} />
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge}`}>{name}</span>
                </div>
                <div className="space-y-2.5 mb-4">
                  {rules.map((r) => (
                    <div key={r.label} className="flex items-start justify-between gap-2 text-sm">
                      <span className="text-gray-600">{r.label}</span>
                      <span className="font-semibold text-dark shrink-0">{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 italic">{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Extenuating circumstances */}
        <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6 md:p-8">
          <h3 className="font-bold text-dark text-lg mb-2">Extenuating circumstances</h3>
          <p className="text-sm text-gray-500 mb-4">
            In exceptional situations, you may receive a full refund regardless of the property's cancellation policy. Qualifying circumstances include:
          </p>
          <ul className="space-y-2">
            {extenuating.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={15} className="mt-0.5 text-blue-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-4">Documentation may be required. Claims must be submitted before or within 24 hours of the check-in date.</p>
        </div>

        {/* Travolish fees */}
        <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6">
          <h3 className="font-semibold text-dark mb-2">Travolish service fees</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Travolish service fees are generally non-refundable when a guest cancels. However, if a host cancels your booking,
            you'll receive a full refund including service fees. Service fees may also be refunded under extenuating circumstances.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[28px] bg-dark p-6 text-white">
          <p className="text-sm text-white/70">Need help with a specific cancellation?</p>
          <Link to="/contact" className="shrink-0 rounded-2xl bg-white text-dark px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Contact support
          </Link>
        </div>

      </div>
    </div>
  )
}
