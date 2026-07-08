import { Link } from 'react-router-dom'
import { Leaf, Scale, Shield, Heart, AlertCircle } from 'lucide-react'

const principles = [
  {
    icon: Scale,
    title: 'Accuracy above all',
    body: 'Your listing must accurately reflect the property — photos, amenities, location, and house rules. Misleading guests is a policy violation and grounds for listing removal.',
  },
  {
    icon: Shield,
    title: 'Safety standards',
    body: 'Ensure working smoke detectors, fire extinguishers, and clearly marked emergency exits. Provide a first-aid kit and emergency contact numbers visible in the property.',
  },
  {
    icon: Heart,
    title: 'Respectful hosting',
    body: 'Treat all guests equally regardless of nationality, gender, religion, or disability. Discriminatory behaviour violates our non-discrimination policy and will result in account termination.',
  },
  {
    icon: Leaf,
    title: 'Environmental responsibility',
    body: 'Provide recycling bins, use energy-efficient appliances where possible, and consider offering refillable toiletries. Small steps make a meaningful difference at scale.',
  },
]

const legal = [
  'Register your property with local authorities if required by law',
  'Obtain all necessary short-term rental permits or licences',
  'Declare rental income to the applicable tax authority',
  'Comply with building, fire, and safety regulations',
  'Check local zoning laws and HOA rules before listing',
  'Maintain valid property and liability insurance',
]

const dos = [
  'Respond to booking requests within 24 hours',
  'Keep your availability calendar up to date',
  'Provide a clean, well-maintained property',
  'Give guests a warm welcome and local recommendations',
  'Leave honest reviews of guests after their stay',
]

const donts = [
  'Cancel confirmed bookings without a legitimate reason',
  'Ask guests to pay outside the Travolish platform',
  'Install hidden cameras or recording devices',
  'Misrepresent the property in your listing',
  'Retaliate against guests for honest reviews',
]

export default function ResponsibleHostingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Hosting</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Responsible hosting</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Great hosts build trust. This guide covers our standards and expectations to help you host with confidence and integrity.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-14">

        {/* Principles */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Our standards</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Core hosting principles</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {principles.map(({ icon: Icon, title, body }) => (
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

        {/* Do / Don't */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-[28px] border border-green-200 bg-green-50 p-6">
            <h3 className="font-bold text-dark mb-4">✓ Do</h3>
            <ul className="space-y-2.5">
              {dos.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 shrink-0 mt-0.5">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
            <h3 className="font-bold text-dark mb-4">✗ Don't</h3>
            <ul className="space-y-2.5">
              {donts.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-brand shrink-0 mt-0.5">✗</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 md:p-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <h3 className="font-bold text-dark text-lg">Legal compliance</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            It's your responsibility as a host to comply with local laws. Requirements vary by city and state. Common obligations include:
          </p>
          <ul className="space-y-2">
            {legal.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-amber-600 shrink-0">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[28px] bg-dark p-6 text-white">
          <p className="text-sm text-white/70">Questions about hosting standards or policies?</p>
          <Link to="/contact" className="shrink-0 rounded-2xl bg-white text-dark px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Contact host support
          </Link>
        </div>

      </div>
    </div>
  )
}
