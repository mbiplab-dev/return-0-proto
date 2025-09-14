// Install dependencies first:
// npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend

// =============================================================================
// FILE: src/i18n/index.ts
// =============================================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import all translation files
import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi }, // Hindi
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      caches: ['localStorage', 'sessionStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
