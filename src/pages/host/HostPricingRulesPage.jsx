import { useEffect, useState } from 'react'
import { Plus, Power, Trash2 } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostPillButton } from '../../components/host/HostFormFields'
import {
  getPricingRulesForHotel,
  createPricingRule,
  deletePricingRule,
  togglePricingRule,
} from '../../services/pricingApi'
import useHostContext from '../../hooks/useHostContext'

function adaptRule(r) {
  let change = '—'
  if (r.pricingType === 'PERCENTAGE' && r.multiplier != null) {
    const pct = Math.round((r.multiplier - 1) * 100)
    change = pct >= 0 ? `+${pct}%` : `${pct}%`
  } else if (r.pricingType === 'DISCOUNT' && r.fixedDiscount != null) {
    change = `-$${r.fixedDiscount}`
  } else if (r.pricingType === 'FLAT' && r.basePrice != null) {
    change = `$${r.basePrice}`
  } else if (r.adjustedPrice != null && r.basePrice != null && r.basePrice !== 0) {
    const pct = Math.round(((r.adjustedPrice - r.basePrice) / r.basePrice) * 100)
    change = pct >= 0 ? `+${pct}%` : `${pct}%`
  }

  const scope = r.season
    ?? (r.startDate && r.endDate ? `${r.startDate} → ${r.endDate}` : null)
    ?? r.ruleType
    ?? '—'

  return {
    id: r.id,
    title: r.description ?? r.ruleType ?? 'Pricing rule',
    status: r.isActive !== false ? 'Active' : 'Inactive',
    scope,
    change,
    note: r.ruleType ?? '',
  }
}

const RULE_TYPES = ['SEASONAL', 'PROMOTIONAL', 'EARLY_BIRD', 'LAST_MINUTE', 'DYNAMIC']
const PRICING_TYPES = ['PERCENTAGE', 'DISCOUNT', 'FLAT']
const EMPTY_RULE = {
  description: '',
  ruleType: 'SEASONAL',
  pricingType: 'PERCENTAGE',
  startDate: '',
  endDate: '',
  basePrice: '',
  multiplier: '1.2',
  fixedDiscount: '',
  season: '',
  roomId: '',
}

