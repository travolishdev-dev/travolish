import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AuthModal from './components/auth/AuthModal'
import HomePage from './pages/HomePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import WishlistPage from './pages/WishlistPage'
import SearchPage from './pages/SearchPage'
import MapViewPage from './pages/MapViewPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import OnboardingPage from './pages/OnboardingPage'
import AccountPage from './pages/account/AccountPage'
import EditProfilePage from './pages/account/EditProfilePage'
import SecurityPage from './pages/account/SecurityPage'
import PaymentMethodsPage from './pages/account/PaymentMethodsPage'
import TransactionsPage from './pages/account/TransactionsPage'
import NotificationSettingsPage from './pages/account/NotificationSettingsPage'
import NotificationsPage from './pages/NotificationsPage'
import TripsPage from './pages/trips/TripsPage'
import TripDetailPage from './pages/trips/TripDetailPage'
import CheckoutPage from './pages/trips/CheckoutPage'
import MessagesPage from './pages/messages/MessagesPage'
import ConversationPage from './pages/messages/ConversationPage'
import MyReviewsPage from './pages/reviews/MyReviewsPage'
import ReviewEditorPage from './pages/reviews/ReviewEditorPage'
import useAuthStore from './stores/useAuthStore'
import useNativeAppLocationStore from './stores/useNativeAppLocationStore'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function isPortalRoute(pathname) {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/trips') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/reviews')
  )
}

function AppLayout({ children }) {
  const { pathname } = useLocation()
  const portalRoute = isPortalRoute(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <div className={portalRoute ? 'hidden md:block' : ''}>
        <Navbar />
      </div>
      <div className="flex-1">{children}</div>
      <div className={portalRoute ? 'hidden md:block' : ''}>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const initialize = useAuthStore((s) => s.initialize)
  const hydrateNativeAppLocation = useNativeAppLocationStore((s) => s.hydrate)
  const initializeNativeAppLocation = useNativeAppLocationStore(
    (s) => s.initializeFromSearch,
  )

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    hydrateNativeAppLocation()
  }, [hydrateNativeAppLocation])

  useEffect(() => {
    initializeNativeAppLocation(location.search)
  }, [initializeNativeAppLocation, location.search])

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#222222',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 20px',
          },
        }}
      />
      <AuthModal />

      <Routes>
        {/* Pages with Navbar + Footer */}
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        <Route
          path="/property/:id"
          element={
            <AppLayout>
              <PropertyDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/wishlists"
          element={
            <AppLayout>
              <WishlistPage />
            </AppLayout>
          }
        />
        <Route
          path="/search"
          element={
            <AppLayout>
              <SearchPage />
            </AppLayout>
          }
        />
        <Route
          path="/account"
          element={
            <AppLayout>
              <AccountPage />
            </AppLayout>
          }
        />
        <Route
          path="/account/edit"
          element={
            <AppLayout>
              <EditProfilePage />
            </AppLayout>
          }
        />
        <Route
          path="/account/security"
          element={
            <AppLayout>
              <SecurityPage />
            </AppLayout>
          }
        />
        <Route
          path="/account/payments"
          element={
            <AppLayout>
              <PaymentMethodsPage />
            </AppLayout>
          }
        />
        <Route
          path="/account/transactions"
          element={
            <AppLayout>
              <TransactionsPage />
            </AppLayout>
          }
        />
        <Route
          path="/account/notification-settings"
          element={
            <AppLayout>
              <NotificationSettingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          }
        />
        <Route
          path="/trips"
          element={
            <AppLayout>
              <TripsPage />
            </AppLayout>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <AppLayout>
              <TripDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/checkout/:propertyId"
          element={
            <AppLayout>
              <CheckoutPage />
            </AppLayout>
          }
        />
        <Route
          path="/messages"
          element={
            <AppLayout>
              <MessagesPage />
            </AppLayout>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <AppLayout>
              <ConversationPage />
            </AppLayout>
          }
        />
        <Route
          path="/reviews/me"
          element={
            <AppLayout>
              <MyReviewsPage />
            </AppLayout>
          }
        />
        <Route
          path="/reviews/new"
          element={
            <AppLayout>
              <ReviewEditorPage />
            </AppLayout>
          }
        />
        <Route
          path="/reviews/:reviewId/edit"
          element={
            <AppLayout>
              <ReviewEditorPage />
            </AppLayout>
          }
        />

        {/* Standalone pages (no Navbar/Footer) */}
        <Route path="/map-view" element={<MapViewPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/host/onboarding" element={<OnboardingPage />} />
      </Routes>
    </>
  )
}
