import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { HostShell, SectionCard, SectionHeading } from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import { submitGuestReview } from '../../services/reviewsApi'
import useAuthStore from '../../stores/useAuthStore'

const CATEGORIES = [
  { key: 'cleanlinessRating', label: 'Cleanliness', description: 'Did the guest keep the property tidy?' },
  { key: 'behaviorRating',    label: 'Behaviour',   description: 'Were they respectful and cooperative?' },
  { key: 'theftRating',       label: 'Honesty',     description: 'Did the guest handle property items responsibly? (5 = no issues)' },
]

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-2 transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={`transition-colors ${
              n <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function HostGuestReviewPage() {
  const { guestId } = useParams()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const hotelId   = searchParams.get('hotelId')
  const guestName = searchParams.get('guestName') ?? 'your guest'

  const navigate = useNavigate()
  const hostUserId = useAuthStore((s) => s.backendUserId)

  const [overall, setOverall]   = useState(0)
  const [ratings, setRatings]   = useState({ cleanlinessRating: 0, behaviorRating: 0, theftRating: 0 })
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [saving, setSaving]     = useState(false)

  const setCategory = (key, val) => setRatings((prev) => ({ ...prev, [key]: val }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!overall) { toast.error('Please set an overall rating.'); return }
    if (!title.trim()) { toast.error('Please add a review title.'); return }
    if (!content.trim()) { toast.error('Please write a short review.'); return }
    if (!bookingId) { toast.error('Missing booking reference.'); return }

    setSaving(true)
    try {
      await submitGuestReview(
        guestId,
        bookingId,
        {
          title: title.trim(),
          content: content.trim(),
          rating: overall,
          hotelId: hotelId ? Number(hotelId) : null,
          cleanlinessRating: ratings.cleanlinessRating || null,
          theftRating:       ratings.theftRating       || null,
          behaviorRating:    ratings.behaviorRating     || null,
        },
        hostUserId,
      )
      toast.success('Guest review submitted for moderation.')
      navigate('/host/bookings')
    } catch (err) {
      const already = err?.message?.includes('already')
      toast.error(already ? 'You have already reviewed this guest for this booking.' : 'Could not submit review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HostShell
      eyebrow="Bookings"
      title={`Review ${guestName}`}
      mobileTitle="Review guest"
      description="Your feedback helps maintain a trusted community."
      actions={[{ label: 'Back to bookings', href: '/host/bookings', secondary: true }]}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <SectionCard>
          <SectionHeading eyebrow="Step 1" title="Overall rating" description="How was your experience hosting this guest overall?" />
          <div className="mt-5 flex items-center gap-4">
            <StarPicker value={overall} onChange={setOverall} />
            {overall > 0 && (
              <span className="text-sm font-semibold text-dark">
                {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][overall]}
              </span>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading eyebrow="Step 2" title="Category ratings" description="Rate specific aspects of the stay (optional)." />
          <div className="mt-5 divide-y divide-gray-200">
            {CATEGORIES.map(({ key, label, description }) => (
              <div key={key} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-dark">{label}</p>
                  <p className="text-xs text-muted">{description}</p>
                </div>
                <StarPicker value={ratings[key]} onChange={(v) => setCategory(key, v)} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading eyebrow="Step 3" title="Written review" description="A short, honest description of the stay." />
          <div className="mt-5 space-y-4">
            <HostField
              label="Review title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Great guest, would welcome again"
            />
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark">Review</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your experience hosting this guest…"
                rows={5}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3.5 text-base md:text-sm text-dark outline-none focus:border-dark focus:ring-1 focus:ring-dark"
              />
              <p className="mt-1 text-xs text-muted">{content.length}/2000</p>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate('/host/bookings')}
            className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </form>
    </HostShell>
  )
}
