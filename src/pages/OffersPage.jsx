import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  Gift,
  MapPin,
  Sparkles,
  TicketPercent,
} from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../components/portal/PortalUI'
import useCurrency from '../hooks/useCurrency'

const featuredDeals = [
  {
    id: 'deal-weekend',
    title: 'Weekend city breaks',
    location: 'Mumbai, Bengaluru, Delhi NCR',
    discount: 'Up to 18% off',
    window: 'Fri to Sun stays',
    code: 'WEEKEND18',
  },
  {
    id: 'deal-long-stay',
    title: 'Long-stay comfort',
    location: 'Goa, Kochi, Jaipur',
    discount: 'Stay 5 nights, save 1',
    window: 'Valid this month',
    code: 'LONGSTAY',
  },
  {
    id: 'deal-last-minute',
    title: 'Last-minute escapes',
    location: 'Near your current search',
    discount: 'Up to 12% off',
    window: 'Next 7 days',
    code: 'LASTCALL',
  },
]

export default function OffersPage() {
  const { formatCurrency } = useCurrency()
  const travelCredit = formatCurrency(4500)
  const offerStats = [
    { label: 'Travel credits', value: travelCredit, note: 'Available at checkout' },
    { label: 'Active offers', value: '7', note: 'Matched to your profile' },
    { label: 'Expiring soon', value: '2', note: 'Use before month end' },
  ]

  return (
    <PortalShell
      eyebrow="Offers"
      title="Deals and travel credits."
      mobileTitle="Offers"
      description="Traveller-facing offers, promo codes, credits, and curated deal windows."
      actions={[
        { label: 'Search stays', href: '/search' },
        { label: 'Transactions', href: '/account/transactions', secondary: true },
      ]}
      stats={offerStats}
      accent="from-rose-50 via-white to-amber-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard>
          <SectionHeading
            eyebrow="Deals"
            title="Available stay offers"
            description="UI-ready deal cards that can connect to host promotions or admin promotion rules later."
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {featuredDeals.map((deal) => (
              <div key={deal.id} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                    <TicketPercent size={22} />
                  </div>
                  <StatusPill tone="success">{deal.discount}</StatusPill>
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-dark">{deal.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <MapPin size={15} />
                  {deal.location}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <CalendarDays size={15} />
                  {deal.window}
                </p>
                <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Promo code</p>
                  <p className="mt-1 text-lg font-semibold text-dark">{deal.code}</p>
                </div>
                <Link
                  to={`/search?offer=${deal.id}`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-3 text-sm font-semibold text-white"
                >
                  Browse offer
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Credits"
              title="Travel wallet"
              description="Clear credit visibility before checkout."
            />
            <div className="mt-6 rounded-[28px] bg-dark p-5 text-white">
              <Gift size={24} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Available credit
              </p>
              <p className="mt-2 text-3xl font-semibold">{travelCredit}</p>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Credits can be applied from checkout once the promotion API is connected.
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow="Rules" title="How offers apply" />
            <div className="mt-6 space-y-3">
              {[
                'Only one promo code can be previewed per checkout.',
                'Credits apply after cancellation and tax rules.',
                'Host promotions can be combined only when policy allows.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3">
                  <Sparkles size={16} className="mt-0.5 text-brand" />
                  <p className="text-sm leading-6 text-dark">{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
