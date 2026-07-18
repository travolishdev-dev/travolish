import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BellRing,
  CalendarRange,
  CreditCard,
  Home,
  LifeBuoy,
  Menu,
  MessageCircleMore,
  Receipt,
  ShieldCheck,
  Sparkles,
  Star,
  TicketPercent,
  UserRound,
  X,
} from 'lucide-react'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'
import usePortalViewer from '../../hooks/usePortalViewer'
import { useAndroidBackClose } from '../../hooks/useAndroidBackClose'
import useAccountInsights from '../../hooks/useAccountInsights'
import useAuthStore from '../../stores/useAuthStore'

const ACCOUNT_NAV_GROUP_DEFS = [
  {
    titleKey: 'portalAccountGroup',
    items: [
      { labelKey: 'overview', href: '/account', icon: UserRound },
      { labelKey: 'editProfile', href: '/account/edit', icon: Sparkles },
      { labelKey: 'security', href: '/account/security', icon: ShieldCheck },
      { labelKey: 'paymentMethods', href: '/account/payments', icon: CreditCard },
      { labelKey: 'transactions', href: '/account/transactions', icon: Receipt },
      { labelKey: 'notificationSettings', href: '/account/notification-settings', icon: BellRing },
    ],
  },
  {
    titleKey: 'portalTravelGroup',
    items: [
      { labelKey: 'trips', href: '/trips', icon: CalendarRange },
      { labelKey: 'offers', href: '/offers', icon: TicketPercent },
      { labelKey: 'emergency', href: '/emergency', icon: LifeBuoy },
      { labelKey: 'messages', href: '/messages', icon: MessageCircleMore },
      { labelKey: 'reviews', href: '/reviews/me', icon: Star },
    ],
  },
]

const toneClasses = {
  brand: 'bg-rose-50 text-brand border-rose-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
}

const MOBILE_BOTTOM_NAV_DEFS = [
  { labelKey: 'home', href: '/', icon: Home },
  { labelKey: 'trips', href: '/trips', icon: CalendarRange },
  { labelKey: 'offers', href: '/offers', icon: TicketPercent },
  { labelKey: 'messages', href: '/messages', icon: MessageCircleMore },
  { labelKey: 'account', href: '/account', icon: UserRound },
]

const MOBILE_DRAWER_MAIN_ITEMS = [
  { labelKey: 'home', href: '/', icon: Home },
  { labelKey: 'trips', href: '/trips', icon: CalendarRange },
  { labelKey: 'offers', href: '/offers', icon: TicketPercent },
  { labelKey: 'emergency', href: '/emergency', icon: LifeBuoy },
  { labelKey: 'messages', href: '/messages', icon: MessageCircleMore },
  { labelKey: 'reviews', href: '/reviews/me', icon: Star },
  { labelKey: 'notifications', href: '/notifications', icon: BellRing },
  { labelKey: 'account', href: '/account', icon: UserRound },
]

function isActiveRoute(pathname, href) {
  if (href === '/account') {
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
                ? 'inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto'
                : 'inline-flex w-full items-center justify-center rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto'
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
                ? 'inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto'
                : 'inline-flex w-full items-center justify-center rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto'
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
    'inline-flex h-9 items-center justify-center rounded-full bg-dark px-3.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800'

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
    'inline-flex w-full items-center justify-center rounded-[20px] bg-dark px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition-colors hover:bg-gray-800'

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.8rem+env(safe-area-inset-bottom))] z-40 px-4 md:hidden">
      <div className="mx-auto max-w-screen-sm rounded-[28px] border border-gray-200 bg-white/92 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur">
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

