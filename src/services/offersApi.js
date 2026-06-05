import { get } from '../lib/api'

/** All active traveller-facing offers (PROMOTIONAL, EARLY_BIRD, LAST_MINUTE, LOYALTY). */
export async function getActiveOffers() {
  return get('/api/offers')
}

/**
 * Validate a promo code and return the offer details.
 * Throws / rejects when the code is not found.
 */
export async function validatePromoCode(code) {
  return get('/api/offers/validate', { code })
}

/** Travel credits balance for an authenticated user. */
export async function getUserCredits(userId) {
  return get('/api/offers/credits', { userId })
}
