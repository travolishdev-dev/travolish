import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, Sparkles, Star } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { getHotel } from '../../services/hotelsApi'
import { submitReview } from '../../services/reviewsApi'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop',
]

const REVIEW_CATEGORY_IDS = ['cleanliness', 'accuracy', 'communication', 'location', 'checkIn', 'value']

const REVIEW_TAG_IDS = [
  'greatLocation', 'spotless', 'fastCheckIn', 'responsiveHost',
  'goodValue', 'quiet', 'greatAmenities', 'accurateListing',
  'comfortableBeds', 'wouldReturn',
]

function placeholderImage(hotelId) {
  return PLACEHOLDER_IMAGES[(Number(hotelId) || 0) % PLACEHOLDER_IMAGES.length]
}

export default function ReviewEditorPage() {
  const { t } = useTranslation('property')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hotelId = searchParams.get('hotelId')

  const [hotel, setHotel] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const [overallRating, setOverallRating] = useState(5)
  const [scores, setScores] = useState(
    REVIEW_CATEGORY_IDS.reduce((acc, id) => ({ ...acc, [id]: 5 }), {})
  )
  const [selectedTags, setSelectedTags] = useState(REVIEW_TAG_IDS.slice(0, 3))
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [published, setPublished] = useState(null)

  useEffect(() => {
    if (!hotelId) return
    getHotel(hotelId)
      .then(setHotel)
      .catch(() => setLoadError(t('property:review.loadError')))
  }, [hotelId])

  const reviewCategories = useMemo(() =>
    REVIEW_CATEGORY_IDS.map((id) => ({ id, label: t(`property:review.category.${id}`) })),
    [t]
  )

  const reviewTags = useMemo(() =>
    REVIEW_TAG_IDS.map((id) => ({ id, label: t(`property:review.tag.${id}`) })),
    [t]
  )

  const toggleTag = (tagId) =>
    setSelectedTags((cur) =>
      cur.includes(tagId) ? cur.filter((id) => id !== tagId) : [...cur, tagId]
    )

  const handleSubmit = async () => {
    if (!hotelId || !title.trim() || !summary.trim()) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await submitReview(hotelId, {
        title: title.trim(),
        content: summary.trim(),
        rating: overallRating,
      })
      setPublished(result)
    } catch {
      setSubmitError(t('property:review.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hotelId) {
    return (
      <PortalShell
        eyebrow={t('property:review.eyebrow')}
        title={t('property:review.noPropertyTitle')}
        actions={[{ label: t('property:review.backToTrips'), href: '/trips' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            {t('property:review.noPropertyDesc')}
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  if (loadError) {
    return (
      <PortalShell eyebrow={t('property:review.eyebrow')} title={t('property:review.notFoundTitle')} actions={[{ label: t('property:review.backToTrips'), href: '/trips' }]}>
        <SectionCard>
          <p className="text-sm text-muted">{loadError}</p>
        </SectionCard>
      </PortalShell>
    )
  }

  if (published) {
    return (
      <PortalShell eyebrow={t('property:review.eyebrow')} title={t('property:review.publishedTitle')} accent="from-emerald-50 via-white to-sky-50"
        actions={[
          { label: t('property:review.backToTrips'), href: '/trips', secondary: true },
          { label: t('property:review.viewPropertyNamed', { name: hotel?.name || `#${hotelId}` }), href: `/property/${hotelId}` },
        ]}
      >
        <SectionCard>
          <div className="flex flex-col items-center py-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-dark">{t('property:review.publishedThanks')}</h2>
            <p className="mt-2 text-sm text-muted max-w-sm">
              {t('property:review.publishedDesc', { rating: overallRating, name: hotel?.name || `Hotel #${hotelId}` })}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/property/${hotelId}`)}
                className="px-5 py-2.5 bg-dark text-white text-sm font-semibold rounded-full hover:opacity-90 transition-all"
              >
                {t('property:review.viewProperty')}
              </button>
              <button
                onClick={() => navigate('/trips')}
                className="px-5 py-2.5 border border-gray-200 text-dark text-sm font-semibold rounded-full hover:bg-gray-50 transition-all"
              >
                {t('property:review.backToTrips')}
              </button>
            </div>
          </div>
        </SectionCard>
      </PortalShell>
    )
  }

  const canSubmit = title.trim().length > 0 && summary.trim().length > 0 && !isSubmitting

  return (
    <PortalShell
      eyebrow={t('property:review.writeEyebrow')}
      title={t('property:review.writeTitle')}
      mobileTitle={t('property:review.writeMobileTitle')}
      description={t('property:review.writeDesc')}
      actions={[
        { label: t('property:review.backToTrips'), href: '/trips', secondary: true },
      ]}
      stats={[
        { label: t('property:review.statOverall'), value: `${overallRating}.0`, note: hotel?.city || '' },
        { label: t('property:review.statTags'), value: String(selectedTags.length), note: t('property:review.statHighlights') },
        { label: t('property:review.statProperty'), value: hotel?.name || `#${hotelId}`, note: hotel?.country || '' },
      ]}
      accent="from-rose-50 via-white to-sky-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-first space-y-6 xl:order-last">
          <SectionCard>
            <img
              src={placeholderImage(hotelId)}
              alt={hotel?.name || ''}
              className="aspect-[4/3] w-full rounded-[24px] object-cover"
            />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">{t('property:review.newReview')}</StatusPill>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-dark">
              {hotel?.name || `Hotel #${hotelId}`}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {[hotel?.city, hotel?.country].filter(Boolean).join(', ')}
            </p>

            <Link
              to={`/property/${hotelId}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
            >
              {t('property:review.openPropertyPage')}
            </Link>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <SectionHeading
              eyebrow={t('property:review.previewEyebrow')}
              title={t('property:review.previewTitle')}
              description={t('property:review.previewDesc')}
            />

            <div className="mt-6 rounded-[26px] border border-gray-200 bg-[#fcfcfb] p-5">
              <div className="flex items-center gap-2">
                {Array.from({ length: overallRating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-dark text-dark" />
                ))}
              </div>
              <p className="mt-4 text-xl font-semibold tracking-tight text-dark">
                {title || t('property:review.previewTitlePlaceholder')}
              </p>
              <p className="mt-3 text-sm leading-7 text-dark">
                {summary || t('property:review.previewBodyPlaceholder')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const found = reviewTags.find((rt) => rt.id === tagId)
                  return <StatusPill key={tagId} tone="sky">{found?.label ?? tagId}</StatusPill>
                })}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-dashed border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  {t('property:review.futureNote')}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow={t('property:review.overallEyebrow')}
              title={t('property:review.overallTitle')}
              description={t('property:review.overallDesc')}
            />

            <div className="mt-6 flex flex-wrap gap-3">
              {Array.from({ length: 5 }).map((_, i) => {
                const score = i + 1
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setOverallRating(score)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                      overallRating === score
                        ? 'bg-dark text-white'
                        : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    <Star size={15} className={overallRating === score ? 'fill-white' : 'fill-dark'} />
                    {score}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviewCategories.map(({ id, label }) => (
                <div key={id} className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-dark">{label}</p>
                    <StatusPill tone="sky">{scores[id]}.0</StatusPill>
                  </div>
                  <input
                    type="range" min="1" max="5" step="1"
                    value={scores[id]}
                    onChange={(e) => setScores((cur) => ({ ...cur, [id]: Number(e.target.value) }))}
                    className="mt-4 w-full accent-[#222222]"
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow={t('property:review.writtenEyebrow')}
              title={t('property:review.writtenTitle')}
              description={t('property:review.writtenDesc')}
            />

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {t('property:review.titleLabel')}
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('property:review.titlePlaceholder')}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {t('property:review.bodyLabel')}
                </span>
                <textarea
                  rows={7}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={t('property:review.bodyPlaceholder')}
                  className="min-h-[180px] w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base leading-7 text-dark outline-none transition-colors focus:border-dark md:text-sm"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow={t('property:review.highlightsEyebrow')} title={t('property:review.highlightsTitle')} description={t('property:review.highlightsDesc')} />

            <div className="mt-6 flex flex-wrap gap-3">
              {reviewTags.map(({ id, label }) => {
                const isSelected = selectedTags.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleTag(id)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isSelected ? 'bg-dark text-white' : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </SectionCard>

          {submitError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{submitError}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> {t('property:review.publishing')}</> : t('property:review.publishReview')}
          </button>
        </div>
      </div>
    </PortalShell>
  )
}
