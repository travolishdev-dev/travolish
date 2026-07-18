import { useState, useRef, useEffect } from 'react'
import { Mail, Phone, Clock, CheckCircle2, ChevronDown, Check } from 'lucide-react'

const contacts = [
  { icon: Mail, label: 'Email support', value: 'support@travolish.com', note: 'Response within 4 hours' },
  { icon: Phone, label: 'Phone support', value: '+91 80 4567 8900', note: 'Mon–Sun, 8am–10pm IST' },
  { icon: Clock, label: 'Live chat', value: 'Available on the platform', note: 'Average wait: under 2 minutes' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [subjectOpen, setSubjectOpen] = useState(false)
  const subjectRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) setSubjectOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand/5 via-white to-white border-b border-rose-100/60">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Support</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-dark">Contact us</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl leading-relaxed">
            We're here to help. Reach out through any of the channels below or send us a message and we'll get back to you quickly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

          {/* Form */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Send a message</p>
            <h2 className="text-2xl font-bold text-dark mb-6">Get in touch</h2>

            {sent ? (
              <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-3" />
                <h3 className="font-bold text-dark text-lg">Message sent!</h3>
                <p className="text-sm text-gray-500 mt-1">We'll respond to {form.email} within 4 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1.5">Your name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Priya Sharma"
                      className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark mb-1.5">Email address</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="priya@example.com"
                      className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">Subject</label>
                  <div ref={subjectRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setSubjectOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-brand"
                    >
                      <span className={form.subject ? 'text-dark' : 'text-muted'}>
                        {form.subject || 'Select a topic…'}
                      </span>
                      <ChevronDown size={14} className="shrink-0 text-muted" />
                    </button>
                    {subjectOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                        {['Booking issue', 'Payment problem', 'Host support', 'Account access', 'Report a listing', 'Other'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              handleChange({ target: { name: 'subject', value: opt } })
                              setSubjectOpen(false)
                            }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${form.subject === opt ? 'text-dark' : 'text-muted'}`}
                          >
                            {opt}
                            {form.subject === opt && <Check size={14} className="shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your issue or question in as much detail as possible…"
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none focus:border-brand resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand px-4 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                >
                  Send message
                </button>
              </form>
            )}
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Other ways to reach us</p>
            {contacts.map(({ icon: Icon, label, value, note }) => (
              <div key={label} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-brand">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-dark">{label}</span>
                </div>
                <p className="text-sm text-dark font-medium">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{note}</p>
              </div>
            ))}

            <div className="rounded-[28px] bg-dark p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">For hosts</p>
              <p className="text-sm font-semibold">Host support line</p>
              <p className="text-sm text-white/70 mt-1">Dedicated support for hosts with active listings.</p>
              <p className="text-sm font-semibold text-brand mt-2">hosts@travolish.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