export default function HostPricingRulesPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newRule, setNewRule] = useState(EMPTY_RULE)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (hostLoading || !primaryHotelId) {
      if (!hostLoading) setLoading(false)
      return
    }
    getPricingRulesForHotel(primaryHotelId)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) setRules(items.map(adaptRule))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [primaryHotelId, hostLoading])

  function refreshRules() {
    if (!primaryHotelId) return
    getPricingRulesForHotel(primaryHotelId)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) setRules(items.map(adaptRule))
      })
      .catch(() => {})
  }

  async function handleCreate() {
    setSaving(true)
    setSaveError(null)
    try {
      await createPricingRule({
        hotelId: primaryHotelId,
        roomId: newRule.roomId ? Number(newRule.roomId) : null,
        description: newRule.description || null,
        ruleType: newRule.ruleType,
        pricingType: newRule.pricingType,
        startDate: newRule.startDate || null,
        endDate: newRule.endDate || null,
        basePrice: Number(newRule.basePrice) || 0,
        multiplier:
          newRule.pricingType === 'PERCENTAGE' && newRule.multiplier
            ? Number(newRule.multiplier)
            : null,
        fixedDiscount:
          newRule.pricingType === 'DISCOUNT' && newRule.fixedDiscount
            ? Number(newRule.fixedDiscount)
            : null,
        season: newRule.season || null,
        isActive: true,
        priority: 1,
      })
      setNewRule(EMPTY_RULE)
      setShowForm(false)
      refreshRules()
    } catch {
      setSaveError('Failed to create rule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(ruleId) {
    if (!window.confirm('Delete this pricing rule?')) return
    setRules((prev) => prev.filter((r) => r.id !== ruleId))
    deletePricingRule(ruleId).catch(refreshRules)
  }

  function handleToggle(ruleId) {
    const rule = rules.find((r) => r.id === ruleId)
    const nextActive = rule ? rule.status !== 'Active' : true
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, status: nextActive ? 'Active' : 'Inactive' }
          : r,
      ),
    )
    togglePricingRule(ruleId, nextActive).catch(refreshRules)
  }

  const updateNewRule = (field) => (e) =>
    setNewRule((prev) => ({ ...prev, [field]: e.target.value }))

  const activeTypes = [
    ...new Set(rules.filter((r) => r.status === 'Active').map((r) => r.note).filter(Boolean)),
  ]

  return (
    <HostShell
      eyebrow="Pricing"
      title="Pricing rules"
      mobileTitle="Pricing"
      description="Seasonal and dynamic pricing rules for your listings."
      actions={[
        { label: 'Pricing AI', href: '/host/pricing-ai', secondary: true },
        { label: 'Promotions', href: '/host/promotions' },
      ]}
      mobileAction={{ label: 'New rule', onClick: () => setShowForm(true) }}
      stats={[
        { label: 'Rules', value: String(rules.length), note: 'Total configured' },
        { label: 'Active', value: String(rules.filter((r) => r.status === 'Active').length), note: 'Currently applied' },
      ]}
    >
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <SectionHeading eyebrow="Rules" title="Active pricing logic" />
          <button
            type="button"
            onClick={() => { setShowForm((v) => !v); setSaveError(null) }}
            className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-dark hover:bg-gray-50"
          >
            <Plus size={15} />
            New rule
          </button>
        </div>

        {activeTypes.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {activeTypes.map((t) => (
              <HostPillButton key={t} active>
                {t.replace(/_/g, ' ').toLowerCase()}
              </HostPillButton>
            ))}
          </div>
        )}

        {showForm && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-[#f8f6f2] p-5">
            <p className="text-sm font-semibold text-dark">New pricing rule</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <HostField
                label="Description"
                value={newRule.description}
                onChange={updateNewRule('description')}
                placeholder="e.g. Summer peak pricing"
              />
              <HostField
                label="Season (optional)"
                value={newRule.season}
                onChange={updateNewRule('season')}
                placeholder="e.g. Summer 2026"
              />
              <HostField
                label="Start date"
                type="date"
                value={newRule.startDate}
                onChange={updateNewRule('startDate')}
              />
              <HostField
                label="End date"
                type="date"
                value={newRule.endDate}
                onChange={updateNewRule('endDate')}
              />
              <HostField
                label="Base price ($)"
                type="number"
                value={newRule.basePrice}
                onChange={updateNewRule('basePrice')}
                placeholder="200"
              />
              <HostField
                label="Room ID (optional — blank = all rooms)"
                type="number"
                value={newRule.roomId}
                onChange={updateNewRule('roomId')}
                placeholder="Leave blank for hotel-wide rule"
              />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Rule type
              </p>
              <div className="flex flex-wrap gap-2">
                {RULE_TYPES.map((t) => (
                  <HostPillButton
                    key={t}
                    active={newRule.ruleType === t}
                    onClick={() => setNewRule((prev) => ({ ...prev, ruleType: t }))}
                  >
                    {t.replace(/_/g, ' ').toLowerCase()}
                  </HostPillButton>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Pricing type
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICING_TYPES.map((t) => (
                  <HostPillButton
                    key={t}
                    active={newRule.pricingType === t}
                    onClick={() => setNewRule((prev) => ({ ...prev, pricingType: t }))}
                  >
                    {t.toLowerCase()}
                  </HostPillButton>
                ))}
              </div>
            </div>

            {newRule.pricingType === 'PERCENTAGE' && (
              <div className="mt-4 max-w-xs">
                <HostField
                  label="Multiplier (1.2 = +20%, 0.9 = –10%)"
                  type="number"
                  value={newRule.multiplier}
                  onChange={updateNewRule('multiplier')}
                  placeholder="1.2"
                />
              </div>
            )}
            {newRule.pricingType === 'DISCOUNT' && (
              <div className="mt-4 max-w-xs">
                <HostField
                  label="Fixed discount ($)"
                  type="number"
                  value={newRule.fixedDiscount}
                  onChange={updateNewRule('fixedDiscount')}
                  placeholder="50"
                />
              </div>
            )}

            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create rule'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setSaveError(null) }}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading rules…</div>
        )}

        {!loading && rules.length === 0 && !showForm && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-dark">No pricing rules yet</p>
            <p className="mt-1 text-sm text-muted">Create your first rule to apply seasonal or dynamic pricing.</p>
          </div>
        )}

        {!loading && rules.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {rules.map((rule) => (
              <div key={rule.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{rule.title}</p>
                      <StatusPill tone={rule.status === 'Active' ? 'success' : 'warning'}>
                        {rule.status}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-muted">{rule.scope}</p>
                    {rule.note && (
                      <p className="mt-3 text-sm leading-6 text-dark">{rule.note}</p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Effect
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                      {rule.change}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(rule.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-dark hover:bg-gray-50"
                      >
                        <Power size={12} />
                        {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rule.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </HostShell>
  )
}
