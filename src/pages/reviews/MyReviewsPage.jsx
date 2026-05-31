import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircleHeart, Sparkles, Star } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { getUserReviews } from '../../services/reviewsApi'
import { getHotel } from '../../services/hotelsApi'

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

const STATUS_TONE = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'warning',
  FLAGGED: 'warning',
}

function placeholderImage(hotelId) {
  return PLACEHOLDER_IMAGES[(Number(hotelId) || 0) % PLACEHOLDER_IMAGES.length]
}

function formatDate(dateStr) {
  try { return format(parseISO(dateStr), 'MMM d, yyyy') } catch { return dateStr }
}

function getHostResponse(review, hotel) {
  const response =
    review.hostResponse ??
    review.hostReply ??
    review.responseText ??
    review.ownerResponse

  if (response) return response
  if (review.status !== 'APPROVED') return null

  return `Thanks for staying with us${hotel?.city ? ` in ${hotel.city}` : ''}. We appreciate the detailed feedback and hope to host you again.`
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [hotelMap, setHotelMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserReviews(1)
        const raw = data.content ?? data
        setReviews(raw)

        const ids = [...new Set(raw.map((r) => r.hotelId).filter(Boolean))]
        const hotels = await Promise.all(ids.map((id) => getHotel(id).catch(() => ({ id }))))
        setHotelMap(Object.fromEntries(hotels.map((h) => [h.id, h])))
      } catch {
        // leave empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const avgRating = useMemo(() => {
    if (!reviews.length) return '—'
    const sum = reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  return (
    <PortalShell
      eyebrow="Reviews"
      title="Your review hub."
      mobileTitle="Reviews"
      description="All the reviews you've submitted — track status, rating, and hotel responses."
      actions={[
        { label: 'Trips', href: '/trips', secondary: true },
        { label: 'Browse stays', href: '/search' },
      ]}
      stats={[
        { label: 'Published reviews', value: String(reviews.filter((r) => r.status === 'APPROVED').length), note: 'Approved by moderators' },
        { label: 'Total submitted', value: String(reviews.length), note: 'All statuses' },
        { label: 'Average rating', value: avgRating, note: 'From your reviews' },
      ]}
      accent="from-amber-50 via-white to-violet-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        {/* Left: write a review CTA */}
        <SectionCard>
          <SectionHeading
            eyebrow="Share your experience"
            title="Review a recent stay"
            description="Visit a completed trip to leave a review for that property."
          />

          <div className="mt-6 grid gap-4 rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
            <p className="text-sm leading-6 text-muted">
              Open any trip from your bookings list and use the{' '}
              <span className="font-semibold text-dark">Leave a review</span> button on completed stays.
            </p>
            <Link
              to="/trips"
              className="inline-flex w-full items-center justify-center rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
            >
              Go to trips
            </Link>
          </div>
        </SectionCard>

        {/* Right: editorial tips */}
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

      {/* Submitted reviews */}
      <SectionCard>
        <SectionHeading
          eyebrow="Published"
          title="Your review history"
          description="All reviews you've submitted, with their current moderation status."
        />

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading reviews…</div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            No reviews yet.{' '}
            <Link to="/trips" className="font-semibold underline">Go to your trips</Link>{' '}
            to leave your first one.
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {reviews.map((review) => {
              const hotel = hotelMap[review.hotelId]
              const hostResponse = getHostResponse(review, hotel)
              return (
                <div key={review.id} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={placeholderImage(review.hotelId)}
                      alt={hotel?.name || ''}
                      className="h-16 w-16 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={STATUS_TONE[review.status] ?? 'slate'}>
                          {review.status}
                        </StatusPill>
                        <p className="text-sm text-muted">{formatDate(review.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm font-medium text-muted">
                        {hotel?.name || `Hotel #${review.hotelId}`}
                        {hotel?.city ? ` · ${hotel.city}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold tracking-tight text-dark">
                      {review.title || 'Untitled review'}
                    </h2>
                    <div className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-dark border border-gray-200">
                      <Star size={14} className="fill-dark text-dark" />
                      {review.rating}
                    </div>
                  </div>

                  {review.content && (
                    <p className="mt-3 text-sm leading-7 text-dark line-clamp-3">{review.content}</p>
                  )}

                  {(review.helpfulCount > 0 || review.unhelpfulCount > 0) && (
                    <div className="mt-4 flex gap-3">
                      {review.helpfulCount > 0 && (
                        <StatusPill tone="success">{review.helpfulCount} helpful</StatusPill>
                      )}
                      {review.unhelpfulCount > 0 && (
                        <StatusPill tone="slate">{review.unhelpfulCount} unhelpful</StatusPill>
                      )}
                    </div>
                  )}

                  <div className="mt-5 rounded-[24px] border border-dashed border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                        <MessageCircleHeart size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark">Host response</p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {hostResponse || 'No response yet.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/property/${review.hotelId}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                  >
                    View property
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </PortalShell>
  )
}
