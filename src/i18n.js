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
  es: {
    translation: {
      nav: {
        hostHome: 'Publica tu alojamiento',
        account: 'Cuenta',
        trips: 'Viajes',
        messages: 'Mensajes',
        notifications: 'Notificaciones',
        hostDashboard: 'Panel de anfitrión',
        hostProperty: 'Publicar propiedad',
        wishlists: 'Favoritos',
        logout: 'Cerrar sesión',
        signup: 'Registrarse',
        login: 'Iniciar sesión',
        anywhere: 'Cualquier lugar',
        anyWeek: 'Cualquier semana',
        addGuests: 'Agregar huéspedes',
      },
      homeSearch: {
        eyebrow: 'Compara estancias más rápido',
        title: 'Encuentra una estancia para tu viaje.',
        description:
          'Busca hoteles, compara detalles útiles y sigue explorando con la experiencia limpia de Travolish.',
        destination: 'Destino',
        destinationPlaceholder: 'Busca ciudades u hoteles',
        checkInOut: 'Entrada/salida',
        guests: 'Huéspedes',
        adults: 'Adultos',
        children: 'Niños',
        search: 'Buscar',
        flexibleDates: 'Fechas flexibles',
        selectCheckout: 'Elige salida',
      },
      region: {
        title: 'Idioma y región',
        subtitle: 'Elige cómo debe verse Travolish en este dispositivo.',
        language: 'Idioma',
        country: 'País o región',
        save: 'Listo',
      },
    },
  },
  fr: {
    translation: {
      nav: {
        hostHome: 'Mettre mon logement sur Travolish',
        account: 'Compte',
        trips: 'Voyages',
        messages: 'Messages',
        notifications: 'Notifications',
        hostDashboard: 'Tableau hôte',
        hostProperty: 'Ajouter une propriété',
        wishlists: 'Favoris',
        logout: 'Se déconnecter',
        signup: "S'inscrire",
        login: 'Se connecter',
        anywhere: 'Partout',
        anyWeek: 'Toute semaine',
        addGuests: 'Ajouter des voyageurs',
      },
      homeSearch: {
        eyebrow: 'Comparez plus vite',
        title: 'Trouvez un séjour adapté.',
        description:
          'Recherchez des hôtels, comparez les détails utiles et continuez avec une expérience Travolish claire.',
        destination: 'Destination',
        destinationPlaceholder: 'Rechercher villes ou hôtels',
        checkInOut: 'Arrivée/départ',
        guests: 'Voyageurs',
        adults: 'Adultes',
        children: 'Enfants',
        search: 'Rechercher',
        flexibleDates: 'Dates flexibles',
        selectCheckout: 'Choisir le départ',
      },
      region: {
        title: 'Langue et région',
        subtitle: 'Choisissez comment Travolish doit apparaître sur cet appareil.',
        language: 'Langue',
        country: 'Pays ou région',
        save: 'Terminé',
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
