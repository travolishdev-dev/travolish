/**
 * INR checkout math — mirrors backend PaymentService + travolish.economics in application.yaml
 * (platform-fee-percent 2.5, gst-percent 18). Scale 2, HALF_UP, paise for Razorpay.
 */
const MONEY_SCALE = 2
const PLATFORM_FEE_PERCENT = 2.5
const GST_PERCENT = 18

/** @param {number} rupees */
export function rupeesToPaise(rupees) {
  const n = Number(rupees)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 10 ** MONEY_SCALE)
}

function paiseToRupees(paise) {
  return paise / 10 ** MONEY_SCALE
}

/** Half-up: (amountPaise * percent) / 100 */
function percentOfPaise(amountPaise, percent) {
  return Math.round((amountPaise * percent) / 100)
}

/**
 * @param {number} stayTotal - room total (+ add-ons etc.) stored on the booking
 * @param {{
 *   payFullAtBooking?: boolean,
 *   payAtProperty?: boolean,
 *   secureWithPartialPayment?: boolean,
 *   advancePaymentPercent?: number,
 * } | null} config
 */
export function isPayAtPropertyOnly(config) {
  if (!config) return false
  return Boolean(config.payAtProperty)
    && !config.payFullAtBooking
    && !config.secureWithPartialPayment
}

function computeChargeBasePaise(stayTotalPaise, config) {
  if (!config?.secureWithPartialPayment) {
    return stayTotalPaise
  }
  const pct = Number(config.advancePaymentPercent) || 0
  if (pct <= 0) {
    return stayTotalPaise
  }
  return percentOfPaise(stayTotalPaise, pct)
}

export function computeCheckoutAmounts(stayTotal, config) {
  const stayPaise = rupeesToPaise(stayTotal)
  const basePaise = computeChargeBasePaise(stayPaise, config)
  const platformFeePaise = percentOfPaise(basePaise, PLATFORM_FEE_PERCENT)
  const taxPaise = percentOfPaise(basePaise + platformFeePaise, GST_PERCENT)
  const totalPaise = basePaise + platformFeePaise + taxPaise

  return {
    baseAmount: paiseToRupees(basePaise),
    platformFee: paiseToRupees(platformFeePaise),
    taxAmount: paiseToRupees(taxPaise),
    totalAmount: paiseToRupees(totalPaise),
    totalPaise,
  }
}

export function defaultPaymentConfig() {
  return {
    payFullAtBooking: true,
    payAtProperty: false,
    secureWithPartialPayment: false,
    advancePaymentPercent: 0,
  }
}
