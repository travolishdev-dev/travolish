import { useEffect, useState } from 'react'
import {
  AdminActionGrid,
  AdminActivityFeed,
  AdminApprovalTable,
  AdminHero,
  AdminMiniBars,
  AdminRequirementBadges,
  AdminShell,
} from '../../components/admin/AdminPortalUI'
import { adminDashboard } from '../../data/adminPanelData'
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
    ['KYC Review', `${s.pendingKYC} pending`, '—', 'Review queue'],
    ['Hotel Requests', `${s.totalHotels} listed`, `${s.pendingHotelRequests} pending`, 'Open requests'],
    ['Content Reports', `${s.flaggedReviews} flagged`, '—', 'Moderate now'],
    ['Bookings', `${s.totalBookings} total`, `${s.confirmedBookings} confirmed`, 'View bookings'],
  ]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(adminDashboard.stats)
  const [pendingActions, setPendingActions] = useState(adminDashboard.pendingActions)
  const [bookingTrend, setBookingTrend] = useState(adminDashboard.bookingTrend)
  const [approvals, setApprovals] = useState(adminDashboard.approvals)
  const [activity, setActivity] = useState(adminDashboard.activity)

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
  }, [])

  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin dashboard"
        title="Hotel booking control center"
        description="A real-time overview for platform performance, pending approvals, revenue movement, reports, and urgent operational actions."
        stats={stats}
      />

      <AdminActionGrid items={pendingActions} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <AdminMiniBars data={bookingTrend} />
        <AdminActivityFeed items={activity} />
      </div>

      <AdminApprovalTable rows={approvals} />
      <AdminRequirementBadges />
    </AdminShell>
  )
}
