import { Globe, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = {
  support: {
    title: 'Support',
    links: [
      { label: 'Help', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  hosting: {
    title: 'Hosting',
    links: [
      { label: 'List your property', href: '#' },
      { label: 'Host dashboard', href: '/host' },
    ],
  },
  travolish: {
    title: 'Travolish',
    links: [
      { label: 'About', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
}

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="footer-pink-grid relative overflow-hidden border-t border-rose-100">
      {/* Links Grid */}
      <div className="relative z-10 max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-7">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-pink-400 shadow-sm">
            <span className="text-xs font-bold text-white">T</span>
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-brand">
            travolish
          </span>
        </Link>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-dark mb-2">{section.title}</h3>
              <ul className="space-y-2">
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
      <div className="relative z-10 border-t border-rose-100/80 bg-white/45">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>© 2026 Travolish, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-semibold text-dark hover:underline">
                <Globe size={16} />
                English (US)
              </button>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-sm font-semibold text-dark hover:underline"
              >
                Back to top
                <ChevronUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
