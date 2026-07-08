import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import {
  deleteCatalogItem,
  getAllCatalogItems,
  toggleCatalogItem,
} from '../../services/adminApi'

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
  const rawMap = useRef({})

  const load = useCallback(() => {
    setLoading(true)
    getAllCatalogItems()
      .then((data) => {
        const items = Array.isArray(data) ? data : []
        rawMap.current = Object.fromEntries(items.map((i) => [i.name, i]))
        setRows(items.map(mapItemToRow))
      })
      .catch(() => toast.error('Failed to load catalog'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const item = rawMap.current[row[0]]
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
      try {
        await deleteCatalogItem(item.id)
        toast.success(`"${row[0]}" deleted`)
        load()
      } catch {
        toast.error('Failed to delete item')
      }
    } else {
      setNotice(`Editing "${row[0]}" — type: ${row[1]}, group: ${row[2]}, status: ${row[5]}`)
    }
  }, [load])

  return (
    <AdminManagementPage
      pageKey="categoriesAmenities"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
    />
  )
}
