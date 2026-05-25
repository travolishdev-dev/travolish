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

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin dashboard"
        title="Hotel booking control center"
        description="A real-time overview for platform performance, pending approvals, revenue movement, reports, and urgent operational actions."
        stats={adminDashboard.stats}
      />

      <AdminActionGrid items={adminDashboard.pendingActions} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <AdminMiniBars data={adminDashboard.bookingTrend} />
        <AdminActivityFeed items={adminDashboard.activity} />
      </div>

      <AdminApprovalTable rows={adminDashboard.approvals} />
      <AdminRequirementBadges />
    </AdminShell>
  )
}
