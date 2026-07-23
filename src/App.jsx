import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AuthModal from './components/auth/AuthModal'
import TravellerAssistantWidget from './components/traveller/TravellerAssistantWidget'

// ── Lazy-loaded page bundles ─────────────────────────────────────────────────
// Each page gets its own chunk; the router only loads what the user navigates to.
const HomePage                    = lazy(() => import('./pages/HomePage'))
const PropertyDetailPage          = lazy(() => import('./pages/PropertyDetailPage'))
const WishlistPage                = lazy(() => import('./pages/WishlistPage'))
const SearchPage                  = lazy(() => import('./pages/SearchPage'))
const OffersPage                  = lazy(() => import('./pages/OffersPage'))
const TravellerEmergencyPage      = lazy(() => import('./pages/TravellerEmergencyPage'))
const MapViewPage                 = lazy(() => import('./pages/MapViewPage'))
const AuthCallbackPage            = lazy(() => import('./pages/AuthCallbackPage'))
const OnboardingPage              = lazy(() => import('./pages/OnboardingPage'))
const AccountPage                 = lazy(() => import('./pages/account/AccountPage'))
const EditProfilePage             = lazy(() => import('./pages/account/EditProfilePage'))
const SecurityPage                = lazy(() => import('./pages/account/SecurityPage'))
const PaymentMethodsPage          = lazy(() => import('./pages/account/PaymentMethodsPage'))
const TransactionsPage            = lazy(() => import('./pages/account/TransactionsPage'))
const NotificationSettingsPage    = lazy(() => import('./pages/account/NotificationSettingsPage'))
const NotificationsPage           = lazy(() => import('./pages/NotificationsPage'))
const TripsPage                   = lazy(() => import('./pages/trips/TripsPage'))
const TripDetailPage              = lazy(() => import('./pages/trips/TripDetailPage'))
const CheckoutPage                = lazy(() => import('./pages/trips/CheckoutPage'))
const MessagesPage                = lazy(() => import('./pages/messages/MessagesPage'))
const ConversationPage            = lazy(() => import('./pages/messages/ConversationPage'))
const MyReviewsPage               = lazy(() => import('./pages/reviews/MyReviewsPage'))
const ReviewEditorPage            = lazy(() => import('./pages/reviews/ReviewEditorPage'))
const HostDashboardPage           = lazy(() => import('./pages/host/HostDashboardPage'))
const HostBookingsPage            = lazy(() => import('./pages/host/HostBookingsPage'))
const HostListingsPage            = lazy(() => import('./pages/host/HostListingsPage'))
const HostListingEditorPage       = lazy(() => import('./pages/host/HostListingEditorPage'))
const HostRoomsPage               = lazy(() => import('./pages/host/HostRoomsPage'))
const HostRoomEditorPage          = lazy(() => import('./pages/host/HostRoomEditorPage'))
const HostAvailabilityPage        = lazy(() => import('./pages/host/HostAvailabilityPage'))
const HostInventoryPage           = lazy(() => import('./pages/host/HostInventoryPage'))
const HostReportsPage             = lazy(() => import('./pages/host/HostReportsPage'))
const HostPricingRulesPage        = lazy(() => import('./pages/host/HostPricingRulesPage'))
const HostPromotionsPage          = lazy(() => import('./pages/host/HostPromotionsPage'))
const HostPricingAIPage           = lazy(() => import('./pages/host/HostPricingAIPage'))
const HostPayoutsPage             = lazy(() => import('./pages/host/HostPayoutsPage'))
const HostKycPage                 = lazy(() => import('./pages/host/HostKycPage'))
const HostCreateListingPage       = lazy(() => import('./pages/host/HostCreateListingPage'))
const HostBankAccountsPage        = lazy(() => import('./pages/host/HostBankAccountsPage'))
const HostGuestReviewPage         = lazy(() => import('./pages/host/HostGuestReviewPage'))
const HostAutoRepliesPage         = lazy(() => import('./pages/host/HostAutoRepliesPage'))
const HostEmergencyPage           = lazy(() => import('./pages/host/HostEmergencyPage'))
const AboutPage                   = lazy(() => import('./pages/AboutPage'))
const CareersPage                 = lazy(() => import('./pages/CareersPage'))
const NewsroomPage                = lazy(() => import('./pages/NewsroomPage'))
const PrivacyPage                 = lazy(() => import('./pages/PrivacyPage'))
const TermsPage                   = lazy(() => import('./pages/TermsPage'))
const HelpPage                    = lazy(() => import('./pages/HelpPage'))
const ContactPage                 = lazy(() => import('./pages/ContactPage'))
const TrustSafetyPage             = lazy(() => import('./pages/TrustSafetyPage'))
const CancellationPolicyPage      = lazy(() => import('./pages/CancellationPolicyPage'))
const DestinationsPage            = lazy(() => import('./pages/DestinationsPage'))
const WeekendGetawaysPage         = lazy(() => import('./pages/WeekendGetawaysPage'))
const GiftCardsPage               = lazy(() => import('./pages/GiftCardsPage'))
const ResponsibleHostingPage      = lazy(() => import('./pages/ResponsibleHostingPage'))
const HostResourcesPage           = lazy(() => import('./pages/HostResourcesPage'))
const AdminDashboardPage          = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminUsersPage              = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminVerificationPage       = lazy(() => import('./pages/admin/AdminVerificationPage'))
const AdminListingApprovalsPage   = lazy(() => import('./pages/admin/AdminListingApprovalsPage'))
const AdminModerationPage         = lazy(() => import('./pages/admin/AdminModerationPage'))
const AdminCategoriesAmenitiesPage = lazy(() => import('./pages/admin/AdminCategoriesAmenitiesPage'))
const AdminPricingRulesPage       = lazy(() => import('./pages/admin/AdminPricingRulesPage'))
const AdminBookingsPage           = lazy(() => import('./pages/admin/AdminBookingsPage'))
const AdminEmailLogsPage          = lazy(() => import('./pages/admin/AdminEmailLogsPage'))
const AdminAuditLogPage           = lazy(() => import('./pages/admin/AdminAuditLogPage'))
import useAuthStore from './stores/useAuthStore'
import useNativeAppLocationStore from './stores/useNativeAppLocationStore'
import ProtectedRoute from './components/auth/ProtectedRoute'

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-brand" />
    </div>
  )
}

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
  const messagesRoute = pathname.startsWith('/messages')
  const showTravellerAssistant = !adminRoute && !hostRoute && !messagesRoute

  return (
    <div className="min-h-screen flex flex-col">
      <div className={portalRoute ? 'hidden md:block' : ''}>
        <Navbar />
      </div>
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
    if (!location.search.includes('native=')) return
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

      <Suspense fallback={<PageFallback />}>
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
          path="/host/reviews/guests/:guestId"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostGuestReviewPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="host">
                <HostCreateListingPage />
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
        <Route
          path="/admin/email-logs"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminEmailLogsPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <AppLayout>
              <ProtectedRoute requireRole="admin">
                <AdminAuditLogPage />
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
      </Suspense>
    </>
  )
}
