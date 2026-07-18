import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminManagementPage from '../../components/admin/AdminManagementPage'
import { AdminCard, AdminSectionHeading } from '../../components/admin/AdminPortalUI'
import {
  deleteUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from '../../services/adminApi'

const ROLES = ['GUEST', 'HOST', 'ADMIN']
const STATUSES = ['ACTIVE', 'SUSPENDED', 'PENDING', 'BLACKLISTED']

function deriveRole(u) {
  if (u.role) return u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()
  return u.provider ? 'Host' : 'Guest'
}

function deriveStatus(u) {
  if (u.status) return u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase()
  return 'Active'
}

function deriveVerification(u) {
  if (u.provider) {
    const p = u.provider
    return `${p.charAt(0).toUpperCase()}${p.slice(1)} auth`
  }
  return 'Unverified'
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function mapUserToRow(u) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || `User #${u.id}`
  return [
    name,
    deriveRole(u),
    deriveStatus(u),
    deriveVerification(u),
    formatDate(u.createdAt),
    u.email || '—',
    'Edit',
  ]
}

function UserEditPanel({ record, rawMap, onSave, setNotice }) {
  const user = record ? rawMap.current[record[0]] : null

  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const roleRef = useRef(null)
  const statusRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false)
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Sync selects when selected user changes
  useEffect(() => {
    if (user) {
      setRole(user.role || 'GUEST')
      setStatus(user.status || 'ACTIVE')
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <AdminCard>
        <AdminSectionHeading
          eyebrow="User detail"
          title="Select a user"
          description="Click any row in the table to open their profile and edit role or status."
        />
      </AdminCard>
    )
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `User #${user.id}`

  async function handleSaveStatus() {
    setSaving(true)
    try {
      await updateUserStatus(user.id, status)
      toast.success(`${name} status updated to ${status}`)
      setNotice(`Status set to ${status} for ${name}.`)
      onSave()
    } catch {
      toast.error('Status update failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveRole() {
    setSaving(true)
    try {
      await updateUserRole(user.id, role)
      toast.success(`${name} role updated to ${role}`)
      setNotice(`Role set to ${role} for ${name}.`)
      onSave()
    } catch {
      toast.error('Role update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminCard className="space-y-6">
      <AdminSectionHeading
        eyebrow="User detail"
        title={name}
        description={user.email || '—'}
      />

      <div className="rounded-card border border-brand/20 bg-[#fff1f3] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Current state</p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-dark">
          <span>Role: {user.role || 'GUEST'}</span>
          <span className="text-muted">·</span>
          <span>Status: {user.status || 'ACTIVE'}</span>
        </div>
        {user.provider && (
          <p className="mt-2 text-xs text-muted">
            Auth: {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
          </p>
        )}
      </div>

      {/* Role editor */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Change role</p>
        <div className="flex items-center gap-3">
          <div ref={roleRef} className="relative flex-1">
            <button
              type="button"
              onClick={() => setRoleOpen((prev) => !prev)}
              className="flex h-10 w-full items-center justify-between rounded-card border border-gray-200 bg-white px-3 text-base md:text-sm font-semibold text-dark outline-none"
            >
              <span>{role.charAt(0) + role.slice(1).toLowerCase()}</span>
              <ChevronDown size={14} className="shrink-0 text-muted" />
            </button>
            {roleOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] overflow-hidden rounded-card border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setRoleOpen(false) }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${role === r ? 'text-dark' : 'text-muted'}`}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                    {role === r && <Check size={13} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={saving || role === (user.role || 'GUEST')}
            onClick={handleSaveRole}
            className="inline-flex h-10 items-center rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save role
          </button>
        </div>
      </div>

      {/* Status editor */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Change status</p>
        <div className="flex items-center gap-3">
          <div ref={statusRef} className="relative flex-1">
            <button
              type="button"
              onClick={() => setStatusOpen((prev) => !prev)}
              className="flex h-10 w-full items-center justify-between rounded-card border border-gray-200 bg-white px-3 text-base md:text-sm font-semibold text-dark outline-none"
            >
              <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
              <ChevronDown size={14} className="shrink-0 text-muted" />
            </button>
            {statusOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] overflow-hidden rounded-card border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setStatus(s); setStatusOpen(false) }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${status === s ? 'text-dark' : 'text-muted'}`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                    {status === s && <Check size={13} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={saving || status === (user.status || 'ACTIVE')}
            onClick={handleSaveStatus}
            className="inline-flex h-10 items-center rounded-card bg-dark px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save status
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-muted">
          Member since {formatDate(user.createdAt)} · ID {user.id}
        </p>
      </div>
    </AdminCard>
  )
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const rawMap = useRef({})

  const load = useCallback(() => {
    setLoading(true)
    getAllUsers()
      .then((users) => {
        const list = users ?? []
        rawMap.current = Object.fromEntries(
          list.map((u) => {
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || `User #${u.id}`
            return [name, u]
          }),
        )
        setRows(list.map(mapUserToRow))
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleRowAction = useCallback(async (row, action, setNotice) => {
    const user = rawMap.current[row[0]]
    if (!user) return

    if (action === 'Delete') {
      try {
        await deleteUser(user.id)
        toast.success(`${row[0]} deleted`)
        load()
      } catch {
        toast.error('Delete failed')
      }
    } else if (action === 'Suspend') {
      try {
        await updateUserStatus(user.id, 'SUSPENDED')
        toast.success(`${row[0]} suspended`)
        load()
      } catch {
        toast.error('Suspend failed')
      }
    } else if (action === 'Restore') {
      try {
        await updateUserStatus(user.id, 'ACTIVE')
        toast.success(`${row[0]} restored to active`)
        load()
      } catch {
        toast.error('Restore failed')
      }
    } else {
      setNotice(`Editing ${row[0]} — use the panel on the right to change role or status.`)
    }
  }, [load])

  const renderDetailPanel = useCallback(({ record, setNotice }) => (
    <UserEditPanel
      record={record}
      rawMap={rawMap}
      onSave={load}
      setNotice={setNotice}
    />
  ), [load])

  return (
    <AdminManagementPage
      pageKey="users"
      rows={rows}
      loading={loading}
      onRowAction={handleRowAction}
      detailContent={renderDetailPanel}
    />
  )
}
