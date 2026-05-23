import { get, post, put, del } from '../lib/api'

export async function getPricingSuggestions(hotelId = 1) {
  return get(`/api/pricing/suggestions/hotel/${hotelId}`)
}

export async function getPricingSuggestionsByRoom(roomId) {
  return get(`/api/pricing/suggestions/room/${roomId}`)
}

export async function getPendingSuggestions() {
  return get('/api/pricing/suggestions/pending')
}

export async function generatePricingSuggestions(body) {
  return post('/api/pricing/suggestions/generate', body)
}

export async function acceptPricingSuggestion(suggestionId) {
  return post(`/api/pricing/suggestions/${suggestionId}/accept`, {})
}

export async function rejectPricingSuggestion(suggestionId) {
  return post(`/api/pricing/suggestions/${suggestionId}/reject`, {})
}

export async function analyzeDemand(params = {}) {
  return get('/api/pricing/suggestions/analyze/demand', params)
}

export async function analyzeCompetitors(params = {}) {
  return get('/api/pricing/suggestions/analyze/competitors', params)
}

export async function getSeasonalPricing(params = {}) {
  return get('/api/pricing/suggestions/seasonal', params)
}

export async function getPricingRulesForHotel(hotelId = 1) {
  return get(`/api/inventory/pricing/rules/hotel/${hotelId}`)
}

export async function createPricingRule(body) {
  return post('/api/inventory/pricing/rules', body)
}

export async function updatePricingRule(ruleId, body) {
  return put(`/api/inventory/pricing/rules/${ruleId}`, body)
}

export async function deletePricingRule(ruleId) {
  return del(`/api/inventory/pricing/rules/${ruleId}`)
}

export async function togglePricingRule(ruleId) {
  return put(`/api/inventory/pricing/rules/${ruleId}/toggle`, {})
}
