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

export default function HostReportsPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [reportCards, setReportCards] = useState(EMPTY_REPORT_CARDS)
  const [marketSegments, setMarketSegments] = useState([])
  const [occupancyData, setOccupancyData] = useState(null)

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
