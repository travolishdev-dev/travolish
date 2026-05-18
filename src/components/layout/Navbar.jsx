import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import useAuthStore from '../../stores/useAuthStore'

const countryOptions = [
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED' },
]

const languageOptions = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
]

function readStoredCountry() {
  if (typeof window === 'undefined') return 'IN'
  return window.localStorage.getItem('travolish.country') || 'IN'
}

function LanguageRegionModal({ country, onCountryChange, onClose }) {
  const { t, i18n } = useTranslation()
  const activeLanguage = i18n.resolvedLanguage || i18n.language

  const handleCountryChange = (countryCode) => {
    window.localStorage.setItem('travolish.country', countryCode)
    onCountryChange(countryCode)
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
              {t('region.title')}
            </h2>
            <p className="mt-1 text-sm text-muted">{t('region.subtitle')}</p>
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
              {t('region.language')}
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
              {t('region.country')}
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
            {t('region.save')}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

export default function Navbar() {
  const { t } = useTranslation()
  const { user, profile, openAuthModal, signOut } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLocaleOpen, setIsLocaleOpen] = useState(false)
  const [country, setCountry] = useState(readStoredCountry)
  const menuRef = useRef(null)
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'
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

  const getInitial = () => {
    if (profile?.full_name) return profile.full_name[0].toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return 'U'
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-brand to-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-brand text-[22px] font-extrabold tracking-tight hidden sm:block">
              travolish
            </span>
          </Link>

         
          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!hideHostCta && (!profile || profile.role === 'host') && (
              <Link
                to={user ? '/host/onboarding' : '#'}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    openAuthModal()
                  }
                }}
                className="hidden lg:flex px-4 py-2.5 text-sm font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                {t('nav.hostHome')}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsLocaleOpen(true)}
              className="hidden md:flex p-3 rounded-full hover:bg-gray-50 transition-colors"
              aria-label={t('region.title')}
            >
              <Globe size={18} />
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => (user ? setIsMenuOpen(!isMenuOpen) : openAuthModal())}
                className="flex items-center gap-3 border border-gray-200 rounded-full pl-3 pr-1.5 py-1.5 hover:shadow-md transition-all duration-200"
              >
                <Menu size={16} className="text-gray-600" />
                <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
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
                    className="absolute right-0 top-14 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {user ? (
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold truncate">
                            {profile?.full_name || user.email}
                          </p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Settings2 size={16} className="text-gray-600" />
                          {t('nav.account')}
                        </Link>
                        <Link
                          to="/trips"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <CalendarRange size={16} className="text-gray-600" />
                          {t('nav.trips')}
                        </Link>
                        <Link
                          to="/messages"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <MessageCircleMore size={16} className="text-gray-600" />
                          {t('nav.messages')}
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Bell size={16} className="text-gray-600" />
                          {t('nav.notifications')}
                        </Link>
                        <Link
                          to="/host"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={16} className="text-gray-600" />
                          {t('nav.hostDashboard')}
                        </Link>
                        <Link
                          to="/host/listings/new"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} className="text-gray-600" />
                          {t('nav.hostProperty')}
                        </Link>
                        <Link
                          to="/wishlists"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Heart size={16} className="text-gray-600" />
                          {t('nav.wishlists')}
                        </Link>
                        {!hideHostCta && (
                          <Link
                            to="/host/onboarding"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={16} className="text-gray-600" />
                            {t('nav.hostHome')}
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            signOut()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <LogOut size={16} className="text-gray-600" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <button
                          onClick={() => {
                            openAuthModal()
                            setIsMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                          {t('nav.signup')}
                        </button>
                        <button
                          onClick={() => {
                            openAuthModal()
                            setIsMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          {t('nav.login')}
                        </button>
                        <button
                          onClick={() => {
                            openAuthModal()
                            setIsMenuOpen(false)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} className="text-gray-600" />
                          {t('nav.hostProperty')}
                        </button>
                        {!hideHostCta && (
                          <>
                            <hr className="my-1 border-gray-100" />
                            <Link
                              to="#"
                              onClick={(e) => {
                                e.preventDefault()
                                openAuthModal()
                                setIsMenuOpen(false)
                              }}
                              className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                              {t('nav.hostHome')}
                            </Link>
                          </>
                        )}
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