function PortalMobileChrome({ title, mobileAction }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { pathname } = useLocation()
  const { viewer } = usePortalViewer()
  const { t, i18n } = useTranslation('nav')
  const isRTL = i18n.dir() === 'rtl'
  const prefersReduced = useReducedMotion()
  useAndroidBackClose(isDrawerOpen, () => setIsDrawerOpen(false))
  const mobileDrawerSections = useMemo(() => [
    {
      title: t('nav:portalMainGroup'),
      items: MOBILE_DRAWER_MAIN_ITEMS.map((d) => ({ ...d, label: t(`nav:${d.labelKey}`) })),
    },
    {
      title: t('nav:portalAccountGroup'),
      items: ACCOUNT_NAV_GROUP_DEFS[0].items.map((d) => ({ ...d, label: t(`nav:${d.labelKey}`) })),
    },
  ], [t])
  const mobileBottomNav = useMemo(
    () => MOBILE_BOTTOM_NAV_DEFS.map((d) => ({ ...d, label: t(`nav:${d.labelKey}`) })),
    [t],
  )

  return (
    <>
      <div className="-mx-4 sticky top-0 z-40 border-b border-gray-200 bg-[#fcfbf8]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-dark shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
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
              to="/account"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
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
        {isDrawerOpen && (
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
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ duration: prefersReduced ? 0 : 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 start-0 z-50 flex w-[88%] max-w-[320px] flex-col bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:hidden"
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-[#fcfcfb] text-dark"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                {mobileDrawerSections.map((section) => (
                  <div key={section.title}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {section.title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = isActiveRoute(pathname, item.href)

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsDrawerOpen(false)}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                              isActive
                                ? 'bg-dark text-white'
                                : 'bg-[#fcfcfb] text-dark'
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
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-screen-sm grid-cols-5 px-2 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-2">
          {mobileBottomNav.map((item) => {
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
    <div
      className={`w-full border-t border-gray-200/80 pt-5 md:pt-6 ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-muted md:block">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-[21px] leading-tight font-semibold tracking-tight text-dark md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 hidden text-sm leading-6 text-muted md:block md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="md:shrink-0">{action}</div> : null}
    </div>
  )
}

export function StatusPill({ tone = 'slate', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone] || toneClasses.slate}`}
    >
      {children}
    </span>
  )
}

export function PreviewModeNotice({ className = '' }) {
  const { isPreview } = usePortalViewer()
  const { t } = useTranslation('nav')

  if (!isPreview || !import.meta.env.DEV) {
    return null
  }

  return (
    <div
      className={`hidden rounded-2xl border border-dashed border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 md:block ${className}`}
    >
      {t('nav:previewNotice')}
    </div>
  )
}

export function PortalShell({
  eyebrow,
  title,
  mobileTitle = title,
  description,
  actions,
  stats,
  mobileAction,
  mobileBottomAction,
  accent = 'from-rose-50 via-white to-amber-50',
  children,
}) {
  const mobilePadding = mobileBottomAction
    ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom))]'
    : 'pb-[calc(5.75rem+env(safe-area-inset-bottom))]'

  return (
    <main className={`min-h-screen bg-[#fcfbf8] pt-0 ${mobilePadding} md:pb-16 md:pt-24 overscroll-y-contain`}>
      <div className="mx-auto flex max-w-[1760px] flex-col gap-4 px-4 pt-4 md:gap-6 md:px-10 md:pt-0 xl:px-20">
        <PortalMobileChrome title={mobileTitle} mobileAction={mobileAction} />
        <MobileBottomAction action={mobileBottomAction} />
        <Motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={`hidden border-y border-gray-200/80 bg-gradient-to-r ${accent} md:block`}
        >
          <div className="space-y-4 px-4 py-5 md:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {eyebrow}
                </p>
                <h1 className="mt-2 max-w-2xl text-[24px] font-semibold tracking-tight text-dark lg:text-[30px]">
                  {title}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  {description}
                </p>
                <div className="mt-4">{shellActions(actions)}</div>
              </div>
            </div>

            {stats?.length ? (
              <div className="grid gap-0 divide-y divide-gray-200/80 border-t border-gray-200/80 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-b-0">
                {stats.map((stat) => (
                  <div key={stat.label} className="py-3 lg:px-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-dark lg:text-[20px]">
                      {stat.value}
                    </p>
                    {stat.note ? (
                      <p className="mt-1 text-[11px] leading-5 text-muted">{stat.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Motion.section>

        <PreviewModeNotice />
        {children}
      </div>
    </main>
  )
}

export function AccountShell({
  title,
  mobileTitle = title,
  description,
  eyebrow = 'Account',
  actions,
  mobileAction,
  mobileBottomAction,
  accent = 'from-rose-50 via-white to-orange-50',
  children,
}) {
  const { pathname } = useLocation()
  const { t } = useTranslation('nav')
  // AccountShell only needs a few display fields — read directly from auth store
  // to avoid duplicating the expensive listBookings calls that page-level hooks already make.
  const { user, profile } = useAuthStore()
  const shellViewer = {
    avatar: profile?.avatar_url || null,
    fullName: profile?.full_name || user?.firstName || '',
    email: user?.email || profile?.email || '',
    city: profile?.city || user?.city || null,
    joinedLabel: user?.createdAt
      ? t('nav:memberSince', { year: new Date(user.createdAt).getFullYear() })
      : null,
  }
  const accountNavGroups = useMemo(
    () =>
      ACCOUNT_NAV_GROUP_DEFS.map((g) => ({
        title: t(`nav:${g.titleKey}`),
        items: g.items.map((d) => ({ ...d, label: t(`nav:${d.labelKey}`) })),
      })),
    [t],
  )
  const insights = useAccountInsights()
  const mobilePadding = mobileBottomAction
    ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom))]'
    : 'pb-[calc(5.75rem+env(safe-area-inset-bottom))]'

  return (
    <main className={`min-h-screen bg-[#fcfbf8] pt-0 ${mobilePadding} md:pb-16 md:pt-24 overscroll-y-contain`}>
      <div className="mx-auto flex max-w-[1760px] flex-col gap-4 px-4 pt-4 md:gap-6 md:px-10 md:pt-0 xl:px-20">
        <PortalMobileChrome title={mobileTitle} mobileAction={mobileAction} />
        <MobileBottomAction action={mobileBottomAction} />
        <Motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={`hidden border-y border-gray-200/80 bg-gradient-to-r ${accent} md:block`}
        >
          <div className="space-y-4 px-4 py-5 md:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {eyebrow}
                </p>
                <h1 className="mt-2 max-w-2xl text-[24px] font-semibold tracking-tight text-dark lg:text-[30px]">
                  {title}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  {description}
                </p>
                <div className="mt-4">{shellActions(actions)}</div>
              </div>

              <div className="border-t border-gray-200/80 pt-4 lg:min-w-[300px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div className="flex items-center gap-4">
                  <img
                    src={shellViewer.avatar}
                    alt={shellViewer.fullName}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-dark">
                      {shellViewer.fullName}
                    </p>
                    <p className="truncate text-[13px] text-muted">{shellViewer.email}</p>
                    <p className="mt-0.5 text-[13px] text-dark">
                      {shellViewer.city} · {shellViewer.joinedLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 divide-y divide-gray-200/80 border-t border-gray-200/80 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-b-0">
              {insights.map((insight) => (
                <div key={insight.label} className="py-3 lg:px-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {insight.label}
                  </p>
                  <p className="mt-1 text-base font-semibold tracking-tight text-dark lg:text-lg">
                    {insight.value}
                  </p>
                  {insight.note ? (
                    <p className="mt-1 text-[11px] leading-5 text-muted">{insight.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </Motion.section>

        <PreviewModeNotice />

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <SectionCard className="hidden xl:block">
              <div className="space-y-6 pt-4">
                {accountNavGroups.map((group) => (
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
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                              isActive
                                ? 'bg-dark text-white shadow-sm'
                                : 'text-dark hover:bg-gray-50'
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

            <div className="hidden sm:grid grid-cols-2 gap-2 sm:grid-cols-3 xl:hidden">
              {accountNavGroups.flatMap((group) => group.items).map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </aside>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </main>
  )
}
