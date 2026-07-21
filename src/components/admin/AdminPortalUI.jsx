import { createElement, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  Filter,
  Flag,
  Gauge,
  Home,
  Layers3,
  LayoutDashboard,
  Mail,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { adminNavItems } from '../../data/adminPanelData'
import TravolishWordmark from '../common/TravolishWordmark'

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  verification: ShieldCheck,
  listings: Building2,
  moderation: FileSearch,
  amenities: Layers3,
  pricing: CreditCard,
  mail: Mail,
}

const toneClasses = {
  neutral: 'border-gray-200 bg-white text-dark',
  brand: 'border-brand/20 bg-[#fff1f3] text-brand-dark',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
}

const statAccentClasses = {
  neutral: 'border-l-[3px] border-l-gray-300',
  brand:   'border-l-[3px] border-l-brand',
  success: 'border-l-[3px] border-l-emerald-500',
  warning: 'border-l-[3px] border-l-amber-400',
  danger:  'border-l-[3px] border-l-rose-500',
}

const GRID_ICONS = {
  '/admin/listing-approvals': Building2,
  '/admin/verification': ShieldCheck,
  '/admin/moderation': Flag,
  '/admin/users': Users,
  '/admin/bookings': CalendarDays,
}

function resolveActivityIcon(item) {
  const t = `${item.title ?? ''} ${item.meta ?? ''}`.toLowerCase()
  if (t.includes('approv') || t.includes('verif') || t.includes('kyc')) return CheckCircle2
  if (t.includes('reject') || t.includes('flag') || t.includes('report')) return XCircle
  if (t.includes('book') || t.includes('reserv')) return CalendarDays
  if (t.includes('user') || t.includes('regist')) return UserCheck
  return Sparkles
}

