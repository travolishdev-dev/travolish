import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle, ShieldCheck, TriangleAlert, BadgeAlert } from 'lucide-react'

const guestPolicies = [
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
    note: "Best when you're certain of your travel plans.",
  },
]

const guestExtenuating = [
  'Death of a guest, host, or immediate family member',
  'Serious illness requiring hospitalisation',
  'Natural disasters, declared emergencies, or government travel bans',
  'Severe property damage making the stay impossible',
]

const hostConsequences = [
  {
    timing: '30+ days before check-in',
    color: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    guestOutcome: [
      { label: 'Booking amount', value: 'Full refund' },
      { label: 'Service fees', value: 'Full refund' },
    ],
    hostPenalty: [
      { label: 'Cancellation fee', value: 'Deducted from next payout' },
      { label: 'Calendar', value: 'Dates blocked automatically' },
      { label: 'Cancellation rate', value: 'Increases' },
    ],
    note: 'Guests are notified immediately and offered alternative stays.',
  },
  {
    timing: '7–29 days before check-in',
    color: 'border-rose-200 bg-rose-50',
    badge: 'bg-rose-100 text-brand',
    icon: TriangleAlert,
    iconColor: 'text-brand',
    guestOutcome: [
      { label: 'Booking amount', value: 'Full refund' },
      { label: 'Service fees', value: 'Full refund' },
      { label: 'Relocation support', value: 'Priority assistance' },
    ],
    hostPenalty: [
      { label: 'Cancellation fee', value: 'Elevated — up to 15% of booking' },
      { label: 'Calendar', value: 'Dates blocked + listing flagged' },
      { label: 'Cancellation rate', value: 'Significant increase' },
    ],
    note: 'Close-in cancellations cause serious disruption for guests.',
  },
  {
    timing: 'Within 7 days of check-in',
    color: 'border-red-300 bg-red-50',
    badge: 'bg-red-100 text-red-700',
    icon: BadgeAlert,
    iconColor: 'text-red-600',
    guestOutcome: [
      { label: 'Booking amount', value: 'Full refund' },
      { label: 'Service fees', value: 'Full refund' },
      { label: 'Goodwill credit', value: 'Issued to guest' },
      { label: 'Relocation', value: 'Priority + concierge support' },
    ],
    hostPenalty: [
      { label: 'Cancellation fee', value: 'Up to 25% of booking' },
      { label: 'Calendar', value: 'Dates permanently blocked' },
      { label: 'Listing review', value: 'Automated quality review triggered' },
      { label: 'Account standing', value: 'Risk of suspension on repeat' },
    ],
    note: 'Last-minute host cancellations are treated as the most severe breach of guest trust.',
  },
]

const hostExtenuating = [
  'Property rendered uninhabitable — fire, flood, or structural failure',
  'Natural disaster or government-declared state of emergency',
  'Serious illness or death of the host or immediate family member',
  'Legal or regulatory restriction preventing the booking from proceeding',
]

