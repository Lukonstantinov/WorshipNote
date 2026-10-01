import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './ru.json'
import lt from './lt.json'
import en from './en.json'

/** Read the language persisted by the settings store so the first render is already correct. */
function savedLanguage(): string {
  try {
    const raw = localStorage.getItem('worshiphub-settings')
    const lang = raw ? JSON.parse(raw)?.state?.language : undefined
    return lang === 'ru' || lang === 'lt' || lang === 'en' ? lang : 'ru'
  } catch {
    return 'ru'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    lt: { translation: lt },
    en: { translation: en },
  },
  lng: savedLanguage(),
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

export default i18n
