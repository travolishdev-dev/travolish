import { get, put } from '../lib/api'

export async function getTaxProfile(hostId) {
  return get('/api/tax/profile', { hostId })
}

export async function updateTaxProfile(body) {
  return put('/api/tax/profile', body)
}

export async function getTaxDocuments(hostId) {
  return get('/api/tax/documents', { hostId })
}
