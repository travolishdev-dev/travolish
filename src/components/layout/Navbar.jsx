import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Settings2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import useAuthStore from '../../stores/useAuthStore'
import useNativeAppLocationStore from '../../stores/useNativeAppLocationStore'
import {
  formatCoordinates,
  formatPlatformLabel,
} from '../../lib/nativeAppLocation'

export default function Navbar() {
  const { user, profile, openAuthModal, signOut } = useAuthStore()
  const {
    isNativeAppLaunch,
    hasSharedLocation,
    locationPermission,
    latitude,
    longitude,
    platform,
  } = useNativeAppLocationStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

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

  const locationTitle = hasSharedLocation
    ? 'Current location'
    : isNativeAppLaunch
      ? 'Location unavailable'
      : 'Anywhere'
  const locationMeta = hasSharedLocation
    ? formatCoordinates(latitude, longitude)
    : isNativeAppLaunch
      ? `Permission: ${locationPermission || 'unknown'}`
      : 'Any week'
  const guestLabel = isNativeAppLaunch
    ? formatPlatformLabel(platform)
    : 'Add guests'

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

          {/* Search Bar Trigger */}
          <button
            onClick={() => navigate('/search')}
            className="hidden md:flex items-center border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200 px-2 py-2 gap-1"
          >
            <span className="text-sm font-semibold px-4 border-r border-gray-200">
              {locationTitle}
            </span>
            <span className="text-sm font-semibold px-4 border-r border-gray-200">
              {locationMeta}
            </span>
            <span className="text-sm text-muted px-4">{guestLabel}</span>
            <div className="bg-brand rounded-full p-2 ml-1">
              <Search size={14} className="text-white" strokeWidth={3} />
            </div>
          </button>

          {/* Mobile Search */}
          <button
            onClick={() => navigate('/search')}
            className="md:hidden flex items-center gap-3 flex-1 mx-4 border border-gray-200 rounded-full shadow-sm px-4 py-2.5"
          >
            <Search size={18} className="text-dark" />
            <div className="text-left">
              <p className="text-xs font-semibold">{locationTitle}</p>
              <p className="text-xs text-muted">
                {locationMeta} · {guestLabel}
              </p>
            </div>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {(!profile || profile.role === 'host') && (
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
                Travolish your home
              </Link>
            )}
            <button className="hidden md:flex p-3 rounded-full hover:bg-gray-50 transition-colors">
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
                  <motion.div
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
                          Account
                        </Link>
                        <Link
                          to="/trips"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <CalendarRange size={16} className="text-gray-600" />
                          Trips
                        </Link>
                        <Link
                          to="/messages"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <MessageCircleMore size={16} className="text-gray-600" />
                          Messages
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Bell size={16} className="text-gray-600" />
                          Notifications
                        </Link>
                        <Link
                          to="/wishlists"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Heart size={16} className="text-gray-600" />
                          Wishlists
                        </Link>
                        <Link
                          to="/host/onboarding"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} className="text-gray-600" />
                          Travolish your home
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            signOut()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <LogOut size={16} className="text-gray-600" />
                          Log out
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
                          Sign up
                        </button>
                        <button
                          onClick={() => {
                            openAuthModal()
                            setIsMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          Log in
                        </button>
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
                          Travolish your home
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
