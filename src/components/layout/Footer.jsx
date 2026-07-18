import { Globe, ChevronUp, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TravolishWordmark from '../common/TravolishWordmark'

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter,   label: 'Twitter',   href: '#' },
  { icon: Facebook,  label: 'Facebook',  href: '#' },
  { icon: Linkedin,  label: 'LinkedIn',  href: '#' },
]

const LANG_LABELS = { en: 'English (US)', hi: 'हिन्दी', es: 'Español', fr: 'Français', ar: 'العربية' }

export default function Footer() {
  const { t, i18n } = useTranslation('footer')
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const langLabel = LANG_LABELS[i18n.resolvedLanguage || 'en'] ?? 'English (US)'

  const footerLinks = {
    discover: {
      title: t('sections.discover'),
      links: [
        { label: t('links.browseHotels'),      href: '/search' },
        { label: t('links.topDestinations'),   href: '/destinations' },
        { label: t('links.weekendGetaways'),   href: '/weekend-getaways' },
        { label: t('links.giftCards'),         href: '/gift-cards' },
      ],
    },
    support: {
      title: t('sections.support'),
      links: [
        { label: t('links.helpCentre'),            href: '/help' },
        { label: t('links.contactUs'),             href: '/contact' },
        { label: t('links.trustSafety'),           href: '/trust-safety' },
        { label: t('links.cancellationOptions'),   href: '/cancellation-policy' },
      ],
    },
    hosting: {
      title: t('sections.hosting'),
      links: [
        { label: t('links.listProperty'),         href: '/host/onboarding' },
        { label: t('links.hostDashboard'),        href: '/host' },
        { label: t('links.responsibleHosting'),   href: '/responsible-hosting' },
        { label: t('links.hostResources'),        href: '/host-resources' },
      ],
    },
    company: {
      title: t('sections.travolish'),
      links: [
        { label: t('links.aboutUs'),        href: '/about' },
        { label: t('links.careers'),        href: '/careers' },
        { label: t('links.newsroom'),       href: '/newsroom' },
        { label: t('links.privacyPolicy'),  href: '/privacy' },
        { label: t('links.termsOfService'), href: '/terms' },
      ],
    },
  }

  return (
    <footer className="footer-pink-grid relative overflow-hidden border-t border-rose-100">

      {/* Main grid */}
      <div className="relative z-10 max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center">
              <TravolishWordmark className="h-10 sm:h-11" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand/25 hover:bg-rose-50/70 transition-all shadow-sm"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-bold text-dark mb-3">{section.title}</h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-500 hover:text-brand transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-rose-100/80 bg-white/45">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>{t('copyright')}</span>
              <span className="text-rose-200">·</span>
              <Link to="/privacy" className="hover:text-brand transition-colors">{t('links.privacy')}</Link>
              <span className="text-rose-200">·</span>
              <Link to="/terms" className="hover:text-brand transition-colors">{t('links.terms')}</Link>
              <span className="text-rose-200">·</span>
              <Link to="/destinations" className="hover:text-brand transition-colors">{t('links.sitemap')}</Link>
            </div>
            <div className="flex items-center gap-5">
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand transition-colors">
                <Globe size={15} />
                {langLabel}
              </button>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand transition-colors"
              >
                {t('backToTop')}
                <ChevronUp size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
