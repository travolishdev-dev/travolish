import { get, post } from '../lib/api'

export async function getPayoutBalance(hostId = 1) {
  return get('/api/payouts/balance', { hostId })
}

export async function getPayoutHistory(hostId = 1) {
  return get('/api/payouts/history', { hostId })
}

export async function requestPayout(body) {
  return post('/api/payouts/request', body)
}
