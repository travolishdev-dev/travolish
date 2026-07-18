import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search, BookOpen, CreditCard, Home, Star, Shield } from 'lucide-react'

const categories = [
  { icon: BookOpen, label: 'Bookings', color: 'bg-blue-50 text-blue-600' },
  { icon: CreditCard, label: 'Payments', color: 'bg-green-50 text-green-600' },
  { icon: Home, label: 'Hosting', color: 'bg-amber-50 text-amber-600' },
  { icon: Star, label: 'Reviews', color: 'bg-purple-50 text-purple-600' },
  { icon: Shield, label: 'Safety', color: 'bg-rose-50 text-brand' },
]

const faqs = [
  {
    q: 'How do I make a booking?',
    a: 'Search for a destination and dates on our search page, select a property that suits you, choose your room, and proceed to checkout. You\'ll receive an instant confirmation email once payment is processed.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Cancellation policies vary by property. You can find the cancellation terms on the listing page before you book, and in your booking confirmation. To cancel, go to Trips → select your booking → Cancel booking.',
  },
  {
    q: 'How do I contact my host?',
    a: 'Once your booking is confirmed, you can message your host directly through the Messages section. Hosts typically respond within a few hours. You\'ll also receive the host\'s contact number 24 hours before check-in.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI, and net banking. Payments are processed securely and your card details are never stored on our servers.',
  },
  {
    q: 'What happens if the property is different from the listing?',
    a: 'If the property significantly differs from what was listed, contact us within 24 hours of check-in with photos. We\'ll review your case and may offer a rebooking or refund under our Guest Guarantee.',
  },
  {
    q: 'How do I list my property?',
    a: 'Click "List your property" in the footer or navigate to Host Onboarding. The process takes about 15 minutes. You\'ll need to provide property details, photos, availability, and pricing. All listings are reviewed before going live.',
  },
  {
    q: 'How are reviews collected?',
    a: 'After check-out, both guests and hosts are invited to leave a review. Reviews are published only after both parties have submitted or after 14 days, whichever comes first. Reviews cannot be edited or deleted except in cases of policy violation.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Yes. All payments are encrypted using TLS and processed through PCI-DSS compliant payment gateways. Travolish holds your payment until 24 hours after check-in before releasing it to the host.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-dark text-sm pr-4">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">How can we help?</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Find answers to common questions or get in touch with our support team.</p>
          <div className="mt-8 max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-base text-dark outline-none focus:border-brand shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-12">

        {/* Categories */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {categories.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4 flex flex-col items-center gap-2 hover:border-rose-200 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs font-semibold text-dark">{label}</span>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">FAQ</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>

        {/* Still need help */}
        <div className="rounded-[28px] bg-dark p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-lg">Still need help?</h3>
            <p className="text-white/70 text-sm mt-1">Our support team is available 7 days a week, 8am–10pm IST.</p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 rounded-2xl bg-white text-dark px-6 py-3 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact us
          </Link>
        </div>

      </div>
    </div>
  )
}
