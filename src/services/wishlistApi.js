import { get, post, del } from '../lib/api'

export async function fetchWishlist(userId) {
  return get(`/api/wishlists/${userId}`)
}

export async function addToWishlist(userId, hotelId) {
  return post(`/api/wishlists/${userId}/${hotelId}`)
}

export async function removeFromWishlist(userId, hotelId) {
  return del(`/api/wishlists/${userId}/${hotelId}`)
}
