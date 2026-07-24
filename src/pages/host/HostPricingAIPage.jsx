import { useEffect, useState } from 'react'
import { BarChart2, RefreshCw, TrendingUp, Users } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import {
  getPricingSuggestions,
  getPendingSuggestions,
  generatePricingSuggestions,
  acceptPricingSuggestion,
  rejectPricingSuggestion,
  analyzeDemand,
  analyzeCompetitors,
  getSeasonalPricing,
} from '../../services/pricingApi'
import useHostContext from '../../hooks/useHostContext'

function adaptSuggestion(s) {
  const score = s.confidenceScore ?? 0
  const confidence = score >= 0.7 ? 'High' : score >= 0.4 ? 'Medium' : 'Low'

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
  const from = fmt(s.suggestedFromDate)
  const to = fmt(s.suggestedToDate)
  const dateWindow = from && to ? `${from} – ${to}` : '—'

  const currentRate = s.currentPrice != null ? `$${s.currentPrice}` : '—'
  const suggestedRate = s.suggestedPrice != null ? `$${s.suggestedPrice}` : '—'
  const rationale = s.reason ? [s.reason.replace(/_/g, ' ')] : []

  return {
    id: s.id,
    listingId: s.hotelId,
    roomId: s.roomId,
    dateWindow,
    currentRate,
    suggestedRate,
    confidence,
    rationale,
    hotelName: s.hotelName ?? null,
    roomName: s.roomName ?? null,
  }
}

function DemandMetric({ label, value, note }) {
  return (
    <div className="rounded-[22px] border border-gray-200 bg-[#fcfbf8] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-dark">{value ?? '—'}</p>
      {note && <p className="mt-1 text-xs leading-5 text-muted">{note}</p>}
    </div>
  )
}

