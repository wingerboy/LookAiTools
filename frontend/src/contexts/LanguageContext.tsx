import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from '../i18n'

interface LanguageContextType {
  currentLanguage: string
  changeLanguage: (language: string) => void
  languages: typeof languages
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language)
      setCurrentLanguage(language)
      localStorage.setItem('language', language)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    languages
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
