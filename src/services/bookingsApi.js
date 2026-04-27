import { format } from 'date-fns'
import { get, post } from '../lib/api'

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
  guestName,
  guestEmail,
  guestPhone,
  checkIn,
  checkOut,
  basePrice,
  totalPrice,
}) {
  return post('/api/bookings', {
    roomId,
    hotelId,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate: fmt(checkIn),
    checkOutDate: fmt(checkOut),
    basePrice,
    totalPrice,
    status: 'PENDING',
  })
}

export async function listBookings() {
  return get('/api/bookings')
}
