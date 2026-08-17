import { useEffect, useMemo } from 'react'
import { ChevronDown, LocateFixed } from 'lucide-react'

// ---------------------------------------------------------------------------
// IANA timezone list — grouped by region.
// UTC offsets are computed once at module load so the select options stay fast.
// ---------------------------------------------------------------------------
function computeOffset(tzValue) {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: tzValue,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date())
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

const RAW_ZONES = [
  // UTC
  { group: 'UTC',       value: 'UTC',                              label: 'UTC' },
  // Africa
  { group: 'Africa',    value: 'Africa/Abidjan',                   label: 'Abidjan' },
  { group: 'Africa',    value: 'Africa/Accra',                     label: 'Accra' },
  { group: 'Africa',    value: 'Africa/Addis_Ababa',               label: 'Addis Ababa' },
  { group: 'Africa',    value: 'Africa/Cairo',                     label: 'Cairo' },
  { group: 'Africa',    value: 'Africa/Casablanca',                label: 'Casablanca' },
  { group: 'Africa',    value: 'Africa/Johannesburg',              label: 'Johannesburg' },
  { group: 'Africa',    value: 'Africa/Lagos',                     label: 'Lagos' },
  { group: 'Africa',    value: 'Africa/Nairobi',                   label: 'Nairobi' },
  { group: 'Africa',    value: 'Africa/Tripoli',                   label: 'Tripoli' },
  { group: 'Africa',    value: 'Africa/Tunis',                     label: 'Tunis' },
  // Americas
  { group: 'Americas',  value: 'America/Anchorage',                label: 'Anchorage' },
  { group: 'Americas',  value: 'America/Argentina/Buenos_Aires',   label: 'Buenos Aires' },
  { group: 'Americas',  value: 'America/Bogota',                   label: 'Bogotá' },
  { group: 'Americas',  value: 'America/Caracas',                  label: 'Caracas' },
  { group: 'Americas',  value: 'America/Chicago',                  label: 'Chicago' },
  { group: 'Americas',  value: 'America/Denver',                   label: 'Denver' },
  { group: 'Americas',  value: 'America/Halifax',                  label: 'Halifax' },
  { group: 'Americas',  value: 'America/Lima',                     label: 'Lima' },
  { group: 'Americas',  value: 'America/Los_Angeles',              label: 'Los Angeles' },
  { group: 'Americas',  value: 'America/Mexico_City',              label: 'Mexico City' },
  { group: 'Americas',  value: 'America/New_York',                 label: 'New York' },
  { group: 'Americas',  value: 'America/Phoenix',                  label: 'Phoenix' },
  { group: 'Americas',  value: 'America/Santiago',                 label: 'Santiago' },
  { group: 'Americas',  value: 'America/Sao_Paulo',                label: 'São Paulo' },
  { group: 'Americas',  value: 'America/Toronto',                  label: 'Toronto' },
  { group: 'Americas',  value: 'America/Vancouver',                label: 'Vancouver' },
  { group: 'Americas',  value: 'America/Winnipeg',                 label: 'Winnipeg' },
  // Asia
  { group: 'Asia',      value: 'Asia/Almaty',                      label: 'Almaty' },
  { group: 'Asia',      value: 'Asia/Amman',                       label: 'Amman' },
  { group: 'Asia',      value: 'Asia/Baghdad',                     label: 'Baghdad' },
  { group: 'Asia',      value: 'Asia/Baku',                        label: 'Baku' },
  { group: 'Asia',      value: 'Asia/Bangkok',                     label: 'Bangkok' },
  { group: 'Asia',      value: 'Asia/Beirut',                      label: 'Beirut' },
  { group: 'Asia',      value: 'Asia/Colombo',                     label: 'Colombo' },
  { group: 'Asia',      value: 'Asia/Dhaka',                       label: 'Dhaka' },
  { group: 'Asia',      value: 'Asia/Dubai',                       label: 'Dubai' },
  { group: 'Asia',      value: 'Asia/Hong_Kong',                   label: 'Hong Kong' },
  { group: 'Asia',      value: 'Asia/Jakarta',                     label: 'Jakarta' },
  { group: 'Asia',      value: 'Asia/Jerusalem',                   label: 'Jerusalem' },
  { group: 'Asia',      value: 'Asia/Kabul',                       label: 'Kabul' },
  { group: 'Asia',      value: 'Asia/Karachi',                     label: 'Karachi' },
  { group: 'Asia',      value: 'Asia/Kathmandu',                   label: 'Kathmandu' },
  { group: 'Asia',      value: 'Asia/Kolkata',                     label: 'Kolkata' },
  { group: 'Asia',      value: 'Asia/Kuala_Lumpur',                label: 'Kuala Lumpur' },
  { group: 'Asia',      value: 'Asia/Kuwait',                      label: 'Kuwait' },
  { group: 'Asia',      value: 'Asia/Manila',                      label: 'Manila' },
  { group: 'Asia',      value: 'Asia/Muscat',                      label: 'Muscat' },
  { group: 'Asia',      value: 'Asia/Nicosia',                     label: 'Nicosia' },
  { group: 'Asia',      value: 'Asia/Riyadh',                      label: 'Riyadh' },
  { group: 'Asia',      value: 'Asia/Seoul',                       label: 'Seoul' },
  { group: 'Asia',      value: 'Asia/Shanghai',                    label: 'Shanghai' },
  { group: 'Asia',      value: 'Asia/Singapore',                   label: 'Singapore' },
  { group: 'Asia',      value: 'Asia/Taipei',                      label: 'Taipei' },
  { group: 'Asia',      value: 'Asia/Tashkent',                    label: 'Tashkent' },
  { group: 'Asia',      value: 'Asia/Tehran',                      label: 'Tehran' },
  { group: 'Asia',      value: 'Asia/Tokyo',                       label: 'Tokyo' },
  { group: 'Asia',      value: 'Asia/Yerevan',                     label: 'Yerevan' },
  // Atlantic
  { group: 'Atlantic',  value: 'Atlantic/Azores',                  label: 'Azores' },
  { group: 'Atlantic',  value: 'Atlantic/Cape_Verde',              label: 'Cape Verde' },
  { group: 'Atlantic',  value: 'Atlantic/Reykjavik',               label: 'Reykjavik' },
  // Australia
  { group: 'Australia', value: 'Australia/Adelaide',               label: 'Adelaide' },
  { group: 'Australia', value: 'Australia/Brisbane',               label: 'Brisbane' },
  { group: 'Australia', value: 'Australia/Darwin',                 label: 'Darwin' },
  { group: 'Australia', value: 'Australia/Lord_Howe',              label: 'Lord Howe' },
  { group: 'Australia', value: 'Australia/Melbourne',              label: 'Melbourne' },
  { group: 'Australia', value: 'Australia/Perth',                  label: 'Perth' },
  { group: 'Australia', value: 'Australia/Sydney',                 label: 'Sydney' },
  // Europe
  { group: 'Europe',    value: 'Europe/Amsterdam',                 label: 'Amsterdam' },
  { group: 'Europe',    value: 'Europe/Athens',                    label: 'Athens' },
  { group: 'Europe',    value: 'Europe/Belgrade',                  label: 'Belgrade' },
  { group: 'Europe',    value: 'Europe/Berlin',                    label: 'Berlin' },
  { group: 'Europe',    value: 'Europe/Brussels',                  label: 'Brussels' },
  { group: 'Europe',    value: 'Europe/Bucharest',                 label: 'Bucharest' },
  { group: 'Europe',    value: 'Europe/Budapest',                  label: 'Budapest' },
  { group: 'Europe',    value: 'Europe/Copenhagen',                label: 'Copenhagen' },
  { group: 'Europe',    value: 'Europe/Dublin',                    label: 'Dublin' },
  { group: 'Europe',    value: 'Europe/Helsinki',                  label: 'Helsinki' },
  { group: 'Europe',    value: 'Europe/Istanbul',                  label: 'Istanbul' },
  { group: 'Europe',    value: 'Europe/Kyiv',                      label: 'Kyiv' },
  { group: 'Europe',    value: 'Europe/Lisbon',                    label: 'Lisbon' },
  { group: 'Europe',    value: 'Europe/London',                    label: 'London' },
  { group: 'Europe',    value: 'Europe/Madrid',                    label: 'Madrid' },
  { group: 'Europe',    value: 'Europe/Moscow',                    label: 'Moscow' },
  { group: 'Europe',    value: 'Europe/Oslo',                      label: 'Oslo' },
  { group: 'Europe',    value: 'Europe/Paris',                     label: 'Paris' },
  { group: 'Europe',    value: 'Europe/Prague',                    label: 'Prague' },
  { group: 'Europe',    value: 'Europe/Rome',                      label: 'Rome' },
  { group: 'Europe',    value: 'Europe/Sofia',                     label: 'Sofia' },
  { group: 'Europe',    value: 'Europe/Stockholm',                 label: 'Stockholm' },
  { group: 'Europe',    value: 'Europe/Vienna',                    label: 'Vienna' },
  { group: 'Europe',    value: 'Europe/Warsaw',                    label: 'Warsaw' },
  { group: 'Europe',    value: 'Europe/Zurich',                    label: 'Zurich' },
  // Pacific
  { group: 'Pacific',   value: 'Pacific/Auckland',                 label: 'Auckland' },
  { group: 'Pacific',   value: 'Pacific/Chatham',                  label: 'Chatham' },
  { group: 'Pacific',   value: 'Pacific/Fiji',                     label: 'Fiji' },
  { group: 'Pacific',   value: 'Pacific/Guam',                     label: 'Guam' },
  { group: 'Pacific',   value: 'Pacific/Honolulu',                 label: 'Honolulu' },
  { group: 'Pacific',   value: 'Pacific/Pago_Pago',                label: 'Pago Pago' },
  { group: 'Pacific',   value: 'Pacific/Tongatapu',                label: 'Tongatapu' },
]

