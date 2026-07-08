import { get } from '../lib/api'

export async function getInventoryDashboard(hotelId = 1) {
  const data = await get(`/api/inventory/dashboard/${hotelId}`)
  return {
    // API returns totalRooms/bookedRooms/occupancyPercentage
    sellableNights: data.totalRooms ?? data.sellableNights ?? data.totalNights ?? null,
    bookedNights: data.bookedRooms ?? data.bookedNights ?? null,
    availableNights: data.availableRooms ?? null,
    occupancyRate: data.occupancyPercentage ?? data.occupancyRate ?? null,
    estimatedRevenue: data.estimatedRevenue ?? null,
    status: data.status ?? null,
  }
}

export async function getInventoryForecast(hotelId = 1) {
  // API returns a flat daily array: [{ date, projectedOccupancy, demandLevel, ... }]
  const daily = await get(`/api/inventory/forecast/${hotelId}`)
  if (!Array.isArray(daily) || !daily.length) return null

  const next7 = daily.slice(0, 7)
  const next30 = daily.slice(0, 30)

  const avgBookings = (arr) => {
    const vals = arr.map((d) => Number(d.projectedOccupancy ?? 0))
    return Math.round(vals.reduce((a, b) => a + b, 0) / arr.length * 10) / 10
  }

  const dominantDemand = (arr) => {
    const freq = {}
    arr.forEach((d) => { if (d.demandLevel) freq[d.demandLevel] = (freq[d.demandLevel] || 0) + 1 })
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] ?? 'LOW'
  }

  const isWeekend = (dateStr) => {
    const day = new Date(dateStr).getDay()
    return day === 0 || day === 6
  }
  const weekendDays = next30.filter((d) => isWeekend(d.date))

  return {
    next7Days: {
      avgBookings: avgBookings(next7),
      demandLevel: dominantDemand(next7),
    },
    next30Days: {
      avgBookings: avgBookings(next30),
      demandLevel: dominantDemand(next30),
    },
    weekendAvgBookings: weekendDays.length ? avgBookings(weekendDays) : null,
    weekendDemand: weekendDays.length ? dominantDemand(weekendDays) : 'LOW',
    dailyForecast: daily,
  }
}

export async function getInventoryAlerts(hotelId = 1) {
  return get(`/api/inventory/alerts/${hotelId}`)
}