const hostRateThresholds = [
  { rate: '< 1%', label: 'Excellent standing', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { rate: '1–5%', label: 'Warning issued', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { rate: '5–10%', label: 'Additional review required', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { rate: '> 10%', label: 'Risk of listing suspension', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
]

export default function CancellationPolicyPage() {
  const [tab, setTab] = useState('guest')

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Cancellation policies</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Policies work differently depending on who initiates the cancellation. Select your role below to see what applies to you.
          </p>

          {/* Tab switcher */}
          <div className="mt-8 inline-flex rounded-2xl border border-gray-200 bg-white p-1 gap-1">
            <button
              type="button"
              onClick={() => setTab('guest')}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                tab === 'guest' ? 'bg-dark text-white' : 'text-gray-500 hover:text-dark'
              }`}
            >
              Guest / Traveller
            </button>
            <button
              type="button"
              onClick={() => setTab('host')}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                tab === 'host' ? 'bg-dark text-white' : 'text-gray-500 hover:text-dark'
              }`}
            >
              Owner / Host
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-12">

        {/* ── GUEST TAB ── */}
        {tab === 'guest' && (
          <>
            {/* Policy type cards */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Policy types</p>
              <h2 className="text-2xl font-bold text-dark mb-2">What each policy means for your refund</h2>
              <p className="text-sm text-gray-500 mb-6">Each property sets its own cancellation tier. Check the listing before you book.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                {guestPolicies.map(({ name, color, badge, icon: Icon, iconColor, rules, note }) => (
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
                {guestExtenuating.map((item) => (
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
          </>
        )}

        {/* ── HOST TAB ── */}
        {tab === 'host' && (
          <>
            {/* Intro notice */}
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 flex gap-4">
              <AlertCircle size={22} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-dark text-sm">Host-initiated cancellations affect your guests most</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  When you cancel a booking, the guest receives an automatic full refund. Penalties applied to your account depend on how close to check-in the cancellation occurs.
                </p>
              </div>
            </div>

            {/* Consequence tiers */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Cancellation impact</p>
              <h2 className="text-2xl font-bold text-dark mb-2">What happens when you cancel</h2>
              <p className="text-sm text-gray-500 mb-6">Outcomes are shown for the guest and for your account separately.</p>
              <div className="space-y-5">
                {hostConsequences.map(({ timing, color, badge, icon: Icon, iconColor, guestOutcome, hostPenalty, note }) => (
                  <div key={timing} className={`rounded-[28px] border p-6 ${color}`}>
                    <div className="flex items-center gap-3 mb-5">
                      <Icon size={22} className={iconColor} />
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge}`}>{timing}</span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Guest outcome</p>
                        <div className="space-y-2">
                          {guestOutcome.map((r) => (
                            <div key={r.label} className="flex items-start justify-between gap-2 text-sm">
                              <span className="text-gray-600">{r.label}</span>
                              <span className="font-semibold text-dark shrink-0">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Your account</p>
                        <div className="space-y-2">
                          {hostPenalty.map((r) => (
                            <div key={r.label} className="flex items-start justify-between gap-2 text-sm">
                              <span className="text-gray-600">{r.label}</span>
                              <span className="font-semibold text-dark shrink-0">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 italic mt-4">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation rate thresholds */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Account health</p>
              <h2 className="text-2xl font-bold text-dark mb-2">Cancellation rate thresholds</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your cancellation rate is calculated over a rolling 12-month window. Travolish reviews it periodically and after any automated flag.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {hostRateThresholds.map(({ rate, label, color, bg }) => (
                  <div key={rate} className={`rounded-2xl border p-4 ${bg}`}>
                    <p className={`text-2xl font-bold ${color}`}>{rate}</p>
                    <p className="text-sm text-gray-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Host extenuating circumstances */}
            <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6 md:p-8">
              <div className="flex items-start gap-3">
                <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-dark text-lg mb-2">Penalty waiver — extenuating circumstances</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    In the following situations, Travolish may waive the cancellation penalty and unblock your calendar after review:
                  </p>
                  <ul className="space-y-2">
                    {hostExtenuating.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle size={15} className="mt-0.5 text-blue-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 mt-4">
                    Submit your claim within 48 hours of cancelling. Supporting documentation is required. Waivers are not guaranteed and are reviewed case by case.
                  </p>
                </div>
              </div>
            </div>

            {/* Host service fee note */}
            <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6">
              <h3 className="font-semibold text-dark mb-2">Service fees on cancelled bookings</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                When you cancel a booking, Travolish refunds the guest's service fee in full. Your host service fee for that booking is forfeited and is not returned. Cancellation penalties (where applicable) are deducted from your next scheduled payout.
              </p>
            </div>
          </>
        )}

        {/* CTA — shared */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[28px] bg-dark p-6 text-white">
          <p className="text-sm text-white/70">
            {tab === 'guest'
              ? 'Need help with a specific cancellation?'
              : 'Need to appeal a penalty or request a waiver?'}
          </p>
          <Link
            to="/contact"
            className="shrink-0 rounded-2xl bg-white text-dark px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact support
          </Link>
        </div>

      </div>
    </div>
  )
}
