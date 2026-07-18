import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

export const ALL_NS = [
  'common', 'nav', 'auth', 'home', 'search', 'property',
  'booking', 'trips', 'messages', 'wishlist',
  'notifications', 'offers', 'account',
  'host', 'admin', 'footer', 'pages',
]

export const SUPPORTED_LANGS = ['en', 'hi', 'es', 'fr', 'ar']
export const RTL_LANGS = new Set(['ar'])

// host and admin panels are English-only; always load en JSON for these
const EN_ONLY_NS = new Set(['host', 'admin'])

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGS,
    fallbackLng: 'en',
    ns: ALL_NS,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
    detection: {
      // Check localStorage first, then browser Accept-Language, then <html lang>
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'travolish.language',
      caches: ['localStorage'],
    },
    backend: {
      // Per-namespace language override: EN_ONLY_NS always load from /locales/en/
      loadPath: (lngs, nss) => {
        const lng = lngs[0]
        const ns = nss[0]
        const resolvedLng =
          EN_ONLY_NS.has(ns)
            ? 'en'
            : SUPPORTED_LANGS.includes(lng) ? lng : 'en'
        return `/locales/${resolvedLng}/${ns}.json`
      },
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window === 'undefined') return
  // Persist explicit user choice
  window.localStorage.setItem('travolish.language', lng)
  // Sync HTML attributes so CSS :lang() selectors and browser tools work
  const dir = RTL_LANGS.has(lng) ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('lang', lng)
  document.documentElement.setAttribute('dir', dir)
})

export default i18n