// Pre-compute UTC offsets once so option rendering is O(1) per item
const TIMEZONES = RAW_ZONES.map((tz) => ({ ...tz, offset: computeOffset(tz.value) }))

// Group into { label, zones[] } for <optgroup>
const TIMEZONE_GROUPS = Object.entries(
  TIMEZONES.reduce((acc, tz) => {
    if (!acc[tz.group]) acc[tz.group] = []
    acc[tz.group].push(tz)
    return acc
  }, {}),
).map(([label, zones]) => ({ label, zones }))

// The browser's IANA timezone, detected once
function detectBrowserTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TimeZoneField — styled select with IANA timezone options and auto-detect.
 *
 * Props:
 *   label        — field label string
 *   value        — controlled IANA timezone string e.g. "Asia/Kolkata"
 *   onChange(v)  — called with the new IANA string
 *   detectLabel  — button title (localised)
 */
export function TimeZoneField({ label, value, onChange, detectLabel = 'Detect automatically' }) {
  const browserTz = useMemo(detectBrowserTz, [])

  // Auto-detect on first render if no value is stored
  useEffect(() => {
    if (!value) {
      onChange(browserTz)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Current offset label for the hint row (recomputes only when value changes)
  const offsetLabel = useMemo(() => (value ? computeOffset(value) : ''), [value])

  // Check whether the stored value is in our list; if not, still show it
  const knownValue = TIMEZONES.some((tz) => tz.value === value)

  return (
    <div className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>

      <div className="flex items-stretch gap-2">
        {/* Select wrapper */}
        <div className="relative flex-1">
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 pr-9 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
          >
            {/* Placeholder / unknown-value fallback */}
            {!value && (
              <option value="" disabled>
                — select a time zone —
              </option>
            )}
            {!knownValue && value && (
              <option value={value}>{value}</option>
            )}

            {TIMEZONE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.zones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Dropdown chevron */}
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>

        {/* Detect button */}
        <button
          type="button"
          onClick={() => onChange(browserTz)}
          title={`${detectLabel} (${browserTz})`}
          className="flex flex-none items-center justify-center rounded-2xl border border-gray-200 bg-[#fcfcfb] px-3 text-muted transition-colors hover:border-dark hover:text-dark"
        >
          <LocateFixed size={16} />
        </button>
      </div>

      {/* Hint row: IANA name · offset */}
      {value && (
        <p className="mt-1.5 text-[11px] text-muted">
          {value}
          {offsetLabel && <> · <span className="font-medium text-dark">{offsetLabel}</span></>}
        </p>
      )}
    </div>
  )
}
