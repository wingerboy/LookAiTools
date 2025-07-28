import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslations from '../locales/en.json'
import zhTranslations from '../locales/zh.json'

// 支持的语言列表
export const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'cn',
    name: '中文',
    flag: '🇨🇳'
  }
]

// 获取默认语言
const getDefaultLanguage = () => {
  // 优先从localStorage获取
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
    return savedLanguage
  }
  
  // 其次从浏览器语言检测
  const browserLanguage = navigator.language.toLowerCase()
  if (browserLanguage.startsWith('zh')) {
    return 'cn'
  }
  
  // 默认返回英文
  return 'en'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      cn: {
        translation: zhTranslations
      }
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React已经默认转义了
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language'
    }
  })

export default i18n
