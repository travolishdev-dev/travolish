import { get, post } from '../lib/api'

export async function getKycProfile(hostId) {
  return get('/api/host/kyc/profile', { hostId })
}

export async function getKycStatus(hostId) {
  return get('/api/host/kyc/status', { hostId })
}

export async function getVerificationStatus(hostId) {
  return get('/api/host/kyc/verification/status', { hostId })
}

export async function getKycDocuments(hostId) {
  return get('/api/host/kyc/documents', { hostId })
}

export async function uploadKycDocument(hostId, body) {
  return post(`/api/host/kyc/document/upload?hostId=${hostId}`, body)
}

export async function submitKyc(hostId, body) {
  // Map frontend field names to backend SubmitKYCRequest field names.
  // vatGstNumber has no backend field yet — merged into taxId.
  const { taxNumber, vatGstNumber, ...rest } = body
  const mappedBody = {
    ...rest,
    taxId: taxNumber || vatGstNumber || body.taxId || '',
  }
  return post(`/api/host/kyc/submit-redirect?hostId=${hostId}`, mappedBody)
}
