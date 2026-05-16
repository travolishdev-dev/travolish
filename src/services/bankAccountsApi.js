import { get, post } from '../lib/api'

export async function getBankAccounts(hostId = 1) {
  return get('/api/host/kyc/bank/accounts', { hostId })
}

export async function registerBankAccount(body) {
  return post('/api/host/kyc/bank/register', body)
}

export async function setPrimaryBankAccount(bankAccountId) {
  return post(`/api/host/kyc/bank/${bankAccountId}/set-primary`, {})
}
