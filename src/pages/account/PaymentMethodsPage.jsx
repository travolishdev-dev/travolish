import { useEffect, useState } from 'react'
import { CheckCheck, CreditCard, Loader2, Plus, ShieldEllipsis, Star, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../stores/useAuthStore'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { getUserPaymentMethods, addPaymentMethod } from '../../services/paymentMethodsApi'
import CountrySelect from '../../components/common/CountrySelect'

const NETWORK_COLORS = {
  VISA: 'from-slate-900 via-slate-800 to-slate-700',
  MASTERCARD: 'from-rose-600 via-orange-500 to-amber-400',
  AMEX: 'from-cyan-700 via-sky-600 to-blue-500',
  AMERICAN_EXPRESS: 'from-cyan-700 via-sky-600 to-blue-500',
  RUPAY: 'from-violet-700 via-purple-600 to-indigo-500',
  UPI: 'from-emerald-700 via-teal-600 to-cyan-500',
}

function adaptMethod(m) {
  const network = (m.cardNetwork ?? '').toUpperCase().replace(/\s+/g, '_')
  const color = NETWORK_COLORS[network] ?? 'from-slate-700 via-slate-600 to-slate-500'
  const expiry =
    m.cardExpiryMonth && m.cardExpiryYear
      ? `${String(m.cardExpiryMonth).padStart(2, '0')}/${String(m.cardExpiryYear).slice(-2)}`
      : '—'
  const type = m.cardType
    ? `${m.cardType.charAt(0)}${m.cardType.slice(1).toLowerCase()} card`
    : m.methodType ?? 'Card'

  return {
    id: m.id,
    type,
    brand: m.cardNetwork ?? m.methodName ?? m.methodType ?? 'Card',
    primary: m.isDefault ?? false,
    last4: m.cardLast4 ?? '••••',
    expiry,
    color,
  }
}

export default function PaymentMethodsPage() {
  const { t } = useTranslation('account')
  const { user } = useAuthStore()
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [billing, setBilling] = useState({
    cardholderName: user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '',
    billingEmail: user?.email ?? '',
    country: '',
    postalCode: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [addingCard, setAddingCard] = useState(false)
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [cardSaving, setCardSaving] = useState(false)
  const [cardMsg, setCardMsg] = useState('')

  const updateBilling = (field) => (e) => setBilling((prev) => ({ ...prev, [field]: e.target.value }))
  const updateCard = (field) => (e) => setCardForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSaveBilling() {
    if (!billing.cardholderName.trim()) { setSaveMsg(t('account:payments.nameRequired')); return }
    setSaving(true); setSaveMsg('')
    try {
      await addPaymentMethod({
        methodType: 'CARD',
        methodName: billing.cardholderName,
        billingEmail: billing.billingEmail,
        billingCountry: billing.country,
        billingPostalCode: billing.postalCode,
        isDefault: methods.length === 0,
      })
      setSaveMsg(t('account:payments.savedMsg'))
      const data = await getUserPaymentMethods()
      const items = Array.isArray(data) ? data : (data?.content ?? [])
      setMethods(items.map(adaptMethod))
    } catch {
      setSaveMsg(t('account:payments.savedError'))
    } finally {
      setSaving(false)
    }
  }

  async function handleAddCard(e) {
    e.preventDefault()
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvv) {
      setCardMsg(t('account:payments.cardFieldsRequired')); return
    }
    setCardSaving(true); setCardMsg('')
    try {
      const [expMonth, expYear] = cardForm.expiry.split('/')
      await addPaymentMethod({
        methodType: 'CARD',
        cardLast4: cardForm.number.replace(/\s/g, '').slice(-4),
        cardExpiryMonth: parseInt(expMonth, 10),
        cardExpiryYear: 2000 + parseInt(expYear?.trim(), 10),
        cardNetwork: 'VISA',
        methodName: cardForm.name || billing.cardholderName,
        isDefault: methods.length === 0,
      })
      setCardMsg(t('account:payments.cardAdded'))
      setAddingCard(false)
      setCardForm({ number: '', expiry: '', cvv: '', name: '' })
      const data = await getUserPaymentMethods()
      const items = Array.isArray(data) ? data : (data?.content ?? [])
      setMethods(items.map(adaptMethod))
    } catch {
      setCardMsg(t('account:payments.cardError'))
    } finally {
      setCardSaving(false)
    }
  }

  const transactionSummary = [
    { label: t('account:payments.savedCards'), value: loading ? '—' : String(methods.length), Icon: WalletCards, bg: 'bg-sky-50 text-sky-700' },
    { label: t('account:payments.defaultMethod'), value: methods.find((m) => m.primary)?.brand ?? (loading ? '—' : t('account:payments.noMethod')), Icon: Star, bg: 'bg-amber-50 text-amber-600' },
    { label: t('account:payments.billingStatus'), value: methods.length > 0 ? t('account:payments.ready') : (loading ? '—' : t('account:payments.noCard')), Icon: ShieldEllipsis, bg: 'bg-emerald-50 text-emerald-700' },
  ]

  useEffect(() => {
    getUserPaymentMethods()
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        setMethods(items.map(adaptMethod))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AccountShell
      title={t('account:payments.title')}
      mobileTitle={t('account:payments.mobileTitle')}
      description={t('account:payments.desc')}
      mobileBottomAction={{ label: t('account:payments.saveBilling'), href: '/account/payments' }}
      actions={[
        { label: t('account:payments.seeTransactions'), href: '/account/transactions', secondary: true },
        { label: t('account:payments.addMethod'), href: '/account/payments' },
      ]}
      accent="from-slate-100 via-white to-rose-50"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard>
          <SectionHeading
            eyebrow={t('account:payments.walletEyebrow')}
            title={t('account:payments.walletTitle')}
            description={t('account:payments.walletDesc')}
          />

          {loading ? (
            <div className="mt-6 py-10 text-center text-sm text-muted">{t('account:payments.loading')}</div>
          ) : methods.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-[#fcfcfb] py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-muted">
                <WalletCards size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">No payment methods yet</p>
                <p className="mt-1 text-xs text-muted">Add a card below to get started</p>
              </div>
              <button
                type="button"
                onClick={() => setAddingCard(true)}
                className="inline-flex items-center gap-2 rounded-full bg-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                <Plus size={15} />
                Add Card
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${method.color} p-[1px] shadow-[0_18px_45px_rgba(15,23,42,0.18)]`}
                >
                  <div className="h-full rounded-[27px] bg-black/10 p-5 text-white backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                          {method.type}
                        </p>
                        <p className="mt-4 text-2xl font-semibold tracking-tight">
                          {method.brand}
                        </p>
                      </div>
                      {method.primary ? (
                        <StatusPill tone="success">{t('account:payments.primaryCard')}</StatusPill>
                      ) : (
                        <StatusPill tone="sky">{t('account:payments.backupCard')}</StatusPill>
                      )}
                    </div>

                    <div className="mt-10 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                          {t('account:payments.cardEnding')}
                        </p>
                        <p className="mt-1 text-lg font-semibold">•••• {method.last4}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                          {t('account:payments.expires')}
                        </p>
                        <p className="mt-1 text-lg font-semibold">{method.expiry}</p>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/15"
                      >
                        {method.primary ? t('account:payments.editCard') : t('account:payments.setAsPrimary')}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
                      >
                        {t('account:payments.removeCard')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow={t('account:payments.snapshotEyebrow')}
              title={t('account:payments.snapshotTitle')}
              description={t('account:payments.snapshotDesc')}
            />

            <div className="mt-6 space-y-3">
              {transactionSummary.map(({ label, value, Icon, bg }) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 rounded-xl p-2 ${bg}`}>
                      <Icon size={14} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted truncate">
                      {label}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-sm font-bold text-dark tabular-nums">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="rounded-[24px] bg-dark p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldEllipsis size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    {t('account:payments.securityLabel')}
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {t('account:payments.tokenized')}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/80">
                {t('account:payments.tokenizedDesc')}
              </p>
            </div>

            <div className="mt-4 border-t border-dashed border-gray-200 pt-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <WalletCards size={20} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  {t('account:payments.walletNote')}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard>
        <SectionHeading
          eyebrow={t('account:payments.billingEyebrow')}
          title={t('account:payments.billingTitle')}
          description={t('account:payments.billingDesc')}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { key: 'cardholderName', label: t('account:payments.cardholderName'), placeholder: t('account:payments.cardholderPlaceholder') },
            { key: 'billingEmail',   label: t('account:payments.billingEmail'),   placeholder: 'you@example.com', type: 'email' },
            { key: 'postalCode',     label: t('account:payments.postalCode'),      placeholder: '110001' },
          ].map(({ key, label, placeholder, type = 'text' }) => (
            <label key={key} className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {label}
              </span>
              <input
                type={type}
                value={billing[key]}
                onChange={updateBilling(key)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
              />
            </label>
          ))}
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t('account:payments.country')}
            </span>
            <CountrySelect
              value={billing.country}
              onChange={(v) => setBilling((prev) => ({ ...prev, country: v }))}
              placeholder="Select country"
              inputClass="rounded-2xl !h-[50px] text-base bg-[#fcfcfb] md:text-sm"
            />
          </div>
        </div>

        {saveMsg && (
          <p className={`mt-3 text-sm font-semibold ${saveMsg === t('account:payments.savedMsg') ? 'text-emerald-600' : 'text-red-500'}`}>
            {saveMsg}
          </p>
        )}

        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={handleSaveBilling}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            {saving ? t('account:payments.saving') : t('account:payments.saveBillingBtn')}
          </button>
          <button
            type="button"
            onClick={() => { setAddingCard((v) => !v); setCardMsg('') }}
            className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            {addingCard ? t('account:payments.cancel') : t('account:payments.addNewCard')}
          </button>
        </div>

        {addingCard && (
          <form onSubmit={handleAddCard} className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="mb-4 text-sm font-semibold text-dark">{t('account:payments.newCardDetails')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t('account:payments.nameOnCard')}</span>
                <input type="text" value={cardForm.name} onChange={updateCard('name')}
                  placeholder="Full name" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-dark" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t('account:payments.cardNumber')}</span>
                <input type="text" value={cardForm.number} onChange={updateCard('number')}
                  placeholder="4242 4242 4242 4242" maxLength={19} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-dark" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t('account:payments.expiry')}</span>
                <input type="text" value={cardForm.expiry} onChange={updateCard('expiry')}
                  placeholder="06/27" maxLength={5} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-dark" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t('account:payments.cvv')}</span>
                <input type="password" value={cardForm.cvv} onChange={updateCard('cvv')}
                  placeholder="•••" maxLength={4} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-dark" />
              </label>
            </div>
            {cardMsg && (
              <p className={`mt-2 text-sm font-semibold ${cardMsg === t('account:payments.cardAdded') ? 'text-emerald-600' : 'text-red-500'}`}>{cardMsg}</p>
            )}
            <button type="submit" disabled={cardSaving}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50">
              {cardSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCheck size={15} />}
              {cardSaving ? t('account:payments.adding') : t('account:payments.addCard')}
            </button>
          </form>
        )}
      </SectionCard>
    </AccountShell>
  )
}
