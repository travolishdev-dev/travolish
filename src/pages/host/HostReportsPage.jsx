import { useCallback, useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
} from '../../components/host/HostPortalUI'
import { getRevenueReport, getOccupancyReport } from '../../services/reportsApi'
import { getDashboardOverview } from '../../services/analyticsApi'
import useHostContext from '../../hooks/useHostContext'

const EMPTY_REPORT_CARDS = [
  { title: 'Total Revenue', amount: '—', delta: '—', note: '' },
  { title: 'Average Daily Rate', amount: '—', delta: '—', note: '' },
  { title: 'RevPAR', amount: '—', delta: '—', note: '' },
]

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildTrendBars(revenueTrend, occupancyTrend) {
  const rev = Array.isArray(revenueTrend) ? revenueTrend.slice(-7) : []
  const occ = Array.isArray(occupancyTrend) ? occupancyTrend.slice(-7) : []
  if (!rev.length && !occ.length) return null

  const len = Math.max(rev.length, occ.length, 7)
  const maxRev = Math.max(...rev.map((d) => Number(d.value ?? 0)), 1)
  const maxOcc = Math.max(...occ.map((d) => Number(d.value ?? 0)), 1)

  return Array.from({ length: len }, (_, i) => {
    const revVal = Number(rev[i]?.value ?? 0)
    const occVal = Number(occ[i]?.value ?? 0)
    const dateLabel = rev[i]?.date ?? occ[i]?.date
    let label = WEEKDAY_LABELS[i % 7]
    if (dateLabel) {
      try {
        label = new Date(dateLabel).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
      } catch { /* use default */ }
    }
    return {
      label,
      revenue: Math.round((revVal / maxRev) * 100),
      occupancy: Math.round((occVal / maxOcc) * 100),
    }
  })
}

// Build bars from the dailyForecasts array returned by the revenue report.
// Samples 7 evenly-distributed days; caps projectedOccupancy at 100 to
// guard against backend data anomalies (e.g. totalPrice stored in wrong field).
function buildTrendBarsFromDaily(dailyForecasts) {
  if (!Array.isArray(dailyForecasts) || !dailyForecasts.length) return null

  const n = Math.min(7, dailyForecasts.length)
  const last = dailyForecasts.length - 1
  const sampled = Array.from({ length: n }, (_, i) =>
    dailyForecasts[Math.round((i / (n - 1 || 1)) * last)],
  )

  const occVals = sampled.map((d) => Math.min(Number(d.projectedOccupancy ?? 0), 100))
  const revVals = sampled.map((d) => Number(d.projectedRevenue ?? 0))
  const maxOcc = Math.max(...occVals, 1)
  const maxRev = Math.max(...revVals, 1)

  return sampled.map((d, i) => {
    let label = WEEKDAY_LABELS[i % 7]
    try {
      label = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
    } catch { /* keep default */ }
    return {
      label,
      occupancy: Math.round((occVals[i] / maxOcc) * 100),
      revenue: Math.round((revVals[i] / maxRev) * 100),
    }
  })
}

