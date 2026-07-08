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
import AboutPage from './pages/AboutPage'
import CareersPage from './pages/CareersPage'
import NewsroomPage from './pages/NewsroomPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import HelpPage from './pages/HelpPage'
import ContactPage from './pages/ContactPage'
import TrustSafetyPage from './pages/TrustSafetyPage'
import CancellationPolicyPage from './pages/CancellationPolicyPage'
import DestinationsPage from './pages/DestinationsPage'
import WeekendGetawaysPage from './pages/WeekendGetawaysPage'
import GiftCardsPage from './pages/GiftCardsPage'
import ResponsibleHostingPage from './pages/ResponsibleHostingPage'
import HostResourcesPage from './pages/HostResourcesPage'
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
import ProtectedRoute from './components/auth/ProtectedRoute'

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
              <ProtectedRoute requireAuth>
                <WishlistPage />
              </ProtectedRoute>
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
              <ProtectedRoute requireAuth>
                <OffersPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/emergency"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <TravellerEmergencyPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <AccountPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/edit"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <EditProfilePage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/security"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <SecurityPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/payments"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <PaymentMethodsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/transactions"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <TransactionsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/notification-settings"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <NotificationSettingsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <NotificationsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/trips"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <TripsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <TripDetailPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/checkout/:propertyId"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <CheckoutPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/messages"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <MessagesPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <ConversationPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/reviews/me"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <MyReviewsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/reviews/new"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <ReviewEditorPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/reviews/:reviewId/edit"
          element={
            <AppLayout>
              <ProtectedRoute requireAuth>
                <ReviewEditorPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostDashboardPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/listings"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostListingsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostBookingsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostListingEditorPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/:id/edit"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostListingEditorPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/:id/rooms"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostRoomsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/rooms/new"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostRoomEditorPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/rooms/:id/edit"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostRoomEditorPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/availability"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostAvailabilityPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/inventory"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostInventoryPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/reports"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostReportsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/pricing"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostPricingRulesPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/promotions"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostPromotionsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/pricing-ai"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostPricingAIPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/payouts"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostPayoutsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/kyc"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostKycPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/bank-accounts"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostBankAccountsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/auto-replies"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostAutoRepliesPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/emergency"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostEmergencyPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminUsersPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminVerificationPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/listing-approvals"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminListingApprovalsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminModerationPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminBookingsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/categories-amenities"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminCategoriesAmenitiesPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/pricing-rules"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminPricingRulesPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />

        {/* Footer pages */}
        <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
        <Route path="/careers" element={<AppLayout><CareersPage /></AppLayout>} />
        <Route path="/newsroom" element={<AppLayout><NewsroomPage /></AppLayout>} />
        <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
        <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
        <Route path="/help" element={<AppLayout><HelpPage /></AppLayout>} />
        <Route path="/contact" element={<AppLayout><ContactPage /></AppLayout>} />
        <Route path="/trust-safety" element={<AppLayout><TrustSafetyPage /></AppLayout>} />
        <Route path="/cancellation-policy" element={<AppLayout><CancellationPolicyPage /></AppLayout>} />
        <Route path="/destinations" element={<AppLayout><DestinationsPage /></AppLayout>} />
        <Route path="/weekend-getaways" element={<AppLayout><WeekendGetawaysPage /></AppLayout>} />
        <Route path="/gift-cards" element={<AppLayout><GiftCardsPage /></AppLayout>} />
        <Route path="/responsible-hosting" element={<AppLayout><ResponsibleHostingPage /></AppLayout>} />
        <Route path="/host-resources" element={<AppLayout><HostResourcesPage /></AppLayout>} />

        {/* Standalone pages (no Navbar/Footer) */}
        <Route path="/map-view" element={<MapViewPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/host/onboarding" element={<OnboardingPage />} />
      </Routes>
    </>
  )
}
