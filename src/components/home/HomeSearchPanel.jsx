import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Minus,
  MapPin,
  Plus,
  Search,
  UsersRound,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchContext } from '../../hooks/useSearchContext'
import {
  formatDateRange,
  formatGuestSummary,
} from '../../lib/searchFormatting'
import { indianDestinations } from '../../data/indianDestinations'
import HomeDateRangePicker from './HomeDateRangePicker'

function CounterControl({ label, value, min = 0, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div>
        <p className="text-sm font-semibold text-dark">{label}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Minus size={15} />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-dark">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-dark transition-colors hover:border-dark"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}

export default function HomeSearchPanel() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { searchDraft, updateSearchDraft } = useSearchContext()
  const [activePanel, setActivePanel] = useState(null)
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
    if (!query) return indianDestinations.slice(0, 6)

    return indianDestinations
      .filter((destination) =>
        `${destination.name} ${destination.region}`.toLowerCase().includes(query),
      )
      .slice(0, 6)
  }, [searchDraft.destination])

  const handleSubmit = (event) => {
    event.preventDefault()
    setActivePanel(null)
    navigate('/search')
  }

  return (
    <section className="home-search-hero border-b border-gray-100 pt-24">
      <div className="relative z-10 mx-auto max-w-[1760px] px-6 pb-12 pt-10 md:px-10 md:pb-16 md:pt-14 xl:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t('homeSearch.eyebrow')}
          </p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-dark md:text-[46px]">
            {t('homeSearch.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
            {t('homeSearch.description')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative z-40 mx-auto mt-9 max-w-6xl rounded-[28px] border border-gray-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
          ref={panelRef}
        >
          <div className="grid gap-2 lg:grid-cols-[1.35fr_1fr_1fr_auto]">
            <label className="relative flex min-h-[72px] items-center gap-4 rounded-[22px] px-4 transition-colors hover:bg-gray-50 sm:px-5">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                <Search size={20} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {t('homeSearch.destination')}
                </span>
                <span className="relative mt-1 block">
                  <input
                    value={searchDraft.destination}
                    onChange={(event) => {
                      updateSearchDraft({ destination: event.target.value })
                      setActivePanel('destination')
                    }}
                    onFocus={() => setActivePanel('destination')}
                    placeholder={t('homeSearch.destinationPlaceholder')}
                    className="w-full bg-transparent pr-8 text-base font-semibold text-dark outline-none placeholder:text-gray-400"
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
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[20px] border border-gray-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
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
                className="flex min-h-[72px] w-full items-center gap-4 rounded-[22px] px-4 text-left transition-colors hover:bg-gray-50 sm:px-5"
              >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                <CalendarDays size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {t('homeSearch.checkInOut')}
                </span>
                <span className="mt-1 block truncate text-base font-semibold text-dark">
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
                />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActivePanel(activePanel === 'guests' ? null : 'guests')
                }
                className="flex min-h-[72px] w-full items-center gap-4 rounded-[22px] px-4 text-left transition-colors hover:bg-gray-50 sm:px-5"
              >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                <UsersRound size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {t('homeSearch.guests')}
                </span>
                <span className="mt-1 block truncate text-base font-semibold text-dark">
                  {formatGuestSummary(searchDraft.adults, searchDraft.children)}
                </span>
              </span>
              </button>
              {activePanel === 'guests' && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 space-y-5 rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] lg:w-[320px]">
                  <CounterControl
                    label={t('homeSearch.adults')}
                    value={searchDraft.adults}
                    min={1}
                    onChange={(adults) => updateSearchDraft({ adults })}
                  />
                  <CounterControl
                    label={t('homeSearch.children')}
                    value={searchDraft.children}
                    onChange={(children) => updateSearchDraft({ children })}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[62px] items-center justify-center gap-2 rounded-[22px] bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark lg:min-h-full"
            >
              <MapPin size={18} />
              {t('homeSearch.search')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
