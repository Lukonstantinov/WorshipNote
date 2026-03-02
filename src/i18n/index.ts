import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './ru.json'
import lt from './lt.json'
import en from './en.json'

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    lt: { translation: lt },
    en: { translation: en },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

export default i18n
