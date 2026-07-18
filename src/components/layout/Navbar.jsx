import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  Globe,
  Menu,
  User,
  Heart,
  Plus,
  LogOut,
  Bell,
  CalendarRange,
  MessageCircleMore,
  LayoutDashboard,
  Settings2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import TravolishWordmark from '../common/TravolishWordmark'
import ThemeToggle from '../common/ThemeToggle'
import useAuthStore from '../../stores/useAuthStore'
import useRole from '../../hooks/useRole'
import { getUnreadCount } from '../../services/notificationsApi'

const countryOptions = [
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED' },
  { code: 'FR', label: 'France', currency: 'EUR' },
]

const languageOptions = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
]

function readStoredCountry() {
  if (typeof window === 'undefined') return 'IN'
  return window.localStorage.getItem('travolish.country') || 'IN'
}

function LanguageRegionModal({ country, onCountryChange, onClose }) {
  const { t, i18n } = useTranslation(['nav', 'common'])
  const activeLanguage = i18n.resolvedLanguage || i18n.language

  const handleCountryChange = (countryCode) => {
    window.localStorage.setItem('travolish.country', countryCode)
    onCountryChange(countryCode)
    window.dispatchEvent(new CustomEvent('travolish-region-change'))
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4"
      onMouseDown={onClose}
    >
      <Motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-dark">
              {t('common:region.title')}
            </h2>
            <p className="mt-1 text-sm text-muted">{t('common:region.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-dark transition-colors hover:bg-gray-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 px-6 py-6 md:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold text-dark">
              {t('common:region.language')}
            </h3>
            <div className="mt-3 space-y-2">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => i18n.changeLanguage(option.code)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                    activeLanguage === option.code
                      ? 'border-dark bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-dark">
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted">
                      {option.nativeLabel}
                    </span>
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      activeLanguage === option.code ? 'bg-brand' : 'bg-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-dark">
              {t('common:region.country')}
            </h3>
            <div className="mt-3 space-y-2">
              {countryOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleCountryChange(option.code)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                    country === option.code
                      ? 'border-dark bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-dark">
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted">
                      {option.currency}
                    </span>
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      country === option.code ? 'bg-brand' : 'bg-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            {t('common:region.save')}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

export default function Navbar() {
  const { t } = useTranslation(['nav', 'common'])
  const { user, profile, openAuthModal, signOut } = useAuthStore()
  const { isHost, isAdmin } = useRole()
  const backendUserId = useAuthStore((s) => s.backendUserId)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLocaleOpen, setIsLocaleOpen] = useState(false)
  const [country, setCountry] = useState(readStoredCountry)
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'
  const isTransparent = isHomePage && !isScrolled
  const hideCompactSearch =
    isHomePage || pathname === '/search' || pathname.startsWith('/property/')
  const hideHostCta = hideCompactSearch

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!backendUserId) { setUnreadCount(0); return }
    getUnreadCount(backendUserId)
      .then((data) => setUnreadCount(typeof data === 'number' ? data : (data?.count ?? 0)))
      .catch(() => {})
  }, [backendUserId])

  const getInitial = () => {
    if (profile?.full_name) return profile.full_name[0].toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return 'U'
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent border-b border-white/10'
          : `bg-white/95 backdrop-blur-sm ${isScrolled ? 'shadow-[0_1px_24px_rgba(15,23,42,0.08)]' : 'border-b border-gray-100/80'}`
      }`}
    >
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-shrink-0 items-center">
            <TravolishWordmark
              className="h-10 sm:h-12 transition-[filter] duration-500"
              style={isTransparent ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
          </Link>

         
          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <ThemeToggle className={`hidden md:flex ${isTransparent ? 'text-white' : ''}`} />
            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className={`hidden md:flex p-3 rounded-full transition-colors ${isTransparent ? 'text-white/85 hover:bg-white/10' : 'hover:bg-gray-50'}`}
              aria-label={t('common:region.title')}
            >
              <Globe size={18} />
            </button>

            {user && (
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className={`relative flex p-3 rounded-full transition-colors ${isTransparent ? 'text-white/85 hover:bg-white/10' : 'hover:bg-gray-50'}`}
                aria-label={t('nav:notifications')}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => (user ? setIsMenuOpen(!isMenuOpen) : openAuthModal())}
                className={`flex items-center gap-3 rounded-full pl-3 pr-1.5 py-1.5 transition-all duration-200 ${
                  isTransparent
                    ? 'border border-white/25 hover:bg-white/10'
                    : 'border border-gray-200 hover:shadow-md'
                }`}
              >
                <Menu size={16} className={isTransparent ? 'text-white/80' : 'text-gray-600'} />
                <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
                  {user ? (
                    <span className="text-white text-xs font-semibold">{getInitial()}</span>
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-14 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.05] overflow-hidden z-50"
                  >
                    {user ? (
                      <div>
                        {/* User header */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-sm font-semibold text-white">
                            {getInitial()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-dark">
                              {profile?.full_name || user.email}
                            </p>
                            <p className="truncate text-xs text-muted">{user.email}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            profile?.role === 'admin'
                              ? 'bg-red-100 text-red-600'
                              : profile?.role === 'host'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {profile?.role || 'guest'}
                          </span>
                        </div>

                        {/* Traveller section */}
                        <div className="px-2 pt-3 pb-1">
                          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted/60">{t('nav:traveller')}</p>
                          <Link to="/account" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                            <Settings2 size={15} className="text-gray-400" />
                            {t('nav:account')}
                          </Link>
                          <Link to="/trips" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                            <CalendarRange size={15} className="text-gray-400" />
                            {t('nav:trips')}
                          </Link>
                          <Link to="/messages" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                            <MessageCircleMore size={15} className="text-gray-400" />
                            {t('nav:messages')}
                          </Link>
                          <Link to="/wishlists" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                            <Heart size={15} className="text-gray-400" />
                            {t('nav:wishlists')}
                          </Link>
                        </div>

                        {/* Hosting section — host and admin only */}
                        {(isHost || isAdmin) && (
                          <div className="px-2 pt-2 pb-1">
                            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted/60">{t('nav:hosting')}</p>
                            <Link to="/host" onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                              <LayoutDashboard size={15} className="text-gray-400" />
                              {t('nav:hostDashboard')}
                            </Link>
                            <Link to="/host/listings/new" onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                              <Plus size={15} className="text-gray-400" />
                              {t('nav:listNewProperty')}
                            </Link>
                          </div>
                        )}

                        {/* Admin section — admin only */}
                        {isAdmin && (
                          <div className="px-2 pt-2 pb-1">
                            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted/60">{t('nav:admin')}</p>
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                              <LayoutDashboard size={15} className="text-red-400" />
                              {t('nav:adminDashboard')}
                            </Link>
                          </div>
                        )}

                        {/* Become a host — guests only */}
                        {!isHost && !isAdmin && (
                          <div className="px-2 pt-2 pb-1">
                            <Link to="/host/onboarding" onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-50">
                              <Plus size={15} className="text-gray-400" />
                              {t('nav:becomeHost')}
                            </Link>
                          </div>
                        )}

                        {/* Sign out */}
                        <div className="px-2 pb-2 pt-1 border-t border-gray-100 mt-1">
                          <button
                            onClick={() => { signOut(); setIsMenuOpen(false) }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                          >
                            <LogOut size={15} className="text-red-400" />
                            {t('nav:logout')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <button
                          onClick={() => { openAuthModal(); setIsMenuOpen(false) }}
                          className="w-full rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                        >
                          {t('nav:signup')} / {t('nav:login')}
                        </button>
                        <div className="mt-1">
                          <Link
                            to="/search"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-dark transition-colors hover:bg-gray-50"
                          >
                            <Search size={15} className="text-gray-400" />
                            Search stays
                          </Link>
                          <Link
                            to="/host/onboarding"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-dark transition-colors hover:bg-gray-50"
                          >
                            <Plus size={15} className="text-gray-400" />
                            {t('nav:becomeHost')}
                          </Link>
                        </div>
                      </div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isLocaleOpen && (
          <LanguageRegionModal
            country={country}
            onCountryChange={setCountry}
            onClose={() => setIsLocaleOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  )
}
