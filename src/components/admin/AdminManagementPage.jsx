import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminScreenConfigs } from '../../data/adminPanelData'
import {
  AdminDataTable,
  AdminFilterBar,
  AdminHero,
  AdminRequirementBadges,
  AdminShell,
  AdminStatesPanel,
  AdminWorkflowPanel,
} from './AdminPortalUI'

// Derive stat cards from actual loaded rows instead of static config
function computeLiveStats(pageKey, rows) {
  switch (pageKey) {
    case 'users':
      return [
        { label: 'Registered accounts', value: rows.length.toLocaleString(), note: 'Travelers, hosts, admins', tone: 'brand' },
        { label: 'Pending hosts', value: String(rows.filter(r => r[1] === 'Host' && r[2] === 'Pending').length), note: 'Applications waiting', tone: 'warning' },
        { label: 'Suspended', value: String(rows.filter(r => r[2] === 'Suspended').length), note: 'Policy or payment risk', tone: 'danger' },
        { label: 'Verified', value: rows.length ? `${Math.round(rows.filter(r => r[3] !== 'Unverified').length / rows.length * 100)}%` : '—', note: 'Identity or payment verified', tone: 'success' },
      ]
    case 'verification':
      return [
        { label: 'Pending review', value: String(rows.filter(r => ['PENDING', 'UNDER_REVIEW'].includes(r[4])).length), note: 'Awaiting decision', tone: 'warning' },
        { label: 'Approved', value: String(rows.filter(r => r[4] === 'VERIFIED').length), note: 'Clean decisions', tone: 'success' },
        { label: 'Rejected', value: String(rows.filter(r => r[4] === 'REJECTED').length), note: 'Document mismatch', tone: 'danger' },
        { label: 'Total', value: String(rows.length), note: 'All KYC submissions', tone: 'brand' },
      ]
    case 'listingApprovals':
      return [
        { label: 'Pending review', value: String(rows.filter(r => r[6] === 'PENDING_REVIEW').length), note: 'Awaiting admin decision', tone: 'warning' },
        { label: 'Approved', value: String(rows.filter(r => r[6] === 'LIVE').length), note: 'Now live for bookings', tone: 'success' },
        { label: 'Returned', value: String(rows.filter(r => r[6] === 'DRAFT').length), note: 'Sent back to host', tone: 'danger' },
        { label: 'Total', value: String(rows.length), note: 'All hotels pending review', tone: 'brand' },
      ]
    case 'moderation':
      return [
        { label: 'Flagged items', value: String(rows.filter(r => ['FLAGGED', 'UNDER_REVIEW', 'ESCALATED'].includes(r[4])).length), note: 'Across content surfaces', tone: 'danger' },
        { label: 'Under review', value: String(rows.filter(r => r[4] === 'UNDER_REVIEW').length), note: 'Assigned to moderators', tone: 'warning' },
        { label: 'Resolved', value: String(rows.filter(r => ['APPROVED', 'REJECTED'].includes(r[4])).length), note: 'Closed cases', tone: 'success' },
        { label: 'Escalated', value: String(rows.filter(r => r[4] === 'ESCALATED').length), note: 'Legal or safety review', tone: 'brand' },
      ]
    case 'categoriesAmenities':
      return [
        { label: 'Categories', value: String(rows.filter(r => r[1] === 'Category').length), note: 'Hotel, resort, villa…', tone: 'brand' },
        { label: 'Amenities', value: String(rows.filter(r => r[1] === 'Amenity').length), note: 'Grouped by type', tone: 'success' },
        { label: 'Disabled', value: String(rows.filter(r => r[5] === 'DISABLED').length), note: 'Hidden from new listings', tone: 'warning' },
        { label: 'Active', value: String(rows.filter(r => r[5] === 'ACTIVE').length), note: 'Available for use', tone: 'brand' },
      ]
    case 'pricingRules':
      return [
        { label: 'Active rules', value: String(rows.filter(r => r[6] === 'Active').length), note: 'Currently applied', tone: 'brand' },
        { label: 'Draft', value: String(rows.filter(r => r[6] === 'Draft').length), note: 'Awaiting activation', tone: 'warning' },
        { label: 'Seasonal', value: String(rows.filter(r => r[1] === 'SEASONAL').length), note: 'Date-range based', tone: 'success' },
        { label: 'Total rules', value: String(rows.length), note: 'Across all types', tone: 'brand' },
      ]
    default:
      return adminScreenConfigs[pageKey]?.stats ?? []
  }
}

// Map bulk action labels to the row-action names the individual page handlers understand
const BULK_TO_ROW_ACTION = {
  'Approve clean': 'Approve',
  'Approve selected': 'Approve',
  'Request resubmission': 'Request files',
  'Request edits': 'Request files',
  'Reject': 'Reject',
  'Dismiss': 'Dismiss',
  'Suspend': 'Suspend',
  'Restore': 'Restore',
  'Escalate': 'Escalate',
  'Enable': 'Enable',
  'Disable': 'Disable',
  'Clone': 'Clone',
  'Delete': 'Delete',
  'Preview impact': 'Preview',
  'Assign reviewer': 'Assign reviewer',
  'Assign': 'Assign',
  'Send warning': 'Send notice',
  'Edit': 'Edit',
}

