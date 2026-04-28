import { useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostField } from '../../components/host/HostFormFields'
import { hostBankAccounts } from '../../data/mockHostPortalData'

export default function HostBankAccountsPage() {
  const [formState, setFormState] = useState({
    accountName: '',
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    currency: '',
  })

  const updateField = (field) => (event) =>
    setFormState((current) => ({ ...current, [field]: event.target.value }))

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
      mobileAction={{ label: 'Save', href: '/host/bank-accounts' }}
      mobileBottomAction={{ label: 'Save account', href: '/host/bank-accounts' }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard>
          <SectionHeading eyebrow="Accounts" title="Connected payout destinations" />

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {hostBankAccounts.map((account) => (
              <div key={account.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{account.label}</p>
                      <StatusPill tone={account.status === 'Verified' ? 'success' : 'warning'}>
                        {account.status}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {account.type} · {account.currency} · •••• {account.last4}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-dark">
                      Typical transfer speed: {account.transferSpeed}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading eyebrow="Add account" title="New payout destination" />

          <div className="mt-6 grid gap-4">
            <HostField label="Account holder" value={formState.accountName} onChange={updateField('accountName')} placeholder="Legal account holder" />
            <HostField label="Bank name" value={formState.bankName} onChange={updateField('bankName')} placeholder="Bank / provider" />
            <HostField label="Routing number" value={formState.routingNumber} onChange={updateField('routingNumber')} placeholder="Routing number" />
            <HostField label="Account number" value={formState.accountNumber} onChange={updateField('accountNumber')} placeholder="Account number" />
            <HostField label="Currency" value={formState.currency} onChange={updateField('currency')} placeholder="USD / EUR" />
          </div>
        </SectionCard>
      </div>
    </HostShell>
  )
}