function isActiveRoute(pathname, href) {
  if (href === '/admin') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AdminLogo() {
  return (
    <Link to="/admin" className="flex flex-col justify-center">
      <span>
        <TravolishWordmark className="h-9" />
        <span className="-mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Admin
        </span>
      </span>
    </Link>
  )
}

function AdminNav({ onNavigate }) {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => {
        const Icon = iconMap[item.icon] ?? SlidersHorizontal
        const active = isActiveRoute(pathname, item.href)

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-card px-3 py-3 transition-colors ${
              active
                ? 'bg-dark text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]'
                : 'text-dark hover:bg-[#fff1f3] hover:text-brand-dark'
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
            )}
            <Icon size={18} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{item.label}</span>
              <span className={`block truncate text-xs ${active ? 'text-white/65' : 'text-muted'}`}>
                {item.description}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function AdminMobileHeader({ onOpen }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={onOpen}
          className="flex h-10 w-10 items-center justify-center rounded-card border border-gray-200 bg-white text-dark"
          aria-label="Open admin navigation"
        >
          <Menu size={18} />
        </button>
        <AdminLogo />
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-card bg-[#fff1f3] text-brand"
          aria-label="Back to home"
        >
          <Home size={18} />
        </Link>
      </div>
    </header>
  )
}

function AdminTopHeader() {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')

  return (
    <div className="hidden space-y-3 lg:block">
      <header className="flex items-center justify-between gap-4">
        <form
          className="relative min-w-0 flex-1"
          onSubmit={(event) => {
            event.preventDefault()
            setNotice(query.trim() ? `Global search queued for "${query.trim()}".` : 'Type something to search.')
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bookings, users, listings, reports..."
            className="h-12 w-full rounded-card border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-dark shadow-sm outline-none transition-colors placeholder:text-muted focus:border-brand"
          />
        </form>
        <button
          type="button"
          onClick={() => setNotice('Alerts panel opened. No critical production alerts in this mock view.')}
          className="relative flex h-12 items-center gap-2 rounded-card border border-gray-200 bg-white px-4 text-sm font-semibold text-dark shadow-sm transition-colors hover:border-brand hover:text-brand"
        >
          <span className="relative">
            <Bell size={17} />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">3</span>
          </span>
          Alerts
        </button>
        <button
          type="button"
          onClick={() => setNotice('Admin profile controls are ready for role and permission wiring.')}
          className="flex h-12 items-center gap-3 rounded-card border border-gray-200 bg-white px-4 text-left shadow-sm transition-colors hover:border-brand"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-card bg-dark text-xs font-semibold text-white">
            AD
          </span>
          <span>
            <span className="block text-sm font-semibold text-dark">Admin desk</span>
            <span className="block text-xs text-muted">Operations</span>
          </span>
        </button>
      </header>
      {notice ? (
        <div className="rounded-card border border-brand/20 bg-[#fff1f3] px-4 py-3 text-sm font-semibold text-brand-dark">
          {notice}
        </div>
      ) : null}
    </div>
  )
}

export function AdminShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#fffdfb] text-dark">
      <AdminMobileHeader onOpen={() => setDrawerOpen(true)} />

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close admin navigation"
          />
          <aside className="absolute inset-y-0 left-0 w-[88%] max-w-[340px] overflow-y-auto bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <AdminLogo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-card border border-gray-200 bg-white text-dark"
                aria-label="Close admin navigation"
              >
                <X size={18} />
              </button>
            </div>
            <AdminNav onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1760px] gap-6 px-4 py-5 md:px-8 lg:grid-cols-[292px_minmax(0,1fr)] lg:py-8 xl:px-12">
        <aside className="hidden lg:block">
          <div className="sticky top-[90px] rounded-card border border-gray-200 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="mb-6 rounded-card bg-[#fff1f3] px-3 py-4">
              <AdminLogo />
            </div>
            <AdminNav />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <AdminTopHeader />
          {children}
        </div>
      </div>
    </main>
  )
}

export function AdminHero({ eyebrow, title, description, stats, actions, onAction }) {
  const [notice, setNotice] = useState('')

  function handleAction(action) {
    if (onAction) {
      onAction(action)
    } else {
      setNotice(`${action} action selected. Connect this to the ${title} API workflow.`)
    }
  }

  return (
    <section className="overflow-hidden rounded-card border border-gray-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div className="p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight text-dark md:text-[38px]">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted md:text-[15px]">
              {description}
            </p>
          </div>
          {actions?.length ? (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleAction(action)}
                  className="inline-flex h-11 items-center justify-center rounded-card border border-gray-200 bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-brand hover:text-brand"
                >
                  {action}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {stats?.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <AdminStatCard key={stat.label} stat={stat} />
            ))}
          </div>
        ) : null}
        {notice ? (
          <div className="mt-5 rounded-card border border-brand/20 bg-[#fff1f3] px-4 py-3 text-sm font-semibold text-brand-dark">
            {notice}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function AdminCard({ children, className = '' }) {
  return (
    <section className={`rounded-card border border-gray-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] md:p-6 ${className}`}>
      {children}
    </section>
  )
}

export function AdminSectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-dark">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function AdminStatCard({ stat }) {
  const tone = toneClasses[stat.tone] ?? toneClasses.neutral
  const accent = statAccentClasses[stat.tone] ?? statAccentClasses.neutral

  return (
    <div className={`rounded-card border px-4 py-4 ${tone} ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
        {stat.label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
      <p className="mt-1 text-xs leading-5 opacity-75">{stat.note}</p>
    </div>
  )
}

export function AdminStatusPill({ children, tone = 'neutral' }) {
  const toneClass = toneClasses[tone] ?? toneClasses.neutral

  return (
    <span className={`inline-flex rounded-card border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  )
}

function FilterDropdown({ filter, value, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  const current = value || ''
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-12 items-center gap-2 rounded-card border border-gray-200 bg-white pl-9 pr-3 text-base md:text-sm font-semibold text-dark outline-none transition-colors hover:border-brand"
        aria-label={filter.label}
      >
        <Filter size={15} className="pointer-events-none absolute left-3 text-muted" />
        <span>{current ? current : `${filter.label}: All`}</span>
        <ChevronDown size={13} className="shrink-0 text-muted" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[80] min-w-[160px] max-h-60 overflow-y-auto rounded-card border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
          <button
            type="button"
            onClick={() => { onFilterChange(filter.field, ''); setIsOpen(false) }}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${!current ? 'text-dark' : 'text-muted'}`}
          >
            {filter.label}: All
            {!current && <Check size={13} className="shrink-0" />}
          </button>
          {(filter.options ?? []).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => { onFilterChange(filter.field, option); setIsOpen(false) }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${current === option ? 'text-dark' : 'text-muted'}`}
            >
              {option}
              {current === option && <Check size={13} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminFilterBar({
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onResetFilters,
  bulkActions,
  onBulkAction,
}) {
  return (
    <AdminCard>
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-12 w-full rounded-card border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-dark outline-none transition-colors placeholder:text-muted focus:border-brand"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <FilterDropdown
              key={filter.label}
              filter={filter}
              value={activeFilters[filter.field] ?? ''}
              onFilterChange={onFilterChange}
            />
          ))}
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex h-12 items-center justify-center rounded-card border border-gray-200 bg-white px-4 text-sm font-semibold text-dark transition-colors hover:border-brand hover:text-brand"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        {bulkActions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onBulkAction(action)}
            className="inline-flex h-9 items-center justify-center rounded-card bg-[#f8f6f2] px-3 text-xs font-semibold text-dark transition-colors hover:bg-[#fff1f3] hover:text-brand"
          >
            {action}
          </button>
        ))}
      </div>
    </AdminCard>
  )
}

