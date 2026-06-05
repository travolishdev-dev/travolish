import { useEffect, useState } from 'react'
import { BellRing, CalendarCheck, Clock3, Plus, Power, Trash2 } from 'lucide-react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField, HostPillButton } from '../../components/host/HostFormFields'
import {
  getTemplatesForHost,
  createAutoReply,
  deleteAutoReply,
  activateAutoReply,
  deactivateAutoReply,
} from '../../services/autoRepliesApi'
import useHostContext from '../../hooks/useHostContext'

const CATEGORIES = [
  'GENERAL_INQUIRY',
  'BOOKING_CONFIRMATION',
  'CHECK_IN_INSTRUCTIONS',
  'CHECK_OUT_REMINDER',
  'PAYMENT_INQUIRY',
  'CANCELLATION',
  'HOUSE_RULES',
  'WIFI_PASSWORD',
  'LOCAL_ATTRACTIONS',
  'COMPLAINT_RESPONSE',
  'CUSTOM',
]

const EMPTY_TEMPLATE = {
  templateName: '',
  category: 'GENERAL_INQUIRY',
  triggerKeyword: '',
  templateText: '',
  language: 'en',
}

const guestReminders = [
  {
    id: 'pre-arrival',
    title: 'Pre-arrival reminder',
    timing: '48 hours before check-in',
    channel: 'Email + app',
    message: 'Share arrival timing, address, parking notes, and host contact.',
    category: 'CHECK_IN_INSTRUCTIONS',
    defaultText: 'Your check-in is coming up in 48 hours! Here are your arrival details. We look forward to hosting you.',
  },
  {
    id: 'check-in',
    title: 'Check-in day note',
    timing: '8:00 AM on arrival day',
    channel: 'App notification',
    message: 'Send check-in steps, Wi-Fi, house rules, and key collection details.',
    category: 'BOOKING_CONFIRMATION',
    defaultText: 'Welcome! Today is your check-in day. Your access details and Wi-Fi password are below. Enjoy your stay!',
  },
  {
    id: 'checkout',
    title: 'Checkout and review nudge',
    timing: 'Evening before checkout',
    channel: 'Email',
    message: 'Remind checkout time, pending dues, damage notes, and review request.',
    category: 'CHECK_OUT_REMINDER',
    defaultText: 'Friendly reminder: checkout is tomorrow. Thank you for staying with us — we would love a review when you get a chance!',
  },
]

function adaptTemplate(t) {
  return {
    id: t.id,
    title: t.title ?? t.templateName ?? 'Template',
    channel: t.channel ?? t.deliveryChannel ?? 'In-app',
    trigger: t.triggerType ?? t.triggerKeyword ?? t.trigger ?? '—',
    tone: t.category ?? t.tone ?? '—',
    preview: t.templateText ?? t.messagePreview ?? t.preview ?? '',
    performance: t.successRate != null ? `${t.successRate}% success rate` : (t.performance ?? '—'),
    isActive: t.isActive ?? t.active ?? true,
  }
}