function buildComparisonCards(revenueData, occupancyData) {
  const cards = []

  if (revenueData?.revenueGrowth != null) {
    const v = Number(revenueData.revenueGrowth)
    cards.push({
      label: 'Revenue vs previous period',
      value: `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
      note: revenueData.revenuePeriod || '',
    })
  }

  if (occupancyData?.averageOccupancy != null) {
    cards.push({
      label: 'Average occupancy',
      value: `${Number(occupancyData.averageOccupancy).toFixed(1)}%`,
      note: occupancyData.peakOccupancy != null ? `Peak ${occupancyData.peakOccupancy}%` : '',
    })
  }

  if (occupancyData?.cancellationRate != null) {
    const rate = Number(occupancyData.cancellationRate)
    cards.push({
      label: 'Cancellation rate',
      value: `${rate.toFixed(1)}%`,
      note: occupancyData.totalBookings != null ? `${occupancyData.totalBookings} total bookings` : '',
    })
  }

  return cards.length ? cards : null
}

function downloadCSV(reportCards, comparisonCards, marketSegments, dateRange) {
  const rows = [
    ['Travolish Host Report', `${dateRange.from} to ${dateRange.to}`],
    [],
    ['Metric', 'Value', 'Delta', 'Note'],
    ...reportCards.map((c) => [c.title, c.amount, c.delta, c.note]),
    [],
    ['Comparison', 'Value', 'Note'],
    ...(comparisonCards ?? []).map((c) => [c.label, c.value, c.note]),
  ]
  if (marketSegments.length) {
    rows.push([], ['Market', 'Share', 'Trend'])
    marketSegments.forEach((s) => rows.push([s.market, s.share, s.trend]))
  }
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `travolish-report-${dateRange.from}-${dateRange.to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function HostReportsPage() {
  const { primaryHotelId, hostId, loading: hostLoading } = useHostContext()
  const [reportCards, setReportCards] = useState(EMPTY_REPORT_CARDS)
  const [marketSegments, setMarketSegments] = useState([])
  const [occupancyData, setOccupancyData] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [trendBars, setTrendBars] = useState(null)
  const [comparisonCards, setComparisonCards] = useState(null)
  const [dateRange, setDateRange] = useState({
    from: '2026-05-01',
    to: '2026-05-31',
  })
  const [fetching, setFetching] = useState(false)

  const fetchReports = useCallback(
    async (startDate, endDate) => {
      if (!primaryHotelId) return
      setFetching(true)
      try {
        const [revData, occData, overview] = await Promise.allSettled([
          getRevenueReport(primaryHotelId, startDate, endDate),
          getOccupancyReport(primaryHotelId, startDate, endDate),
          getDashboardOverview(hostId),
        ])

        const rev = revData.status === 'fulfilled' ? revData.value : null
        const occ = occData.status === 'fulfilled' ? occData.value : null
        const ov = overview.status === 'fulfilled' ? overview.value : null

        if (rev) {
          setRevenueData(rev)
          setReportCards([
            {
              title: 'Total Revenue',
              amount: rev.totalRevenue != null ? `$${Math.round(rev.totalRevenue).toLocaleString()}` : '—',
              delta: rev.revenueGrowth != null ? `${rev.revenueGrowth > 0 ? '+' : ''}${rev.revenueGrowth}%` : '—',
              note: rev.revenuePeriod ?? '',
            },
            {
              title: 'Average Daily Rate',
              amount: rev.averageDailyRate != null ? `$${Math.round(rev.averageDailyRate).toLocaleString()}` : '—',
              delta: rev.adrChange != null ? `${rev.adrChange > 0 ? '+' : ''}${rev.adrChange}%` : '—',
              note: '',
            },
            {
              title: 'RevPAR',
              amount: rev.revPar != null ? `$${rev.revPar}` : '—',
              delta: rev.revParChange != null ? `${rev.revParChange > 0 ? '+' : ''}${rev.revParChange}%` : '—',
              note: '',
            },
          ])
        }

        if (occ) {
          setOccupancyData(occ)
          if (occ.segments?.length) {
            setMarketSegments(
              occ.segments.map((s) => ({
                market: s.segmentName ?? s.market,
                share: s.percentage != null ? `${s.percentage}%` : s.share ?? '—',
                trend: s.trend ?? s.change ?? '—',
              })),
            )
          }
        }

        // Prefer dashboard overview trend arrays; fall back to dailyForecasts from revenue report
        const bars =
          buildTrendBars(ov?.revenueTrend, ov?.occupancyTrend) ??
          buildTrendBarsFromDaily(rev?.dailyForecasts)
        if (bars) setTrendBars(bars)

        const comparison = buildComparisonCards(rev, occ)
        if (comparison) setComparisonCards(comparison)
      } finally {
        setFetching(false)
      }
    },
    [primaryHotelId, hostId],
  )

  useEffect(() => {
    if (hostLoading || !primaryHotelId) return
    fetchReports(dateRange.from, dateRange.to)
  }, [primaryHotelId, hostLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateDateRange(field) {
    return (event) =>
      setDateRange((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleApplyRange() {
    fetchReports(dateRange.from, dateRange.to)
  }

  function handleExportCSV() {
    downloadCSV(reportCards, comparisonCards, marketSegments, dateRange)
  }

  function handleExportPDF() {
    window.print()
  }

  const displayBars = trendBars ?? [
    { label: 'Mon', occupancy: 0, revenue: 0 },
    { label: 'Tue', occupancy: 0, revenue: 0 },
    { label: 'Wed', occupancy: 0, revenue: 0 },
    { label: 'Thu', occupancy: 0, revenue: 0 },
    { label: 'Fri', occupancy: 0, revenue: 0 },
    { label: 'Sat', occupancy: 0, revenue: 0 },
    { label: 'Sun', occupancy: 0, revenue: 0 },
  ]

  return (
    <HostShell
      eyebrow="Reports"
      title="Reports"
      mobileTitle="Reports"
      description="Revenue, occupancy, and guest score snapshot."
      actions={[
        { label: 'Inventory', href: '/host/inventory', secondary: true },
        { label: 'Payouts', href: '/host/payouts' },
      ]}
      stats={[
        {
          label: 'Avg occupancy',
          value: occupancyData?.averageOccupancy != null ? `${occupancyData.averageOccupancy}%` : '—',
          note: 'Rolling period',
        },
        {
          label: 'Total bookings',
          value: occupancyData?.totalBookings != null ? String(occupancyData.totalBookings) : '—',
          note: 'In period',
        },
      ]}
    >
      <SectionCard>
        <SectionHeading
          eyebrow="Period"
          title="Date range and export"
          description="Choose a custom period and export data as CSV or print as PDF."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto_auto]">
          <label>
            <span className="mb-2 block text-sm font-semibold text-dark">From</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={updateDateRange('from')}
              className="h-12 w-full rounded-xl border border-gray-300 px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-dark">To</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={updateDateRange('to')}
              className="h-12 w-full rounded-xl border border-gray-300 px-3 text-sm font-semibold text-dark outline-none focus:border-dark"
            />
          </label>
          <button
            type="button"
            onClick={handleApplyRange}
            disabled={fetching}
            className="h-12 self-end rounded-xl bg-dark px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {fetching ? 'Loading…' : 'Apply'}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-12 self-end rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="h-12 self-end rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="Snapshot" title="Core report cards" />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {reportCards.map((card) => (
            <div key={card.title} className="border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {card.title}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-dark">
                {card.amount}
              </p>
              <p className="mt-1 text-sm font-medium text-dark">{card.delta}</p>
              {card.note && (
                <p className="mt-2 text-sm leading-6 text-muted">{card.note}</p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeading
          eyebrow="Charts"
          title="Booking trend visualisation"
          description="Occupancy and revenue trend for the selected period."
        />

        <div className="mt-6 grid grid-cols-7 gap-3">
          {displayBars.map((bar, i) => (
            <div key={`${bar.label}-${i}`} className="flex min-h-[190px] flex-col justify-end gap-2">
              <div className="flex flex-1 items-end gap-1.5">
                <div
                  className="w-full rounded-xl bg-brand transition-all duration-500"
                  style={{ height: `${Math.max(bar.occupancy, 2)}%` }}
                  title={`${bar.occupancy}% occupancy`}
                />
                <div
                  className="w-full rounded-xl bg-dark transition-all duration-500"
                  style={{ height: `${Math.max(bar.revenue, 2)}%` }}
                  title={`${bar.revenue}% revenue index`}
                />
              </div>
              <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {bar.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
            Occupancy
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-dark" />
            Revenue
          </span>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="Compare" title="Period comparison" />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(comparisonCards ?? []).length > 0 ? (
            comparisonCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">{card.value}</p>
                {card.note && (
                  <p className="mt-2 text-sm leading-6 text-muted">{card.note}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No comparison data available for this period.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="Segments" title="Demand mix" />

        {marketSegments.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No segment data available for this period.</p>
        ) : (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {marketSegments.map((segment) => (
              <div
                key={segment.market}
                className="grid gap-2 py-4 md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-center"
              >
                <p className="text-sm font-semibold text-dark">{segment.market}</p>
                <p className="text-sm text-muted">{segment.share}</p>
                <p className="text-sm font-medium text-dark">{segment.trend}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </HostShell>
  )
}