function downloadCSV(columns, rows, pageKey) {
  const header = columns.filter(c => c !== 'Action').join(',')
  const body = rows.map(row =>
    row.slice(0, columns.filter(c => c !== 'Action').length)
      .map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [header, ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `travolish-${pageKey}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminManagementPage({ pageKey, rows: rowsProp, loading = false, onRowAction, onHeaderAction, detailContent, pagination }) {
  const config = adminScreenConfigs[pageKey]
  const baseRows = rowsProp ?? config.rows
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [selectedRowKey, setSelectedRowKey] = useState('')
  const [actionNotice, setActionNotice] = useState('')

  const liveStats = useMemo(() => computeLiveStats(pageKey, baseRows), [pageKey, baseRows])

  const filtersWithOptions = useMemo(
    () =>
      config.filters.map((filter) => {
        const columnIndex = config.columns.indexOf(filter.field)
        const options =
          columnIndex === -1
            ? []
            : [...new Set(baseRows.map((row) => row[columnIndex]).filter(Boolean))]
        return { ...filter, options }
      }),
    [config, baseRows],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return baseRows.filter((row) => {
      const matchesSearch =
        !normalizedQuery ||
        row.some((cell) => String(cell).toLowerCase().includes(normalizedQuery))
      const matchesFilters = Object.entries(activeFilters).every(([field, value]) => {
        if (!value) return true
        const columnIndex = config.columns.indexOf(field)
        return columnIndex === -1 || row[columnIndex] === value
      })
      return matchesSearch && matchesFilters
    })
  }, [activeFilters, config, searchQuery, baseRows])

  const selectedRecord = useMemo(
    () => filteredRows.find((row) => row[0] === selectedRowKey) ?? filteredRows[0] ?? null,
    [filteredRows, selectedRowKey],
  )

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  function handleSearchChange(value) {
    setSearchQuery(value)
    setActionNotice(value.trim() ? `Filtering ${config.title} for "${value.trim()}".` : 'Search cleared.')
  }

  function handleFilterChange(field, value) {
    setActiveFilters((current) => ({ ...current, [field]: value }))
    setActionNotice(value ? `${field} filter set to ${value}.` : `${field} filter cleared.`)
  }

  function handleResetFilters() {
    setSearchQuery('')
    setActiveFilters({})
    setActionNotice('Search and filters reset.')
  }

  function handleExportCSV() {
    downloadCSV(config.columns, filteredRows, pageKey)
    setActionNotice(`${filteredRows.length} records exported as CSV.`)
  }

  function handleBulkAction(action) {
    if (action === 'Export') {
      handleExportCSV()
      return
    }
    const mappedAction = BULK_TO_ROW_ACTION[action]
    if (mappedAction && selectedRecord && onRowAction) {
      onRowAction(selectedRecord, mappedAction, setActionNotice)
    } else if (!selectedRecord) {
      setActionNotice(`Select a row first, then use "${action}".`)
    } else {
      setActionNotice(`"${action}" is not available as an API action for this record type.`)
    }
  }

  function handleRowSelect(row) {
    setSelectedRowKey(row[0])
    setActionNotice(`Opened ${row[0]} for review.`)
  }

  function handleRowAction(row, action) {
    setSelectedRowKey(row[0])
    if (onRowAction) {
      onRowAction(row, action, setActionNotice)
    } else {
      setActionNotice(`${action} selected for ${row[0]}.`)
    }
  }

  function handleHeaderAction(action) {
    if (action === 'Export') {
      handleExportCSV()
    } else if (action === 'Audit log') {
      navigate('/admin/audit-log')
    } else if (onHeaderAction) {
      onHeaderAction(action)
    } else {
      setActionNotice(`${action} action opened for ${config.title}.`)
    }
  }

  return (
    <AdminShell>
      <AdminHero
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        stats={liveStats}
        actions={['Create', 'Export', 'Audit log']}
        onAction={handleHeaderAction}
      />

      <AdminFilterBar
        searchPlaceholder={config.searchPlaceholder}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={filtersWithOptions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        bulkActions={config.bulkActions}
        onBulkAction={handleBulkAction}
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
        {loading && baseRows.length === 0 ? (
          <div className="flex items-center justify-center rounded-card border border-gray-200 bg-white p-12 text-sm font-semibold text-muted shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            Loading records…
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AdminDataTable
              columns={config.columns}
              rows={filteredRows}
              selectedRowKey={selectedRecord?.[0]}
              onRowSelect={handleRowSelect}
              onRowAction={handleRowAction}
              onExport={handleExportCSV}
            />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs font-semibold text-muted">
                <span>Page {pagination.page + 1} of {pagination.totalPages}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page === 0}
                    onClick={() => pagination.onPage(pagination.page - 1)}
                    className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 transition-colors hover:border-dark disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages - 1}
                    onClick={() => pagination.onPage(pagination.page + 1)}
                    className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 transition-colors hover:border-dark disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {detailContent
          ? detailContent({ record: selectedRecord, setNotice: setActionNotice })
          : (
            <AdminWorkflowPanel
              config={config}
              selectedRecord={selectedRecord}
              actionNotice={actionNotice}
            />
          )}
      </div>

      <AdminStatesPanel states={config.states} validations={config.validations} />
      <AdminRequirementBadges />
    </AdminShell>
  )
}
