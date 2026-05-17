import { useEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { CalendarDays, Moon, X } from 'lucide-react'
import { formatDateRange } from '../../lib/searchFormatting'

function toDate(dateValue) {
  if (!dateValue) return undefined
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateValue(date) {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function getThisWeekendRange() {
  const today = startOfToday()
  const day = today.getDay()
  const daysUntilFriday = (5 - day + 7) % 7 || 7
  const friday = addDays(today, daysUntilFriday)
  return { from: friday, to: addDays(friday, 2) }
}

function getNightCount(from, to) {
  if (!from || !to) return 0
  const difference = to.getTime() - from.getTime()
  return Math.max(0, Math.round(difference / 86400000))
}

function useIsWideCalendar() {
  const [isWide, setIsWide] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 900,
  )

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 900)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isWide
}

function formatSingleDate(dateValue) {
  if (!dateValue) return 'Select date'
  return formatDateRange(dateValue, '').split(' - ')[0]
}

export default function HomeDateRangePicker({
  checkIn,
  checkOut,
  onChange,
  onClose,
  panelClassName = 'absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-[24px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] lg:left-1/2 lg:right-auto lg:w-[720px] lg:-translate-x-1/2',
}) {
  const isWideCalendar = useIsWideCalendar()
  const selectedRange = useMemo(
    () => ({
      from: toDate(checkIn),
      to: toDate(checkOut),
    }),
    [checkIn, checkOut],
  )
  const nights = getNightCount(selectedRange.from, selectedRange.to)

  const presets = useMemo(() => {
    const today = startOfToday()
    const tomorrow = addDays(today, 1)
    const weekend = getThisWeekendRange()

    return [
      { label: 'Tonight', range: { from: today, to: tomorrow } },
      { label: 'Tomorrow', range: { from: tomorrow, to: addDays(tomorrow, 1) } },
      { label: 'This weekend', range: weekend },
      { label: 'Next 7 days', range: { from: today, to: addDays(today, 7) } },
    ]
  }, [])

  const handleRangeSelect = (range) => {
    onChange({
      checkIn: toDateValue(range?.from),
      checkOut: toDateValue(range?.to),
    })
  }

  const handlePresetSelect = (range) => {
    onChange({
      checkIn: toDateValue(range.from),
      checkOut: toDateValue(range.to),
    })
  }

  return (
    <div className={panelClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-dark">Select your stay</p>
          <p className="mt-1 text-xs text-muted">
            Pick a check-in date, then choose your check-out date.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-dark transition-colors hover:bg-gray-50"
          aria-label="Close date picker"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Check-in
          </p>
          <p className="mt-1 text-sm font-semibold text-dark">
            {formatSingleDate(checkIn)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Check-out
          </p>
          <p className="mt-1 text-sm font-semibold text-dark">
            {formatSingleDate(checkOut)}
          </p>
        </div>
      </div>

      <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetSelect(preset.range)}
            className="flex-shrink-0 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-semibold text-dark transition-colors hover:border-brand hover:bg-rose-50 hover:text-brand"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={handleRangeSelect}
        fromDate={startOfToday()}
        numberOfMonths={isWideCalendar ? 2 : 1}
        pagedNavigation={isWideCalendar}
        className="travolish-calendar mt-4"
      />

      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-brand">
            {nights > 0 ? <Moon size={16} /> : <CalendarDays size={16} />}
          </span>
          <span>
            {nights > 0
              ? `${nights} night${nights === 1 ? '' : 's'} selected`
              : 'Select both dates to continue'}
          </span>
        </div>

        <div className="flex gap-2">
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={() => onChange({ checkIn: '', checkOut: '' })}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-dark px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
