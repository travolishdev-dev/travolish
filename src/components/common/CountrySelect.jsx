import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { COUNTRIES, flagEmoji } from '../../data/countries'

/**
 * Searchable country dropdown.
 *
 * Props:
 *   value        – country name string (or '')
 *   onChange     – (countryName: string) => void
 *   label        – field label (optional)
 *   placeholder  – placeholder text (default: 'Select country')
 *   required     – shows * on label
 *   error        – error string shown below
 *   className    – extra wrapper classes
 *   inputClass   – override trigger button classes
 */
export default function CountrySelect({
  value = '',
  onChange,
  label,
  placeholder = 'Select country',
  required = false,
  error = '',
  className = '',
  inputClass = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const searchRef = useRef(null)

  const selected = COUNTRIES.find((c) => c.name === value) ?? null

  const filtered = query.trim()
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES

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

  function select(country) {
    onChange(country.name)
    setOpen(false)
    setQuery('')
  }

  function clear(e) {
    e.stopPropagation()
    onChange('')
  }

  const triggerBase =
    'relative flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-3 text-sm transition-colors outline-none'
  const triggerState = error
    ? 'border-rose-400 focus:border-rose-500'
    : open
      ? 'border-brand'
      : 'border-gray-200 hover:border-gray-400'

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${triggerBase} ${triggerState} ${inputClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <span className="text-base leading-none" aria-hidden="true">{flagEmoji(selected.code)}</span>
            <span className="flex-1 truncate text-left font-medium text-slate-800">{selected.name}</span>
            <button
              type="button"
              onClick={clear}
              className="ml-auto flex-shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700"
              aria-label="Clear country"
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

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[300] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
          {/* Search */}
          <div className="border-b border-gray-100 px-3 py-2">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search countries…"
                className="h-8 w-full rounded-lg bg-gray-50 pl-7 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* List */}
          <ul
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-400">No countries match</li>
            )}
            {filtered.map((c) => {
              const isSelected = c.name === value
              return (
                <li key={c.code} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => select(c)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-[#fff1f3] font-semibold text-brand-dark' : 'font-medium text-slate-800'
                    }`}
                  >
                    <span className="text-base leading-none w-5 text-center" aria-hidden="true">{flagEmoji(c.code)}</span>
                    <span className="flex-1 truncate text-left">{c.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-brand">✓</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
      )}
    </div>
  )
}
