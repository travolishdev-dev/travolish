import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import { getBankAccounts, registerBankAccount } from '../../services/bankAccountsApi'
import useHostContext from '../../hooks/useHostContext'

function adaptAccount(a) {
  return {
    id: a.id,
    label: a.accountHolderName ?? a.bankName ?? a.label ?? 'Bank account',
    type: a.accountType ?? a.type ?? '—',
    last4: a.lastFourDigits ?? a.last4 ?? '****',
    currency: a.currency ?? 'USD',
    status: a.verificationStatus ?? a.status ?? 'Pending',
    transferSpeed: a.transferSpeed ?? '1–2 business days',
  }
}

export default function HostBankAccountsPage() {
  const { hostId, loading: hostLoading } = useHostContext()
  const [accounts, setAccounts] = useState([])
  const [defaultAccountId, setDefaultAccountId] = useState(null)
  const [bankNotice, setBankNotice] = useState('')
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [formState, setFormState] = useState({
    accountName: '',
    bankName: '',
    routingNumber: '',
    accountNumber: '',
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
          setDefaultAccountId((current) => current ?? nextAccounts[0]?.id ?? null)
        }
      })
      .catch(() => {})
      .finally(() => setAccountsLoading(false))
  }, [hostId, hostLoading])

  const updateField = (field) => (event) =>
    setFormState((current) => ({ ...current, [field]: event.target.value }))

  async function handleSave() {
    if (!formState.accountName || !formState.accountNumber) return
    setSaving(true)
    try {
      await registerBankAccount(hostId, {
        accountHolderName: formState.accountName,
        bankName: formState.bankName,
        routingNumber: formState.routingNumber,
        accountNumber: formState.accountNumber,
        currency: formState.currency || 'USD',
      })
      const data = await getBankAccounts(hostId)
      const items = data?.content ?? (Array.isArray(data) ? data : null)
      if (items?.length) {
        const nextAccounts = items.map(adaptAccount)
        setAccounts(nextAccounts)
        setDefaultAccountId((current) => current ?? nextAccounts[0]?.id ?? null)
      }
      setFormState({ accountName: '', bankName: '', routingNumber: '', accountNumber: '', currency: '' })
    } catch {
      // keep current state
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

          {bankNotice ? (
            <div className="mt-5 rounded-2xl border border-brand/20 bg-rose-50 px-4 py-3 text-sm font-semibold text-brand">
              {bankNotice}
            </div>
          ) : null}

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
                    </p>
                    <p className="mt-3 text-sm leading-6 text-dark">
                      Typical transfer speed: {account.transferSpeed}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultAccountId(account.id)
                        setBankNotice(`${account.label} set as default payout destination in this UI view.`)
                      }}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                    >
                      Set default
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankNotice(`Delete requested for ${account.label}. Backend delete is not called in this UI pass.`)}
                      className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                    >
                      Delete
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
              placeholder="Routing number"
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
              placeholder="USD / EUR"
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
