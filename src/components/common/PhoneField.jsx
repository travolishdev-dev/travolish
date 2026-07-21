import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRY_CODES, findCountryByCode } from '../../lib/countryCodes'
import { parsePhoneValue } from '../../lib/phone'

function parseEntry(value) {
  const { countryCode, phoneNumber } = parsePhoneValue(value || '', '+91')
  return { entry: findCountryByCode(countryCode), digits: phoneNumber }
}

/**
 * PhoneField — country-code dropdown + number input.
 *
 * Props:
 *   label        — field label string
 *   value        — controlled combined value e.g. "+91 9876543210"
 *   onChange(v)  — called with the new combined string
 *   placeholder  — number-part placeholder
 *   variant      — "account" (default, rounded-2xl) | "host" (rounded-xl, host styling)
 */
export function PhoneField({ label, value, onChange, placeholder = '98765 43210', variant = 'account' }) {
  const { entry: initEntry, digits: initDigits } = parseEntry(value)
  const [entry, setEntry] = useState(initEntry)
  const [digits, setDigits] = useState(initDigits)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const lastEmitted = useRef(null)
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  // Sync when the parent changes value from outside (e.g. data load)
  useEffect(() => {
    const combined = digits ? `${entry.code} ${digits}` : ''
    if (value !== lastEmitted.current && value !== combined) {
      const parsed = parseEntry(value)
      setEntry(parsed.entry)
      setDigits(parsed.digits)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  const emit = (newEntry, newDigits) => {
    const combined = newDigits.trim() ? `${newEntry.code} ${newDigits.trim()}` : ''
    lastEmitted.current = combined
    onChange?.(combined)
  }

  const handleSelect = (e) => {
    setEntry(e)
    setOpen(false)
    setSearch('')
    emit(e, digits)
  }

  const handleDigits = (e) => {
    const raw = e.target.value.replace(/[^\d\s\-().]/g, '')
    setDigits(raw)
    emit(entry, raw)
  }

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search),
      )
    : COUNTRY_CODES

  const isHost = variant === 'host'

  const wrapperRadius = isHost ? 'rounded-xl' : 'rounded-2xl'
  const btnRadius = isHost ? 'rounded-l-xl' : 'rounded-l-2xl'
  const labelCls = isHost
    ? 'mb-2 block text-sm font-semibold text-dark'
    : 'mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted'
  const bgCls = isHost ? 'bg-white' : 'bg-[#fcfcfb]'
  const borderCls = isHost
    ? 'border-gray-300 focus-within:border-dark focus-within:ring-1 focus-within:ring-dark/30'
    : 'border-gray-200 focus-within:border-dark'

  return (
    <div className="block">
      <span className={labelCls}>{label}</span>

      <div className={`relative flex items-stretch border transition-colors ${wrapperRadius} ${bgCls} ${borderCls}`}>
        {/* ── Country code selector ── */}
        <div ref={dropdownRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`flex h-full items-center gap-1.5 border-r border-gray-200 px-3 py-3 text-sm font-medium text-dark hover:bg-black/5 transition-colors ${btnRadius}`}
          >
            <span className="text-base leading-none">{entry.flag}</span>
            <span className="tabular-nums">{entry.code}</span>
            <ChevronDown
              size={12}
              className={`text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              {/* Search */}
              <div className="border-b border-gray-100 p-2">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Search size={12} className="flex-shrink-0 text-muted" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                  />
                </div>
              </div>

              {/* List */}
              <div className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">No results</p>
                ) : (
                  filtered.map((c, i) => {
                    const active = entry.code === c.code && entry.name === c.name
                    return (
                      <button
                        key={`${c.code}-${c.name}-${i}`}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${active ? 'bg-gray-50 font-semibold' : ''}`}
                      >
                        <span className="w-5 flex-shrink-0 text-center text-base">{c.flag}</span>
                        <span className="flex-1 truncate text-left text-dark">{c.name}</span>
                        <span className="tabular-nums text-muted">{c.code}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Phone number input ── */}
        <input
          type="tel"
          value={digits}
          onChange={handleDigits}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-dark outline-none md:text-sm"
        />
      </div>
    </div>
  )
}
