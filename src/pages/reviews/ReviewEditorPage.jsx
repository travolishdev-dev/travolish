import { useEffect, useState } from 'react'
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

const reviewCategories = ['Cleanliness', 'Accuracy', 'Communication', 'Location', 'Check-in', 'Value']

const reviewTags = [
  'Great location', 'Spotless', 'Fast check-in', 'Responsive host',
  'Good value', 'Quiet', 'Great amenities', 'Accurate listing',
  'Comfortable beds', 'Would return',
]

function placeholderImage(hotelId) {
  return PLACEHOLDER_IMAGES[(Number(hotelId) || 0) % PLACEHOLDER_IMAGES.length]
}

export default function ReviewEditorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hotelId = searchParams.get('hotelId')

  const [hotel, setHotel] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const [overallRating, setOverallRating] = useState(5)
  const [scores, setScores] = useState(
    reviewCategories.reduce((acc, cat) => ({ ...acc, [cat]: 5 }), {})
  )
  const [selectedTags, setSelectedTags] = useState(reviewTags.slice(0, 3))
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [published, setPublished] = useState(null)

  useEffect(() => {
    if (!hotelId) return
    getHotel(hotelId)
      .then(setHotel)
      .catch(() => setLoadError('Could not load property details.'))
  }, [hotelId])

  const toggleTag = (tag) =>
    setSelectedTags((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]
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
      setSubmitError('Failed to publish review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hotelId) {
    return (
      <PortalShell
        eyebrow="Review"
        title="No property specified."
        actions={[{ label: 'Back to trips', href: '/trips' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            Open this page from a completed trip — the property link is set automatically.
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  if (loadError) {
    return (
      <PortalShell eyebrow="Review" title="Property not found." actions={[{ label: 'Back to trips', href: '/trips' }]}>
        <SectionCard>
          <p className="text-sm text-muted">{loadError}</p>
        </SectionCard>
      </PortalShell>
    )
  }

  if (published) {
    return (
      <PortalShell eyebrow="Review" title="Review published!" accent="from-emerald-50 via-white to-sky-50"
        actions={[
          { label: 'Back to trips', href: '/trips', secondary: true },
          { label: `View ${hotel?.name || 'property'}`, href: `/property/${hotelId}` },
        ]}
      >
        <SectionCard>
          <div className="flex flex-col items-center py-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-dark">Thanks for your review!</h2>
            <p className="mt-2 text-sm text-muted max-w-sm">
              Your {overallRating}-star review of{' '}
              <span className="font-semibold text-dark">{hotel?.name || `Hotel #${hotelId}`}</span>{' '}
              has been submitted and is pending approval.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/property/${hotelId}`)}
                className="px-5 py-2.5 bg-dark text-white text-sm font-semibold rounded-full hover:opacity-90 transition-all"
              >
                View property
              </button>
              <button
                onClick={() => navigate('/trips')}
                className="px-5 py-2.5 border border-gray-200 text-dark text-sm font-semibold rounded-full hover:bg-gray-50 transition-all"
              >
                Back to trips
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
      eyebrow="Write Review"
      title="Write your stay review."
      mobileTitle="Write review"
      description="Share your experience to help future guests."
      actions={[
        { label: 'Back to trips', href: '/trips', secondary: true },
      ]}
      stats={[
        { label: 'Overall rating', value: `${overallRating}.0`, note: hotel?.city || '' },
        { label: 'Selected tags', value: String(selectedTags.length), note: 'Highlights' },
        { label: 'Property', value: hotel?.name || `#${hotelId}`, note: hotel?.country || '' },
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
              <StatusPill tone="brand">New review</StatusPill>
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
              Open property page
            </Link>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <SectionHeading
              eyebrow="Preview"
              title="How the published card could read"
              description="Validate spacing and tone before submitting."
            />

            <div className="mt-6 rounded-[26px] border border-gray-200 bg-[#fcfcfb] p-5">
              <div className="flex items-center gap-2">
                {Array.from({ length: overallRating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-dark text-dark" />
                ))}
              </div>
              <p className="mt-4 text-xl font-semibold tracking-tight text-dark">
                {title || 'Your review title…'}
              </p>
              <p className="mt-3 text-sm leading-7 text-dark">
                {summary || 'Your review body…'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <StatusPill key={tag} tone="sky">{tag}</StatusPill>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-dashed border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Helpful votes, host replies, and moderation states can all extend from this review model later.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Overall Experience"
              title="Start with the headline impression"
              description="The strongest review flows feel composed, not overwhelming."
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
              {reviewCategories.map((category) => (
                <div key={category} className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-dark">{category}</p>
                    <StatusPill tone="sky">{scores[category]}.0</StatusPill>
                  </div>
                  <input
                    type="range" min="1" max="5" step="1"
                    value={scores[category]}
                    onChange={(e) => setScores((cur) => ({ ...cur, [category]: Number(e.target.value) }))}
                    className="mt-4 w-full accent-[#222222]"
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Written Review"
              title="Shape the actual story"
              description="Short fields keep this usable on mobile while still supporting a richer published review."
            />

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Review title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Thoughtful, easy stay with great host communication"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Review body
                </span>
                <textarea
                  rows={7}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe what made your stay special…"
                  className="min-h-[180px] w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base leading-7 text-dark outline-none transition-colors focus:border-dark md:text-sm"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading eyebrow="Highlights" title="What stood out" description="Tags give the published card a stronger visual summary." />

            <div className="mt-6 flex flex-wrap gap-3">
              {reviewTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isSelected ? 'bg-dark text-white' : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    {tag}
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
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Publishing…</> : 'Publish review'}
          </button>
        </div>
      </div>
    </PortalShell>
  )
}
