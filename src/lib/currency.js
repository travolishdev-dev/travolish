export const currencyConfig = {
  INR: { code: 'INR', locale: 'en-IN', rateFromInr: 1 },
  USD: { code: 'USD', locale: 'en-US', rateFromInr: 0.012 },
  GBP: { code: 'GBP', locale: 'en-GB', rateFromInr: 0.0095 },
  AED: { code: 'AED', locale: 'en-AE', rateFromInr: 0.044 },
  EUR: { code: 'EUR', locale: 'de-DE', rateFromInr: 0.011 },
}

export const countryCurrencyMap = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
  FR: 'EUR',
}

export function getCurrencyForCountry(countryCode) {
  return countryCurrencyMap[countryCode] || 'INR'
}

export function getStoredCountry() {
  if (typeof window === 'undefined') return 'IN'
  return window.localStorage.getItem('travolish.country') || 'IN'
}

export function getStoredCurrency() {
  return getCurrencyForCountry(getStoredCountry())
}

export function convertFromInr(value, currency = getStoredCurrency()) {
  const config = currencyConfig[currency] || currencyConfig.INR
  return Number(value || 0) * config.rateFromInr
}

export function formatCurrencyAmount(value, currency = getStoredCurrency()) {
  const config = currencyConfig[currency] || currencyConfig.INR
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(convertFromInr(value, config.code))))
}
