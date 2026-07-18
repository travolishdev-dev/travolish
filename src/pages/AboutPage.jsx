import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Globe, Shield, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { get } from '../lib/api'

const FALLBACK_STATS = {
  properties: '12,000+',
  cities: '180+',
  rating: '4.8★',
  responseRate: '98%',
}

export default function AboutPage() {
  const { t } = useTranslation('pages')
  const [stats, setStats] = useState(FALLBACK_STATS)

  useEffect(() => {
    get('/api/about/stats')
      .then((data) => {
        if (data) {
          setStats({
            properties: data.properties ?? FALLBACK_STATS.properties,
            cities: data.cities ?? FALLBACK_STATS.cities,
            rating: data.rating ?? FALLBACK_STATS.rating,
            responseRate: data.responseRate ?? FALLBACK_STATS.responseRate,
          })
        }
      })
      .catch(() => {})
  }, [])

  const values = [
    { icon: Heart,  title: t('about.values.guestFirst'), body: 'Every decision we make starts with one question: does this make the stay better for the traveller? From discovery to checkout, we obsess over the details.' },
    { icon: Globe,  title: t('about.values.india'),      body: 'We started in India to connect domestic travellers with extraordinary properties — from heritage havelis to boutique hillside retreats — and we\'re growing globally.' },
    { icon: Shield, title: t('about.values.trust'),      body: 'We verify hosts, protect payments, and give both guests and hosts the tools they need to feel safe and supported throughout every booking.' },
    { icon: Users,  title: t('about.values.community'),  body: 'Travolish is more than a booking platform. It\'s a community of travellers and hosts who believe that where you stay shapes how you experience a place.' },
  ]

  const statItems = [
    { value: stats.properties,   label: t('about.stats.properties') },
    { value: stats.cities,       label: t('about.stats.cities') },
    { value: stats.rating,       label: t('about.stats.rating') },
    { value: stats.responseRate, label: t('about.stats.responseRate') },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">{t('about.eyebrow')}</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">
            {t('about.heading')}
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl leading-relaxed">
            Travolish was founded with a simple belief: every journey deserves a stay worth remembering.
            We connect travellers with handpicked hotels, guesthouses, and boutique properties — places
            that make a destination feel personal.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-16">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((s) => (
            <div key={s.label} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6 text-center">
              <p className="text-3xl font-bold text-dark">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="rounded-[28px] bg-dark p-8 md:p-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Our mission</p>
          <p className="text-2xl md:text-3xl font-semibold leading-snug">
            "To make exceptional stays accessible to every traveller — not just the ones who know where to look."
          </p>
          <p className="mt-5 text-white/70 leading-relaxed">
            We curate properties that meet high standards for quality, cleanliness, and hospitality. Every listing
            on Travolish is reviewed before going live, and we stand behind every booking.
          </p>
        </div>

        {/* Values */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">{t('about.valuesEyebrow')}</p>
          <h2 className="text-2xl font-bold text-dark mb-8">{t('about.valuesHeading')}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-brand mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-dark mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-[28px] bg-rose-50 border border-rose-100 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-dark text-lg">{t('about.cta')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('about.ctaDesc')}</p>
          </div>
          <Link
            to="/search"
            className="shrink-0 rounded-2xl bg-dark px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            {t('about.browseHotels')}
          </Link>
        </div>

      </div>
    </div>
  )
}
