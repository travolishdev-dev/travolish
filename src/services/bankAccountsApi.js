import { get, post } from '../lib/api'

export async function getBankAccounts(hostId) {
  return get('/api/host/kyc/bank/accounts', { hostId })
}

export async function registerBankAccount(hostId, body) {
  return post(`/api/host/kyc/bank/register?hostId=${hostId}`, body)
}

export async function setPrimaryBankAccount(hostId, bankAccountId) {
  return post(`/api/host/kyc/bank/${bankAccountId}/set-primary?hostId=${hostId}`, {})
}
