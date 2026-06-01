import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Banknote,
  BellRing,
  Bot,
  Building2,
  CalendarDays,
  CalendarCheck,
  Gauge,
  LayoutDashboard,
  Menu,
  Megaphone,
  NotebookPen,
  OctagonAlert,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import useHostViewer from '../../hooks/useHostViewer'
import { PreviewModeNotice, StatusPill } from '../portal/PortalUI'

const hostNavGroups = [
  {
    title: 'Operations',
    items: [
      { label: 'Dashboard', href: '/host', icon: LayoutDashboard },
      { label: 'Bookings', href: '/host/bookings', icon: CalendarCheck },
      { label: 'Listings', href: '/host/listings', icon: Building2 },
      { label: 'Availability', href: '/host/availability', icon: CalendarDays },
      { label: 'Inventory', href: '/host/inventory', icon: Gauge },
      { label: 'Reports', href: '/host/reports', icon: NotebookPen },
    ],
  },
  {
    title: 'Revenue',
    items: [
      { label: 'Pricing rules', href: '/host/pricing', icon: Banknote },
      { label: 'Promotions', href: '/host/promotions', icon: Megaphone },
      { label: 'Pricing AI', href: '/host/pricing-ai', icon: Bot },
      { label: 'Payouts', href: '/host/payouts', icon: WalletCards },
    ],
  },
  {
    title: 'Trust',
    items: [
      { label: 'KYC', href: '/host/kyc', icon: ShieldCheck },
      { label: 'Bank accounts', href: '/host/bank-accounts', icon: WalletCards },
      { label: 'Auto replies', href: '/host/auto-replies', icon: BellRing },
      { label: 'Emergency', href: '/host/emergency', icon: OctagonAlert },
    ],
  },
]

const hostBottomNav = [
  { label: 'Host', href: '/host', icon: LayoutDashboard },
  { label: 'Bookings', href: '/host/bookings', icon: CalendarCheck },
  { label: 'Calendar', href: '/host/availability', icon: CalendarDays },
  { label: 'Payouts', href: '/host/payouts', icon: WalletCards },
  { label: 'Safety', href: '/host/emergency', icon: OctagonAlert },
]

function isActiveRoute(pathname, href) {
  if (href === '/host') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function shellActions(actions) {
  if (!actions?.length) {
    return null
  }

  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
      {actions.map((action) =>
        action.href ? (
          <Link
            key={action.label}
            to={action.href}
            className={
              action.secondary
                ? 'inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto'
                : 'inline-flex w-full items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto'
            }
          >
            {action.label}
          </Link>
        ) : (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={
              action.secondary
                ? 'inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto'
                : 'inline-flex w-full items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto'
            }
          >
            {action.label}
          </button>
        ),
      )}
    </div>
  )
}

function MobileActionLink({ action }) {
  if (!action) {
    return null
  }

  const className =
    'inline-flex h-9 items-center justify-center rounded-xl bg-dark px-3.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800'

  return action.href ? (
    <Link to={action.href} className={className}>
      {action.label}
    </Link>
  ) : (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  )
}

function MobileBottomAction({ action }) {
  if (!action) {
    return null
  }

  const className =
    'inline-flex w-full items-center justify-center rounded-2xl bg-dark px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800'

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.8rem+env(safe-area-inset-bottom))] z-40 px-4 md:hidden">
      <div className="mx-auto max-w-screen-sm rounded-[26px] border border-gray-200 bg-white/96 p-2 backdrop-blur">
        {action.href ? (
          <Link to={action.href} className={className}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={className}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

function HostMobileChrome({ title, mobileAction }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { pathname } = useLocation()
  const { viewer } = useHostViewer()

  return (
    <>
      <div className="-mx-4 sticky top-0 z-40 border-b border-gray-200 bg-[#f8f6f2]/96 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-dark"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold tracking-tight text-dark">
              {title}
            </p>
          </div>

          {mobileAction ? (
            <MobileActionLink action={mobileAction} />
          ) : (
            <Link
              to="/host"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <img
                src={viewer.avatar}
                alt={viewer.fullName}
                className="h-full w-full object-cover"
              />
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen ? (
          <>
            <Motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/35 md:hidden"
            />
            <Motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-[320px] flex-col bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] md:hidden"
            >
              <div className="border-b border-gray-200 px-4 pb-4 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={viewer.avatar}
                      alt={viewer.fullName}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-dark">
                        {viewer.fullName}
                      </p>
                      <p className="truncate text-xs text-muted">{viewer.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-[#f8f6f2] text-dark"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                {hostNavGroups.map((group) => (
                  <div key={group.title}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {group.title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive = isActiveRoute(pathname, item.href)

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsDrawerOpen(false)}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                              isActive ? 'bg-dark text-white' : 'bg-[#f8f6f2] text-dark'
                            }`}
                          >
                            <Icon size={16} />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-screen-sm grid-cols-5 px-2 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-2">
          {hostBottomNav.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(pathname, item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-brand' : 'text-muted'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export function SectionCard({ className = '', children }) {
  return (
    <section
      className={`rounded-[28px] border border-gray-200 bg-white p-5 md:p-6 ${className}`}
    >
      {children}
    </section>
  )
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-[21px] font-semibold tracking-tight text-dark md:text-[24px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="md:shrink-0">{action}</div> : null}
    </div>
  )
}

export function HostShell({
  eyebrow = 'Host',
  title,
  mobileTitle = title,
  description,
  actions,
  stats,
  mobileAction,
  mobileBottomAction,
  accent = 'from-emerald-50 via-white to-sky-50',
  children,
}) {
  const { pathname } = useLocation()
  const mobilePadding = mobileBottomAction
    ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom))]'
    : 'pb-[calc(5.75rem+env(safe-area-inset-bottom))]'

  void accent

  return (
    <main className={`min-h-screen bg-[#f8f6f2] pt-0 ${mobilePadding} md:pb-16 md:pt-24`}>
      <div className="mx-auto flex max-w-[1720px] flex-col gap-4 px-4 pt-4 md:gap-5 md:px-8 md:pt-0 xl:px-14">
        <HostMobileChrome title={mobileTitle} mobileAction={mobileAction} />
        <MobileBottomAction action={mobileBottomAction} />

        <Motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="hidden rounded-[30px] border border-gray-200 bg-white md:block"
        >
          <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {eyebrow}
                </p>
                <h1 className="mt-1 max-w-2xl text-[25px] font-semibold tracking-tight text-dark lg:text-[30px]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    {description}
                  </p>
                ) : null}
              </div>

              {actions?.length ? <div>{shellActions(actions)}</div> : null}
            </div>

            {stats?.length ? (
              <div className="grid gap-3 border-t border-gray-200 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfbf8] px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-dark">
                      {stat.value}
                    </p>
                    {stat.note ? (
                      <p className="mt-1 text-xs leading-5 text-muted">{stat.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Motion.section>

        <PreviewModeNotice />

        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <SectionCard className="hidden xl:block">
              <div className="space-y-6">
                {hostNavGroups.map((group) => (
                  <div key={group.title}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {group.title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive = isActiveRoute(pathname, item.href)

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                              isActive
                                ? 'bg-dark text-white'
                                : 'text-dark hover:bg-[#f8f6f2]'
                            }`}
                          >
                            <Icon size={16} />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </aside>

          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </main>
  )
}

export { StatusPill }
