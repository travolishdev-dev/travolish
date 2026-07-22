import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading, AdminStatusPill } from '../../components/admin/AdminPortalUI'
import { clonePricingRule, createPricingRule, deletePricingRule, getAllPricingRules, togglePricingRule, updatePricingRule } from '../../services/adminApi'

const RULE_TYPES = ['SEASONAL', 'PROMOTIONAL', 'DYNAMIC', 'EARLY_BIRD', 'LAST_MINUTE', 'BULK', 'LOYALTY']

function RuleForm({ description, setDescription, ruleType, setRuleType, multiplier, setMultiplier, priority, setPriority }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Weekend premium" className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Rule type</label>
        <select value={ruleType} onChange={(e) => setRuleType(e.target.value)} className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand">
          {RULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Multiplier</label>
          <input type="number" step="0.01" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} placeholder="e.g. 1.18" className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Priority</label>
          <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="e.g. 30" className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand" />
        </div>
      </div>
    </div>
  )
}

function RuleDetailPanel({ record, rawMap, nameToId, onSave, setNotice, mode, onEdit }) {
  const rule = (mode === 'preview' || mode === 'edit') && record ? rawMap.current[nameToId.current[record[0]]] : null
  const [description, setDescription] = useState('')
  const [ruleType, setRuleType] = useState('SEASONAL')
  const [multiplier, setMultiplier] = useState('')
  const [priority, setPriority] = useState('')
  const [basePrice, setBasePrice] = useState('100')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (rule) {
      setDescription(rule.description ?? '')
      setRuleType(rule.ruleType ?? rule.pricingType ?? 'SEASONAL')
      setMultiplier(rule.multiplier != null ? String(rule.multiplier) : '')
      setPriority(rule.priority != null ? String(rule.priority) : '')
    } else if (mode === 'create') {
      setDescription(''); setRuleType('SEASONAL'); setMultiplier(''); setPriority('')
    }
  }, [rule?.id, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate() {
    if (!description.trim()) { toast.error('Description is required'); return }
    setSaving(true)
    try {
      await createPricingRule({
        description: description.trim(),
        ruleType,
        multiplier: multiplier ? Number(multiplier) : undefined,
        priority: priority ? Number(priority) : undefined,
        isActive: false,
      })
      toast.success('Pricing rule created')
      setNotice(`Rule "${description}" created as Draft.`)
      onSave()
    } catch {
      toast.error('Failed to create rule')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!rule) return
    if (!description.trim()) { toast.error('Description is required'); return }
    setSaving(true)
    try {
      await updatePricingRule(rule.id, {
        description: description.trim(),
        ruleType,
        multiplier: multiplier ? Number(multiplier) : undefined,
        priority: priority ? Number(priority) : undefined,
      })
      toast.success('Rule updated')
      setNotice(`Rule "${description}" updated.`)
      onSave()
    } catch {
      toast.error('Failed to update rule')
    } finally {
      setSaving(false)
    }
  }

  if (mode === 'create') {
    return (
      <AdminCard className="space-y-5">
        <AdminSectionHeading eyebrow="Pricing rules" title="Create new rule" description="New rules are created as Draft and must be enabled separately." />
        <RuleForm
          description={description} setDescription={setDescription}
          ruleType={ruleType} setRuleType={setRuleType}
          multiplier={multiplier} setMultiplier={setMultiplier}
          priority={priority} setPriority={setPriority}
        />
        <button type="button" disabled={saving} onClick={handleCreate} className="inline-flex h-10 w-full items-center justify-center rounded-card bg-dark text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40">
          {saving ? 'Creating…' : 'Create rule'}
        </button>
      </AdminCard>
    )
  }

  if (mode === 'edit' && rule) {
    return (
      <AdminCard className="space-y-5">
        <AdminSectionHeading eyebrow="Edit rule" title={rule.description || `Rule #${rule.id}`} description="Changes apply immediately — re-enable the rule after saving if needed." />
        <RuleForm
          description={description} setDescription={setDescription}
          ruleType={ruleType} setRuleType={setRuleType}
          multiplier={multiplier} setMultiplier={setMultiplier}
          priority={priority} setPriority={setPriority}
        />
        <div className="flex gap-2 border-t border-gray-200 pt-4">
          <button type="button" disabled={saving} onClick={handleUpdate} className="flex-1 inline-flex h-10 items-center justify-center rounded-card bg-dark text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => onEdit('preview')} className="inline-flex h-10 items-center justify-center rounded-card border border-gray-200 bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-dark">
            Cancel
          </button>
        </div>
      </AdminCard>
    )
  }

  if (!rule) {
    return (
      <AdminCard>
        <AdminSectionHeading eyebrow="Pricing rules" title="Select a rule" description="Click any row to preview rule details and conditions." />
      </AdminCard>
    )
  }

  const period = rule.startDate && rule.endDate ? `${rule.startDate} – ${rule.endDate}` : 'Always active'
  const appliesTo = rule.hotelId ? `Hotel ${rule.hotelId}` : rule.roomId ? `Room ${rule.roomId}` : 'All listings'
  const value = rule.multiplier != null ? `×${rule.multiplier}` : rule.fixedDiscount != null ? `-$${rule.fixedDiscount}` : rule.adjustedPrice != null ? `$${rule.adjustedPrice}` : '—'
  const basePriceNum = Math.max(1, Number(basePrice) || 100)
  const afterRule = rule.multiplier != null
    ? (basePriceNum * rule.multiplier).toFixed(0)
    : rule.fixedDiscount != null
      ? Math.max(0, basePriceNum - rule.fixedDiscount).toFixed(0)
      : null

  return (
    <AdminCard className="space-y-5">
      <AdminSectionHeading
        eyebrow="Rule preview"
        title={rule.description || `Rule #${rule.id}`}
        description="Impact preview and condition summary for this pricing rule."
      />

      <div className="flex flex-wrap gap-2">
        <AdminStatusPill tone={rule.isActive ? 'success' : 'warning'}>{rule.isActive ? 'Active' : 'Draft'}</AdminStatusPill>
        <AdminStatusPill tone="neutral">{rule.ruleType ?? rule.pricingType ?? '—'}</AdminStatusPill>
      </div>

      <div className="space-y-2 rounded-card border border-gray-200 bg-[#fcfbf8] p-4 text-sm">
        {[
          ['Value', value],
          ['Applies to', appliesTo],
          ['Period', period],
          ['Priority', rule.priority ?? '—'],
          ['Rule ID', `#${rule.id}`],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between gap-3">
            <span className="text-muted">{label}</span>
            <span className="font-semibold text-dark">{val}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Price impact preview</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Base $</span>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="h-7 w-20 rounded-card border border-gray-200 bg-white px-2 text-xs font-semibold text-dark outline-none focus:border-brand"
              min="1"
            />
          </div>
        </div>
        <div className="rounded-card border border-gray-200 bg-white p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted">Base price</span><span className="font-semibold">${basePriceNum}</span></div>
          <div className="flex justify-between">
            <span className="text-muted">After rule ({value})</span>
            <span className="font-semibold text-brand">
              {afterRule != null ? `$${afterRule}` : '—'}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit('edit')}
        className="inline-flex h-10 w-full items-center justify-center rounded-card border border-gray-200 bg-white text-sm font-semibold text-dark transition-colors hover:border-dark"
      >
        Edit rule
      </button>
    </AdminCard>
  )
}

function mapRuleToRow(r) {
  const value = r.multiplier != null
    ? `×${r.multiplier}`
    : r.fixedDiscount != null
      ? `-$${r.fixedDiscount}`
      : r.adjustedPrice != null
        ? `$${r.adjustedPrice}`
        : '—'

  const period = r.startDate && r.endDate ? `${r.startDate} – ${r.endDate}` : 'Always'
  const appliesTo = r.hotelId ? `Hotel ${r.hotelId}` : r.roomId ? `Room ${r.roomId}` : 'All'

  return [
    r.description || `Rule #${r.id}`,
    r.ruleType || r.pricingType || '—',
    appliesTo,
    value,
    period,
    r.priority ?? '—',
    r.isActive ? 'Active' : 'Draft',
    r.isActive ? 'Disable' : 'Enable',
  ]
}

export default function AdminPricingRulesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [panelMode, setPanelMode] = useState('preview') // 'preview' | 'create' | 'edit'
  const rawMap = useRef({})   // String(r.id) → rule
  const nameToId = useRef({}) // row[0] label → String(r.id)

  const load = useCallback(() => {
    setLoading(true)
    setPanelMode('preview')
    getAllPricingRules()
      .then((rules) => {
        rawMap.current = Object.fromEntries(rules.map((r) => [String(r.id), r]))
        nameToId.current = Object.fromEntries(
          rules.map((r) => [r.description || `Rule #${r.id}`, String(r.id)]),
        )
        setRows(rules.map(mapRuleToRow))
      })
      .catch(() => toast.error('Failed to load pricing rules'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const rule = rawMap.current[nameToId.current[row[0]]]
    if (!rule) return

    if (action === 'Enable' || action === 'Disable') {
      const nextActive = action === 'Enable'
      try {
        await togglePricingRule(rule.id, nextActive)
        toast.success(`Rule "${row[0]}" ${nextActive ? 'enabled' : 'disabled'}`)
        load()
      } catch {
        toast.error('Failed to update rule')
      }
    } else if (action === 'Edit') {
      setPanelMode('edit')
      setNotice(`Editing rule "${row[0]}"`)
    } else if (action === 'Delete') {
      if (!window.confirm(`Delete rule "${row[0]}"? This cannot be undone.`)) return
      try {
        await deletePricingRule(rule.id)
        toast.success(`Rule "${row[0]}" deleted`)
        load()
      } catch {
        toast.error('Failed to delete rule')
      }
    } else if (action === 'Clone') {
      try {
        await clonePricingRule(rule.id)
        toast.success(`Rule "${row[0]}" cloned`)
        setNotice(`Rule "${row[0]}" cloned as Draft.`)
        load()
      } catch {
        toast.error('Clone failed')
      }
    } else {
      setPanelMode('preview')
      setNotice(`Previewing rule "${row[0]}"`)
    }
  }, [load])

  const renderDetailPanel = useCallback(({ record, setNotice }) => (
    <RuleDetailPanel
      record={record}
      rawMap={rawMap}
      nameToId={nameToId}
      onSave={load}
      setNotice={setNotice}
      mode={panelMode}
      onEdit={setPanelMode}
    />
  ), [load, panelMode])

  return (
    <AdminManagementPage
      pageKey="pricingRules"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
      onHeaderAction={(action) => { if (action === 'Create') setPanelMode('create') }}
      detailContent={renderDetailPanel}
    />
  )
}