export default function HostPricingAIPage() {
  const { primaryHotelId, loading: hostLoading } = useHostContext()
  const [suggestions, setSuggestions] = useState([])
  const [generating, setGenerating] = useState(false)

  const [demandData, setDemandData] = useState(null)
  const [demandLoading, setDemandLoading] = useState(false)

  const [competitorData, setCompetitorData] = useState(null)
  const [competitorLoading, setCompetitorLoading] = useState(false)

  const [seasonalData, setSeasonalData] = useState(null)

  useEffect(() => {
    if (hostLoading || !primaryHotelId) return

    getPricingSuggestions(primaryHotelId)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) setSuggestions(items.map(adaptSuggestion))
      })
      .catch(() => {})

    getPendingSuggestions(primaryHotelId)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) setSuggestions((prev) => {
          const existingIds = new Set(prev.map((s) => s.id))
          const newItems = items.map(adaptSuggestion).filter((s) => !existingIds.has(s.id))
          return [...prev, ...newItems]
        })
      })
      .catch(() => {})

    getSeasonalPricing(primaryHotelId)
      .then((data) => { if (data) setSeasonalData(data) })
      .catch(() => {})

    loadDemandAnalysis()
    loadCompetitorAnalysis()
  }, [primaryHotelId, hostLoading])

  function loadDemandAnalysis() {
    if (!primaryHotelId) return
    setDemandLoading(true)
    analyzeDemand(primaryHotelId)
      .then((data) => { if (data) setDemandData(data) })
      .catch(() => {})
      .finally(() => setDemandLoading(false))
  }

  function loadCompetitorAnalysis() {
    if (!primaryHotelId) return
    setCompetitorLoading(true)
    analyzeCompetitors(primaryHotelId)
      .then((data) => { if (data) setCompetitorData(data) })
      .catch(() => {})
      .finally(() => setCompetitorLoading(false))
  }

  async function handleGenerate() {
    if (!primaryHotelId) return
    setGenerating(true)
    try {
      const result = await generatePricingSuggestions({ hotelId: primaryHotelId })
      const items = result?.content ?? (Array.isArray(result) ? result : null)
      if (items?.length) setSuggestions(items.map(adaptSuggestion))
    } catch {
      // keep existing suggestions
    } finally {
      setGenerating(false)
    }
  }

  async function handleAccept(suggestion) {
    try {
      await acceptPricingSuggestion(suggestion.id)
    } catch {
      // optimistic
    } finally {
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
    }
  }

  async function handleReject(suggestion) {
    try {
      await rejectPricingSuggestion(suggestion.id)
    } catch {
      // optimistic
    } finally {
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
    }
  }

  const demandMetrics = demandData
    ? [
        { label: 'Search volume trend', value: demandData.searchVolumeTrend ?? demandData.searchTrend, note: demandData.searchNote },
        { label: 'Booking pace', value: demandData.bookingPace ?? demandData.pace, note: demandData.paceNote },
        { label: 'Demand score', value: demandData.demandScore ?? demandData.score, note: demandData.scoreNote },
        { label: 'Peak window', value: demandData.peakWindow ?? demandData.peakDates, note: demandData.peakNote },
      ].filter((m) => m.value)
    : []

  const competitorMetrics = competitorData
    ? [
        { label: 'Comp set avg rate', value: competitorData.avgRate ?? competitorData.competitorAvgRate, note: competitorData.rateNote },
        { label: 'Your position', value: competitorData.yourPosition ?? competitorData.position, note: competitorData.positionNote },
        { label: 'Comp set occupancy', value: competitorData.competitorOccupancy ?? competitorData.occupancy, note: competitorData.occupancyNote },
        { label: 'Price gap', value: competitorData.priceGap, note: competitorData.gapNote },
      ].filter((m) => m.value)
    : []

  return (
    <HostShell
      eyebrow="Pricing AI"
      title="Pricing suggestions"
      mobileTitle="Pricing AI"
      description="Review AI-generated rate changes based on demand, competitors, and seasonal trends."
      actions={[
        { label: 'Pricing rules', href: '/host/pricing', secondary: true },
        {
          label: generating ? 'Generating…' : 'Generate suggestions',
          onClick: handleGenerate,
        },
      ]}
    >
      <div className="space-y-5">
        <SectionCard>
          <SectionHeading
            eyebrow="Demand"
            title="Market demand analysis"
            description="Real-time signals from search trends, booking pace, and local events."
            action={
              <button
                type="button"
                onClick={loadDemandAnalysis}
                disabled={demandLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={14} className={demandLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            }
          />

          {demandLoading ? (
            <div className="mt-6 grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-[22px] bg-gray-100" />
              ))}
            </div>
          ) : demandMetrics.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {demandMetrics.map((m) => (
                <DemandMetric key={m.label} {...m} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-10 text-center">
              <TrendingUp size={28} className="text-gray-400" />
              <p className="text-sm font-semibold text-dark">No demand data yet</p>
              <p className="text-sm text-muted">Click Refresh to pull live market signals.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeading
            eyebrow="Competition"
            title="Competitor rate analysis"
            description="How your rates compare to similar listings in your markets."
            action={
              <button
                type="button"
                onClick={loadCompetitorAnalysis}
                disabled={competitorLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={14} className={competitorLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            }
          />

          {competitorLoading ? (
            <div className="mt-6 grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-[22px] bg-gray-100" />
              ))}
            </div>
          ) : competitorMetrics.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {competitorMetrics.map((m) => (
                <DemandMetric key={m.label} {...m} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-10 text-center">
              <Users size={28} className="text-gray-400" />
              <p className="text-sm font-semibold text-dark">No competitor data yet</p>
              <p className="text-sm text-muted">Click Refresh to compare against your comp set.</p>
            </div>
          )}
        </SectionCard>

        {seasonalData && (
          <SectionCard>
            <SectionHeading eyebrow="Seasonal" title="Seasonal pricing outlook" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(seasonalData.windows ?? seasonalData.seasons ?? []).map((w, i) => (
                <DemandMetric
                  key={i}
                  label={w.label ?? w.name ?? `Season ${i + 1}`}
                  value={w.suggestedAdjustment ?? w.adjustment ?? w.rate}
                  note={w.note ?? w.reason}
                />
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard>
          <SectionHeading
            eyebrow="Suggestions"
            title="Recommended rate changes"
            action={
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                <BarChart2 size={14} />
                {generating ? 'Generating…' : 'Generate new'}
              </button>
            }
          />

          {suggestions.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 py-12 text-center">
              <BarChart2 size={30} className="text-gray-400" />
              <p className="text-sm font-semibold text-dark">No pending suggestions</p>
              <p className="text-sm text-muted">Click "Generate new" to get AI rate recommendations.</p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {suggestions.map((suggestion) => {
                const listingTitle = suggestion.hotelName ?? '—'
                const roomName = suggestion.roomName ?? '—'

                return (
                  <div key={suggestion.id} className="py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-dark">{listingTitle}</p>
                          <StatusPill tone={suggestion.confidence === 'High' ? 'success' : 'sky'}>
                            {suggestion.confidence}
                          </StatusPill>
                        </div>
                        <p className="mt-2 text-sm text-muted">
                          {roomName} · {suggestion.dateWindow}
                        </p>
                        {suggestion.rationale.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {suggestion.rationale.map((item) => (
                              <StatusPill key={item} tone="sky">{item}</StatusPill>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          Current to suggested
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                          {suggestion.currentRate} → {suggestion.suggestedRate}
                        </p>
                        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                          <button
                            onClick={() => handleReject(suggestion)}
                            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(suggestion)}
                            className="inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </HostShell>
  )
}
