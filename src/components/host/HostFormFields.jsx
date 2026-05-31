export function HostField({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  type = 'text',
}) {
  const Component = textarea ? 'textarea' : 'input'

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-dark">
        {label}
      </span>
      <Component
        type={textarea ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark ${
          textarea ? 'min-h-[148px] resize-none' : ''
        }`}
      />
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
