import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import { getBankAccounts, registerBankAccount, deleteBankAccount, setPrimaryBankAccount } from '../../services/bankAccountsApi'
import toast from 'react-hot-toast'
import useHostContext from '../../hooks/useHostContext'

function adaptAccount(a) {
  const last4 = a.lastFourDigits ?? a.last4
    ?? (a.accountNumber ? String(a.accountNumber).slice(-4) : '****')
  return {
    id: a.id,
    label: a.accountHolderName ?? a.bankName ?? a.label ?? 'Bank account',
    type: a.accountType ?? a.type ?? '—',
    last4,
    currency: a.currency ?? 'INR',
    status: a.verificationStatus ?? a.status ?? 'Pending',
    isPrimary: a.isPrimary ?? false,
    swiftCode: a.swiftCode ?? null,
    iban: a.iban ?? null,
  }
}

export default function HostBankAccountsPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [accounts, setAccounts] = useState([])
  const [defaultAccountId, setDefaultAccountId] = useState(null)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)
  const [formState, setFormState] = useState({
    accountName: '',
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    swiftCode: '',
    iban: '',
    currency: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (hostLoading || !hostId) {
      if (!hostLoading) setAccountsLoading(false)
      return
    }
    getBankAccounts(hostId)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : null)
        if (items?.length) {
          const nextAccounts = items.map(adaptAccount)
          setAccounts(nextAccounts)
          // Prefer the account marked as primary by the backend
          const primary = nextAccounts.find((a) => a.isPrimary) ?? nextAccounts[0]
          setDefaultAccountId((current) => current ?? primary?.id ?? null)
        }
      })
      .catch(() => {})
      .finally(() => setAccountsLoading(false))
  }, [hostId, hostLoading])

  const updateField = (field) => (event) =>
    setFormState((current) => ({ ...current, [field]: event.target.value }))

  async function handleSetDefault(account) {
    setActioningId(account.id)
    try {
      await setPrimaryBankAccount(hostId, account.id)
      setDefaultAccountId(account.id)
      toast.success(`${account.label} set as default payout account.`)
    } catch (err) {
      // 409 means the account isn't verified yet
      const is409 = err?.status === 409 || err?.message?.includes('409') || String(err).includes('409')
      toast.error(is409
        ? 'Only verified accounts can be set as default. Complete KYC verification first.'
        : 'Could not update default account.')
    } finally {
      setActioningId(null)
    }
  }

  async function handleDelete(account) {
    if (!window.confirm(`Delete "${account.label}"? This cannot be undone.`)) return
    setActioningId(account.id)
    try {
      await deleteBankAccount(account.id, hostId)
      setAccounts((prev) => prev.filter((a) => a.id !== account.id))
      if (defaultAccountId === account.id) {
        const remaining = accounts.filter((a) => a.id !== account.id)
        setDefaultAccountId(remaining[0]?.id ?? null)
      }
      toast.success(`${account.label} removed.`)
    } catch {
      toast.error('Could not delete account. It may be linked to a pending payout.')
    } finally {
      setActioningId(null)
    }
  }

  async function handleSave() {
    if (!formState.accountName || !formState.accountNumber) return
    setSaving(true)
    try {
      await registerBankAccount(hostId, {
        accountHolderName: formState.accountName,
        bankName: formState.bankName,
        routingNumber: formState.routingNumber || null,
        accountNumber: formState.accountNumber,
        swiftCode: formState.swiftCode || null,
        iban: formState.iban || null,
        currency: formState.currency || 'USD',
      })
      const data = await getBankAccounts(hostId)
      const items = data?.content ?? (Array.isArray(data) ? data : null)
      if (items?.length) {
        const nextAccounts = items.map(adaptAccount)
        setAccounts(nextAccounts)
        setDefaultAccountId((current) => current ?? nextAccounts[0]?.id ?? null)
      }
      setFormState({ accountName: '', bankName: '', routingNumber: '', accountNumber: '', swiftCode: '', iban: '', currency: '' })
    } catch {
      toast.error('Failed to save account. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HostShell
      eyebrow="Bank accounts"
      title="Bank accounts"
      mobileTitle="Banking"
      description="Manage payout destinations."
      actions={[
        { label: 'Payouts', href: '/host/payouts', secondary: true },
        { label: 'KYC', href: '/host/kyc' },
      ]}
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: 'Save account', onClick: handleSave }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard>
          <SectionHeading eyebrow="Accounts" title="Connected payout destinations" />


          {accountsLoading && (
            <div className="py-12 text-center text-sm text-muted">Loading accounts…</div>
          )}

          {!accountsLoading && accounts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-dark">No bank accounts connected</p>
              <p className="mt-1 text-sm text-muted">Add a payout destination using the form on the right.</p>
            </div>
          )}

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {accounts.map((account) => (
              <div key={account.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{account.label}</p>
                      <StatusPill tone={account.status === 'Verified' ? 'success' : 'warning'}>
                        {account.status}
                      </StatusPill>
                      {defaultAccountId === account.id ? (
                        <StatusPill tone="sky">Default</StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {account.type} · {account.currency} · •••• {account.last4}
                      {account.swiftCode && <span> · SWIFT: {account.swiftCode}</span>}
                      {account.iban && <span> · IBAN: ••••{account.iban.slice(-4)}</span>}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(account)}
                      disabled={defaultAccountId === account.id || actioningId === account.id}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      {defaultAccountId === account.id ? 'Default ✓' : 'Set default'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(account)}
                      disabled={actioningId === account.id}
                      className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                    >
                      {actioningId === account.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading eyebrow="Add account" title="New payout destination" />

          <div className="mt-6 grid gap-4">
            <HostField
              label="Account holder"
              value={formState.accountName}
              onChange={updateField('accountName')}
              placeholder="Legal account holder"
            />
            <HostField
              label="Bank name"
              value={formState.bankName}
              onChange={updateField('bankName')}
              placeholder="Bank / provider"
            />
            <HostField
              label="Routing number"
              value={formState.routingNumber}
              onChange={updateField('routingNumber')}
              placeholder="Routing number (domestic)"
            />
            <HostField
              label="SWIFT / BIC code"
              value={formState.swiftCode}
              onChange={updateField('swiftCode')}
              placeholder="e.g., DEUTDEDB (international)"
            />
            <HostField
              label="IBAN"
              value={formState.iban}
              onChange={updateField('iban')}
              placeholder="e.g., DE89370400440532013000"
            />
            <HostField
              label="Account number"
              value={formState.accountNumber}
              onChange={updateField('accountNumber')}
              placeholder="Account number"
            />
            <HostField
              label="Currency"
              value={formState.currency}
              onChange={updateField('currency')}
              placeholder="USD / EUR / INR"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save account'}
            </button>
          </div>
        </SectionCard>
      </div>
    </HostShell>
  )
}
