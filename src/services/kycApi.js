import { get, post } from '../lib/api'

export async function getKycProfile(hostId = 1) {
  return get('/api/host/kyc/profile', { hostId })
}

export async function getKycStatus(hostId = 1) {
  return get('/api/host/kyc/status', { hostId })
}

export async function getVerificationStatus(hostId = 1) {
  return get('/api/host/kyc/verification/status', { hostId })
}

export async function getKycDocuments(hostId = 1) {
  return get('/api/host/kyc/documents', { hostId })
}

export async function uploadKycDocument(body) {
  return post('/api/host/kyc/document/upload', body)
}

export async function submitKyc(body) {
  return post('/api/host/kyc/submit-redirect', body)
}
