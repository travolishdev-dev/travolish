import { Globe, ChevronUp } from 'lucide-react'

const footerLinks = {
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'AirCover', href: '#' },
      { label: 'Anti-discrimination', href: '#' },
      { label: 'Disability support', href: '#' },
      { label: 'Cancellation options', href: '#' },
      { label: 'Report concern', href: '#' },
    ],
  },
  hosting: {
    title: 'Hosting',
    links: [
      { label: 'Travolish your home', href: '#' },
      { label: 'AirCover for Hosts', href: '#' },
      { label: 'Hosting resources', href: '#' },
      { label: 'Community forum', href: '#' },
      { label: 'Hosting responsibly', href: '#' },
      { label: 'Travolish-friendly', href: '#' },
    ],
  },
  travolish: {
    title: 'Travolish',
    links: [
      { label: 'Newsroom', href: '#' },
      { label: 'New features', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Investors', href: '#' },
      { label: 'Gift cards', href: '#' },
      { label: 'Emergency stays', href: '#' },
    ],
  },
}

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Links Grid */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-dark mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-dark hover:underline transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>© 2026 Travolish, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
              <span>·</span>
              <a href="#" className="hover:underline">Sitemap</a>
              <span>·</span>
              <a href="#" className="hover:underline">Company details</a>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-semibold text-dark hover:underline">
                <Globe size={16} />
                English (US)
              </button>
              <button className="text-sm font-semibold text-dark hover:underline">
                $ USD
              </button>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-sm font-semibold text-dark hover:underline"
              >
                Support & resources
                <ChevronUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
