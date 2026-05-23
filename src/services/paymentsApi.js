import { get, post, del } from '../lib/api'

export async function getReceipt(bookingId) {
  return get(`/api/payments/receipt/${bookingId}`)
}

export async function getPaymentHistory({ page = 0, size = 20 } = {}) {
  return get('/api/payments/history', { page, size })
}

export async function getPaymentMethods() {
  return get('/api/payments/methods')
}

export async function addPaymentMethod(body) {
  return post('/api/payments/methods', body)
}

export async function removePaymentMethod(id) {
  return del(`/api/payments/methods/${id}`)
}

export async function processRefund(body) {
  return post('/api/payments/refund', body)
}
