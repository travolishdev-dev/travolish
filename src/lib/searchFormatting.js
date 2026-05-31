
function formatDateLabel(dateValue) {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T00:00:00`)
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatDateRange(checkIn, checkOut) {
  if (checkIn && checkOut) {
    return `${formatDateLabel(checkIn)} - ${formatDateLabel(checkOut)}`
  }
  if (checkIn) return `${formatDateLabel(checkIn)} - Select checkout`
  return 'Flexible dates'
}

export function formatGuestSummary(adults, children) {
  const adultLabel = `${adults} adult${adults === 1 ? '' : 's'}`
  const childLabel = children
    ? `, ${children} child${children === 1 ? '' : 'ren'}`
    : ''
  return `${adultLabel}${childLabel}`
}
