import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
} from '../../components/host/HostPortalUI'
import { getRevenueReport, getOccupancyReport } from '../../services/reportsApi'
import useHostContext from '../../hooks/useHostContext'

const EMPTY_REPORT_CARDS = [
  { title: 'Total Revenue', amount: '—', delta: '—', note: '' },
  { title: 'Average Daily Rate', amount: '—', delta: '—', note: '' },
  { title: 'RevPAR', amount: '—', delta: '—', note: '' },
]

const trendBars = [
  { label: 'Mon', occupancy: 62, revenue: 42 },
  { label: 'Tue', occupancy: 68, revenue: 49 },
  { label: 'Wed', occupancy: 74, revenue: 55 },
  { label: 'Thu', occupancy: 71, revenue: 52 },
  { label: 'Fri', occupancy: 88, revenue: 76 },
  { label: 'Sat', occupancy: 94, revenue: 88 },
  { label: 'Sun', occupancy: 81, revenue: 69 },
]

const comparisonCards = [
  { label: 'Revenue vs previous period', value: '+12.4%', note: 'Weekend ADR carried the lift.' },
  { label: 'Occupancy vs previous period', value: '+7.8%', note: 'Two fewer blocked nights.' },
  { label: 'Cancellations', value: '-3', note: 'Lower refund pressure.' },
]

export default function HostReportsPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [reportCards, setReportCards] = useState(EMPTY_REPORT_CARDS)
  const [marketSegments, setMarketSegments] = useState([])
  const [occupancyData, setOccupancyData] = useState(null)
  const [dateRange, setDateRange] = useState({
    from: '2026-05-01',
    to: '2026-05-31',
  })
  const [reportNotice, setReportNotice] = useState('')

  useEffect(() => {
    if (hostLoading || !primaryHotelId) return

    getRevenueReport(primaryHotelId)
      .then((data) => {
        if (data) {
          setReportCards([
            {
              title: 'Total Revenue',
              amount: data.totalRevenue != null ? `$${Math.round(data.totalRevenue).toLocaleString()}` : '—',
              delta: data.revenueGrowth != null ? `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}%` : '—',
              note: data.revenuePeriod ?? '',
            },
            {
              title: 'Average Daily Rate',
              amount: (data.averageDailyRate ?? data.averageDailyRevenue) != null
                ? `$${Math.round(data.averageDailyRate ?? data.averageDailyRevenue).toLocaleString()}`
                : '—',
              delta: data.adrChange != null ? `${data.adrChange > 0 ? '+' : ''}${data.adrChange}%` : '—',
              note: data.adrNote ?? '',
            },
            {
              title: 'RevPAR',
              amount: data.revPar != null ? `$${data.revPar}` : '—',
              delta: data.revParChange != null ? `${data.revParChange > 0 ? '+' : ''}${data.revParChange}%` : '—',
              note: data.revParNote ?? '',
            },
          ])
        }
      })
      .catch(() => {})

    getOccupancyReport(primaryHotelId)
      .then((data) => {
        if (data) {
          setOccupancyData(data)
          if (data.segments?.length) {
            setMarketSegments(
              data.segments.map((s) => ({
                market: s.segmentName ?? s.market,
                share: s.percentage != null ? `${s.percentage}%` : s.share ?? '—',
                trend: s.trend ?? s.change ?? '—',
              })),
            )
          }
        }
      })
      .catch(() => {})
  }, [primaryHotelId, hostLoading])

  function updateDateRange(field) {
    return (event) => {
      setDateRange((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  function handleApplyRange() {
    setReportNotice(`Showing report UI for ${dateRange.from} to ${dateRange.to}. Live report query wiring is unchanged.`)
  }

  function handleExport(format) {
    setReportNotice(`${format} export prepared for ${dateRange.from} to ${dateRange.to}. UI placeholder only.`)
  }

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
          description="Choose custom periods and prepare CSV/PDF exports without changing report API calls yet."
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
            className="h-12 self-end rounded-xl bg-dark px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => handleExport('CSV')}
            className="h-12 self-end rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport('PDF')}
            className="h-12 self-end rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>

        {reportNotice ? (
          <div className="mt-5 rounded-2xl border border-brand/20 bg-rose-50 px-4 py-3 text-sm font-semibold text-brand">
            {reportNotice}
          </div>
        ) : null}
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
          description="Compact occupancy and revenue bars for the selected period."
        />

        <div className="mt-6 grid grid-cols-7 gap-3">
          {trendBars.map((bar) => (
            <div key={bar.label} className="flex min-h-[190px] flex-col justify-end gap-2">
              <div className="flex flex-1 items-end gap-1.5">
                <div
                  className="w-full rounded-xl bg-brand"
                  style={{ height: `${bar.occupancy}%` }}
                  title={`${bar.occupancy}% occupancy`}
                />
                <div
                  className="w-full rounded-xl bg-dark"
                  style={{ height: `${bar.revenue}%` }}
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
          {comparisonCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{card.note}</p>
            </div>
          ))}
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
