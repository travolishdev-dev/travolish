import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'
import { getHotelBoosts, purchaseBoost, cancelBoost } from '../../services/boostApi'
import { getHostRooms } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'

const BOOST_TYPES = [
  { value: 'FEATURED_LISTING', label: 'Featured listing' },
  { value: 'HIGHLIGHTED_SEARCH', label: 'Highlighted search' },
  { value: 'PRIORITY_DISPLAY', label: 'Priority display' },
  { value: 'PREMIUM_PROMOTION', label: 'Premium promotion' },
  { value: 'SEASONAL_BOOST', label: 'Seasonal boost' },
]

const BOOST_TIERS = ['SILVER', 'GOLD', 'PLATINUM']

const TIER_COSTS = { SILVER: 49.99, GOLD: 99.99, PLATINUM: 199.99 }

const EMPTY_FORM = {
  roomId: '',
  boostType: 'FEATURED_LISTING',
  boostTier: 'SILVER',
  durationDays: '7',
}

function adaptBoost(b) {
  const status =
    b.status === 'ACTIVE' ? 'Running'
    : b.status === 'SCHEDULED' || b.status === 'PENDING' || b.status === 'PENDING_PAYMENT' ? 'Scheduled'
    : 'Paused'

  const parts = [b.boostTier, b.boostType].filter(Boolean)
  const title = parts.length > 0 ? parts.join(' ') : 'Listing boost'

  const spend = b.cost != null ? `$${Number(b.cost).toFixed(0)}` : '—'

  const result =
    b.bookingGain != null && b.bookingGain > 0
      ? `+${b.bookingGain} bookings`
      : b.impressionGain != null && b.impressionGain > 0
        ? `+${b.impressionGain} impressions`
        : b.clickGain != null && b.clickGain > 0
          ? `+${b.clickGain} clicks`
          : '—'

  const note = [
    b.durationDays != null ? `${b.durationDays}d boost` : null,
    b.visibilityMultiplier != null ? `${b.visibilityMultiplier}× visibility` : null,
  ].filter(Boolean).join(' · ') || b.boostType

  return { id: b.id, title, status, spend, result, note, rawStatus: b.status }
}

