import { Link } from 'react-router-dom'
import { MessageCircleHeart, Sparkles, Star } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import {
  pendingReviewPrompts,
  submittedReviews,
} from '../../data/mockPortalData'
import { properties } from '../../data/mockData'

function propertyForReview(propertyId) {
  return properties.find((property) => property.id === propertyId)
}

export default function MyReviewsPage() {
  return (
    <PortalShell
      eyebrow="Reviews"
      title="Your review hub."
      mobileTitle="Reviews"
      description="This mock page covers both submitted reviews and outstanding prompts, matching the backend review module without needing the APIs wired yet."
      actions={[
        { label: 'Trips', href: '/trips', secondary: true },
        {
          label: pendingReviewPrompts[0]
            ? `Review ${pendingReviewPrompts[0].property.title}`
            : 'Browse stays',
          href: pendingReviewPrompts[0]
            ? `/reviews/new?bookingId=${pendingReviewPrompts[0].id}`
            : '/search',
        },
      ]}
      stats={[
        {
          label: 'Published reviews',
          value: String(submittedReviews.length),
          note: 'Across recent stays',
        },
        {
          label: 'Pending prompts',
          value: String(pendingReviewPrompts.length),
          note: 'Ready to complete',
        },
        { label: 'Average rating', value: '4.5', note: 'From your published reviews' },
      ]}
      accent="from-amber-50 via-white to-violet-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <SectionCard>
          <SectionHeading
            eyebrow="Pending"
            title="Reviews waiting for you"
            description="These cards should feel enticing enough that guests actually finish the flow."
          />

          <div className="mt-6 space-y-4">
            {pendingReviewPrompts.map((booking) => (
              <div
                key={booking.id}
                className="grid gap-4 rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-4 md:grid-cols-[120px_minmax(0,1fr)] md:p-5"
              >
                <img
                  src={booking.property.image}
                  alt={booking.property.title}
                  className="h-28 w-full rounded-[22px] object-cover md:h-full"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="warning">Review needed</StatusPill>
                    <p className="text-sm text-muted">{booking.dateLabel}</p>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                    {booking.property.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Help future guests understand what made this stay easy, calm, or
                    worth the price.
                  </p>
                  <Link
                    to={`/reviews/new?bookingId=${booking.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
                  >
                    Write review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="hidden md:block">
          <SectionHeading
            eyebrow="Review tone"
            title="What strong guest reviews usually do"
            description="A lightweight editorial guideline makes the review system feel intentional."
          />

          <div className="mt-6 space-y-3">
            {[
              'Describe arrival, cleanliness, and host communication clearly.',
              'Call out what made the stay memorable or practical.',
              'Mention who the place is ideal for when that is obvious.',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-4 py-3"
              >
                <div className="rounded-full bg-rose-100 p-1.5 text-brand">
                  <Sparkles size={12} />
                </div>
                <p className="text-sm leading-6 text-dark">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionHeading
          eyebrow="Published"
          title="Your review history"
          description="Review cards use more breathing room and stronger typography so they feel closer to a polished editorial archive."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {submittedReviews.map((review) => {
            const property = propertyForReview(review.propertyId)

            return (
              <div
                key={review.id}
                className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="success">{review.status}</StatusPill>
                  <p className="text-sm text-muted">{review.submittedAt}</p>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-dark">
                      {review.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {property?.title || 'Previous stay'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-dark">
                    <Star size={14} className="fill-dark text-dark" />
                    {review.rating}.0
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-dark">{review.summary}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {Object.entries(review.categoryScores).map(([label, score]) => (
                    <StatusPill key={label} tone="sky">
                      {label}: {score}
                    </StatusPill>
                  ))}
                </div>

                <div className="mt-5 rounded-[24px] border border-dashed border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                      <MessageCircleHeart size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">Host response</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {review.hostResponse}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/reviews/${review.id}/edit`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                >
                  Edit review
                </Link>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </PortalShell>
  )
}
