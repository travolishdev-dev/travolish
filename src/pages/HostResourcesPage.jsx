import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Camera, MessageSquare, Star, DollarSign, ArrowRight } from 'lucide-react'

const guides = [
  {
    icon: Camera,
    category: 'Photography',
    title: 'How to photograph your property',
    excerpt: 'Listings with professional-quality photos get 3× more bookings. Learn the angles, lighting, and staging tips that work.',
    readTime: '5 min',
  },
  {
    icon: DollarSign,
    category: 'Pricing',
    title: 'Setting the right price for your rooms',
    excerpt: 'Competitive pricing isn\'t just about being cheap. Discover how to position your property to maximise occupancy and revenue.',
    readTime: '7 min',
  },
  {
    icon: Star,
    category: 'Reviews',
    title: 'Getting (and keeping) 5-star reviews',
    excerpt: 'Reviews are currency on Travolish. Here\'s the formula consistently high-rated hosts follow — from check-in to check-out.',
    readTime: '6 min',
  },
  {
    icon: MessageSquare,
    category: 'Communication',
    title: 'Mastering guest communication',
    excerpt: 'Fast, friendly responses lead to more bookings. Build templates for every stage of the guest journey.',
    readTime: '4 min',
  },
  {
    icon: TrendingUp,
    category: 'Growth',
    title: 'Using Pricing AI to boost revenue',
    excerpt: 'Our AI-powered pricing engine suggests dynamic rates based on demand and seasonality. Here\'s how to make the most of it.',
    readTime: '5 min',
  },
  {
    icon: BookOpen,
    category: 'Onboarding',
    title: 'Host onboarding checklist',
    excerpt: 'Everything you need to do before your first booking — listing setup, legal requirements, and property readiness.',
    readTime: '8 min',
  },
]

const tools = [
  { label: 'Host dashboard', href: '/host', description: 'Manage bookings, listings, and revenue in one place.' },
  { label: 'Pricing AI', href: '/host/pricing-ai', description: 'Get AI-driven rate suggestions based on demand signals.' },
  { label: 'Promotions', href: '/host/promotions', description: 'Create promo codes and early-bird discounts.' },
  { label: 'Availability calendar', href: '/host/availability', description: 'Block dates and manage your booking windows.' },
  { label: 'Reports', href: '/host/reports', description: 'Track earnings, occupancy, and guest metrics.' },
  { label: 'KYC & payouts', href: '/host/kyc', description: 'Complete identity verification to unlock payouts.' },
]

export default function HostResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Hosting</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Host resources</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Guides, tips, and tools to help you become a top-rated host and grow your property business on Travolish.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-14">

        {/* Guides */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Learning centre</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Host guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(({ icon: Icon, category, title, excerpt, readTime }) => (
              <div
                key={title}
                className="group rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5 hover:border-rose-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-brand">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs text-gray-400">{readTime}</span>
                </div>
                <p className="text-xs font-semibold text-brand mb-1">{category}</p>
                <h3 className="font-semibold text-dark text-sm mb-2 group-hover:text-brand transition-colors">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{excerpt}</p>
                <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand">
                  Read guide <ArrowRight size={12} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Host tools */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Platform tools</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Host dashboard tools</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <Link
                key={t.label}
                to={t.href}
                className="group rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5 hover:border-rose-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark text-sm group-hover:text-brand transition-colors">{t.label}</h3>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-brand transition-colors" />
                </div>
                <p className="mt-1 text-xs text-gray-500">{t.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Start hosting */}
        <div className="rounded-[28px] bg-dark p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-lg">Not yet a host?</h3>
            <p className="text-white/70 text-sm mt-1">List your property in 15 minutes and start earning.</p>
          </div>
          <Link
            to="/host/onboarding"
            className="shrink-0 rounded-2xl bg-white text-dark px-6 py-3 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Start hosting
          </Link>
        </div>

      </div>
    </div>
  )
}
