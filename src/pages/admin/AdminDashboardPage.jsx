import { useEffect, useState } from 'react'
import {
  AdminActionGrid,
  AdminActivityFeed,
  AdminApprovalTable,
  AdminHero,
  AdminMiniBars,
  AdminShell,
} from '../../components/admin/AdminPortalUI'
import { getAdminDashboardStats } from '../../services/adminApi'

function buildStats(s) {
  return [
    { label: 'Total users', value: s.totalUsers.toLocaleString(), note: 'Registered accounts', tone: 'brand' },
    { label: 'Active listings', value: s.totalHotels.toLocaleString(), note: `${s.pendingHotelRequests} pending requests`, tone: 'warning' },
    { label: 'Flagged content', value: String(s.flaggedReviews), note: 'Awaiting moderation', tone: 'danger' },
    { label: 'KYC pending', value: String(s.pendingKYC), note: 'Verification queue', tone: 'success' },
  ]
}

function buildPendingActions(s) {
  return [
    { title: 'Hotel requests', value: String(s.pendingHotelRequests), meta: 'Change requests', href: '/admin/listing-approvals' },
    { title: 'KYC documents', value: String(s.pendingKYC), meta: 'Verification queue', href: '/admin/verification' },
    { title: 'Moderation reports', value: String(s.flaggedReviews), meta: 'Flagged content', href: '/admin/moderation' },
    { title: 'Registered users', value: s.totalUsers.toLocaleString(), meta: 'Total accounts', href: '/admin/users' },
  ]
}

function buildApprovals(s) {
  return [
    ['KYC Review',      `${s.pendingKYC} pending`,             '—',                              'Review queue',  '/admin/verification'],
    ['Hotel Requests',  `${s.totalHotels} listed`,             `${s.pendingHotelRequests} pending`, 'Open requests', '/admin/listing-approvals'],
    ['Content Reports', `${s.flaggedReviews} flagged`,          '—',                              'Moderate now',  '/admin/moderation'],
    ['Bookings',        `${s.totalBookings} total`,            `${s.confirmedBookings} confirmed`, 'View bookings', '/admin/bookings'],
  ]
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [pendingActions, setPendingActions] = useState([])
  const [bookingTrend, setBookingTrend] = useState([])
  const [approvals, setApprovals] = useState([])
  const [activity, setActivity] = useState([])

  useEffect(() => {
    getAdminDashboardStats()
      .then((s) => {
        setStats(buildStats(s))
        setPendingActions(buildPendingActions(s))
        setApprovals(buildApprovals(s))
        if (s.bookingTrend?.length) {
          setBookingTrend(
            s.bookingTrend.map((d) => ({
              label: d.label,
              bookings: d.bookings,
              revenue: Math.round(d.revenue),
            })),
          )
        }
        if (s.recentActivity?.length) {
          setActivity(s.recentActivity)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AdminShell>
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-2xl bg-gray-100" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-gray-100" />)}
          </div>
          <div className="h-48 rounded-2xl bg-gray-100" />
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin dashboard"
        title="Hotel booking control center"
        description="A real-time overview for platform performance, pending approvals, revenue movement, reports, and urgent operational actions."
        stats={stats}
      />

      <AdminActionGrid items={pendingActions} />

      <div className={`grid gap-6 ${bookingTrend.length ? 'xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]' : ''}`}>
        {bookingTrend.length > 0 && <AdminMiniBars data={bookingTrend} />}
        {activity.length > 0 && <AdminActivityFeed items={activity} />}
      </div>

      <AdminApprovalTable rows={approvals} />
    </AdminShell>
  )
}
