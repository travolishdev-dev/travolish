import { format } from 'date-fns'
import { get, post, put } from '../lib/api'

const fmt = (date) => format(date, 'yyyy-MM-dd')

export async function checkAvailability(roomId, checkIn, checkOut) {
  return get('/api/bookings/check-availability', {
    roomId,
    checkInDate: fmt(checkIn),
    checkOutDate: fmt(checkOut),
  })
}

export async function calculatePrice(roomId, basePrice, checkIn, checkOut) {
  return get('/api/bookings/calculate-price', {
    roomId,
    basePrice,
    checkInDate: fmt(checkIn),
    checkOutDate: fmt(checkOut),
  })
}

export async function createBooking({
  roomId,
  hotelId,
  userId,          // backend user ID — links the booking to the logged-in user
  guestName,
  guestEmail,
  guestPhone,
  checkIn,
  checkOut,
  basePrice,
  totalPrice,
  seasonalAdjustment,
  dynamicPricingAdjustment,
  promotionalDiscount,
}) {
  return post('/api/bookings', {
    roomId,
    hotelId,
    userId: userId ?? null,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate: fmt(checkIn),
    checkOutDate: fmt(checkOut),
    basePrice,
    totalPrice,
    seasonalAdjustment: seasonalAdjustment ?? 0,
    dynamicPricingAdjustment: dynamicPricingAdjustment ?? 0,
    promotionalDiscount: promotionalDiscount ?? 0,
    status: 'PENDING',
  })
}

export async function getBooking(id) {
  return get(`/api/bookings/${id}`)
}

export async function cancelBooking(booking) {
  return put(`/api/bookings/${booking.id}`, { ...booking, status: 'CANCELLED' })
}

export async function confirmBooking(id, booking) {
  return put(`/api/bookings/${id}`, { ...booking, status: 'CONFIRMED' })
}

export async function rejectBooking(id, booking) {
  return put(`/api/bookings/${id}`, { ...booking, status: 'CANCELLED' })
}

export async function listBookings({ userId, guestEmail } = {}) {
  if (userId) return get('/api/bookings', { userId })
  if (guestEmail) return get('/api/bookings', { guestEmail })
  return get('/api/bookings')
}

export async function listBookingsByHotel(hotelId) {
  return get(`/api/bookings/hotel/${hotelId}`)
}

export async function refreshBookingStatuses() {
  return post('/api/bookings/refresh-statuses', {}).catch(() => null)
}