export default function HostPromotionsPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [promotions, setPromotions] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [boostForm, setBoostForm] = useState(EMPTY_FORM)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  useEffect(() => {
    if (hostLoading || !primaryHotelId) {
      if (!hostLoading) setLoading(false)
      return
    }
    Promise.all([
      getHotelBoosts(primaryHotelId).catch(() => []),
      getHostRooms(primaryHotelId).catch(() => []),
    ]).then(([boosts, roomList]) => {
      if (boosts.length > 0) setPromotions(boosts.map(adaptBoost))
      const rs = Array.isArray(roomList) ? roomList : (roomList?.content ?? roomList?.rooms ?? [])
      if (rs.length) {
        setRooms(rs)
        // Pre-select first room
        setBoostForm((prev) => ({ ...prev, roomId: prev.roomId || String(rs[0].id) }))
      }
    }).finally(() => setLoading(false))
  }, [primaryHotelId, hostLoading])

  function refreshBoosts() {
    if (!primaryHotelId) return
    getHotelBoosts(primaryHotelId)
      .then((items) => {
        if (items.length > 0) setPromotions(items.map(adaptBoost))
      })
      .catch(() => {})
  }

  async function handlePurchase() {
    if (!boostForm.roomId) {
      setPurchaseError('Room ID is required to purchase a boost.')
      return
    }
    setPurchasing(true)
    setPurchaseError(null)
    setPurchaseSuccess(false)
    try {
      await purchaseBoost({
        hotelId: primaryHotelId,
        roomId: Number(boostForm.roomId),
        boostType: boostForm.boostType,
        boostTier: boostForm.boostTier,
        durationDays: Number(boostForm.durationDays) || 7,
      })
      setPurchaseSuccess(true)
      setBoostForm(EMPTY_FORM)
      refreshBoosts()
    } catch {
      setPurchaseError('Purchase failed. Please check your details and try again.')
    } finally {
      setPurchasing(false)
    }
  }

  function handleCancel(boostId) {
    if (!window.confirm('Cancel this boost?')) return
    setPromotions((prev) => prev.filter((p) => p.id !== boostId))
    cancelBoost(boostId).catch(refreshBoosts)
  }

  const updateForm = (field) => (e) =>
    setBoostForm((prev) => ({ ...prev, [field]: e.target.value }))

  const cancellable = (p) =>
    p.rawStatus === 'ACTIVE' || p.rawStatus === 'PENDING_PAYMENT' || p.status === 'Running' || p.status === 'Scheduled'

  return (
    <HostShell
      eyebrow="Promotions"
      title="Promotions"
      mobileTitle="Promotions"
      description="Listing boosts and scheduled campaigns."
      actions={[
        { label: 'Pricing rules', href: '/host/pricing', secondary: true },
        { label: 'Pricing AI', href: '/host/pricing-ai' },
      ]}
      stats={[
        { label: 'Boosts', value: String(promotions.length), note: 'Total campaigns' },
        { label: 'Running', value: String(promotions.filter((p) => p.status === 'Running').length), note: 'Currently live' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Campaigns" title="Promotion roster" />

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading promotions…</div>
        )}

        {!loading && promotions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-dark">No active boosts</p>
            <p className="mt-1 text-sm text-muted">Purchase a boost below to increase your listing's visibility.</p>
          </div>
        )}

        {!loading && promotions.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{promotion.title}</p>
                      <StatusPill
                        tone={
                          promotion.status === 'Running'
                            ? 'success'
                            : promotion.status === 'Scheduled'
                              ? 'sky'
                              : 'warning'
                        }
                      >
                        {promotion.status}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-dark">{promotion.note}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Spend
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dark">{promotion.spend}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Result
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dark">{promotion.result}</p>
                    </div>
                    {cancellable(promotion) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(promotion.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Cancel boost
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeading
          eyebrow="Purchase"
          title="New listing boost"
          description="Boosting a room increases its visibility in search results for the selected duration."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Room</label>
            {rooms.length > 0 ? (
              <select
                value={boostForm.roomId}
                onChange={updateForm('roomId')}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.number ?? r.name ?? `Room ${r.id}`} — {r.type ?? ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={boostForm.roomId}
                onChange={updateForm('roomId')}
                placeholder="Enter room ID"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
              />
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Duration (days)</label>
            <input
              type="number"
              value={boostForm.durationDays}
              onChange={updateForm('durationDays')}
              placeholder="7"
              min="1"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Boost type
          </p>
          <select
            value={boostForm.boostType}
            onChange={updateForm('boostType')}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
          >
            {BOOST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Tier
          </p>
          <div className="flex flex-wrap gap-3">
            {BOOST_TIERS.map((tier) => (
              <HostPillButton
                key={tier}
                active={boostForm.boostTier === tier}
                onClick={() => setBoostForm((prev) => ({ ...prev, boostTier: tier }))}
              >
                {tier.charAt(0) + tier.slice(1).toLowerCase()}
              </HostPillButton>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {BOOST_TIERS.map((tier) => (
              <div
                key={tier}
                className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                  boostForm.boostTier === tier
                    ? 'border-dark bg-dark text-white'
                    : 'border-gray-200 bg-[#fcfcfb] text-muted'
                }`}
              >
                <span className="font-semibold">{tier.charAt(0) + tier.slice(1).toLowerCase()}</span>
                {' — '}${TIER_COSTS[tier]}/boost
              </div>
            ))}
          </div>
        </div>

        {purchaseError && (
          <p className="mt-4 text-sm text-red-600">{purchaseError}</p>
        )}
        {purchaseSuccess && (
          <p className="mt-4 text-sm text-green-700">Boost purchased successfully.</p>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={handlePurchase}
            disabled={purchasing}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {purchasing ? 'Processing…' : 'Purchase boost'}
          </button>
        </div>
      </SectionCard>
    </HostShell>
  )
}
