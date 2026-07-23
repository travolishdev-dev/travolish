import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostPillButton } from '../../components/host/HostFormFields'
import { getHotelBoosts, purchaseBoost, cancelBoost } from '../../services/boostApi'
import { getHostRooms, getHotelPromotions, saveHotelPromotion } from '../../services/hostListingsApi'
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

const DISCOUNT_PROMOTION_TYPES = [
  {
    id: 'early_bird',
    label: 'Early Bird Discount',
    description: 'Reward guests who book well in advance.',
    fields: [
      { key: 'discountPercent', label: 'Discount %', placeholder: '15' },
      { key: 'advanceDays', label: 'Min. days in advance', placeholder: '30' },
    ],
  },
  {
    id: 'last_minute',
    label: 'Last-Minute Deal',
    description: 'Fill empty rooms by discounting last-minute bookings.',
    fields: [
      { key: 'discountPercent', label: 'Discount %', placeholder: '20' },
      { key: 'cutoffHours', label: 'Hours before check-in', placeholder: '48' },
    ],
  },
  {
    id: 'flash_sale',
    label: 'Flash Sale',
    description: 'Time-limited steep discount to drive quick bookings.',
    fields: [
      { key: 'discountPercent', label: 'Discount %', placeholder: '25' },
      { key: 'saleDurationHours', label: 'Sale duration (hours)', placeholder: '24' },
    ],
  },
  {
    id: 'coupon_code',
    label: 'Coupon Code',
    description: 'Create a discount code guests enter at checkout.',
    fields: [
      { key: 'code', label: 'Coupon code', placeholder: 'SUMMER25' },
      { key: 'discountPercent', label: 'Discount %', placeholder: '10' },
      { key: 'maxUses', label: 'Max uses', placeholder: '100' },
    ],
  },
  {
    id: 'long_stay',
    label: 'Long Stay Discount',
    description: 'Reward guests with weekly or monthly discounts.',
    fields: [
      { key: 'weeklyDiscountPercent', label: 'Weekly discount %', placeholder: '10' },
      { key: 'monthlyDiscountPercent', label: 'Monthly discount %', placeholder: '20' },
    ],
  },
  {
    id: 'free_upgrade',
    label: 'Free Room Upgrade',
    description: 'Offer eligible guests a complimentary room upgrade.',
    fields: [
      { key: 'upgradeCondition', label: 'Upgrade condition', placeholder: 'e.g., On stays of 3+ nights' },
    ],
  },
  {
    id: 'free_breakfast',
    label: 'Free Breakfast',
    description: 'Include breakfast for eligible bookings.',
    fields: [
      { key: 'breakfastCondition', label: 'Eligibility condition', placeholder: 'e.g., 2+ nights or direct booking' },
    ],
  },
  {
    id: 'loyalty',
    label: 'Loyalty Discount',
    description: 'Reward returning guests with a special rate.',
    fields: [
      { key: 'discountPercent', label: 'Discount %', placeholder: '10' },
      { key: 'minPreviousStays', label: 'Min. previous stays', placeholder: '1' },
    ],
  },
]

const RULE_TYPE_TO_FRONTEND = {
  EARLY_BIRD: 'early_bird',
  LAST_MINUTE: 'last_minute',
  FLASH_SALE: 'flash_sale',
  PROMOTIONAL: 'coupon_code',
  LONG_STAY: 'long_stay',
  FREE_UPGRADE: 'free_upgrade',
  FREE_BREAKFAST: 'free_breakfast',
  LOYALTY: 'loyalty',
}

function adaptLoadedPromos(rules) {
  const result = emptyDiscountPromo()
  rules.forEach((r) => {
    const id = RULE_TYPE_TO_FRONTEND[r.ruleType]
    if (!id) return
    const pct = r.multiplier != null ? Math.round((1 - r.multiplier) * 100) : 0
    result[id] = {
      ...result[id],
      enabled: r.isActive !== false,
      ...(pct > 0 ? { discountPercent: String(pct) } : {}),
      ...(r.promoCode ? { code: r.promoCode } : {}),
      ...(id === 'free_upgrade' && r.description ? { upgradeCondition: r.description } : {}),
      ...(id === 'free_breakfast' && r.description ? { breakfastCondition: r.description } : {}),
      ...(id === 'long_stay' && pct > 0 ? { weeklyDiscountPercent: String(pct) } : {}),
    }
  })
  return result
}

