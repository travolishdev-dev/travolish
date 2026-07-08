import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const ALL_NS = [
  'common', 'nav', 'home', 'search', 'property',
  'booking', 'trips', 'messages', 'wishlist',
  'notifications', 'offers', 'account',
  'host', 'admin', 'footer', 'pages',
]

const TRANSLATED_LANGS = ['en', 'hi', 'es', 'fr']
// host and admin are English-only
const EN_ONLY_NS = new Set(['host', 'admin'])

const backendPlugin = {
  type: 'backend',
  read(lng, ns, callback) {
    const lang = TRANSLATED_LANGS.includes(lng) ? lng : 'en'
    const resolvedLng = EN_ONLY_NS.has(ns) ? 'en' : lang
    import(`./locales/${resolvedLng}/${ns}.json`)
      .then(m => callback(null, m.default))
      .catch(() =>
        import(`./locales/en/${ns}.json`)
          .then(m => callback(null, m.default))
          .catch(err => callback(err, null))
      )
  },
}

const storedLanguage =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('travolish.language')
    : null

i18n
  .use(backendPlugin)
  .use(initReactI18next)
  .init({
    lng: storedLanguage || 'en',
    fallbackLng: 'en',
    ns: ALL_NS,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  })

i18n.on('languageChanged', lng => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('travolish.language', lng)
  }
})

export default i18n
