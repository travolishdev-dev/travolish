import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        hostHome: 'Travolish your home',
        account: 'Account',
        trips: 'Trips',
        messages: 'Messages',
        notifications: 'Notifications',
        hostDashboard: 'Host dashboard',
        hostProperty: 'Host your property',
        wishlists: 'Wishlists',
        logout: 'Log out',
        signup: 'Sign up',
        login: 'Log in',
        anywhere: 'Anywhere',
        anyWeek: 'Any week',
        addGuests: 'Add guests',
      },
      homeSearch: {
        eyebrow: 'Compare stays faster',
        title: 'Find a stay that fits your trip.',
        description:
          'Search hotels, compare useful details, and keep browsing without losing the clean Travolish experience.',
        destination: 'Destination',
        destinationPlaceholder: 'Search Indian cities or hotels',
        checkInOut: 'Check-in/out',
        guests: 'Guests',
        adults: 'Adults',
        children: 'Children',
        search: 'Search',
        flexibleDates: 'Flexible dates',
        selectCheckout: 'Select checkout',
      },
      region: {
        title: 'Language and region',
        subtitle: 'Choose how Travolish should appear on this device.',
        language: 'Language',
        country: 'Country or region',
        save: 'Done',
      },
    },
  },
  hi: {
    translation: {
      nav: {
        hostHome: 'अपना घर Travolish पर दें',
        account: 'खाता',
        trips: 'यात्राएं',
        messages: 'संदेश',
        notifications: 'सूचनाएं',
        hostDashboard: 'होस्ट डैशबोर्ड',
        hostProperty: 'अपनी प्रॉपर्टी होस्ट करें',
        wishlists: 'इच्छा सूची',
        logout: 'लॉग आउट',
        signup: 'साइन अप',
        login: 'लॉग इन',
        anywhere: 'कहीं भी',
        anyWeek: 'कोई भी सप्ताह',
        addGuests: 'मेहमान जोड़ें',
      },
      homeSearch: {
        eyebrow: 'तेजी से स्टे तुलना करें',
        title: 'अपनी यात्रा के लिए सही स्टे खोजें.',
        description:
          'होटल खोजें, जरूरी विवरणों की तुलना करें, और साफ Travolish अनुभव में ब्राउज करते रहें.',
        destination: 'गंतव्य',
        destinationPlaceholder: 'भारतीय शहर या होटल खोजें',
        checkInOut: 'चेक-इन/आउट',
        guests: 'मेहमान',
        adults: 'वयस्क',
        children: 'बच्चे',
        search: 'खोजें',
        flexibleDates: 'लचीली तारीखें',
        selectCheckout: 'चेकआउट चुनें',
      },
      region: {
        title: 'भाषा और क्षेत्र',
        subtitle: 'इस डिवाइस पर Travolish कैसे दिखे, यह चुनें.',
        language: 'भाषा',
        country: 'देश या क्षेत्र',
        save: 'पूर्ण',
      },
    },
  },
}

const storedLanguage =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('travolish.language')
    : null

i18n.use(initReactI18next).init({
  resources,
  lng: storedLanguage || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('travolish.language', language)
  }
})

export default i18n
