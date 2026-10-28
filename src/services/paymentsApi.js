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

/**
 * Step 1 of Razorpay checkout — server computes amount from booking + hotel payment config.
 * Returns { orderId, paymentId, keyId, amount, currency }.
 *
 * @param {{ bookingId: number, currency?: string }} body
 */
export async function createOrder(body) {
  return post('/api/payments/create-order', body)
}

/**
 * Step 3 of Razorpay checkout — submits the payment response from the Razorpay
 * popup to the backend for HMAC signature verification and status confirmation.
 *
 * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} body
 */
export async function validatePayment(body) {
  return post('/api/payments/validate', body)
}