export default function HostAutoRepliesPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState(EMPTY_TEMPLATE)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  // reminderTemplateId maps reminder.id → backend templateId (null = no template yet)
  const [reminderTemplateId, setReminderTemplateId] = useState({})
  const [enabledReminders, setEnabledReminders] = useState(
    guestReminders.reduce((acc, r) => ({ ...acc, [r.id]: false }), {}),
  )
  const [reminderNotice, setReminderNotice] = useState(null)
  const [togglingReminder, setTogglingReminder] = useState(null)

  useEffect(() => {
    if (hostLoading || !hostId) {
      return
    }
    setLoading(true)
    getTemplatesForHost(hostId)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) {
          const adapted = items.map(adaptTemplate)
          setTemplates(adapted)

          // Derive reminder states from templates by matching triggerKeyword
          const idMap = {}
          const enabledMap = {}
          guestReminders.forEach((reminder) => {
            const match = items.find(
              (t) => t.triggerKeyword === reminder.id || t.category === reminder.category,
            )
            idMap[reminder.id] = match?.id ?? null
            enabledMap[reminder.id] = match ? (match.isActive ?? match.active ?? true) : false
          })
          setReminderTemplateId(idMap)
          setEnabledReminders(enabledMap)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hostId, hostLoading])

  function refreshTemplates() {
    if (!hostId) return
    getTemplatesForHost(hostId)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) setTemplates(items.map(adaptTemplate))
      })
      .catch(() => {})
  }

  async function handleCreate() {
    if (!newTemplate.templateName || !newTemplate.triggerKeyword || !newTemplate.templateText) {
      setSaveError('Template name, trigger keyword, and message are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await createAutoReply({
        hostId,
        templateName: newTemplate.templateName,
        category: newTemplate.category,
        triggerKeyword: newTemplate.triggerKeyword,
        templateText: newTemplate.templateText,
        language: newTemplate.language || 'en',
      })
      setNewTemplate(EMPTY_TEMPLATE)
      setShowForm(false)
      refreshTemplates()
    } catch {
      setSaveError('Failed to create template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(templateId) {
    if (!window.confirm('Delete this template?')) return
    setTemplates((prev) => prev.filter((t) => t.id !== templateId))
    deleteAutoReply(templateId).catch(refreshTemplates)
  }

  function handleToggle(template) {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id ? { ...t, isActive: !t.isActive } : t,
      ),
    )
    const action = template.isActive ? deactivateAutoReply : activateAutoReply
    action(template.id).catch(refreshTemplates)
  }

  const updateField = (field) => (e) =>
    setNewTemplate((prev) => ({ ...prev, [field]: e.target.value }))

  async function toggleReminder(reminder) {
    const nextEnabled = !enabledReminders[reminder.id]
    setTogglingReminder(reminder.id)
    try {
      const existingId = reminderTemplateId[reminder.id]
      if (existingId) {
        // Template exists — activate or deactivate it
        if (nextEnabled) {
          await activateAutoReply(existingId)
        } else {
          await deactivateAutoReply(existingId)
        }
      } else if (nextEnabled) {
        // No template yet — create one for this reminder category then activate it
        const created = await createAutoReply({
          hostId,
          templateName: reminder.title,
          category: reminder.category,
          triggerKeyword: reminder.id,
          templateText: reminder.defaultText,
          language: 'en',
        })
        if (created?.id) {
          setReminderTemplateId((prev) => ({ ...prev, [reminder.id]: created.id }))
          await activateAutoReply(created.id)
        }
      }
      setEnabledReminders((prev) => ({ ...prev, [reminder.id]: nextEnabled }))
      setReminderNotice(`${reminder.title} ${nextEnabled ? 'enabled' : 'paused'} for upcoming bookings.`)
      refreshTemplates()
    } catch {
      setReminderNotice(`Could not update ${reminder.title}. Please try again.`)
    } finally {
      setTogglingReminder(null)
    }
  }

  return (
    <HostShell
      eyebrow="Auto replies"
      title="Auto replies"
      mobileTitle="Replies"
      description="Saved guest response templates."
      actions={[
        { label: 'Emergency', href: '/host/emergency', secondary: true },
        { label: 'Listings', href: '/host/listings' },
      ]}
      mobileAction={{ label: 'New template', onClick: () => setShowForm(true) }}
      stats={[
        { label: 'Templates', value: String(templates.length), note: 'Saved in library' },
        { label: 'Active', value: String(templates.filter((t) => t.isActive !== false).length), note: 'Currently enabled' },
        { label: 'Reminders', value: String(Object.values(enabledReminders).filter(Boolean).length), note: 'Guest schedules active' },
      ]}
    >
      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            eyebrow="Guest reminders"
            title="Automated stay timeline"
            description="Prepare check-in, checkout, and review reminders for every confirmed booking."
          />
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <BellRing size={16} />
            UI schedule preview
          </div>
        </div>

        {reminderNotice ? (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-brand">
            {reminderNotice}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {guestReminders.map((reminder) => {
            const isEnabled = enabledReminders[reminder.id]

            return (
              <div
                key={reminder.id}
                className="rounded-[24px] border border-gray-200 bg-[#fcfbf8] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                    <CalendarCheck size={19} />
                  </div>
                  <StatusPill tone={isEnabled ? 'success' : 'slate'}>
                    {isEnabled ? 'Active' : 'Paused'}
                  </StatusPill>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-dark">
                  {reminder.title}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <Clock3 size={15} />
                  {reminder.timing}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{reminder.message}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {reminder.channel}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleReminder(reminder)}
                    disabled={togglingReminder === reminder.id}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      isEnabled
                        ? 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                        : 'bg-dark text-white hover:bg-gray-800'
                    }`}
                  >
                    <Power size={13} />
                    {togglingReminder === reminder.id ? '…' : isEnabled ? 'Pause' : 'Enable'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <SectionHeading eyebrow="Templates" title="Message library" />
          <button
            type="button"
            onClick={() => { setShowForm((v) => !v); setSaveError(null) }}
            className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-dark hover:bg-gray-50"
          >
            <Plus size={15} />
            New template
          </button>
        </div>

        {showForm && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-[#f8f6f2] p-5">
            <p className="text-sm font-semibold text-dark">New auto-reply template</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <HostField
                label="Template name"
                value={newTemplate.templateName}
                onChange={updateField('templateName')}
                placeholder="e.g. Check-in welcome"
              />
              <HostField
                label="Trigger keyword"
                value={newTemplate.triggerKeyword}
                onChange={updateField('triggerKeyword')}
                placeholder="e.g. check-in, arrival"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-dark">Category</label>
              <select
                value={newTemplate.category}
                onChange={updateField('category')}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-dark outline-none transition-all focus:border-dark focus:ring-1 focus:ring-dark"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <HostField
                label="Message text"
                value={newTemplate.templateText}
                onChange={updateField('templateText')}
                placeholder="Dear guest, thank you for your message…"
                textarea
              />
            </div>

            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create template'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setSaveError(null) }}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-dark hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading templates…</div>
        )}

        {!loading && templates.length === 0 && !showForm && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-dark">No templates yet</p>
            <p className="mt-1 text-sm text-muted">Create your first template to automate guest responses.</p>
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{template.title}</p>
                      <StatusPill tone="sky">{template.channel}</StatusPill>
                      <StatusPill tone={template.isActive !== false ? 'success' : 'slate'}>
                        {template.isActive !== false ? 'Active' : 'Inactive'}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {template.trigger} · {template.tone}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-dark">{template.preview}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Performance
                    </p>
                    <p className="mt-2 text-lg font-semibold text-dark">{template.performance}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(template)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-dark hover:bg-gray-50"
                      >
                        <Power size={12} />
                        {template.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(template.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </HostShell>
  )
}
