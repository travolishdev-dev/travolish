import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  CheckCheck,
  Clock,
  Copy,
  Gift,
  Loader2,
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
import { getActiveOffers, getUserCredits, validatePromoCode } from '../services/offersApi'
import useAuthStore from '../stores/useAuthStore'
import useCurrency from '../hooks/useCurrency'

const RULE_TYPE_LABELS = {
  PROMOTIONAL: 'Promotion',
  EARLY_BIRD: 'Early bird',
  LAST_MINUTE: 'Last minute',
  LOYALTY: 'Loyalty',
}

function OfferCard({ offer, onCopy }) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-rose-50 p-3 text-brand">
          <TicketPercent size={22} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusPill tone="success">{offer.discountSummary}</StatusPill>
          {offer.expiringSoon && (
            <StatusPill tone="warning">
              <Clock size={11} className="mr-1 inline" />
              Expiring
            </StatusPill>
          )}
        </div>
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-dark">{offer.title}</h2>

      {offer.hotelName && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <MapPin size={15} />
          {offer.hotelName}
        </p>
      )}

      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <CalendarDays size={15} />
        {offer.validFrom} → {offer.validUntil}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {RULE_TYPE_LABELS[offer.ruleType] ?? offer.ruleType}
          </p>
          <p className="mt-1 text-lg font-semibold text-dark">{offer.promoCode}</p>
        </div>
        <button
          type="button"
          onClick={() => onCopy(offer.promoCode)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-gray-200 bg-white text-muted transition-colors hover:border-brand hover:text-brand"
          title="Copy code"
        >
          <Copy size={14} />
        </button>
      </div>

      <Link
        to={`/search?offer=${offer.id}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        Browse offer
        <ArrowRight size={15} />
      </Link>
    </div>
  )
}

export default function OffersPage() {
  const userId = useAuthStore((s) => s.backendUserId)
  const { formatCurrency } = useCurrency()

  const [offers, setOffers] = useState([])
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    Promise.all([
      getActiveOffers().catch(() => []),
      userId ? getUserCredits(userId).catch(() => null) : Promise.resolve(null),
    ]).then(([offerList, creditsData]) => {
      setOffers(offerList ?? [])
      setCredits(creditsData)
    }).finally(() => setLoading(false))
  }, [userId])

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleValidate = async (e) => {
    e.preventDefault()
    const code = promoInput.trim()
    if (!code) return
    setValidating(true)
    setPromoResult(null)
    try {
      const offer = await validatePromoCode(code)
      setPromoResult({ offer })
    } catch {
      setPromoResult({ error: `"${code}" is not a valid or active promo code.` })
    } finally {
      setValidating(false)
    }
  }

  const activeCount = offers.filter((o) => o.active).length
  const expiringSoonCount = offers.filter((o) => o.expiringSoon).length
  const creditsValue = credits?.availableCredits != null
    ? formatCurrency(Number(credits.availableCredits))
    : '—'

  const offerStats = [
    { label: 'Travel credits', value: creditsValue, note: 'Available at checkout' },
    { label: 'Active offers', value: loading ? '—' : String(activeCount), note: 'Matched to platform deals' },
    { label: 'Expiring soon', value: loading ? '—' : String(expiringSoonCount), note: 'Use within 30 days' },
  ]

  return (
    <PortalShell
      eyebrow="Offers"
      title="Deals and travel credits."
      mobileTitle="Offers"
      description="Active promo codes, travel credits, and curated deal windows."
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
            description="Live deals from host promotions and platform pricing rules."
          />

          {copiedCode && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <CheckCheck size={14} />
              &ldquo;{copiedCode}&rdquo; copied to clipboard
            </div>
          )}

          {loading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              Loading offers…
            </div>
          ) : offers.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-gray-200 bg-[#fcfcfb] p-8 text-center">
              <BadgePercent size={32} className="mx-auto text-gray-300" />
              <p className="mt-4 text-sm font-semibold text-dark">No active offers right now</p>
              <p className="mt-1 text-sm text-muted">Check back soon — new deals are added regularly.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onCopy={handleCopy} />
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          {/* Travel wallet */}
          <SectionCard>
            <SectionHeading
              eyebrow="Credits"
              title="Travel wallet"
              description="Credits earned from confirmed bookings (2% cashback)."
            />
            <div className="mt-6 rounded-[28px] bg-dark p-5 text-white">
              <Gift size={24} />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Available credit
              </p>
              <p className="mt-2 text-3xl font-semibold">{creditsValue}</p>
              {credits?.bookingsEarned != null && credits.bookingsEarned > 0 ? (
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Earned from {credits.bookingsEarned} completed booking{credits.bookingsEarned !== 1 ? 's' : ''}.
                  Credits apply automatically at checkout.
                </p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Complete a stay to earn 2% cashback as travel credits.
                </p>
              )}
            </div>
          </SectionCard>

          {/* Promo code validator */}
          <SectionCard>
            <SectionHeading eyebrow="Validate" title="Check a promo code" />
            <form onSubmit={handleValidate} className="mt-5 space-y-3">
              <input
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoResult(null) }}
                placeholder="Enter code, e.g. WEEKEND18"
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm font-semibold text-dark outline-none focus:border-dark"
              />
              <button
                type="submit"
                disabled={!promoInput.trim() || validating}
                className="w-full rounded-2xl bg-dark px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
              >
                {validating ? 'Checking…' : 'Validate code'}
              </button>
              {promoResult?.offer && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Valid code ✓</p>
                  <p className="mt-1 text-sm font-semibold text-dark">{promoResult.offer.title}</p>
                  <p className="text-sm text-emerald-700">{promoResult.offer.discountSummary}</p>
                </div>
              )}
              {promoResult?.error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm text-rose-700">{promoResult.error}</p>
                </div>
              )}
            </form>
          </SectionCard>

          {/* Rules */}
          <SectionCard>
            <SectionHeading eyebrow="Rules" title="How offers apply" />
            <div className="mt-6 space-y-3">
              {[
                'Only one promo code can be applied per checkout.',
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
