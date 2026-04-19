import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Sparkles, Star } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import {
  findBooking,
  findBookingByReview,
  findReview,
  reviewCategories,
  reviewTags,
} from '../../data/mockPortalData'
import { properties } from '../../data/mockData'

function propertyById(propertyId) {
  return properties.find((property) => property.id === propertyId)
}

export default function ReviewEditorPage() {
  const { reviewId } = useParams()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const existingReview = reviewId ? findReview(reviewId) : null
  const bookingFromExisting = reviewId ? findBookingByReview(reviewId) : null
  const activeBooking = bookingId ? findBooking(bookingId) : bookingFromExisting
  const activeProperty =
    activeBooking?.property || propertyById(existingReview?.propertyId)

  const initialScores = useMemo(() => {
    if (existingReview?.categoryScores) {
      return existingReview.categoryScores
    }

    return reviewCategories.reduce(
      (scores, category) => ({ ...scores, [category]: 5 }),
      {},
    )
  }, [existingReview])

  const [overallRating, setOverallRating] = useState(existingReview?.rating || 5)
  const [scores, setScores] = useState(initialScores)
  const [selectedTags, setSelectedTags] = useState(
    reviewTags.filter((_, index) => index < 3),
  )
  const [title, setTitle] = useState(
    existingReview?.title || 'Thoughtful, easy stay with strong host communication',
  )
  const [summary, setSummary] = useState(
    existingReview?.summary ||
      'The design felt elevated, arrival was smooth, and the host reached out at exactly the right moments without overdoing it.',
  )

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  if (!activeProperty) {
    return (
      <PortalShell
        eyebrow="Review"
        title="Review target not found."
        description="Use a valid booking or review id from the mock data to preview this form."
        actions={[{ label: 'Back to reviews', href: '/reviews/me' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            The review form is ready, but it needs either a known booking id or a
            known review id.
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  return (
    <PortalShell
      eyebrow={existingReview ? 'Edit Review' : 'Write Review'}
      title={`${existingReview ? 'Refine' : 'Write'} your stay review.`}
      mobileTitle={existingReview ? 'Edit review' : 'Write review'}
      description="This form covers guest reviews, scoring detail, and host-facing feedback. It is styled to feel premium now and can connect directly to the review APIs later."
      mobileAction={{
        label: existingReview ? 'Save' : 'Publish',
        href: '/reviews/me',
      }}
      mobileBottomAction={{
        label: existingReview ? 'Save review' : 'Publish review',
        href: '/reviews/me',
      }}
      actions={[
        { label: 'Back to reviews', href: '/reviews/me', secondary: true },
        {
          label: existingReview ? 'Save changes' : 'Publish review',
          href: '/reviews/me',
        },
      ]}
      stats={[
        {
          label: 'Overall rating',
          value: `${overallRating}.0`,
          note: activeProperty.location,
        },
        {
          label: 'Selected tags',
          value: String(selectedTags.length),
          note: 'Used for summary highlights',
        },
        {
          label: 'Stay reference',
          value: activeBooking?.id || existingReview?.bookingId || 'Mock review',
          note: activeBooking?.dateLabel || 'Previous stay',
        },
      ]}
      accent="from-rose-50 via-white to-sky-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-first space-y-6 xl:order-last">
          <SectionCard>
            <img
              src={activeProperty.image}
              alt={activeProperty.title}
              className="aspect-[4/3] w-full rounded-[24px] object-cover"
            />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">
                {existingReview ? 'Editing existing review' : 'New review'}
              </StatusPill>
              {activeBooking ? (
                <StatusPill tone="success">{activeBooking.dateLabel}</StatusPill>
              ) : null}
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-dark">
              {activeProperty.title}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {activeProperty.location}, {activeProperty.country}
            </p>

            <Link
              to={`/property/${activeProperty.id}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
            >
              Open property page
            </Link>
          </SectionCard>

          <SectionCard className="hidden md:block">
            <SectionHeading
              eyebrow="Preview"
              title="How the published card could read"
              description="This side panel helps validate spacing, tone, and typography before real persistence exists."
            />

            <div className="mt-6 rounded-[26px] border border-gray-200 bg-[#fcfcfb] p-5">
              <div className="flex items-center gap-2">
                {Array.from({ length: overallRating }).map((_, index) => (
                  <Star key={index} size={14} className="fill-dark text-dark" />
                ))}
              </div>
              <p className="mt-4 text-xl font-semibold tracking-tight text-dark">
                {title}
              </p>
              <p className="mt-3 text-sm leading-7 text-dark">{summary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <StatusPill key={tag} tone="sky">
                    {tag}
                  </StatusPill>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-dashed border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Helpful votes, host replies, and moderation states can all extend
                  from this review model later without changing the screen layout.
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
              description="The strongest review flows feel composed, not overwhelming, so this form keeps the first decision simple."
            />

            <div className="mt-6 flex flex-wrap gap-3">
              {Array.from({ length: 5 }).map((_, index) => {
                const score = index + 1

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
                    <Star
                      size={15}
                      className={overallRating === score ? 'fill-white' : 'fill-dark'}
                    />
                    {score}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviewCategories.map((category) => (
                <div
                  key={category}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-dark">{category}</p>
                    <StatusPill tone="sky">{scores[category]}.0</StatusPill>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={scores[category]}
                    onChange={(event) =>
                      setScores((current) => ({
                        ...current,
                        [category]: Number(event.target.value),
                      }))
                    }
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
              description="Short fields keep this usable on mobile while still supporting a richer published review later."
            />

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Review title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
                  onChange={(event) => setSummary(event.target.value)}
                  className="min-h-[180px] w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base leading-7 text-dark outline-none transition-colors focus:border-dark md:text-sm"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Highlights"
              title="What stood out"
              description="Tags give the final published card a stronger visual summary."
            />

            <div className="mt-6 flex flex-wrap gap-3">
              {reviewTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-dark text-white'
                        : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
