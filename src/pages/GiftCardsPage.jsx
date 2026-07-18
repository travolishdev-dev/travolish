import { useState } from 'react'
import { Gift, CheckCircle } from 'lucide-react'

const amounts = [500, 1000, 2000, 5000, 10000]

const occasions = [
  { emoji: '🎂', label: 'Birthday' },
  { emoji: '💍', label: 'Anniversary' },
  { emoji: '💼', label: 'Work milestone' },
  { emoji: '🎄', label: 'Festive season' },
  { emoji: '🎓', label: 'Graduation' },
  { emoji: '💝', label: 'Just because' },
]

const faqs = [
  { q: 'Do gift cards expire?', a: 'Travolish gift cards are valid for 24 months from the date of purchase.' },
  { q: 'Can I use a gift card for part of a booking?', a: 'Yes. Gift card credits apply at checkout and any remaining balance stays in your account for future bookings.' },
  { q: 'Can I refund a gift card?', a: 'Gift cards are non-refundable once purchased. However, the recipient can use the credit on any available property on Travolish.' },
  { q: 'How is the gift card delivered?', a: 'Instantly via email to the recipient\'s inbox, with a personalised message from you.' },
]

export default function GiftCardsPage() {
  const [selected, setSelected] = useState(2000)
  const [custom, setCustom] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const finalAmount = custom ? Number(custom) : selected

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Discover</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">
            Give the gift of <span className="text-brand">travel</span>.
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl leading-relaxed">
            A Travolish gift card lets someone you love choose their own perfect stay — from a city hotel to a mountain retreat.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">

          {/* Form */}
          <div className="space-y-8">
            {/* Occasion chips */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Occasion</p>
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button key={o.label} className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#fcfcfb] px-3 py-1.5 text-sm text-gray-600 hover:border-rose-200 hover:text-brand transition-colors">
                    {o.emoji} {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Amount</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setSelected(a); setCustom('') }}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      selected === a && !custom
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-[#fcfcfb] text-dark hover:border-dark'
                    }`}
                  >
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Custom amount (₹250 – ₹50,000)"
                value={custom}
                onChange={(e) => { setCustom(e.target.value.replace(/\D/g, '')); setSelected(null) }}
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
              />
            </div>

            {/* Recipient */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Recipient</p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Recipient's email address"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark"
                />
                <textarea
                  rows={3}
                  placeholder="Add a personal message (optional)…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-dark resize-none"
                />
              </div>
            </div>
          </div>

          {/* Preview card + checkout */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-1">Preview</p>

            {/* Card preview */}
            <div className="rounded-[28px] bg-dark p-7 text-white">
              <Gift size={28} className="text-brand mb-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Travolish Gift Card</p>
              <p className="mt-3 text-4xl font-bold">
                ₹{finalAmount ? Number(finalAmount).toLocaleString() : '—'}
              </p>
              {message && <p className="mt-4 text-sm text-white/70 italic leading-relaxed">"{message}"</p>}
              <p className="mt-4 text-xs text-white/40">Valid for 24 months · Redeemable on all Travolish stays</p>
            </div>

            {sent ? (
              <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle size={28} className="mx-auto text-emerald-600 mb-2" />
                <p className="font-bold text-dark">Gift card sent!</p>
                <p className="text-sm text-gray-500 mt-1">Delivered to {recipientEmail}</p>
              </div>
            ) : (
              <button
                onClick={() => recipientEmail && finalAmount >= 250 && setSent(true)}
                disabled={!recipientEmail || !finalAmount || finalAmount < 250}
                className="w-full rounded-2xl bg-brand px-4 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Send gift card · ₹{finalAmount ? Number(finalAmount).toLocaleString() : '0'}
              </button>
            )}

            {/* FAQs */}
            <div className="space-y-2 pt-2">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-4">
                  <p className="text-xs font-semibold text-dark mb-1">{f.q}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
