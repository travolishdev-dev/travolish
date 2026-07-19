import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import useAuthStore from '../../stores/useAuthStore'

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
  REJECTED: 'danger',
  FLAGGED: 'warning',
}

const STATUS_LABEL = {
  APPROVED: 'Approved',
  PENDING: 'Pending review',
  REJECTED: 'Not published',
  FLAGGED: 'Under review',
}

function placeholderImage(hotelId) {
  return PLACEHOLDER_IMAGES[(Number(hotelId) || 0) % PLACEHOLDER_IMAGES.length]
}

function formatDate(dateStr) {
  try { return format(parseISO(dateStr), 'MMM d, yyyy') } catch { return dateStr }
}

function getHostResponse(review) {
  return (
    review.hostResponse ??
    review.hostReply ??
    review.responseText ??
    review.ownerResponse ??
    null
  )
}

export default function MyReviewsPage() {
  const { t } = useTranslation('property')
  const backendUserId = useAuthStore((s) => s.backendUserId)
  const [reviews, setReviews] = useState([])
  const [hotelMap, setHotelMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!backendUserId) { setLoading(false); return }
    async function load() {
      try {
        const data = await getUserReviews(backendUserId)
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
  }, [backendUserId])

  const avgRating = useMemo(() => {
    if (!reviews.length) return '—'
    const sum = reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  return (
    <PortalShell
      eyebrow={t('property:myReviews.eyebrow')}
      title={t('property:myReviews.title')}
      mobileTitle={t('property:myReviews.mobileTitle')}
      description={t('property:myReviews.desc')}
      actions={[
        { label: t('property:myReviews.tripsLink'), href: '/trips', secondary: true },
        { label: t('property:myReviews.browseStays'), href: '/search' },
      ]}
      stats={[
        { label: t('property:myReviews.publishedCount'), value: String(reviews.filter((r) => r.status === 'APPROVED').length), note: t('property:myReviews.publishedNote') },
        { label: t('property:myReviews.totalSubmitted'), value: String(reviews.length), note: t('property:myReviews.allStatuses') },
        { label: t('property:myReviews.avgRating'), value: avgRating, note: t('property:myReviews.fromYourReviews') },
      ]}
      accent="from-amber-50 via-white to-violet-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        {/* Left: write a review CTA */}
        <SectionCard>
          <SectionHeading
            eyebrow={t('property:myReviews.shareEyebrow')}
            title={t('property:myReviews.shareTitle')}
            description={t('property:myReviews.shareDesc')}
          />

          <div className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5">
            <p className="text-sm leading-6 text-muted">
              {t('property:myReviews.shareHintPre')}{' '}
              <span className="font-semibold text-dark">{t('property:myReviews.shareHintAction')}</span>{' '}
              {t('property:myReviews.shareHintPost')}
            </p>
            <Link
              to="/trips"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:w-auto"
            >
              {t('property:myReviews.goToTrips')}
            </Link>
          </div>
        </SectionCard>

        {/* Right: editorial tips */}
        <SectionCard className="hidden md:block">
          <SectionHeading
            eyebrow={t('property:myReviews.toneEyebrow')}
            title={t('property:myReviews.toneTitle')}
          />

          <div className="mt-6 space-y-3">
            {[
              t('property:myReviews.tip1'),
              t('property:myReviews.tip2'),
              t('property:myReviews.tip3'),
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3"
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 text-brand">
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
          eyebrow={t('property:myReviews.publishedEyebrow')}
          title={t('property:myReviews.publishedTitle')}
          description={t('property:myReviews.publishedDesc')}
        />

        {loading && (
          <div className="py-16 text-center text-sm text-muted">{t('property:myReviews.loading')}</div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            {t('property:myReviews.noReviews')}{' '}
            <Link to="/trips" className="font-semibold underline">{t('property:myReviews.goToTripsLink')}</Link>{' '}
            {t('property:myReviews.noReviewsEnd')}
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {reviews.map((review) => {
              const hotel = hotelMap[review.hotelId]
              const hostResponse = getHostResponse(review)
              return (
                <div key={review.id} className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={placeholderImage(review.hotelId)}
                      alt={hotel?.name || ''}
                      className="h-16 w-16 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={STATUS_TONE[review.status] ?? 'slate'}>
                          {STATUS_LABEL[review.status] ?? review.status}
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
                      {review.title || t('property:myReviews.untitledReview')}
                    </h2>
                    <div className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-dark border border-gray-200">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {review.rating}
                    </div>
                  </div>

                  {review.content && (
                    <p className="mt-3 text-sm leading-7 text-dark line-clamp-3">{review.content}</p>
                  )}

                  {(review.helpfulCount > 0 || review.unhelpfulCount > 0) && (
                    <div className="mt-4 flex gap-3">
                      {review.helpfulCount > 0 && (
                        <StatusPill tone="success">{t('property:myReviews.helpfulLabel', { count: review.helpfulCount })}</StatusPill>
                      )}
                      {review.unhelpfulCount > 0 && (
                        <StatusPill tone="slate">{t('property:myReviews.unhelpfulLabel', { count: review.unhelpfulCount })}</StatusPill>
                      )}
                    </div>
                  )}

                  {hostResponse && (
                    <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                          <MessageCircleHeart size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-dark">{t('property:myReviews.hostResponse')}</p>
                          <p className="mt-1 text-sm leading-6 text-muted">{hostResponse}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/property/${review.hotelId}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                  >
                    {t('property:myReviews.viewProperty')}
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
