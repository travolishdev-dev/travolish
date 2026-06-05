import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AuthModal from './components/auth/AuthModal'
import TravellerAssistantWidget from './components/traveller/TravellerAssistantWidget'
import HomePage from './pages/HomePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import WishlistPage from './pages/WishlistPage'
import SearchPage from './pages/SearchPage'
import OffersPage from './pages/OffersPage'
import TravellerEmergencyPage from './pages/TravellerEmergencyPage'
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
import HostDashboardPage from './pages/host/HostDashboardPage'
import HostBookingsPage from './pages/host/HostBookingsPage'
import HostListingsPage from './pages/host/HostListingsPage'
import HostListingEditorPage from './pages/host/HostListingEditorPage'
import HostRoomsPage from './pages/host/HostRoomsPage'
import HostRoomEditorPage from './pages/host/HostRoomEditorPage'
import HostAvailabilityPage from './pages/host/HostAvailabilityPage'
import HostInventoryPage from './pages/host/HostInventoryPage'
import HostReportsPage from './pages/host/HostReportsPage'
import HostPricingRulesPage from './pages/host/HostPricingRulesPage'
import HostPromotionsPage from './pages/host/HostPromotionsPage'
import HostPricingAIPage from './pages/host/HostPricingAIPage'
import HostPayoutsPage from './pages/host/HostPayoutsPage'
import HostKycPage from './pages/host/HostKycPage'
import HostBankAccountsPage from './pages/host/HostBankAccountsPage'
import HostAutoRepliesPage from './pages/host/HostAutoRepliesPage'
import HostEmergencyPage from './pages/host/HostEmergencyPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminVerificationPage from './pages/admin/AdminVerificationPage'
import AdminListingApprovalsPage from './pages/admin/AdminListingApprovalsPage'
import AdminModerationPage from './pages/admin/AdminModerationPage'
import AdminCategoriesAmenitiesPage from './pages/admin/AdminCategoriesAmenitiesPage'
import AdminPricingRulesPage from './pages/admin/AdminPricingRulesPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
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
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/offers') ||
    pathname.startsWith('/emergency') ||
    pathname.startsWith('/admin') ||
    (pathname.startsWith('/host') && pathname !== '/host/onboarding')
  )
}

function AppLayout({ children }) {
  const { pathname } = useLocation()
  const portalRoute = isPortalRoute(pathname)
  const adminRoute = pathname.startsWith('/admin')
  const hostRoute = pathname.startsWith('/host')
  const showTravellerAssistant = !adminRoute && !hostRoute

  return (
    <div className="min-h-screen flex flex-col">
      {!adminRoute ? (
        <div className={portalRoute ? 'hidden md:block' : ''}>
          <Navbar />
        </div>
      ) : null}
      <div className="flex-1">{children}</div>
      {showTravellerAssistant ? <TravellerAssistantWidget /> : null}
      {!adminRoute ? (
        <div className={portalRoute ? 'hidden md:block' : ''}>
          <Footer />
        </div>
      ) : null}
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
          path="/offers"
          element={
            <AppLayout>
              <OffersPage />
            </AppLayout>
          }
        />
        <Route
          path="/emergency"
          element={
            <AppLayout>
              <TravellerEmergencyPage />
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
        <Route
          path="/host"
          element={
            <AppLayout>
              <HostDashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/listings"
          element={
            <AppLayout>
              <HostListingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <AppLayout>
              <HostBookingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <AppLayout>
              <HostListingEditorPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/:id/edit"
          element={
            <AppLayout>
              <HostListingEditorPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/:id/rooms"
          element={
            <AppLayout>
              <HostRoomsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/rooms/new"
          element={
            <AppLayout>
              <HostRoomEditorPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/rooms/:id/edit"
          element={
            <AppLayout>
              <HostRoomEditorPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/availability"
          element={
            <AppLayout>
              <HostAvailabilityPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/inventory"
          element={
            <AppLayout>
              <HostInventoryPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/reports"
          element={
            <AppLayout>
              <HostReportsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/pricing"
          element={
            <AppLayout>
              <HostPricingRulesPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/promotions"
          element={
            <AppLayout>
              <HostPromotionsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/pricing-ai"
          element={
            <AppLayout>
              <HostPricingAIPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/payouts"
          element={
            <AppLayout>
              <HostPayoutsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/kyc"
          element={
            <AppLayout>
              <HostKycPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/bank-accounts"
          element={
            <AppLayout>
              <HostBankAccountsPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/auto-replies"
          element={
            <AppLayout>
              <HostAutoRepliesPage />
            </AppLayout>
          }
        />
        <Route
          path="/host/emergency"
          element={
            <AppLayout>
              <HostEmergencyPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AppLayout>
              <AdminDashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AppLayout>
              <AdminUsersPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <AppLayout>
              <AdminVerificationPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/listing-approvals"
          element={
            <AppLayout>
              <AdminListingApprovalsPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <AppLayout>
              <AdminModerationPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AppLayout>
              <AdminBookingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/categories-amenities"
          element={
            <AppLayout>
              <AdminCategoriesAmenitiesPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/pricing-rules"
          element={
            <AppLayout>
              <AdminPricingRulesPage />
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
