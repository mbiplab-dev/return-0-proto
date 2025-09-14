// =============================================================================
// FILE: src/hooks/useTranslation.ts
// Custom hook with additional utilities for the app
// =============================================================================

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { getLanguageByCode } from '../i18n/languages';

export const useTranslation = (namespace?: string) => {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  const currentLanguage = useMemo(() => {
    return getLanguageByCode(i18n.language);
  }, [i18n.language]);

  const isRTL = useMemo(() => {
    return currentLanguage?.rtl || false;
  }, [currentLanguage]);

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      
      // Update document direction
      const selectedLang = getLanguageByCode(languageCode);
      document.documentElement.dir = selectedLang?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      
      // Store in localStorage
      localStorage.setItem('i18nextLng', languageCode);
      
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  };

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    isRTL,
    changeLanguage,
  };
};

