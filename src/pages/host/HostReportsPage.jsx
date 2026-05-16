import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
} from '../../components/host/HostPortalUI'
import { getRevenueReport, getOccupancyReport } from '../../services/reportsApi'
import { hostMarketSegments, hostReportCards } from '../../data/mockHostPortalData'

export default function HostReportsPage() {
  const [reportCards, setReportCards] = useState(hostReportCards)
  const [marketSegments, setMarketSegments] = useState(hostMarketSegments)

  useEffect(() => {
    getRevenueReport()
      .then((data) => {
        if (data) {
          const cards = [
            {
              title: 'Total Revenue',
              amount: data.totalRevenue != null ? `$${data.totalRevenue.toLocaleString()}` : hostReportCards[0].amount,
              delta: data.revenueGrowth != null ? `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}%` : hostReportCards[0].delta,
              note: data.revenuePeriod ?? hostReportCards[0].note,
            },
            {
              title: 'Average Daily Rate',
              amount: data.averageDailyRate != null ? `$${data.averageDailyRate}` : hostReportCards[1].amount,
              delta: data.adrChange != null ? `${data.adrChange > 0 ? '+' : ''}${data.adrChange}%` : hostReportCards[1].delta,
              note: data.adrNote ?? hostReportCards[1].note,
            },
            {
              title: 'RevPAR',
              amount: data.revPar != null ? `$${data.revPar}` : hostReportCards[2].amount,
              delta: data.revParChange != null ? `${data.revParChange > 0 ? '+' : ''}${data.revParChange}%` : hostReportCards[2].delta,
              note: data.revParNote ?? hostReportCards[2].note,
            },
          ]
          setReportCards(cards)
        }
      })
      .catch(() => {})

    getOccupancyReport()
      .then((data) => {
        if (data?.segments?.length) {
          setMarketSegments(
            data.segments.map((s) => ({
              market: s.segmentName ?? s.market,
              share: s.percentage != null ? `${s.percentage}%` : s.share,
              trend: s.trend ?? s.change ?? '—',
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

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
        { label: 'Period', value: 'Apr 2026', note: 'Current month' },
        { label: 'Best listing', value: 'Island villa', note: 'Revenue leader' },
        { label: 'Growth', value: '+12%', note: 'Month-over-month revenue' },
        { label: 'Review score', value: '4.91', note: 'Portfolio average' },
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
              <p className="mt-2 text-sm leading-6 text-muted">{card.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeading eyebrow="Segments" title="Demand mix" />

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
      </SectionCard>
    </HostShell>
  )
}
