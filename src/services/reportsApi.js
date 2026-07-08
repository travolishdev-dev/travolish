import { get } from '../lib/api'

export async function getRevenueReport(hotelId = 1, startDate, endDate) {
  const params = startDate && endDate ? { startDate, endDate } : undefined
  const data = await get(`/api/inventory/reports/revenue/${hotelId}`, params)
  return {
    totalRevenue: data.totalRevenue ?? null,
    revenueGrowth: data.revenueGrowth ?? null,
    averageDailyRate: data.averageDailyRevenue ?? null,
    adrChange: data.adrChange ?? null,
    revPar: data.estimatedRevenue ?? null,
    revParChange: data.revParChange ?? null,
    revenuePeriod: `${data.startDate ?? ''} → ${data.endDate ?? ''}`.trim(),
    // Pass through daily forecast data for trend chart
    dailyForecasts: Array.isArray(data.dailyForecasts) ? data.dailyForecasts : [],
  }
}

export async function getOccupancyReport(hotelId = 1, startDate, endDate) {
  const params = startDate && endDate ? { startDate, endDate } : undefined
  const data = await get(`/api/inventory/reports/occupancy/${hotelId}`, params)
  return {
    averageOccupancy: data.averageOccupancy ?? null,
    peakOccupancy: data.peakOccupancy ?? null,
    totalBookings: data.totalBookings ?? null,
    cancellationRate: data.cancellationRate ?? null,
    segments: data.segments ?? [],
  }
}

export async function getPricingReport(hotelId = 1) {
  return get(`/api/inventory/reports/pricing/${hotelId}`)
}
