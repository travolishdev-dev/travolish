import { get, post } from '../lib/api'

export async function getGuestKycProfile(guestId) {
  return get('/api/guest/kyc/profile', { guestId })
}

export async function getGuestKycStatus(guestId) {
  return get('/api/guest/kyc/status', { guestId })
}

export async function getGuestVerificationStatus(guestId) {
  return get('/api/guest/kyc/verification/status', { guestId })
}

export async function getGuestKycDocuments(guestId) {
  return get('/api/guest/kyc/documents', { guestId })
}

export async function uploadGuestKycDocument(guestId, body) {
  return post(`/api/guest/kyc/document/upload?guestId=${guestId}`, body)
}

export async function submitGuestKyc(guestId, body) {
  return post(`/api/guest/kyc/submit?guestId=${guestId}`, body)
}
