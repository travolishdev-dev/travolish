import { get } from '../lib/api'

export async function getInventoryDashboard(hotelId = 1) {
  return get(`/api/inventory/dashboard/${hotelId}`)
}

export async function getInventoryForecast(hotelId = 1) {
  return get(`/api/inventory/forecast/${hotelId}`)
}

export async function getInventoryAlerts(hotelId = 1) {
  return get(`/api/inventory/alerts/${hotelId}`)
}
