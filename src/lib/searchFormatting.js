
function formatDateLabel(dateValue) {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T00:00:00`)
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatDateRange(checkIn, checkOut, fallbacks = {}) {
  const flexibleDates = fallbacks.flexibleDates ?? 'Flexible dates'
  const selectCheckout = fallbacks.selectCheckout ?? 'Select checkout'
  if (checkIn && checkOut) {
    return `${formatDateLabel(checkIn)} - ${formatDateLabel(checkOut)}`
  }
  if (checkIn) return `${formatDateLabel(checkIn)} - ${selectCheckout}`
  return flexibleDates
}

export function formatGuestSummary(adults, children, fallbacks = {}) {
  const adultOne = fallbacks.adultOne ?? 'adult'
  const adultMany = fallbacks.adultMany ?? 'adults'
  const childOne = fallbacks.childOne ?? 'child'
  const childMany = fallbacks.childMany ?? 'children'
  const adultLabel = `${adults} ${adults === 1 ? adultOne : adultMany}`
  const childLabel = children
    ? `, ${children} ${children === 1 ? childOne : childMany}`
    : ''
  return `${adultLabel}${childLabel}`
}
