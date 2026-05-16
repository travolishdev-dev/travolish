import { get, post, del } from '../lib/api'

export async function getUserPaymentMethods() {
  return get('/api/payments/methods')
}

export async function addPaymentMethod(body) {
  return post('/api/payments/methods', body)
}

export async function removePaymentMethod(id) {
  return del(`/api/payments/methods/${id}`)
}
