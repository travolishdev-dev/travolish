import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { getStates } from '../../data/states'

/**
 * State / province selector.
 * - If the chosen country has a known state list → searchable dropdown.
 * - Otherwise → plain text input (free-form entry).
 *
 * Props:
 *   country      – the country name string (drives which state list to show)
 *   value        – state name string (or '')
 *   onChange     – (stateName: string) => void
 *   label        – field label (optional)
 *   placeholder  – placeholder text
 *   required     – shows * on label
 *   error        – error string shown below
 *   className    – extra wrapper classes
 */
export default function StateSelect({
  country = '',
  value = '',
  onChange,
  label,
  placeholder = 'Select state / province',
  required = false,
  error = '',
  className = '',
}) {
  const states = getStates(country)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const searchRef = useRef(null)

  // Clear state when country changes and the current value is no longer valid
  useEffect(() => {
    if (states && value && !states.includes(value)) {
      onChange('')
    }
  }, [country]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => searchRef.current?.focus(), 40)
    return () => clearTimeout(id)
  }, [open])

  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    function onEsc(e) { if (e.key === 'Escape') { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const filtered = states
    ? (query.trim()
        ? states.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
        : states)
    : []

  const triggerBase =
    'relative flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-3 text-sm transition-colors outline-none'
  const triggerState = error
    ? 'border-rose-400'
    : open
      ? 'border-brand'
      : 'border-gray-200 hover:border-gray-400'

  const labelEl = label && (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  )

  // ── Dropdown mode (known state list) ─────────────────────────────────────────
  if (states) {
    return (
      <div ref={wrapRef} className={`relative ${className}`}>
        {labelEl}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${triggerBase} ${triggerState}`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {value ? (
            <>
              <span className="flex-1 truncate text-left font-medium text-slate-800">{value}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange('') }}
                className="ml-auto flex-shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700"
                aria-label="Clear state"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 truncate text-left text-slate-400">{placeholder}</span>
              <ChevronDown size={15} className={`flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {open && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-[300] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
            <div className="border-b border-gray-100 px-3 py-2">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search states…"
                className="h-8 w-full rounded-lg bg-gray-50 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <ul role="listbox" className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-slate-400">No states match</li>
              )}
              {filtered.map((s) => {
                const isSelected = s === value
                return (
                  <li key={s} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => { onChange(s); setOpen(false); setQuery('') }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                        isSelected ? 'bg-[#fff1f3] font-semibold text-brand-dark' : 'font-medium text-slate-700'
                      }`}
                    >
                      {s}
                      {isSelected && <span className="text-[10px] font-bold text-brand">✓</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
      </div>
    )
  }

  // ── Text input mode (unknown country or no country selected) ─────────────────
  return (
    <div className={className}>
      {labelEl}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={country ? 'Enter state / province' : 'Select a country first'}
        disabled={!country}
        className={[
          'h-11 w-full rounded-xl border px-3 text-sm font-medium text-slate-800 outline-none transition-colors',
          'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-slate-400',
          error ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-brand',
        ].join(' ')}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
}
