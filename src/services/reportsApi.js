import { get } from '../lib/api'

export async function getRevenueReport(hotelId = 1) {
  const data = await get(`/api/inventory/reports/revenue/${hotelId}`)
  return {
    totalRevenue: data.totalRevenue ?? null,
    revenueGrowth: null,
    averageDailyRate: data.averageDailyRevenue ?? null,
    adrChange: null,
    revPar: data.estimatedRevenue ?? null,
    revParChange: null,
    revenuePeriod: `${data.startDate ?? ''} → ${data.endDate ?? ''}`.trim(),
  }
}

export async function getOccupancyReport(hotelId = 1) {
  const data = await get(`/api/inventory/reports/occupancy/${hotelId}`)
  return {
    averageOccupancy: data.averageOccupancy ?? null,
    peakOccupancy: data.peakOccupancy ?? null,
    totalBookings: data.totalBookings ?? null,
    cancellationRate: data.cancellationRate ?? null,
    segments: [],
  }
}

export async function getPricingReport(hotelId = 1) {
  return get(`/api/inventory/reports/pricing/${hotelId}`)
}
