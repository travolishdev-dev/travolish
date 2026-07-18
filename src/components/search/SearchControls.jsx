import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronDown,
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
import { useTranslation } from 'react-i18next'

function CounterControl({ label, value, min = 0, onChange }) {
  const { t } = useTranslation('search')
  return (
    <div className="flex items-center justify-between gap-5">
      <p className="text-sm font-semibold text-dark">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={t('controls.decreaseLabel', { label })}
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
          aria-label={t('controls.increaseLabel', { label })}
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
  propertyType,
  onPropertyTypeChange,
  selectedAmenities,
  onSelectedAmenitiesChange,
  instantBookOnly,
  onInstantBookOnlyChange,
  freeCancellationOnly,
  onFreeCancellationOnlyChange,
  sortOption,
  onSortOptionChange,
  onClearFilters,
}) {
  const [activePanel, setActivePanel] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const panelRef = useRef(null)
  const { t } = useTranslation(['search', 'home'])

  const propertyTypes = useMemo(() => [
    { value: 'Any', label: t('search:types.any') },
    { value: 'Hotel', label: t('search:types.hotel') },
    { value: 'Apartment', label: t('search:types.apartment') },
    { value: 'Villa', label: t('search:types.villa') },
    { value: 'Homestay', label: t('search:types.homestay') },
    { value: 'Resort', label: t('search:types.resort') },
    { value: 'Guest house', label: t('search:types.guestHouse') },
  ], [t])

  const amenityFilters = useMemo(() => [
    { value: 'Wifi', label: t('search:amenities.wifi') },
    { value: 'Pool', label: t('search:amenities.pool') },
    { value: 'Kitchen', label: t('search:amenities.kitchen') },
    { value: 'Free parking', label: t('search:amenities.parking') },
    { value: 'Workspace', label: t('search:amenities.workspace') },
    { value: 'Breakfast', label: t('search:amenities.breakfast') },
    { value: 'Pet friendly', label: t('search:amenities.petFriendly') },
    { value: 'Gym', label: t('search:amenities.gym') },
  ], [t])

  const sortOptions = useMemo(() => [
    { value: 'recommended', label: t('search:filters.recommended') },
    { value: 'price-low', label: t('search:filters.priceLowToHigh') },
    { value: 'price-high', label: t('search:filters.priceHighToLow') },
    { value: 'rating', label: t('search:filters.highestRated') },
    { value: 'newest', label: t('search:filters.newest') },
  ], [t])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setActivePanel(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const closeOnScroll = () => setActivePanel(null)
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    return () => window.removeEventListener('scroll', closeOnScroll)
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

  const hasFilters =
    minPrice ||
    maxPrice ||
    minRating ||
    propertyType !== 'Any' ||
    selectedAmenities.length > 0 ||
    instantBookOnly ||
    freeCancellationOnly ||
    sortOption !== 'recommended'

  // Total active filter count including guests (above 1 adult = meaningful filter)
  const guestCount = (searchDraft.adults || 1) + (searchDraft.children || 0)
  const activeFilterCount = [
    minPrice, maxPrice, minRating > 0,
    propertyType !== 'Any',
    ...selectedAmenities.map(() => true),
    instantBookOnly, freeCancellationOnly,
    sortOption !== 'recommended',
    guestCount > 1,
  ].filter(Boolean).length

  const toggleAmenity = (amenity) => {
    onSelectedAmenitiesChange(
      selectedAmenities.includes(amenity)
        ? selectedAmenities.filter((item) => item !== amenity)
        : [...selectedAmenities, amenity],
    )
  }

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
                  {t('home:destination')}
                </span>
                <span className="relative mt-1 block">
                  <input
                    value={searchDraft.destination}
                    onChange={(event) => {
                      updateSearchDraft({ destination: event.target.value })
                      setActivePanel('destination')
                    }}
                    onFocus={() => setActivePanel('destination')}
                    placeholder={t('home:destinationPlaceholder')}
                    enterKeyHint="search"
                    autoComplete="off"
                    className="w-full bg-transparent pr-8 text-base font-semibold text-dark outline-none placeholder:text-gray-400"
                  />
                  {searchDraft.destination && (
                    <button
                      type="button"
                      onClick={() => updateSearchDraft({ destination: '' })}
                      className="absolute right-0 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-dark"
                      aria-label={t('home:clearDestination')}
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
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                  <CalendarDays size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('home:checkInOut')}
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
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                  <UsersRound size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('home:guests')}
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-dark">
                    {formatGuestSummary(searchDraft.adults, searchDraft.children)}
                  </span>
                </span>
              </button>

              {activePanel === 'guests' && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] space-y-4 rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] lg:w-[320px]">
                  <CounterControl
                    label={t('home:adults')}
                    value={searchDraft.adults}
                    min={1}
                    onChange={(adults) => updateSearchDraft({ adults })}
                  />
                  <div className="border-t border-gray-100" />
                  <CounterControl
                    label={t('home:children')}
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
              {t('search:controls.filters')}
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-dark px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[20px] bg-brand px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-dark lg:min-h-full"
            >
              <Search size={17} />
              {t('home:search')}
            </button>
          </div>

          {showFilters && (
            <div className="mt-2 grid gap-4 rounded-[22px] bg-gray-50 p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.propertyType')}
                  </span>
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setActivePanel(activePanel === 'propertyType' ? null : 'propertyType')}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base font-semibold text-dark outline-none transition-colors focus:border-dark"
                    >
                      <span>{propertyTypes.find((opt) => opt.value === propertyType)?.label ?? propertyType}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                    {activePanel === 'propertyType' && (
                      <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                        {propertyTypes.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onPropertyTypeChange(opt.value); setActivePanel(null) }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${propertyType === opt.value ? 'text-dark' : 'text-muted'}`}
                          >
                            {opt.label}
                            {propertyType === opt.value && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.sortBy')}
                  </span>
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setActivePanel(activePanel === 'sortBy' ? null : 'sortBy')}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base font-semibold text-dark outline-none transition-colors focus:border-dark"
                    >
                      <span>{sortOptions.find((opt) => opt.value === sortOption)?.label ?? sortOption}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                    {activePanel === 'sortBy' && (
                      <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onSortOptionChange(opt.value); setActivePanel(null) }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${sortOption === opt.value ? 'text-dark' : 'text-muted'}`}
                          >
                            {opt.label}
                            {sortOption === opt.value && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.minPrice')}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={minPrice}
                    onChange={(event) => onMinPriceChange(event.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base text-dark outline-none transition-colors focus:border-dark"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.maxPrice')}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={maxPrice}
                    onChange={(event) => onMaxPriceChange(event.target.value.replace(/\D/g, ''))}
                    placeholder="Any"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base text-dark outline-none transition-colors focus:border-dark"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.amenities')}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {amenityFilters.map((amenity) => {
                      const active = selectedAmenities.includes(amenity.value)
                      return (
                        <button
                          key={amenity.value}
                          type="button"
                          onClick={() => toggleAmenity(amenity.value)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                            active
                              ? 'border-dark bg-dark text-white'
                              : 'border-gray-200 bg-white text-dark hover:border-gray-300'
                          }`}
                        >
                          {active ? <Check size={12} /> : null}
                          {amenity.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.bookingOptions')}
                  </span>
                  <div className="mt-2 grid gap-2">
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-dark">{t('search:filters.instantBookOnly')}</span>
                      <input
                        type="checkbox"
                        checked={instantBookOnly}
                        onChange={(event) => onInstantBookOnlyChange(event.target.checked)}
                        className="h-4 w-4 accent-[#ff385c]"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-dark">{t('search:amenities.freeCancellation')}</span>
                      <input
                        type="checkbox"
                        checked={freeCancellationOnly}
                        onChange={(event) => onFreeCancellationOnlyChange(event.target.checked)}
                        className="h-4 w-4 accent-[#ff385c]"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('home:guests')}
                  </span>
                  <div className="mt-2 rounded-2xl border border-gray-200 bg-white px-4 py-2">
                    <CounterControl
                      label={t('home:adults')}
                      value={searchDraft.adults}
                      min={1}
                      onChange={(adults) => updateSearchDraft({ adults })}
                    />
                    <div className="my-2 border-t border-gray-100" />
                    <CounterControl
                      label={t('home:children')}
                      value={searchDraft.children}
                      onChange={(children) => updateSearchDraft({ children })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('search:filters.guestRating')}
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
                        {rating === 0 ? t('search:filters.anyRating') : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearFilters}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-100"
                >
                  {t('search:filters.clearFilters')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
