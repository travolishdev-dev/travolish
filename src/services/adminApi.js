import { get, post, put, del, patch } from '../lib/api'

// ─── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = (role, status) =>
  get('/api/users', { ...(role ? { role } : {}), ...(status ? { status } : {}) })

export const deleteUser = (id) => del(`/api/users/${id}`)

export const updateUserStatus = (id, status) => patch(`/api/users/${id}/status`, { status })

export const updateUserRole = (id, role) => patch(`/api/users/${id}/role`, { role })

// ─── Hotel Change Requests (Listing Approvals) ────────────────────────────────
export const getHotelRequests = (status) =>
  get('/api/hotel-requests', status ? { status } : {})

export const approveHotelRequest = (id, comment) =>
  post(`/api/hotel-requests/${id}/approve${comment ? `?comment=${encodeURIComponent(comment)}` : ''}`)

export const rejectHotelRequest = (id, comment) =>
  post(`/api/hotel-requests/${id}/reject${comment ? `?comment=${encodeURIComponent(comment)}` : ''}`)

// ─── Moderation (Reviews) ─────────────────────────────────────────────────────
export const getFlaggedReviews = (page = 0, size = 50) =>
  get('/api/reviews/moderation/flagged', { page, size })

export const getPendingReviews = (page = 0, size = 50) =>
  get('/api/reviews/moderation/pending', { page, size })

export const approveReview = (id, moderatorId = 1) =>
  post(`/api/reviews/${id}/approve`, undefined, { 'X-Moderator-Id': String(moderatorId) })

export const rejectReview = (id, reason = 'Policy violation', moderatorId = 1) =>
  post(
    `/api/reviews/${id}/reject?reason=${encodeURIComponent(reason)}`,
    undefined,
    { 'X-Moderator-Id': String(moderatorId) },
  )

export const flagReview = (id) => post(`/api/reviews/${id}/flag`)

export const escalateReview = (id) => post(`/api/reviews/${id}/escalate`)

// ─── KYC Verification (Admin) ─────────────────────────────────────────────────
export const getAllKYC = (status) =>
  get('/api/admin/kyc', status ? { status } : {})

export const getPendingKYC = () => get('/api/admin/kyc/pending')

export const approveKYC = (id) => post(`/api/admin/kyc/${id}/approve`)

export const rejectKYC = (id, reason = 'Admin decision') =>
  post(`/api/admin/kyc/${id}/reject?reason=${encodeURIComponent(reason)}`)

export const requestKYCResubmit = (id, reason = 'Additional documents required') =>
  post(`/api/admin/kyc/${id}/request-resubmit?reason=${encodeURIComponent(reason)}`)

// ─── Pricing Rules ────────────────────────────────────────────────────────────
export const getPricingRulesByType = (ruleType) =>
  get(`/api/inventory/pricing/rules/type/${ruleType}`)

export const getAllPricingRules = () =>
  Promise.all(
    ['SEASONAL', 'PROMOTIONAL', 'DYNAMIC', 'EARLY_BIRD', 'LAST_MINUTE', 'BULK', 'LOYALTY'].map(
      (type) => getPricingRulesByType(type).catch(() => []),
    ),
  ).then((results) => results.flat())

export const togglePricingRule = (ruleId, isActive) =>
  put(`/api/inventory/pricing/rules/${ruleId}/toggle?isActive=${isActive}`)

export const deletePricingRule = (ruleId) => del(`/api/inventory/pricing/rules/${ruleId}`)

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
