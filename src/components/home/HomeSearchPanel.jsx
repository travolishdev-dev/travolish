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
import { saveSearch } from '../../lib/searchHistory'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1920&q=85',
]

function HeroBackground() {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % HERO_IMAGES.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero-bg-layer" aria-hidden="true">
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`hero-bg-img${i === activeIdx ? ' is-active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      {/* Cinematic multi-stop overlay — heavy at top and bottom, readable mid */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,4,2,0.35) 0%, rgba(8,4,2,0.12) 38%, rgba(8,4,2,0.40) 65%, rgba(8,4,2,0.84) 100%)',
        }}
      />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 100% at 50% 0%, transparent 55%, rgba(0,0,0,0.35) 100%)',
        }}
      />
    </div>
  )
}

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
  const { t } = useTranslation('home')
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
    if (!query) return indianDestinations.slice(0, 5)

    return indianDestinations
      .filter((destination) =>
        `${destination.name} ${destination.region}`.toLowerCase().includes(query),
      )
      .slice(0, 5)
  }, [searchDraft.destination])

  const handleSubmit = (event) => {
    event.preventDefault()
    setActivePanel(null)
    saveSearch(searchDraft)
    navigate('/search')
  }

  return (
    <section className="home-search-hero pt-24 flex flex-col justify-center">
      <HeroBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1760px] px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-14 xl:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
              {t('eyebrow')}
            </span>
          </span>
          <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-[48px]">
            {t('title')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] md:text-[17px]">
            {t('description')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative z-40 mx-auto mt-10 max-w-6xl rounded-[28px] border border-gray-200 bg-white p-2 shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
          ref={panelRef}
        >
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-[1.35fr_1fr_1fr_auto]">
            <label className="relative flex min-h-[72px] items-center gap-4 rounded-[22px] px-4 transition-colors hover:bg-gray-50 sm:px-5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-brand/70">
                <Search size={17} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {t('destination')}
                </span>
                <span className="relative mt-1 block">
                  <input
                    value={searchDraft.destination}
                    onChange={(event) => {
                      updateSearchDraft({ destination: event.target.value })
                      setActivePanel('destination')
                    }}
                    onFocus={() => setActivePanel('destination')}
                    onBlur={() => {
                      // Delay so a tap on a dropdown item registers before we close
                      setTimeout(
                        () => setActivePanel((prev) => (prev === 'destination' ? null : prev)),
                        150,
                      )
                    }}
                    placeholder={t('destinationPlaceholder')}
                    className="w-full bg-transparent pr-8 text-base font-semibold text-dark outline-none placeholder:text-gray-400"
                  />
                  {searchDraft.destination && (
                    <button
                      type="button"
                      onClick={() => updateSearchDraft({ destination: '' })}
                      className="absolute right-0 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-dark"
                      aria-label={t('clearDestination')}
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
                        const updatedDraft = { ...searchDraft, destination: destination.name }
                        updateSearchDraft({ destination: destination.name })
                        setActivePanel(null)
                        saveSearch(updatedDraft)
                        navigate('/search')
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

            <div className="relative lg:border-l lg:border-gray-100">
              <button
                type="button"
                onClick={() =>
                  setActivePanel(activePanel === 'dates' ? null : 'dates')
                }
                className="flex min-h-[72px] w-full items-center gap-4 rounded-[22px] px-4 text-left transition-colors hover:bg-gray-50 sm:px-5"
              >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-brand/70">
                <CalendarDays size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {t('checkInOut')}
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

            <div className="relative lg:border-l lg:border-gray-100">
              <button
                type="button"
                onClick={() =>
                  setActivePanel(activePanel === 'guests' ? null : 'guests')
                }
                className="flex min-h-[72px] w-full items-center gap-4 rounded-[22px] px-4 text-left transition-colors hover:bg-gray-50 sm:px-5"
              >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-brand/70">
                <UsersRound size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {t('guests')}
                </span>
                <span className="mt-1 block truncate text-base font-semibold text-dark">
                  {formatGuestSummary(searchDraft.adults, searchDraft.children)}
                </span>
              </span>
              </button>
              {activePanel === 'guests' && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 space-y-5 rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] lg:w-[320px]">
                  <CounterControl
                    label={t('adults')}
                    value={searchDraft.adults}
                    min={1}
                    onChange={(adults) => updateSearchDraft({ adults })}
                  />
                  <CounterControl
                    label={t('children')}
                    value={searchDraft.children}
                    onChange={(children) => updateSearchDraft({ children })}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[62px] items-center justify-center gap-2 rounded-[22px] bg-brand px-8 text-base font-semibold text-white transition-colors hover:bg-brand-dark md:col-span-3 lg:col-span-1 lg:min-h-full"
            >
              <MapPin size={18} />
              {t('search')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
