import { get, post, put, del, patch } from '../lib/api'
import useAuthStore from '../stores/useAuthStore'

// Reads the logged-in admin's ID from the Zustand store at call time
const getModeratorId = () => useAuthStore.getState().profile?.id ?? 1

// ─── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = (role, status) =>
  get('/api/users', { ...(role ? { role } : {}), ...(status ? { status } : {}) })

export const getUsersPage = (page = 0, size = 50) =>
  get('/api/users', { page, size })

export const deleteUser = (id) => del(`/api/users/${id}`)

export const updateUserStatus = (id, status) => patch(`/api/users/${id}/status`, { status })

export const updateUserRole = (id, role) => patch(`/api/users/${id}/role`, { role })

export const sendUserNotice = (id, message) => post(`/api/users/${id}/notify`, { message })

// ─── Hotel Change Requests (legacy — kept for backward compat) ────────────────
export const getHotelRequests = (status) =>
  get('/api/hotel-requests', status ? { status } : {})

export const approveHotelRequest = (id, comment) =>
  post(`/api/hotel-requests/${id}/approve${comment ? `?comment=${encodeURIComponent(comment)}` : ''}`)

export const rejectHotelRequest = (id, comment) =>
  post(`/api/hotel-requests/${id}/reject${comment ? `?comment=${encodeURIComponent(comment)}` : ''}`)

// ─── Listing Approvals (hotel PENDING_REVIEW queue) ───────────────────────────
export const getHotelsPendingReview = () =>
  get('/api/hotels', { status: 'PENDING_REVIEW' })

export const approveHotel = (id) =>
  patch(`/api/hotels/${id}/status?status=LIVE`)

export const rejectHotel = (id, reason) =>
  patch(`/api/hotels/${id}/status?status=DRAFT${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`)

export const requestHotelFiles = (id, reason) =>
  post(`/api/hotels/${id}/request-documents${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`)

// ─── Moderation (Reviews) ─────────────────────────────────────────────────────
export const getFlaggedReviews = (page = 0, size = 50) =>
  get('/api/reviews/moderation/flagged', { page, size })

export const getPendingReviews = (page = 0, size = 50) =>
  get('/api/reviews/moderation/pending', { page, size })

export const approveReview = (id) =>
  post(`/api/reviews/${id}/approve`, undefined, { 'X-Moderator-Id': String(getModeratorId()) })

export const rejectReview = (id, reason = 'Policy violation') =>
  post(
    `/api/reviews/${id}/reject?reason=${encodeURIComponent(reason)}`,
    undefined,
    { 'X-Moderator-Id': String(getModeratorId()) },
  )

export const dismissReview = (id) => post(`/api/reviews/${id}/dismiss`)

export const flagReview = (id) => post(`/api/reviews/${id}/flag`)

export const escalateReview = (id) => post(`/api/reviews/${id}/escalate`)

export const redactReview = (id) => post(`/api/reviews/${id}/redact`, undefined, { 'X-Moderator-Id': String(getModeratorId()) })

// ─── KYC Verification (Admin) ─────────────────────────────────────────────────
export const getAllKYC = (status) =>
  get('/api/admin/kyc', status ? { status } : {})

export const getPendingKYC = () => get('/api/admin/kyc/pending')

export const getKYCDetail = (id) => get(`/api/admin/kyc/${id}`)

export const approveKYC = (id) => post(`/api/admin/kyc/${id}/approve`)

export const rejectKYC = (id, reason = 'Admin decision') =>
  post(`/api/admin/kyc/${id}/reject?reason=${encodeURIComponent(reason)}`)

export const requestKYCResubmit = (id, reason = 'Additional documents required') =>
  post(`/api/admin/kyc/${id}/request-resubmit?reason=${encodeURIComponent(reason)}`)

// ─── Pricing Rules ────────────────────────────────────────────────────────────
export const getPricingRulesByType = (ruleType) =>
  get(`/api/inventory/pricing/rules/type/${ruleType}`)

export const getAllPricingRules = () => {
  const TYPES = ['SEASONAL', 'PROMOTIONAL', 'DYNAMIC', 'EARLY_BIRD', 'LAST_MINUTE', 'BULK', 'LOYALTY']
  return Promise.allSettled(TYPES.map((type) => getPricingRulesByType(type))).then((results) => {
    const failed = []
    const rules = results.flatMap((r, i) => {
      if (r.status === 'rejected') { failed.push(TYPES[i]); return [] }
      return Array.isArray(r.value) ? r.value : []
    })
    if (failed.length > 0) {
      console.warn('[adminApi] Failed to load pricing rule types:', failed.join(', '))
    }
    return rules
  })
}

