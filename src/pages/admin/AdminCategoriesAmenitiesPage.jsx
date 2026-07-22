import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading } from '../../components/admin/AdminPortalUI'
import {
  createCatalogItem,
  deleteCatalogItem,
  getAllCatalogItems,
  reorderCatalogItem,
  toggleCatalogItem,
  updateCatalogItem,
} from '../../services/adminApi'

function CatalogItemPanel({ record, rawMap, nameToId, onSave, setNotice, mode }) {
  const existing = mode === 'edit' && record ? rawMap.current[nameToId.current[record[0]]] : null
  const [name, setName]   = useState(existing?.name ?? '')
  const [type, setType]   = useState(existing?.itemType ?? 'AMENITY')
  const [group, setGroup] = useState(existing?.itemGroup ?? '')
  const [icon, setIcon]   = useState(existing?.icon ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && existing) {
      setName(existing.name ?? '')
      setType(existing.itemType ?? 'AMENITY')
      setGroup(existing.itemGroup ?? '')
      setIcon(existing.icon ?? '')
    }
  }, [existing?.id, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    const payload = { name: name.trim(), itemType: type, itemGroup: group.trim() || null, icon: icon.trim() || null }
    try {
      if (mode === 'edit' && existing) {
        await updateCatalogItem(existing.id, payload)
        toast.success(`"${name}" updated`)
        setNotice(`Catalog item "${name}" saved.`)
      } else {
        await createCatalogItem(payload)
        toast.success(`"${name}" created`)
        setNotice(`New catalog item "${name}" created.`)
      }
      onSave()
    } catch {
      toast.error(mode === 'edit' ? 'Update failed' : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminCard className="space-y-5">
      <AdminSectionHeading
        eyebrow="Catalog editor"
        title={mode === 'edit' ? `Edit: ${existing?.name ?? record?.[0] ?? '—'}` : 'Create new item'}
        description={mode === 'edit' ? 'Update label, type, group, or icon.' : 'Add a new category or amenity to the platform catalog.'}
      />

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Airport pickup"
            className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand"
          >
            <option value="CATEGORY">Category</option>
            <option value="AMENITY">Amenity</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Group</label>
          <input
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g. Transport, Food, Business"
            className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Icon name</label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. Car, Coffee, Wifi"
            className="h-10 w-full rounded-card border border-gray-200 bg-white px-3 text-sm font-semibold text-dark outline-none focus:border-brand"
          />
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex h-10 w-full items-center justify-center rounded-card bg-dark text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create item'}
        </button>
      </div>
    </AdminCard>
  )
}

function mapItemToRow(item) {
  const actionLabel = item.status === 'ACTIVE' ? 'Edit' : 'Enable'
  return [
    item.name,
    item.itemType === 'CATEGORY' ? 'Category' : 'Amenity',
    item.itemGroup || '—',
    item.icon || '—',
    item.usageCount != null ? `${item.usageCount} listings` : '—',
    item.status || 'ACTIVE',
    actionLabel,
  ]
}

export default function AdminCategoriesAmenitiesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [createMode, setCreateMode] = useState(false)
  const rawMap = useRef({})   // String(i.id) → item
  const nameToId = useRef({}) // item name → String(i.id)

  const load = useCallback(() => {
    setLoading(true)
    setCreateMode(false)
    getAllCatalogItems()
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        rawMap.current = Object.fromEntries(items.map((i) => [String(i.id), i]))
        nameToId.current = Object.fromEntries(items.map((i) => [i.name, String(i.id)]))
        setRows(items.map(mapItemToRow))
      })
      .catch(() => toast.error('Failed to load catalog'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const item = rawMap.current[nameToId.current[row[0]]]
    if (!item) return

    if (action === 'Enable') {
      try {
        await toggleCatalogItem(item.id, 'ACTIVE')
        toast.success(`"${row[0]}" enabled`)
        load()
      } catch {
        toast.error('Failed to enable item')
      }
    } else if (action === 'Disable') {
      try {
        await toggleCatalogItem(item.id, 'DISABLED')
        toast.success(`"${row[0]}" disabled`)
        load()
      } catch {
        toast.error('Failed to disable item')
      }
    } else if (action === 'Delete') {
      if (!window.confirm(`Delete "${row[0]}"? This cannot be undone.`)) return
      try {
        await deleteCatalogItem(item.id)
        toast.success(`"${row[0]}" deleted`)
        load()
      } catch {
        toast.error('Failed to delete item')
      }
    } else if (action === 'Reorder') {
      const orderStr = window.prompt(
        `New display order for "${item.name}" (current: ${item.displayOrder ?? 0}):`,
        String(item.displayOrder ?? 0),
      )
      if (orderStr === null) return
      const order = parseInt(orderStr.trim(), 10)
      if (isNaN(order)) { toast.error('Enter a valid number'); return }
      try {
        await reorderCatalogItem(item.id, order)
        toast.success(`"${item.name}" moved to position ${order}`)
        setNotice(`"${item.name}" display order set to ${order}.`)
        load()
      } catch {
        toast.error('Reorder failed')
      }
    } else {
      // 'Edit' — detail panel handles the form
      setCreateMode(false)
      setNotice(`Editing "${row[0]}"`)
    }
  }, [load])

  const renderDetailPanel = useCallback(({ record, setNotice }) => (
    <CatalogItemPanel
      record={createMode ? null : record}
      rawMap={rawMap}
      nameToId={nameToId}
      onSave={load}
      setNotice={setNotice}
      mode={createMode ? 'create' : 'edit'}
    />
  ), [load, createMode])

  return (
    <AdminManagementPage
      pageKey="categoriesAmenities"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
      onHeaderAction={(action) => { if (action === 'Create') setCreateMode(true) }}
      detailContent={renderDetailPanel}
    />
  )
}
