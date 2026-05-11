import { get } from '../lib/api'

export async function getDashboardOverview(hostId = 1) {
  return get('/api/host/dashboard/overview', { hostId })
}

export async function getEarningsSummary(hostId = 1) {
  return get('/api/host/earnings/summary', { hostId })
}

export async function getMonthlyEarnings(hostId = 1, months = 12) {
  return get('/api/host/earnings/monthly', { hostId, months })
}

export async function getOccupancyForecast(hostId = 1) {
  return get('/api/host/occupancy/forecast', { hostId })
}
