import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.yaml'
import zh from './locales/zh.yaml'

function getLocale() {
  const languages = navigator.languages || [navigator.language]
  const supported = ['en', 'zh']
  for (let lang of languages) {
    lang = lang.toLowerCase()
    if (supported.includes(lang)) return lang
    if (supported.includes(lang.slice(0, 2))) return lang.slice(0, 2)
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh }
  },
  lng: getLocale(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
