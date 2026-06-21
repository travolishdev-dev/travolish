import { ArrowRight, Calendar } from 'lucide-react'

const articles = [
  {
    date: 'June 2, 2026',
    category: 'Product',
    title: 'Introducing AI-powered property descriptions',
    excerpt: 'Hosts can now generate compelling, SEO-friendly descriptions for their listings with one click, powered by Google Gemini.',
    readTime: '3 min read',
  },
  {
    date: 'May 18, 2026',
    category: 'Company',
    title: 'Travolish crosses 12,000 listings across India',
    excerpt: 'We hit a major milestone this quarter — 12,000 active properties across 180+ cities, from metro hotels to remote mountain stays.',
    readTime: '2 min read',
  },
  {
    date: 'April 30, 2026',
    category: 'Hosts',
    title: 'Host Pricing AI: smarter revenue, less guesswork',
    excerpt: 'Our new AI-assisted pricing engine analyses demand signals and seasonal trends to suggest optimal nightly rates for hosts.',
    readTime: '4 min read',
  },
  {
    date: 'April 10, 2026',
    category: 'Safety',
    title: 'Expanding guest protection with real-time fraud detection',
    excerpt: "We've rolled out enhanced fraud monitoring across all bookings, providing an extra layer of security for every transaction.",
    readTime: '3 min read',
  },
  {
    date: 'March 22, 2026',
    category: 'Community',
    title: 'Meet our Host of the Quarter: The Aranya Retreat, Coorg',
    excerpt: 'Nestled in the coffee hills of Coorg, Aranya Retreat has maintained a perfect 5-star rating across 200+ stays. We sat down with its founder.',
    readTime: '6 min read',
  },
]

const categoryColors = {
  Product: 'bg-blue-50 text-blue-700',
  Company: 'bg-rose-50 text-brand',
  Hosts: 'bg-amber-50 text-amber-700',
  Safety: 'bg-green-50 text-green-700',
  Community: 'bg-purple-50 text-purple-700',
}

export default function NewsroomPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Press & news</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Newsroom</h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Product updates, company milestones, and stories from the Travolish community.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-16">

        {/* Articles */}
        <div className="space-y-4">
          {articles.map((a) => (
            <article
              key={a.title}
              className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6 hover:border-rose-200 transition-colors cursor-pointer group"
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[a.category]}`}>
                  {a.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={12} /> {a.date}
                </span>
                <span className="text-xs text-gray-400">{a.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-dark group-hover:text-brand transition-colors">{a.title}</h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{a.excerpt}</p>
              <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand">
                Read more <ArrowRight size={14} />
              </p>
            </article>
          ))}
        </div>

        {/* Press contact */}
        <div className="rounded-[28px] bg-dark p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Press enquiries</p>
          <h2 className="text-xl font-bold mb-2">Media contact</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            For press enquiries, interview requests, or media assets, please reach out to our communications team.
          </p>
          <a href="mailto:press@travolish.com" className="text-sm font-semibold text-brand hover:underline">
            press@travolish.com
          </a>
        </div>

      </div>
    </div>
  )
}
