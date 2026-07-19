import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight,
  Lock, Minus, Plus, RefreshCw, Unlock, X,
} from 'lucide-react'
import { HostShell, SectionCard, SectionHeading } from '../../components/host/HostPortalUI'
import { HostField, HostToggle } from '../../components/host/HostFormFields'
import { getHotelAvailabilityRange, blockRoomDate, unblockRoomDate } from '../../services/availabilityApi'
import { getHostRooms, updateHotel } from '../../services/hostListingsApi'
import useHostContext from '../../hooks/useHostContext'

// ── Constants ────────────────────────────────────────────────────────────────
const GRID_WINDOW = 14
const WEEKDAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ── Date utilities ────────────────────────────────────────────────────────────
function todayDate() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function isWeekend(date) {
  const w = date.getDay()
  return w === 0 || w === 6
}

function formatRangeLabel(start, end) {
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n, 1)
  return startOfMonth(d)
}

function monthInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function buildCalendarGrid(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const gridStart = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

function isSameMonth(date, monthDate) {
  return date.getFullYear() === monthDate.getFullYear() &&
    date.getMonth() === monthDate.getMonth()
}

// ── Status helpers ────────────────────────────────────────────────────────────
function resolveCell(item) {
  if (!item) return null
  return {
    available: Number(item.availableRooms ?? item.available ?? 0),
    total:     Number(item.totalRooms ?? 1),
    blocked:   Number(item.blockedRooms ?? 0),
    booked:    Number(item.bookedRooms ?? 0),
  }
}

function cellStatus(cell) {
  if (!cell) return 'empty'
  if (cell.blocked > 0 && cell.available === 0) return 'blocked'
  if (cell.available === 0) return 'full'
  if (cell.total > 1 && cell.available / cell.total <= 0.25) return 'limited'
  return 'open'
}

const CELL_STYLE = {
  open:    'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100',
  limited: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100',
  full:    'bg-slate-800 border-slate-800 text-white hover:bg-slate-700',
  blocked: 'bg-rose-100 border-rose-200 text-rose-900 hover:bg-rose-200',
  empty:   'bg-white border-gray-200 text-gray-400 hover:bg-gray-50',
}

const LEGEND = [
  { status: 'open',    label: 'Available' },
  { status: 'limited', label: 'Limited (≤25%)' },
  { status: 'full',    label: 'Sold out' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'empty',   label: 'No record' },
]

function cellLabel(cell, status) {
  if (!cell)               return '—'
  if (status === 'full')   return '0'
  if (status === 'blocked') return 'Blk'
  return String(cell.available)
}

function roomLabel(room) {
  return room.number ?? room.name ?? `Room ${room.id}`
}

function roomSub(room) {
  return [room.type, room.bedType].filter(Boolean).join(' · ')
}

// ── CellEditor popover ────────────────────────────────────────────────────────
function CellEditor({ room, dateIso, cell, anchor, onClose, onBlockOne, onUnblockOne, onBlockAll, onOpenAll }) {
  const ref = useRef(null)
  const [saving, setSaving] = useState(false)

  const available = cell?.available ?? 0
  const total     = cell?.total     ?? 1
  const blocked   = cell?.blocked   ?? 0
  const booked    = cell?.booked    ?? 0
  const status    = cellStatus(cell)

  const formattedDate = parseIso(dateIso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const popStyle = useMemo(() => {
    const PW = 272; const PH = 300
    if (!anchor) return { position: 'fixed', top: 80, left: 16, width: PW }
    let left = anchor.left + anchor.width / 2 - PW / 2
    let top  = anchor.bottom + 8
    if (left + PW > window.innerWidth - 12) left = window.innerWidth - PW - 12
    if (left < 12) left = 12
    if (top + PH > window.innerHeight - 12) top = anchor.top - PH - 8
    return { position: 'fixed', top, left, width: PW }
  }, [anchor])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    function onMouse(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouse)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouse)
    }
  }, [onClose])

  async function run(fn) {
    setSaving(true)
    try { await fn() } finally { setSaving(false) }
  }

  const headerBg = {
    open:    'bg-emerald-50 text-emerald-900',
    limited: 'bg-amber-50 text-amber-900',
    full:    'bg-slate-800 text-white',
    blocked: 'bg-rose-100 text-rose-900',
    empty:   'bg-gray-50 text-gray-700',
  }[status] ?? 'bg-gray-50 text-gray-700'

  return (
    <>
      <div className="fixed inset-0 z-[190]" />
      <div
        ref={ref}
        style={popStyle}
        className="z-[200] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.18)]"
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-2 px-4 py-3.5 ${headerBg}`}>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] opacity-60">
              {roomLabel(room)}{room.type ? ` · ${room.type}` : ''}
            </p>
            <p className="mt-0.5 text-sm font-semibold">{formattedDate}</p>
          </div>
          <button type="button" onClick={onClose}
            className="mt-0.5 flex-shrink-0 rounded-full p-1 opacity-60 hover:opacity-100"
            aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {/* Count strip */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-white">
          {[['Available', available, 'text-slate-900'], ['Booked', booked, 'text-slate-900'], ['Blocked', blocked, 'text-rose-600']].map(([label, val, cls]) => (
            <div key={label} className="py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
              <p className={`mt-0.5 text-xl font-bold tabular-nums ${cls}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="space-y-3 p-4">
          {/* Stepper */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">Available rooms</span>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Block one"
                disabled={saving || available <= 0}
                onClick={() => run(() => onBlockOne(room.id, dateIso))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition hover:border-slate-400 disabled:opacity-30">
                <Minus size={13} />
              </button>
              <span className="w-6 text-center text-[15px] font-bold tabular-nums text-slate-900">
                {available}
              </span>
              <button type="button" aria-label="Open one"
                disabled={saving || blocked <= 0}
                onClick={() => run(() => onUnblockOne(room.id, dateIso))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition hover:border-slate-400 disabled:opacity-30">
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              disabled={saving || available <= 0}
              onClick={() => run(() => onBlockAll(room.id, dateIso, available))}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40">
              <Lock size={12} /> Stop sell
            </button>
            <button type="button"
              disabled={saving || blocked <= 0}
              onClick={() => run(() => onOpenAll(room.id, dateIso, blocked))}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40">
              <Unlock size={12} /> Open all
            </button>
          </div>

          {saving && <p className="text-center text-[11px] text-slate-400">Saving…</p>}

          <p className="text-[10px] text-slate-400">
            Total capacity: {total} room{total !== 1 ? 's' : ''}.
            For per-date min-stay, use <span className="font-semibold">Booking Rules</span> below.
          </p>
        </div>
      </div>
    </>
  )
}

// ── AllotmentGrid ─────────────────────────────────────────────────────────────
function AllotmentGrid({ rooms, byRoomDate, dates, onCellClick }) {
  const todayIso = toIso(todayDate())
  const colTemplate = `160px repeat(${dates.length}, minmax(54px, 1fr))`

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <div style={{ minWidth: `${160 + dates.length * 54}px` }}>

        {/* Date header */}
        <div className="grid border-b border-gray-200 bg-[#fafafa]"
          style={{ gridTemplateColumns: colTemplate }}>
          <div className="border-r border-gray-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Room
          </div>
          {dates.map((date) => {
            const iso = toIso(date)
            const isToday = iso === todayIso
            const weekend = isWeekend(date)
            return (
              <div key={iso}
                className={`px-0.5 py-2 text-center ${weekend ? 'bg-amber-50/60' : ''}`}>
                <p className={`text-[10px] font-semibold ${isToday ? 'text-rose-500' : 'text-slate-400'}`}>
                  {WEEKDAY[date.getDay()]}
                </p>
                <p className={`mt-0.5 text-[11px] font-bold ${isToday ? 'text-rose-600' : 'text-slate-700'}`}>
                  {date.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Rows */}
        {rooms.length === 0 && (
          <p className="py-14 text-center text-sm text-slate-400">
            No rooms yet — add rooms to start managing inventory.
          </p>
        )}
        {rooms.map((room, ri) => (
          <div key={room.id}
            className={`grid ${ri < rooms.length - 1 ? 'border-b border-gray-100' : ''}`}
            style={{ gridTemplateColumns: colTemplate }}>

            {/* Sticky room name */}
            <div className="sticky left-0 z-10 flex items-center border-r border-gray-100 bg-white px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{roomLabel(room)}</p>
                {roomSub(room) && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">{roomSub(room)}</p>
                )}
              </div>
            </div>

            {/* Date cells */}
            {dates.map((date) => {
              const iso = toIso(date)
              const cell = resolveCell(byRoomDate[String(room.id)]?.[iso])
              const status = cellStatus(cell)
              const weekend = isWeekend(date)
              return (
                <div key={iso} className={`p-1 ${weekend ? 'bg-amber-50/20' : ''}`}>
                  <button
                    type="button"
                    onClick={(e) => onCellClick(e, room, iso, cell)}
                    className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${CELL_STYLE[status] ?? CELL_STYLE.empty}`}
                    title={`${roomLabel(room)} · ${iso}`}
                  >
                    {cellLabel(cell, status)}
                  </button>
                </div>
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 border-t border-gray-100 bg-[#fafafa] px-4 py-3">
          {LEGEND.map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`h-3.5 w-3.5 rounded border ${CELL_STYLE[status].split(' ').slice(0, 2).join(' ')}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HostAvailabilityPage() {
  const { primaryHotelId, hotels, loading: hostLoading } = useHostContext()

  // Grid
  const [rooms, setRooms] = useState([])
  const [byRoomDate, setByRoomDate] = useState({})
  const [gridStart, setGridStart] = useState(() => todayDate())
  const [gridLoading, setGridLoading] = useState(false)

  // Cell editor
  const [editor, setEditor] = useState(null)

  // Bulk
  const [bulkStart, setBulkStart] = useState(() => toIso(todayDate()))
  const [bulkEnd, setBulkEnd] = useState(() => toIso(addDays(todayDate(), 6)))
  const [bulkAction, setBulkAction] = useState('block')
  const [applying, setApplying] = useState(false)
  const [bulkNotice, setBulkNotice] = useState('')

  // Booking rules
  const [rules, setRules] = useState({
    minimumStay: '1', maximumStay: '',
    bookingWindow: '365', lastMinuteBooking: false,
    lastMinuteCutoffHours: '24', sameDayBooking: false,
  })
  const [savingRules, setSavingRules] = useState(false)
  const [rulesNotice, setRulesNotice] = useState('')

  // Monthly calendar
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))

  const dates = useMemo(
    () => Array.from({ length: GRID_WINDOW }, (_, i) => addDays(gridStart, i)),
    [gridStart],
  )

  const gridRange = useMemo(() => ({
    start: toIso(gridStart),
    end:   toIso(addDays(gridStart, GRID_WINDOW - 1)),
  }), [gridStart])

  const gridLabel = useMemo(
    () => formatRangeLabel(gridStart, addDays(gridStart, GRID_WINDOW - 1)),
    [gridStart],
  )

  // ── Load grid data ──
  async function loadGrid(hotelId, range) {
    const [roomsData, availData] = await Promise.all([
      getHostRooms(hotelId).catch(() => []),
      getHotelAvailabilityRange(hotelId, range.start, range.end).catch(() => []),
    ])
    const roomList = Array.isArray(roomsData)
      ? roomsData : roomsData?.content ?? roomsData?.rooms ?? []
    const items = Array.isArray(availData)
      ? availData : availData?.availabilityList ?? availData?.content ?? []

    const map = {}
    items.forEach((item) => {
      const rid = String(item.roomId)
      const iso = String(item.availabilityDate ?? '').split('T')[0]
      if (!rid || !iso) return
      if (!map[rid]) map[rid] = {}
      map[rid][iso] = item
    })
    return { roomList, map }
  }

  useEffect(() => {
    if (hostLoading || !primaryHotelId) return
    setGridLoading(true)
    loadGrid(primaryHotelId, gridRange)
      .then(({ roomList, map }) => { setRooms(roomList); setByRoomDate(map) })
      .finally(() => setGridLoading(false))
  }, [primaryHotelId, hostLoading, gridRange])

  // ── Optimistic cell patch ──
  function patchCell(roomId, dateIso, fn) {
    const rid = String(roomId)
    setByRoomDate((prev) => {
      const roomMap = { ...(prev[rid] ?? {}) }
      const existing = roomMap[dateIso] ?? {
        roomId, availabilityDate: dateIso,
        availableRooms: 1, totalRooms: 1, blockedRooms: 0, bookedRooms: 0,
      }
      roomMap[dateIso] = { ...existing, ...fn(existing) }
      return { ...prev, [rid]: roomMap }
    })
  }

  async function handleBlockOne(roomId, dateIso) {
    await blockRoomDate(roomId, dateIso, 1, 'owner hold', primaryHotelId)
    patchCell(roomId, dateIso, (c) => ({
      availableRooms: Math.max(0, Number(c.availableRooms) - 1),
      blockedRooms:   Number(c.blockedRooms ?? 0) + 1,
    }))
  }

  async function handleUnblockOne(roomId, dateIso) {
    await unblockRoomDate(roomId, dateIso, 1, primaryHotelId)
    patchCell(roomId, dateIso, (c) => ({
      availableRooms: Number(c.availableRooms) + 1,
      blockedRooms:   Math.max(0, Number(c.blockedRooms ?? 0) - 1),
    }))
  }

  async function handleBlockAll(roomId, dateIso, count) {
    await blockRoomDate(roomId, dateIso, count, 'owner hold', primaryHotelId)
    patchCell(roomId, dateIso, (c) => ({
      blockedRooms:   Number(c.blockedRooms ?? 0) + count,
      availableRooms: 0,
    }))
  }

  async function handleOpenAll(roomId, dateIso, count) {
    await unblockRoomDate(roomId, dateIso, count, primaryHotelId)
    patchCell(roomId, dateIso, (c) => ({
      blockedRooms:   0,
      availableRooms: Number(c.availableRooms) + count,
    }))
  }

  function handleCellClick(event, room, dateIso, cell) {
    const rect = event.currentTarget.getBoundingClientRect()
    setEditor({ room, dateIso, anchor: rect })
  }

  // ── Bulk apply ──
  async function handleBulkApply() {
    if (!rooms.length) return
    setApplying(true)
    setBulkNotice('')
    const dateList = []
    for (let d = parseIso(bulkStart); d <= parseIso(bulkEnd); d = addDays(d, 1)) {
      dateList.push(toIso(d))
    }
    try {
      await Promise.all(
        rooms.flatMap((room) =>
          dateList.map((iso) =>
            bulkAction === 'block'
              ? blockRoomDate(room.id, iso, 1, 'owner hold', primaryHotelId).catch(() => null)
              : unblockRoomDate(room.id, iso, 1, primaryHotelId).catch(() => null),
          ),
        ),
      )
      setBulkNotice(`${bulkAction === 'block' ? 'Blocked' : 'Opened'} ${dateList.length} day${dateList.length !== 1 ? 's' : ''} across ${rooms.length} room${rooms.length !== 1 ? 's' : ''}.`)
      // Refresh grid
      const { map } = await loadGrid(primaryHotelId, gridRange)
      setByRoomDate(map)
    } catch {
      setBulkNotice('Some dates could not be updated. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  // ── Save booking rules ──
  async function handleSaveRules() {
    if (!primaryHotelId) return
    setSavingRules(true)
    setRulesNotice('')
    try {
      await updateHotel(primaryHotelId, {
        minimumStay:           Number(rules.minimumStay) || 1,
        maximumStay:           rules.maximumStay ? Number(rules.maximumStay) : null,
        bookingWindow:         Number(rules.bookingWindow) || 365,
        lastMinuteBooking:     rules.lastMinuteBooking,
        lastMinuteCutoffHours: Number(rules.lastMinuteCutoffHours) || 24,
        sameDayBooking:        rules.sameDayBooking,
      })
      setRulesNotice('Saved.')
    } catch {
      setRulesNotice('Could not save. Please try again.')
    } finally {
      setSavingRules(false)
    }
  }

  // ── Stats ──
  const todayIso = toIso(todayDate())
  const todayCells = rooms.map((r) => resolveCell(byRoomDate[String(r.id)]?.[todayIso]))
  const availToday  = todayCells.reduce((s, c) => s + (c?.available ?? 0), 0)
  const blockedToday = todayCells.reduce((s, c) => s + (c?.blocked ?? 0), 0)
  const bookedToday  = todayCells.reduce((s, c) => s + (c?.booked ?? 0), 0)
  const occupancy    = rooms.length > 0 ? Math.round((bookedToday / rooms.length) * 100) : 0

  const stats = [
    { label: 'Available today', value: String(availToday),   note: `of ${rooms.length} room${rooms.length !== 1 ? 's' : ''}` },
    { label: 'Occupancy today', value: `${occupancy}%`,      note: 'Booked / total capacity' },
    { label: 'Blocked today',   value: String(blockedToday), note: 'Owner or maintenance hold' },
    { label: 'Rooms tracked',   value: String(rooms.length), note: primaryHotelId ? 'Live data' : 'No property yet' },
  ]

  // ── Monthly calendar ──
  const calendarDays = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth])
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayLocal = todayDate()

  // Derive calendar cell status from first room's byRoomDate
  const primaryRoomId = rooms[0] ? String(rooms[0].id) : null
  function calendarCellStatus(date) {
    if (!primaryRoomId) return 'empty'
    const cell = resolveCell(byRoomDate[primaryRoomId]?.[toIso(date)])
    return cellStatus(cell)
  }

  return (
    <HostShell
      eyebrow="Inventory"
      title="Allotment & availability"
      mobileTitle="Inventory"
      description="Manage room counts per date. Click any cell to block, open, or stop-sell individual days."
      actions={[{ label: 'Pricing', href: '/host/pricing' }]}
      stats={stats}
    >
      {/* ── Allotment Grid ── */}
      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeading
            eyebrow="Allotment Grid"
            title="Room availability by date"
            description="Rows are rooms · Columns are dates. Click any cell to adjust the available count."
          />
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button type="button" aria-label="Previous period"
              onClick={() => setGridStart((s) => addDays(s, -GRID_WINDOW))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[190px] text-center text-sm font-semibold text-slate-700">
              {gridLabel}
            </span>
            <button type="button" aria-label="Next period"
              onClick={() => setGridStart((s) => addDays(s, GRID_WINDOW))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
            <button type="button"
              onClick={() => setGridStart(todayDate())}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-gray-50">
              <RefreshCw size={13} /> Today
            </button>
          </div>
        </div>

        {/* Banners */}
        {!hostLoading && !primaryHotelId && (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">You haven't created a listing yet.</span>
            <Link to="/host/listings/new"
              className="shrink-0 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900">
              Create listing →
            </Link>
          </div>
        )}
        {!hostLoading && !gridLoading && primaryHotelId && rooms.length === 0 && (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">No rooms found. Add rooms to manage inventory.</span>
            <Link to={`/host/listings/${primaryHotelId}/rooms`}
              className="shrink-0 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900">
              Add rooms →
            </Link>
          </div>
        )}

        {gridLoading ? (
          <div className="mt-5 py-14 text-center text-sm text-slate-400">Loading inventory…</div>
        ) : rooms.length > 0 ? (
          <div className="relative mt-5">
            <AllotmentGrid
              rooms={rooms}
              byRoomDate={byRoomDate}
              dates={dates}
              onCellClick={handleCellClick}
            />
            {editor && (
              <CellEditor
                room={editor.room}
                dateIso={editor.dateIso}
                cell={resolveCell(byRoomDate[String(editor.room.id)]?.[editor.dateIso])}
                anchor={editor.anchor}
                onClose={() => setEditor(null)}
                onBlockOne={handleBlockOne}
                onUnblockOne={handleUnblockOne}
                onBlockAll={handleBlockAll}
                onOpenAll={handleOpenAll}
              />
            )}
          </div>
        ) : null}
      </SectionCard>

      {/* ── Bulk actions ── */}
      <SectionCard>
        <SectionHeading
          eyebrow="Bulk Actions"
          title="Apply to date range"
          description="Block or open all rooms across a selected date range."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Start date
            </span>
            <input type="date" value={bulkStart}
              onChange={(e) => setBulkStart(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-500" />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              End date
            </span>
            <input type="date" value={bulkEnd}
              onChange={(e) => setBulkEnd(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-500" />
          </label>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Action
            </span>
            <div className="flex h-11 overflow-hidden rounded-xl border border-gray-200">
              {['block', 'open'].map((a) => (
                <button key={a} type="button" onClick={() => setBulkAction(a)}
                  className={`flex-1 px-5 text-sm font-semibold capitalize transition-colors ${
                    bulkAction === a
                      ? a === 'block' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-gray-50'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button type="button"
            disabled={applying || !rooms.length}
            onClick={handleBulkApply}
            className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40">
            {applying ? 'Applying…' : 'Apply'}
          </button>
        </div>
        {bulkNotice && (
          <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold ${
            bulkNotice.includes('ould not') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {bulkNotice}
          </p>
        )}
      </SectionCard>

      {/* ── Monthly overview ── */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            eyebrow="Monthly Overview"
            title={formatMonthLabel(currentMonth)}
            description="Calendar view of availability status for your primary room type."
          />
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Previous month"
              onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <input type="month" value={monthInputValue(currentMonth)}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number)
                if (y && m) setCurrentMonth(new Date(y, m - 1, 1))
              }}
              className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-500" />
            <button type="button" aria-label="Next month"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
            <button type="button" onClick={() => setCurrentMonth(startOfMonth(new Date()))}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-gray-50">
              <RefreshCw size={13} /> Today
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-[#fafafa]">
            {weekdayLabels.map((d) => (
              <div key={d}
                className="py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((date) => {
              const iso = toIso(date)
              const outside = !isSameMonth(date, currentMonth)
              const isToday = isSameDay(date, todayLocal)
              const status = calendarCellStatus(date)
              const dotColor = {
                open:    'bg-emerald-400',
                limited: 'bg-amber-400',
                full:    'bg-slate-700',
                blocked: 'bg-rose-400',
                empty:   'bg-transparent',
              }[status] ?? 'bg-transparent'

              function isSameDay(a, b) { return toIso(a) === toIso(b) }

              return (
                <div key={iso}
                  className={`min-h-[64px] border-b border-r border-gray-100 p-2 ${
                    outside ? 'bg-gray-50/60' : 'bg-white'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? 'bg-slate-900 text-white' : outside ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {date.getDate()}
                    </span>
                    {!outside && <span className={`h-2 w-2 rounded-full ${dotColor}`} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {LEGEND.filter(l => l.status !== 'empty').map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${{
                open: 'bg-emerald-400', limited: 'bg-amber-400',
                full: 'bg-slate-700',   blocked: 'bg-rose-400',
              }[status]}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
          {primaryRoomId && (
            <span className="text-xs text-slate-400">
              Showing: {roomLabel(rooms[0])}
            </span>
          )}
        </div>
      </SectionCard>

      {/* ── Booking rules ── */}
      <SectionCard>
        <SectionHeading
          eyebrow="Booking Rules"
          title="Stay & window settings"
          description="Control advance booking window and minimum / maximum stay lengths across all dates."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <HostField label="Minimum stay (nights)" type="number" placeholder="1"
            value={rules.minimumStay}
            onChange={(e) => setRules((r) => ({ ...r, minimumStay: e.target.value }))} />
          <HostField label="Maximum stay (nights)" type="number" placeholder="No limit"
            value={rules.maximumStay}
            onChange={(e) => setRules((r) => ({ ...r, maximumStay: e.target.value }))} />
          <HostField label="Booking window (days ahead)" type="number" placeholder="365"
            value={rules.bookingWindow}
            onChange={(e) => setRules((r) => ({ ...r, bookingWindow: e.target.value }))} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <HostToggle
            label="Allow last-minute bookings"
            description="Accept bookings made close to the check-in date."
            checked={rules.lastMinuteBooking}
            onChange={(e) => setRules((r) => ({ ...r, lastMinuteBooking: e.target.checked }))} />
          <HostToggle
            label="Allow same-day bookings"
            description="Accept bookings on the same day as check-in."
            checked={rules.sameDayBooking}
            onChange={(e) => setRules((r) => ({ ...r, sameDayBooking: e.target.checked }))} />
        </div>
        {rules.lastMinuteBooking && (
          <div className="mt-4 max-w-xs">
            <HostField label="Last-minute cutoff (hours before check-in)" type="number" placeholder="24"
              value={rules.lastMinuteCutoffHours}
              onChange={(e) => setRules((r) => ({ ...r, lastMinuteCutoffHours: e.target.value }))} />
          </div>
        )}
        {rulesNotice && (
          <p className={`mt-4 text-sm font-semibold ${rulesNotice === 'Saved.' ? 'text-emerald-700' : 'text-red-600'}`}>
            {rulesNotice}
          </p>
        )}
        <div className="mt-5">
          <button type="button" disabled={savingRules} onClick={handleSaveRules}
            className="inline-flex items-center rounded-2xl bg-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
            {savingRules ? 'Saving…' : 'Save booking rules'}
          </button>
        </div>
      </SectionCard>
    </HostShell>
  )
}
