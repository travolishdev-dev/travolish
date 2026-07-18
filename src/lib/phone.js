export function parsePhoneValue(value, defaultCountryCode = '+91') {
  if (!value) {
    return { countryCode: defaultCountryCode, phoneNumber: '' }
  }

  const normalized = String(value).trim()
  const match = normalized.match(/^\s*(\+\d{1,4})\s*(.*)$/)

  if (match) {
    return {
      countryCode: match[1],
      phoneNumber: match[2].trim(),
    }
  }

  return {
    countryCode: defaultCountryCode,
    phoneNumber: normalized,
  }
}

export function formatPhoneWithCountryCode(value, countryCode = '+91') {
  if (!value) return ''
  const { phoneNumber } = parsePhoneValue(value, countryCode)
  const cleanedCountryCode = countryCode || '+91'
  const cleanedPhoneNumber = phoneNumber.replace(/^\+\d{1,4}\s*/,'').trim()
  return cleanedPhoneNumber ? `${cleanedCountryCode} ${cleanedPhoneNumber}` : cleanedCountryCode
}

export function normalizePhoneForStorage(value, countryCode = '+91') {
  return formatPhoneWithCountryCode(value, countryCode)
}
