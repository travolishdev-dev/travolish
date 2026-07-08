import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { deletePricingRule, getAllPricingRules, togglePricingRule } from '../../services/adminApi'

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
  const rawMap = useRef({})

  const load = useCallback(() => {
    setLoading(true)
    getAllPricingRules()
      .then((rules) => {
        rawMap.current = Object.fromEntries(
          rules.map((r) => [r.description || `Rule #${r.id}`, r]),
        )
        setRows(rules.map(mapRuleToRow))
      })
      .catch(() => toast.error('Failed to load pricing rules'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const rule = rawMap.current[row[0]]
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
    } else if (action === 'Delete') {
      try {
        await deletePricingRule(rule.id)
        toast.success(`Rule "${row[0]}" deleted`)
        load()
      } catch {
        toast.error('Failed to delete rule')
      }
    } else {
      setNotice(`Viewing rule "${row[0]}" — type: ${row[1]}, status: ${row[6]}`)
    }
  }, [load])

  return (
    <AdminManagementPage
      pageKey="pricingRules"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
    />
  )
}
