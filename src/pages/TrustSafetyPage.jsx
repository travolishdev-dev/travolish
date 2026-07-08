import { Link } from 'react-router-dom'
import { Shield, CheckCircle, AlertTriangle, Lock, UserCheck, Phone } from 'lucide-react'

const pillars = [
  {
    icon: UserCheck,
    title: 'Host verification',
    body: 'Every host submits a government-issued ID and proof of property ownership or management rights. Our team reviews documents before any listing goes live. Verified hosts display a badge on their profile.',
  },
  {
    icon: Lock,
    title: 'Secure payments',
    body: 'All payments are processed through PCI-DSS compliant gateways. We never store raw card details. Your money is held securely until 24 hours after check-in, protecting you if anything goes wrong.',
  },
  {
    icon: Shield,
    title: 'Guest Guarantee',
    body: 'If a property significantly misrepresents itself — wrong location, major missing amenities, or cleanliness issues — report it within 24 hours of check-in and we\'ll rebook you or issue a full refund.',
  },
  {
    icon: CheckCircle,
    title: 'Review integrity',
    body: 'Only verified guests who completed a stay can leave a review. We use automated and manual checks to detect fake or incentivised reviews. Hosts cannot delete legitimate guest reviews.',
  },
]

const tips = [
  'Always book and pay through Travolish — never transfer money directly to a host.',
  'Read recent reviews before booking, paying attention to cleanliness and accuracy.',
  'Message hosts through the platform before arrival to confirm details.',
  'Screenshot any discrepancies between the listing and the property upon arrival.',
  'Share your trip itinerary with a trusted contact when travelling solo.',
  'Contact our 24/7 emergency line if you feel unsafe at any point during your stay.',
]

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Safety</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Trust & Safety</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Safety isn't a feature — it's the foundation. Here's how we protect guests, hosts, and the entire Travolish community.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-16">

        {/* Pillars */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">How we protect you</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Our safety pillars</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-brand mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-dark mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Stay safe</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Safety tips for travellers</h2>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-5 py-4">
                <span className="w-6 h-6 rounded-full bg-rose-50 text-brand text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report & Emergency */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
            <AlertTriangle size={24} className="text-amber-600 mb-3" />
            <h3 className="font-bold text-dark mb-1">Report a concern</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              If you encounter a listing that violates our policies or unsafe behaviour, report it and we'll investigate within 24 hours.
            </p>
            <Link to="/contact" className="text-sm font-semibold text-dark hover:text-brand transition-colors">
              File a report →
            </Link>
          </div>
          <div className="rounded-[28px] bg-dark p-6 text-white">
            <Phone size={24} className="text-brand mb-3" />
            <h3 className="font-bold mb-1">Emergency support</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              If you're in immediate danger, call local emergency services (100/112). For urgent booking issues, our emergency line is available 24/7.
            </p>
            <p className="text-sm font-semibold text-brand">+91 80 4567 8911</p>
          </div>
        </div>

      </div>
    </div>
  )
}
