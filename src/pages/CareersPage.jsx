import { MapPin, ArrowRight } from 'lucide-react'

const openings = [
  { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Bengaluru / Remote', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'Bengaluru', type: 'Full-time' },
  { title: 'Backend Engineer — Payments', team: 'Engineering', location: 'Bengaluru / Remote', type: 'Full-time' },
  { title: 'Growth Marketing Manager', team: 'Marketing', location: 'Mumbai', type: 'Full-time' },
  { title: 'Host Success Specialist', team: 'Operations', location: 'Remote (India)', type: 'Full-time' },
  { title: 'Data Analyst', team: 'Analytics', location: 'Bengaluru', type: 'Full-time' },
]

const perks = [
  { emoji: '🏖️', title: 'Unlimited travel credits', body: '₹50,000 in annual Travolish credits to explore properties on the platform.' },
  { emoji: '🏡', title: 'Flexible work', body: 'Remote-first culture. We care about output, not where you sit.' },
  { emoji: '📚', title: 'Learning budget', body: '₹25,000 per year for courses, books, and conferences.' },
  { emoji: '🏥', title: 'Health & wellness', body: 'Comprehensive health insurance for you and your family.' },
  { emoji: '🎯', title: 'Equity', body: 'ESOPs for all full-time employees. We grow together.' },
  { emoji: '🌍', title: 'Team offsites', body: 'Annual company offsite at one of our top-rated partner properties.' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">We're hiring</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">
            Help us reinvent how India travels.
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            We're a small team with big ambitions. If you love travel and want to build
            products that genuinely improve how people experience new places, you'll fit right in.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-16">

        {/* Open roles */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Open positions</p>
          <h2 className="text-2xl font-bold text-dark mb-6">Current openings</h2>
          <div className="space-y-3">
            {openings.map((job) => (
              <div
                key={job.title}
                className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rose-200 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-dark">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs font-medium bg-rose-50 text-brand px-2.5 py-1 rounded-full">{job.team}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{job.location}</span>
                    <span className="text-xs text-gray-500">{job.type}</span>
                  </div>
                </div>
                <button className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-dark hover:text-brand transition-colors">
                  Apply <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Benefits</p>
          <h2 className="text-2xl font-bold text-dark mb-6">What we offer</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                <span className="text-2xl">{p.emoji}</span>
                <h3 className="mt-3 font-semibold text-dark">{p.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* No role */}
        <div className="rounded-[28px] bg-dark p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Don't see the right role?</h3>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-5">
            We're always interested in hearing from talented people. Send us your CV and a note about what you'd build at Travolish.
          </p>
          <a
            href="mailto:careers@travolish.com"
            className="inline-block rounded-2xl bg-white text-dark px-6 py-3 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Get in touch
          </a>
        </div>

      </div>
    </div>
  )
}