function emptyDiscountPromo() {
  return Object.fromEntries(DISCOUNT_PROMOTION_TYPES.map((t) => [
    t.id,
    {
      enabled: false,
      ...Object.fromEntries((t.fields ?? []).map((f) => [f.key, ''])),
    },
  ]))
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
  const [discountPromos, setDiscountPromos] = useState(emptyDiscountPromo)
  const [savingPromos, setSavingPromos] = useState(false)
  const [promosNotice, setPromosNotice] = useState('')
  const [roomSelectOpen, setRoomSelectOpen] = useState(false)
  const [boostTypeOpen, setBoostTypeOpen] = useState(false)
  const roomSelectRef = useRef(null)
  const boostTypeRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (roomSelectRef.current && !roomSelectRef.current.contains(e.target)) setRoomSelectOpen(false)
      if (boostTypeRef.current && !boostTypeRef.current.contains(e.target)) setBoostTypeOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function setPromoField(promoId, field, val) {
    setDiscountPromos((prev) => ({
      ...prev,
      [promoId]: { ...prev[promoId], [field]: val },
    }))
  }

  async function handleSaveDiscountPromos() {
    if (!primaryHotelId) return
    setSavingPromos(true)
    setPromosNotice('')
    try {
      // POST each enabled discount promotion
      const enabled = DISCOUNT_PROMOTION_TYPES
        .filter((t) => discountPromos[t.id]?.enabled)
        .map((t) => ({ type: t.id, ...discountPromos[t.id] }))
      if (enabled.length === 0) {
        setPromosNotice('No promotions enabled.')
        return
      }
      await Promise.all(enabled.map((p) =>
        saveHotelPromotion(primaryHotelId, p).catch(() => null)
      ))
      setPromosNotice(`${enabled.length} promotion${enabled.length !== 1 ? 's' : ''} saved.`)
    } catch {
      setPromosNotice('Could not save promotions. Please try again.')
    } finally {
      setSavingPromos(false)
    }
  }

  useEffect(() => {
    if (hostLoading || !primaryHotelId) {
      if (!hostLoading) setLoading(false)
      return
    }
    Promise.all([
      getHotelBoosts(primaryHotelId).catch(() => []),
      getHostRooms(primaryHotelId).catch(() => []),
      getHotelPromotions(primaryHotelId).catch(() => null),
    ]).then(([boosts, roomList, existingPromos]) => {
      if (boosts.length > 0) setPromotions(boosts.map(adaptBoost))
      const rs = Array.isArray(roomList) ? roomList : (roomList?.content ?? roomList?.rooms ?? [])
      if (rs.length) {
        setRooms(rs)
        setBoostForm((prev) => ({ ...prev, roomId: prev.roomId || String(rs[0].id) }))
      }
      if (Array.isArray(existingPromos) && existingPromos.length > 0) {
        setDiscountPromos(adaptLoadedPromos(existingPromos))
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
      eyebrow="Boost your Listing"
      title="Boost your Listing"
      mobileTitle="Boost your Listing"
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
      {/* ── Discount promotions ── */}
      <SectionCard>
        <SectionHeading
          eyebrow="Boost your Listing"
          title="Discount promotions"
          description="Enable and configure guest-facing discounts. Enabled promotions are applied automatically at checkout."
        />

        <div className="mt-6 space-y-4">
          {DISCOUNT_PROMOTION_TYPES.map((promo) => {
            const state = discountPromos[promo.id] ?? {}
            return (
              <div
                key={promo.id}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  state.enabled ? 'border-dark' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 bg-gray-50 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-dark">{promo.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{promo.description}</p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!state.enabled}
                      onChange={(e) => setPromoField(promo.id, 'enabled', e.target.checked)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="text-xs font-semibold text-dark">Enable</span>
                  </label>
                </div>

                {state.enabled && promo.fields && (
                  <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    {promo.fields.map((field) => (
                      <HostField
                        key={field.key}
                        label={field.label}
                        value={state[field.key] ?? ''}
                        onChange={(e) => setPromoField(promo.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {promosNotice && (
          <p className={`mt-4 text-sm ${promosNotice.includes('saved') || promosNotice.includes('promotion') ? 'text-green-700' : 'text-red-600'}`}>
            {promosNotice}
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={handleSaveDiscountPromos}
            disabled={savingPromos}
            className="inline-flex items-center rounded-2xl bg-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {savingPromos ? 'Saving…' : 'Save promotions'}
          </button>
        </div>
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
              <div ref={roomSelectRef} className="relative">
                <button
                  type="button"
                  onClick={() => setRoomSelectOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all"
                >
                  <span>{rooms.find((r) => String(r.id) === boostForm.roomId) ? `${rooms.find((r) => String(r.id) === boostForm.roomId).number ?? rooms.find((r) => String(r.id) === boostForm.roomId).name ?? `Room ${boostForm.roomId}`}` : 'Select a room'}</span>
                  <ChevronDown size={14} className="shrink-0 text-muted" />
                </button>
                {roomSelectOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                    {rooms.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { updateForm('roomId')({ target: { value: String(r.id) } }); setRoomSelectOpen(false) }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${boostForm.roomId === String(r.id) ? 'text-dark' : 'text-muted'}`}
                      >
                        {r.number ?? r.name ?? `Room ${r.id}`} — {r.type ?? ''}
                        {boostForm.roomId === String(r.id) && <Check size={14} className="shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={boostForm.roomId}
                onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); updateForm('roomId')(e) }}
                placeholder="Enter room ID"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
              />
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-dark">Duration (days)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={boostForm.durationDays}
              onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); updateForm('durationDays')(e) }}
              placeholder="7"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Boost type
          </p>
          <div ref={boostTypeRef} className="relative">
            <button
              type="button"
              onClick={() => setBoostTypeOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all"
            >
              <span>{BOOST_TYPES.find((t) => t.value === boostForm.boostType)?.label ?? 'Select boost type'}</span>
              <ChevronDown size={14} className="shrink-0 text-muted" />
            </button>
            {boostTypeOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                {BOOST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { updateForm('boostType')({ target: { value: t.value } }); setBoostTypeOpen(false) }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${boostForm.boostType === t.value ? 'text-dark' : 'text-muted'}`}
                  >
                    {t.label}
                    {boostForm.boostType === t.value && <Check size={14} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
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
