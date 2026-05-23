import { get, post, put } from '../lib/api'

export async function getHostListings(hostId = 1) {
  return get('/api/hotels', { hostId })
}

export async function getHotel(id) {
  return get(`/api/hotels/${id}`)
}

export async function getHostRooms(hotelId) {
  return get('/api/rooms', { hotelId })
}

export async function getRoom(id) {
  return get(`/api/rooms/${id}`)
}

export async function createHotel(body) {
  return post('/api/hotels', body)
}

export async function updateHotel(id, body) {
  return put(`/api/hotels/${id}`, body)
}

export async function createRoom(body) {
  return post('/api/rooms', body)
}

export async function updateRoom(id, body) {
  return put(`/api/rooms/${id}`, body)
}
