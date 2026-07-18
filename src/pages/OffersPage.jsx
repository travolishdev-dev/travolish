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
import { useTranslation } from 'react-i18next'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../components/portal/PortalUI'
import { getActiveOffers, getUserCredits, validatePromoCode } from '../services/offersApi'
import useAuthStore from '../stores/useAuthStore'
import useCurrency from '../hooks/useCurrency'

const RULE_TYPE_KEYS = {
  PROMOTIONAL: 'types.promotion',
  EARLY_BIRD: 'types.earlyBird',
  LAST_MINUTE: 'types.lastMinute',
  LOYALTY: 'types.loyalty',
}

function OfferCard({ offer, onCopy, t }) {
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
              {t('expiring')}
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
            {RULE_TYPE_KEYS[offer.ruleType] ? t(RULE_TYPE_KEYS[offer.ruleType]) : offer.ruleType}
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
        {t('browseOffer')}
        <ArrowRight size={15} />
      </Link>
    </div>
  )
}

export default function OffersPage() {
  const { t } = useTranslation('offers')
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
    { label: t('stats.travelCredits'), value: creditsValue, note: t('stats.availableAtCheckout') },
    { label: t('stats.activeOffers'), value: loading ? '—' : String(activeCount), note: 'Matched to platform deals' },
    { label: t('stats.expiringSoon'), value: loading ? '—' : String(expiringSoonCount), note: t('stats.within30') },
  ]

  return (
    <PortalShell
      eyebrow="Offers"
      title={t('heading')}
      mobileTitle="Offers"
      description={t('desc')}
      actions={[
        { label: t('searchStays'), href: '/search' },
        { label: 'Transactions', href: '/account/transactions', secondary: true },
      ]}
      stats={offerStats}
      accent="from-rose-50 via-white to-amber-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard>
          <SectionHeading
            eyebrow="Deals"
            title={t('availableOffers')}
            description={t('offersDesc')}
          />

          {copiedCode && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <CheckCheck size={14} />
              &ldquo;{copiedCode}&rdquo; {t('copied')}
            </div>
          )}

          {loading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              {t('loading')}
            </div>
          ) : offers.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-gray-200 bg-[#fcfcfb] p-8 text-center">
              <BadgePercent size={32} className="mx-auto text-gray-300" />
              <p className="mt-4 text-sm font-semibold text-dark">{t('noOffers')}</p>
              <p className="mt-1 text-sm text-muted">{t('noOffersDesc')}</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onCopy={handleCopy} t={t} />
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          {/* Travel wallet */}
          <SectionCard>
            <SectionHeading
              eyebrow={t('credits')}
              title={t('wallet')}
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
                  {t('creditsAuto')}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-white/75">
                  {t('earnCredits')}
                </p>
              )}
            </div>
          </SectionCard>

          {/* Promo code validator */}
          <SectionCard>
            <SectionHeading eyebrow={t('validate')} title={t('checkPromo')} />
            <form onSubmit={handleValidate} className="mt-5 space-y-3">
              <input
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoResult(null) }}
                placeholder={t('promoPlaceholder')}
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base font-semibold text-dark outline-none focus:border-dark"
              />
              <button
                type="submit"
                disabled={!promoInput.trim() || validating}
                className="w-full rounded-2xl bg-dark px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
              >
                {validating ? t('checking') : t('validateCode')}
              </button>
              {promoResult?.offer && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{t('validCode')} ✓</p>
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
            <SectionHeading eyebrow={t('rules')} title={t('howApply')} />
            <div className="mt-6 space-y-3">
              {[t('ruleOne'), t('ruleTwo'), t('ruleThree')].map((item) => (
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