export const togglePricingRule = (ruleId, isActive) =>
  put(`/api/inventory/pricing/rules/${ruleId}/toggle?isActive=${isActive}`)

export const deletePricingRule = (ruleId) => del(`/api/inventory/pricing/rules/${ruleId}`)

export const clonePricingRule = (ruleId) => post(`/api/inventory/pricing/rules/${ruleId}/clone`)

export const createPricingRule = (body) => post('/api/inventory/pricing/rules', body)

export const updatePricingRule = (ruleId, body) => put(`/api/inventory/pricing/rules/${ruleId}`, body)

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export const getAdminDashboardStats = () => get('/api/admin/dashboard/stats')

// ─── Catalog (Categories & Amenities) ────────────────────────────────────────
export const getAllCatalogItems = (type, status) =>
  get('/api/admin/catalog', { ...(type ? { type } : {}), ...(status ? { status } : {}) })

export const createCatalogItem = (item) => post('/api/admin/catalog', item)

export const updateCatalogItem = (id, item) => put(`/api/admin/catalog/${id}`, item)

export const toggleCatalogItem = (id, newStatus) =>
  patch(`/api/admin/catalog/${id}/toggle?status=${encodeURIComponent(newStatus)}`)

export const deleteCatalogItem = (id) => del(`/api/admin/catalog/${id}`)

// ─── Email Activity Log ───────────────────────────────────────────────────────
export const getEmailLogs = (params = {}) => get('/api/admin/email-logs', params)
export const getEmailLogStats = () => get('/api/admin/email-logs/stats')

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const getAdminAlerts = () => get('/api/admin/alerts')

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const getAuditLogs = (entityType, entityId, { search, page = 0, size = 30 } = {}) =>
  get('/api/admin/audit-logs', {
    ...(entityType ? { entityType } : {}),
    ...(entityId != null ? { entityId } : {}),
    ...(search?.trim() ? { search: search.trim() } : {}),
    page,
    size,
  })
export const createAuditLog = (entry) => post('/api/admin/audit-logs', entry)

// ─── Catalog reorder ─────────────────────────────────────────────────────────
export const reorderCatalogItem = (id, displayOrder) =>
  patch(`/api/admin/catalog/${id}/order?displayOrder=${displayOrder}`)

// ─── KYC reviewer assignment ──────────────────────────────────────────────────
export const assignKYCReviewer = (id, reviewerId) =>
  patch(`/api/admin/kyc/${id}/assign?reviewerId=${reviewerId}`)

// ─── Moderation assignment ────────────────────────────────────────────────────
export const assignModerator = (reviewId, moderatorId) =>
  patch(`/api/reviews/${reviewId}/assign?moderatorId=${moderatorId}`)

// ─── Admin-enriched bookings (includes hotelName) ────────────────────────────
export const getAdminBookings = ({ page = 0, size = 20, search = '', status = 'ALL' } = {}) => {
  const params = { page, size }
  if (search) params.search = search
  if (status && status !== 'ALL') params.status = status
  return get('/api/bookings/admin', params)
}

export const confirmAdminBooking = (id) => post(`/api/bookings/${id}/confirm`)

// ─── Admin global search ──────────────────────────────────────────────────────
export const adminSearch = async (q) => {
  if (!q || !q.trim()) return { users: [], hotels: [], bookings: [] }
  const [users, hotels, bookings] = await Promise.allSettled([
    get('/api/users', { search: q }),
    get('/api/hotels', { search: q }),
    get('/api/bookings/admin', { search: q, size: 5 }),
  ])
  return {
    users: users.status === 'fulfilled' ? (Array.isArray(users.value) ? users.value.slice(0, 5) : []) : [],
    hotels: hotels.status === 'fulfilled' ? (Array.isArray(hotels.value) ? hotels.value.slice(0, 5) : []) : [],
    bookings: bookings.status === 'fulfilled' ? (Array.isArray(bookings.value?.content) ? bookings.value.content.slice(0, 5) : []) : [],
  }
}