function toneForCell(value) {
  const normalized = String(value).toLowerCase()
  if (['active', 'verified', 'approved', 'clean decisions', 'ready', 'published'].some((term) => normalized.includes(term))) {
    return 'success'
  }
  if (['pending', 'review', 'draft', 'needs edits', 'resubmit'].some((term) => normalized.includes(term))) {
    return 'warning'
  }
  if (['suspended', 'blacklisted', 'rejected', 'flagged', 'escalated', 'conflict'].some((term) => normalized.includes(term))) {
    return 'danger'
  }
  return null
}

export function AdminDataTable({
  columns,
  rows,
  selectedRowKey,
  onRowSelect,
  onRowAction,
  onExport,
}) {
  const actionColumnIndex = columns.findIndex((column) => column === 'Action')

  return (
    <AdminCard>
      <AdminSectionHeading
        eyebrow="Records"
        title="Management table"
        description="Table-heavy workflow with review actions, status visibility, and room for pagination."
        action={
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center gap-2 rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Export
            <ChevronRight size={15} />
          </button>
        }
      />
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="border-y border-gray-200 bg-[#fcfbf8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted first:rounded-l-card first:border-l last:rounded-r-card last:border-r"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowKey = row[0]
              const selected = selectedRowKey === rowKey

              return (
                <tr
                  key={row.join('-')}
                  onClick={() => onRowSelect(row)}
                  className={`cursor-pointer transition-colors ${selected ? 'bg-[#fff1f3]' : 'hover:bg-[#fcfbf8]'}`}
                >
                  {row.map((cell, index) => {
                    const tone = toneForCell(cell)
                    const isAction = index === actionColumnIndex
                    return (
                      <td
                        key={`${row[0]}-${index}`}
                        className="border-b border-gray-200 px-4 py-4 text-sm text-dark first:font-semibold"
                      >
                        {isAction ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onRowAction(row, cell)
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-card bg-dark px-3 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
                          >
                            {cell}
                          </button>
                        ) : tone ? (
                          <AdminStatusPill tone={tone}>{cell}</AdminStatusPill>
                        ) : (
                          cell
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        {!rows.length ? (
          <div className="rounded-card border-x border-b border-gray-200 bg-white px-4 py-10 text-center">
            <p className="text-sm font-semibold text-dark">No records match this view.</p>
            <p className="mt-1 text-sm text-muted">Reset filters or change the search query.</p>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-muted">
        <span>Showing {rows.length} filtered records</span>
        <span>Click a row to open detail context</span>
      </div>
    </AdminCard>
  )
}

export function AdminWorkflowPanel({ config, selectedRecord, actionNotice }) {
  return (
    <AdminCard className="space-y-6">
      <AdminSectionHeading
        eyebrow="Workflow"
        title={config.detailTitle}
        description="Detail drawers or modals should keep the table in context while admins decide."
      />

      {selectedRecord ? (
        <div className="rounded-card border border-brand/20 bg-[#fff1f3] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Selected record
          </p>
          <p className="mt-1 text-lg font-semibold text-dark">
            {selectedRecord[0]}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {selectedRecord.slice(1, 4).join(' · ')}
          </p>
          {actionNotice ? (
            <p className="mt-3 rounded-card bg-white px-3 py-2 text-xs font-semibold text-brand-dark">
              {actionNotice}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        {config.detailItems.map((item) => (
          <div key={item} className="flex gap-3 rounded-card border border-gray-200 bg-[#fcfbf8] p-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-brand" size={17} />
            <p className="text-sm leading-6 text-dark">{item}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Workflow logic
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {config.workflow.map((step, index) => (
            <span
              key={step}
              className="inline-flex items-center gap-2 rounded-card border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-dark"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-card bg-[#fff1f3] text-[10px] text-brand">
                {index + 1}
              </span>
              {step}
            </span>
          ))}
        </div>
      </div>
    </AdminCard>
  )
}

export function AdminStatesPanel({ states, validations }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminCard>
        <AdminSectionHeading
          eyebrow="States"
          title="Screen states"
          description="Every page should expose data and system states clearly."
        />
        <div className="mt-5 flex flex-wrap gap-2">
          {states.map((state) => (
            <AdminStatusPill key={state} tone={toneForCell(state) ?? 'neutral'}>
              {state}
            </AdminStatusPill>
          ))}
          <AdminStatusPill>Loading skeleton</AdminStatusPill>
          <AdminStatusPill tone="danger">Error state</AdminStatusPill>
          <AdminStatusPill tone="warning">Empty state</AdminStatusPill>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminSectionHeading
          eyebrow="Validation"
          title="Rules and edge cases"
          description="Decision points that need product and backend support."
        />
        <div className="mt-5 space-y-3">
          {validations.map((rule) => (
            <div key={rule} className="flex gap-3 text-sm leading-6 text-dark">
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={17} />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  )
}

export function AdminMiniBars({ data }) {
  if (!data?.length) return null
  const maxBookings = Math.max(...data.map((item) => item.bookings), 1)
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1)

  return (
    <AdminCard>
      <AdminSectionHeading
        eyebrow="Analytics"
        title="Booking and revenue trend"
        description="Compact chart treatment matching the home page card style."
      />
      <div className="mt-6 grid grid-cols-7 gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex min-h-[180px] flex-col justify-end gap-2">
            <p className="text-center text-[10px] font-bold tabular-nums text-dark">{item.bookings}</p>
            <div className="flex flex-1 items-end gap-1.5">
              <div
                className="w-full rounded-card bg-brand"
                style={{ height: `${Math.max(12, (item.bookings / maxBookings) * 100)}%` }}
                title={`${item.bookings} bookings`}
              />
              <div
                className="w-full rounded-card bg-dark"
                style={{ height: `${Math.max(12, (item.revenue / maxRevenue) * 100)}%` }}
                title={`${item.revenue} revenue index`}
              />
            </div>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-card bg-brand" />
          Bookings
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-card bg-dark" />
          Revenue
        </span>
      </div>
    </AdminCard>
  )
}

export function AdminActionGrid({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = GRID_ICONS[item.href] ?? Gauge
        return (
          <Link
            key={item.title}
            to={item.href}
            className="group rounded-card border border-gray-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-card bg-[#fff1f3] text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon size={18} />
              </span>
              <ChevronRight className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" size={18} />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums text-dark">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-dark">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.meta}</p>
          </Link>
        )
      })}
    </div>
  )
}

export function AdminActivityFeed({ items }) {
  return (
    <AdminCard>
      <AdminSectionHeading
        eyebrow="Activity"
        title="Recent admin activity"
        description="Approval, rejection, and system event history."
      />
      <div className="mt-5 divide-y divide-gray-200">
        {items.map((item) => {
          const ActivityIcon = resolveActivityIcon(item)
          return (
          <div key={`${item.title}-${item.time}`} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-card bg-[#fff1f3] text-brand">
              <ActivityIcon size={15} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-dark">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.meta}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {item.time}
              </p>
            </div>
          </div>
          )
        })}
      </div>
    </AdminCard>
  )
}

export function AdminApprovalTable({ rows }) {
  return (
    <AdminCard>
      <AdminSectionHeading
        eyebrow="Approvals"
        title="Pending approval queues"
        description="Shortcuts to the highest-volume review queues."
      />
      <div className="mt-5 grid gap-3">
        {rows.map(([area, pending, note, action, href]) => (
          <div key={area} className="grid gap-3 rounded-card border border-gray-200 bg-[#fcfbf8] p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold text-dark">{area}</p>
              {note && note !== '—' && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{note}</p>
              )}
            </div>
            <AdminStatusPill tone="warning">{pending}</AdminStatusPill>
            {href ? (
              <Link
                to={href}
                className="inline-flex h-9 items-center justify-center rounded-card bg-dark px-3 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
              >
                {action}
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-card bg-gray-200 px-3 text-xs font-semibold text-muted">
                {action}
              </span>
            )}
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

export function AdminRequirementBadges() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ['Loading', 'Skeleton cards and table rows appear while data is fetched.', CalendarCheck],
        ['Empty', 'Clear empty copy and create or reset actions for each table.', ClipboardCheck],
        ['Error', 'Retry, support trace ID, and fallback navigation are visible.', AlertTriangle],
      ].map(([title, body, Icon]) => (
        <AdminCard key={title}>
          {createElement(Icon, { className: 'text-brand', size: 22 })}
          <p className="mt-4 text-sm font-semibold text-dark">{title} state</p>
          <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
        </AdminCard>
      ))}
    </div>
  )
}
