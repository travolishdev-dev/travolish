import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  MapPin,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react'
import HomeDateRangePicker from '../home/HomeDateRangePicker'
import { indianDestinations } from '../../data/indianDestinations'
import {
  formatDateRange,
  formatGuestSummary,
} from '../../lib/searchFormatting'

function CounterControl({ label, value, min = 0, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <p className="text-sm font-semibold text-dark">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-dark">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark"
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function SearchControls({
  searchDraft,
  updateSearchDraft,
  minPrice,
  maxPrice,
  minRating,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onClearFilters,
}) {
  const [activePanel, setActivePanel] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setActivePanel(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const matchingDestinations = useMemo(() => {
    const query = searchDraft.destination.trim().toLowerCase()
    if (!query) return indianDestinations.slice(0, 7)

    return indianDestinations
      .filter((destination) =>
        `${destination.name} ${destination.region}`.toLowerCase().includes(query),
      )
      .slice(0, 7)
  }, [searchDraft.destination])

  const hasFilters = minPrice || maxPrice || minRating

  return (
    <section className="sticky top-20 z-40 border-b border-rose-100/70 bg-gradient-to-b from-white via-[#fffafb] to-[#fff4f6]/95 backdrop-blur">
      <div
        ref={panelRef}
        className="mx-auto max-w-[1760px] px-4 py-4 md:px-8 xl:px-12"
      >
        <div className="rounded-[26px] border border-rose-100/80 bg-white p-2 shadow-[0_14px_36px_rgba(255,56,92,0.08)]">
          <div className="grid gap-2 lg:grid-cols-[1.35fr_1fr_1fr_auto_auto]">
            <label className="relative flex min-h-[62px] items-center gap-3 rounded-[20px] px-3 transition-colors hover:bg-gray-50 md:px-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                <Search size={18} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Destination
                </span>
                <span className="relative mt-1 block">
                  <input
                    value={searchDraft.destination}
                    onChange={(event) => {
                      updateSearchDraft({ destination: event.target.value })
                      setActivePanel('destination')
                    }}
                    onFocus={() => setActivePanel('destination')}
                    placeholder="Search Indian places"
                    className="w-full bg-transparent pr-8 text-sm font-semibold text-dark outline-none placeholder:text-gray-400"
                  />
                  {searchDraft.destination && (
                    <button
                      type="button"
                      onClick={() => updateSearchDraft({ destination: '' })}
                      className="absolute right-0 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-dark"
                      aria-label="Clear destination"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              </span>

              {activePanel === 'destination' && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-[20px] border border-gray-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                  {matchingDestinations.map((destination) => (
                    <button
                      key={`${destination.name}-${destination.region}`}
                      type="button"
                      onClick={() => {
                        updateSearchDraft({ destination: destination.name })
                        setActivePanel(null)
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-brand">
                        <MapPin size={17} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-dark">
                          {destination.name}
                        </span>
                        <span className="block text-xs text-muted">
                          {destination.region}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActivePanel(activePanel === 'dates' ? null : 'dates')
                }
                className="flex min-h-[62px] w-full items-center gap-3 rounded-[20px] px-3 text-left transition-colors hover:bg-gray-50 md:px-4"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-dark">
                  <CalendarDays size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Check-in/out
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-dark">
                    {formatDateRange(searchDraft.checkIn, searchDraft.checkOut)}
                  </span>
                </span>
              </button>

              {activePanel === 'dates' && (
                <HomeDateRangePicker
                  checkIn={searchDraft.checkIn}
                  checkOut={searchDraft.checkOut}
                  onChange={updateSearchDraft}
                  onClose={() => setActivePanel(null)}
                  panelClassName="absolute left-0 top-[calc(100%+10px)] z-[80] w-[min(720px,calc(100vw-2rem))] rounded-[24px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] xl:left-1/2 xl:-translate-x-1/2"
                />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActivePanel(activePanel === 'guests' ? null : 'guests')
                }
                className="flex min-h-[62px] w-full items-center gap-3 rounded-[20px] px-3 text-left transition-colors hover:bg-gray-50 md:px-4"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-dark">
                  <UsersRound size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Guests
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-dark">
                    {formatGuestSummary(searchDraft.adults, searchDraft.children)}
                  </span>
                </span>
              </button>

              {activePanel === 'guests' && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] space-y-4 rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] lg:w-[320px]">
                  <CounterControl
                    label="Adults"
                    value={searchDraft.adults}
                    min={1}
                    onChange={(adults) => updateSearchDraft({ adults })}
                  />
                  <div className="border-t border-gray-100" />
                  <CounterControl
                    label="Children"
                    value={searchDraft.children}
                    onChange={(children) => updateSearchDraft({ children })}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[20px] border px-5 text-sm font-semibold transition-colors lg:min-h-full ${
                showFilters || hasFilters
                  ? 'border-dark bg-gray-50 text-dark'
                  : 'border-gray-200 text-dark hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[20px] bg-brand px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-dark lg:min-h-full"
            >
              <Search size={17} />
              Search
            </button>
          </div>

          {showFilters && (
            <div className="mt-2 grid gap-3 rounded-[22px] bg-gray-50 p-4 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Min price
                </span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(event) => onMinPriceChange(event.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-dark outline-none transition-colors focus:border-dark"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Max price
                </span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(event) => onMaxPriceChange(event.target.value)}
                  placeholder="Any"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-dark outline-none transition-colors focus:border-dark"
                />
              </label>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Guest rating
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {[0, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => onMinRatingChange(rating)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                        Number(minRating) === rating
                          ? 'border-dark bg-white text-dark'
                          : 'border-gray-200 bg-white text-muted hover:border-gray-300'
                      }`}
                    >
                      {rating === 0 ? 'Any rating' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
