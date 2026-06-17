/**
 * Opens a styled, print-ready receipt in a new window and triggers the
 * browser's print dialog (which includes "Save as PDF" on every modern OS).
 *
 * @param {object} booking  - raw booking object from the API
 * @param {object} hotel    - hotel object (may be partial)
 * @param {function} formatCurrency - useCurrency().formatCurrency
 */
export function printReceipt(booking, hotel, formatCurrency) {
  const fmt = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    } catch {
      return dateStr ?? '—'
    }
  }

  const hotelName   = hotel?.name || `Hotel #${booking.hotelId}`
  const city        = [hotel?.city, hotel?.country].filter(Boolean).join(', ') || '—'
  const checkIn     = fmt(booking.checkInDate)
  const checkOut    = fmt(booking.checkOutDate)
  const total       = formatCurrency(Number(booking.totalPrice ?? 0))
  const basePrice   = booking.basePrice ? formatCurrency(Number(booking.basePrice)) : null
  const serviceFee  = booking.serviceFee ? formatCurrency(Number(booking.serviceFee)) : null
  const taxes       = booking.taxes ? formatCurrency(Number(booking.taxes)) : null
  const nights      = (() => {
    try {
      const ms = new Date(booking.checkOutDate) - new Date(booking.checkInDate)
      return Math.max(1, Math.round(ms / 86400000))
    } catch { return '—' }
  })()
  const issuedOn = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const row = (label, value, bold = false) =>
    value
      ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px">${label}</td><td style="padding:8px 0;text-align:right;font-size:13px;${bold ? 'font-weight:700;color:#111' : 'color:#374151'}">${value}</td></tr>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt – ${hotelName} #${booking.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
    .page { max-width: 600px; margin: 48px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; }
    .header { background: #111827; color: #fff; padding: 32px 36px; }
    .header-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-logo span { color: #f43f5e; }
    .header-sub { margin-top: 4px; font-size: 12px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.14em; }
    .body { padding: 32px 36px; }
    .confirmation { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; margin-bottom: 28px; }
    .confirmation-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: #16a34a; }
    .confirmation-value { font-size: 22px; font-weight: 800; color: #111827; margin-top: 2px; }
    .confirmation-issued { font-size: 12px; color: #6b7280; text-align: right; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #9ca3af; margin-bottom: 14px; }
    .property-card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 20px; margin-bottom: 28px; }
    .property-name { font-size: 17px; font-weight: 700; color: #111827; }
    .property-city { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .dates { display: flex; gap: 16px; margin-top: 16px; }
    .date-block { flex: 1; background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
    .date-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; }
    .date-value { font-size: 14px; font-weight: 700; color: #111827; margin-top: 4px; }
    .date-nights { font-size: 11px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .total-row td { padding: 12px 0; font-size: 15px; font-weight: 800; color: #111827; border-top: 2px solid #111827; }
    .guest-block { background: #f9fafb; border-radius: 14px; padding: 18px 20px; margin-top: 28px; }
    .guest-name { font-size: 15px; font-weight: 700; color: #111827; }
    .guest-email { font-size: 13px; color: #6b7280; margin-top: 3px; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 36px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.7; }
    @media print {
      body { background: #fff; }
      .page { margin: 0; border: none; border-radius: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-logo">Trav<span>o</span>lish</div>
      <div class="header-sub">Booking Receipt</div>
    </div>
    <div class="body">
      <div class="confirmation">
        <div>
          <div class="confirmation-label">Confirmation</div>
          <div class="confirmation-value">#${booking.id}</div>
        </div>
        <div class="confirmation-issued">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280">Issued</div>
          <div style="font-size:13px;font-weight:600;color:#374151;margin-top:2px">${issuedOn}</div>
        </div>
      </div>

      <div class="section-title">Property</div>
      <div class="property-card">
        <div class="property-name">${hotelName}</div>
        <div class="property-city">${city}</div>
        <div class="dates">
          <div class="date-block">
            <div class="date-label">Check-in</div>
            <div class="date-value">${checkIn}</div>
          </div>
          <div class="date-block">
            <div class="date-label">Check-out</div>
            <div class="date-value">${checkOut}</div>
            <div class="date-nights">${nights} night${nights !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      <div class="section-title">Payment breakdown</div>
      <table>
        <tbody>
          ${row('Base price', basePrice)}
          ${row('Service fee', serviceFee)}
          ${row('Taxes &amp; charges', taxes)}
          ${booking.promoDiscount ? row('Promo discount', `−${formatCurrency(Number(booking.promoDiscount))}`) : ''}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td>Total charged</td>
            <td style="text-align:right">${total}</td>
          </tr>
        </tfoot>
      </table>

      ${booking.guestName ? `
      <div class="guest-block">
        <div class="section-title">Guest</div>
        <div class="guest-name">${booking.guestName}</div>
        ${booking.guestEmail ? `<div class="guest-email">${booking.guestEmail}</div>` : ''}
        ${booking.guestPhone ? `<div class="guest-email">${booking.guestPhone}</div>` : ''}
      </div>` : ''}
    </div>
    <div class="footer">
      Travolish · This receipt confirms your booking. Keep for your records.<br/>
      Questions? Contact us via the Messages tab in your account.
    </div>
  </div>

  <script>
    window.onload = function() { window.print() }
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=700,height=900')
  if (!win) {
    // Pop-up blocked — fall back to a data-URI download
    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `travolish-receipt-${booking.id}.html`
    a.click()
    URL.revokeObjectURL(a.href)
    return
  }
  win.document.write(html)
  win.document.close()
}
