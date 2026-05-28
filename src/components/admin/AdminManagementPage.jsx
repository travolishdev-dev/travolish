import { useMemo, useState } from 'react'
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

export default function AdminManagementPage({ pageKey, rows: rowsProp, loading = false, onRowAction, detailContent }) {
  const config = adminScreenConfigs[pageKey]
  const baseRows = rowsProp ?? config.rows

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [selectedRowKey, setSelectedRowKey] = useState('')
  const [actionNotice, setActionNotice] = useState('')

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

  function handleBulkAction(action) {
    const recordLabel = filteredRows.length === 1 ? 'record' : 'records'
    setActionNotice(`${action} prepared for ${filteredRows.length} filtered ${recordLabel}.`)
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
      setActionNotice(`${action} selected for ${row[0]}. Add confirmation and reason capture before saving.`)
    }
  }

  function handleExport() {
    const filterCopy = activeFilterCount ? `${activeFilterCount} active filters` : 'no active filters'
    setActionNotice(`Export prepared for ${filteredRows.length} records with ${filterCopy}.`)
  }

  return (
    <AdminShell>
      <AdminHero
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        stats={config.stats}
        actions={['Create', 'Export', 'Audit log']}
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
          <AdminDataTable
            columns={config.columns}
            rows={filteredRows}
            selectedRowKey={selectedRecord?.[0]}
            onRowSelect={handleRowSelect}
            onRowAction={handleRowAction}
            onExport={handleExport}
          />
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
