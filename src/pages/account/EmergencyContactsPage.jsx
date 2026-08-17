import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  HeartHandshake,
  Loader2,
  Plus,
  Star,
  Trash2,
  Pencil,
  X,
  CheckCheck,
  ShieldCheck,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { PhoneField } from '../../components/common/PhoneField'
import useAuthStore from '../../stores/useAuthStore'
import {
  listEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setEmergencyContactPrimary,
} from '../../services/emergencyContactsApi'
import { parsePhoneValue, normalizePhoneForStorage } from '../../lib/phone'

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_CONTACTS = 10

const RELATIONSHIP_OPTIONS = [
  'Spouse / Partner',
  'Parent',
  'Sibling',
  'Child',
  'Friend',
  'Colleague',
  'Other',
]

// ── Blank form state ─────────────────────────────────────────────────────────

function blankForm() {
  return { name: '', relationship: '', phone: '', isPrimary: false }
}

// ── ContactForm — used for both Add and Edit ──────────────────────────────────

function ContactForm({ initial, onSave, onCancel, saving, isFirst }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? '',
    relationship: initial?.relationship ?? '',
    phone: initial?.phone ?? '',
    isPrimary: initial?.isPrimary ?? isFirst,
  }))

  const setField = (field) => (e) =>
    setForm((cur) => ({ ...cur, [field]: e.target.value }))

  const setPhone = (combined) =>
    setForm((cur) => ({ ...cur, phone: combined }))

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return }
    if (!form.phone.trim()) { toast.error('Phone number is required.'); return }
    onSave({
      name: form.name.trim(),
      relationship: form.relationship || null,
      phone: normalizePhoneForStorage(form.phone, parsePhoneValue(form.phone, '+91').countryCode),
      isPrimary: form.isPrimary,
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5 space-y-4">
      {/* Name */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Full name
        </span>
        <input
          type="text"
          value={form.name}
          onChange={setField('name')}
          placeholder="e.g. Priya Sharma"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition-colors focus:border-dark"
        />
      </label>

      {/* Relationship */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Relationship
        </span>
        <div className="relative">
          <select
            value={form.relationship}
            onChange={setField('relationship')}
            className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition-colors focus:border-dark"
          >
            <option value="">Select relationship</option>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </label>

      {/* Phone */}
      <PhoneField
        label="Phone number"
        value={form.phone}
        onChange={setPhone}
        placeholder="98765 43210"
      />

      {/* Primary toggle */}
      <label className="flex cursor-pointer items-center gap-3">
        <div
          role="switch"
          aria-checked={form.isPrimary}
          onClick={() => setForm((cur) => ({ ...cur, isPrimary: !cur.isPrimary }))}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            form.isPrimary ? 'bg-dark' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              form.isPrimary ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-dark">Set as primary contact</p>
          <p className="text-xs text-muted">Shown first in booking and safety flows</p>
        </div>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
        >
          <X size={14} /> Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-dark px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
        >
          {saving
            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
            : <><CheckCheck size={14} /> Save contact</>}
        </button>
      </div>
    </div>
  )
}

// ── ContactCard ───────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onSetPrimary,
  mutating,
  isConfirmingDelete,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        isConfirmingDelete
          ? 'border-red-200 bg-red-50/30'
          : contact.isPrimary
            ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-gray-200 bg-[#fcfcfb]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 rounded-2xl p-3 ${
              isConfirmingDelete
                ? 'bg-red-100 text-red-600'
                : contact.isPrimary
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            <HeartHandshake size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-dark">{contact.name}</p>
              {contact.isPrimary && !isConfirmingDelete && (
                <StatusPill tone="success">Primary</StatusPill>
              )}
            </div>
            {contact.relationship && (
              <p className="mt-0.5 text-sm text-muted">{contact.relationship}</p>
            )}
            <p className="mt-3 inline-flex items-center rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-medium text-dark">
              {contact.phone}
            </p>
          </div>
        </div>

        {/* Action buttons — hidden while confirming delete */}
        {!isConfirmingDelete && (
          <div className="flex flex-shrink-0 items-center gap-1">
            {!contact.isPrimary && (
              <button
                type="button"
                title="Set as primary"
                onClick={() => onSetPrimary(contact.id)}
                disabled={mutating}
                className="rounded-xl p-2 text-muted transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
              >
                <Star size={16} />
              </button>
            )}
            <button
              type="button"
              title="Edit"
              onClick={() => onEdit(contact)}
              disabled={mutating}
              className="rounded-xl p-2 text-muted transition-colors hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => onDelete(contact.id)}
              disabled={mutating}
              className="rounded-xl p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Inline delete confirmation — replaces window.confirm */}
      {isConfirmingDelete && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            Remove {contact.name}?
          </p>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirmDelete(contact.id)}
              disabled={mutating}
              className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
            >
              {mutating ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EmergencyContactsPage() {
  const userId = useAuthStore((s) => s.backendUserId)
  const queryClient = useQueryClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)     // contact object or null
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null) // id of contact pending removal

  // ── Data fetching ──────────────────────────────────────────────────────────

  const {
    data: contacts = [],
    isPending: loading,
  } = useQuery({
    queryKey: ['emergencyContacts', userId],
    queryFn: () => listEmergencyContacts(userId),
    enabled: !!userId,
    staleTime: 30_000,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['emergencyContacts', userId] })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const { mutate: createContact, isPending: creating } = useMutation({
    mutationFn: (body) => createEmergencyContact(userId, body),
    onSuccess: () => {
      toast.success('Contact added.')
      setShowAddForm(false)
      invalidate()
    },
    onError: () => toast.error('Could not add contact. Please try again.'),
  })

  const { mutate: updateContact, isPending: updating } = useMutation({
    mutationFn: ({ contactId, body }) => updateEmergencyContact(userId, contactId, body),
    onSuccess: () => {
      toast.success('Contact updated.')
      setEditingContact(null)
      invalidate()
    },
    onError: () => toast.error('Could not update contact. Please try again.'),
  })

  const { mutate: removeContact, isPending: deleting } = useMutation({
    mutationFn: (contactId) => deleteEmergencyContact(userId, contactId),
    onSuccess: () => { toast.success('Contact removed.'); invalidate() },
    onError: () => toast.error('Could not remove contact. Please try again.'),
  })

  const { mutate: makePrimary, isPending: promotingPrimary } = useMutation({
    mutationFn: (contactId) => setEmergencyContactPrimary(userId, contactId),
    onSuccess: () => { toast.success('Primary contact updated.'); invalidate() },
    onError: () => toast.error('Could not update primary contact.'),
  })

  const mutating = creating || updating || deleting || promotingPrimary

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = (body) => createContact(body)
  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowAddForm(false)
    setConfirmingDeleteId(null) // clear any pending delete when entering edit mode
  }
  const handleUpdate = (body) => updateContact({ contactId: editingContact.id, body })

  // Two-step delete: first click stages the id, second confirms removal.
  const handleDelete = (contactId) => {
    setEditingContact(null)  // close any open edit form for this card
    setConfirmingDeleteId(contactId)
  }
  const handleConfirmDelete = (contactId) => {
    setConfirmingDeleteId(null)
    removeContact(contactId)
  }
  const handleCancelDelete = () => setConfirmingDeleteId(null)

  const atLimit = contacts.length >= MAX_CONTACTS

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AccountShell
      title="Emergency contacts."
      mobileTitle="Emergency"
      description="Keep family and friends reachable during your trips."
      actions={[
        { label: 'Back to account', href: '/account', secondary: true },
        ...(!atLimit && !showAddForm && !editingContact
          ? [{ label: 'Add contact', onClick: () => setShowAddForm(true) }]
          : []),
      ]}
    >
      {/* Info card */}
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-2xl bg-amber-50 p-3 text-amber-700">
            <ShieldCheck size={22} />
          </div>
          <div>
            <SectionHeading
              eyebrow="Safety"
              title="Who should we contact in an emergency?"
              description="These contacts are shared with our safety team and can be used during medical events, missing-person reports, or other travel incidents. Add family members, partners, or trusted friends."
            />
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5">
                <Users size={12} /> Up to {MAX_CONTACTS} contacts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5">
                <Star size={12} /> One primary contact
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Add form */}
      {showAddForm && (
        <SectionCard>
          <SectionHeading eyebrow="New contact" title="Add an emergency contact" />
          <div className="mt-6">
            <ContactForm
              initial={blankForm()}
              onSave={handleAdd}
              onCancel={() => setShowAddForm(false)}
              saving={creating}
              isFirst={contacts.length === 0}
            />
          </div>
        </SectionCard>
      )}

      {/* Contact list */}
      <SectionCard>
        <div className="flex items-center justify-between">
          <SectionHeading
            eyebrow="Your contacts"
            title={
              loading
                ? 'Loading…'
                : contacts.length === 0
                  ? 'No contacts yet'
                  : `${contacts.length} contact${contacts.length === 1 ? '' : 's'}`
            }
            description={
              contacts.length === 0 && !loading
                ? 'Add someone a Travolish safety agent can reach if they can\'t get hold of you.'
                : null
            }
          />
          {!atLimit && !showAddForm && !editingContact && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              <Plus size={15} /> Add
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" /> Loading contacts…
          </div>
        ) : contacts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-[#fcfcfb] px-4 py-10 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-rose-50 p-4 text-brand">
              <HeartHandshake size={28} />
            </div>
            <p className="text-sm font-semibold text-dark">No emergency contacts yet</p>
            <p className="mt-1 text-sm text-muted">Add a family member or trusted friend so we know who to call.</p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-dark px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              <Plus size={15} /> Add first contact
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {contacts.map((contact) =>
              editingContact?.id === contact.id ? (
                <div key={contact.id}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Editing — {contact.name}
                  </p>
                  <ContactForm
                    initial={editingContact}
                    onSave={handleUpdate}
                    onCancel={() => setEditingContact(null)}
                    saving={updating}
                    isFirst={false}
                  />
                </div>
              ) : (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onConfirmDelete={handleConfirmDelete}
                  onCancelDelete={handleCancelDelete}
                  onSetPrimary={makePrimary}
                  mutating={mutating}
                  isConfirmingDelete={confirmingDeleteId === contact.id}
                />
              )
            )}
          </div>
        )}

        {atLimit && (
          <p className="mt-4 text-xs text-muted">
            You have reached the maximum of {MAX_CONTACTS} emergency contacts.
          </p>
        )}
      </SectionCard>

      {/* Mobile add button */}
      {!atLimit && !showAddForm && !editingContact && contacts.length > 0 && (
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-[#fcfcfb] py-4 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            <Plus size={16} /> Add another contact
          </button>
        </div>
      )}
    </AccountShell>
  )
}
