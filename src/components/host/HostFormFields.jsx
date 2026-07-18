import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export function HostField({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  type = 'text',
  error = '',
}) {
  const Component = textarea ? 'textarea' : 'input'
  const isNumeric = type === 'number'

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-dark">
        {label}
      </span>
      <Component
        type={textarea ? undefined : isNumeric ? 'text' : type}
        inputMode={isNumeric ? 'decimal' : undefined}
        pattern={isNumeric ? '[0-9.]*' : undefined}
        value={value}
        onChange={isNumeric ? (e) => { e.target.value = e.target.value.replace(/[^0-9.]/g, ''); onChange(e) } : onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all focus:ring-1 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-300'
            : 'border-gray-300 focus:border-dark focus:ring-dark'
        } ${textarea ? 'min-h-[148px] resize-none' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  )
}

export function HostPillButton({ active = false, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? 'border-dark bg-dark text-white'
          : 'border-gray-200 bg-white text-dark hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

export function HostSelect({ label, value, onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find((opt) => (opt.value ?? opt) === value)
  const selectedLabel = selected ? (selected.label ?? selected) : value

  return (
    <div className="block">
      <span className="mb-2 block text-sm font-semibold text-dark">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base md:text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
        >
          <span>{selectedLabel}</span>
          <ChevronDown size={14} className="shrink-0 text-muted" />
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] max-h-60 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            {options.map((opt) => {
              const optValue = opt.value ?? opt
              const optLabel = opt.label ?? opt
              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: optValue } })
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${
                    value === optValue ? 'text-dark' : 'text-muted'
                  }`}
                >
                  {optLabel}
                  {value === optValue && <Check size={14} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function HostToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4">
      <span>
        <span className="block text-sm font-semibold text-dark">{label}</span>
        {description && (
          <span className="mt-1 block text-sm leading-6 text-muted">{description}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 shrink-0 accent-brand"
      />
    </label>
  )
}
