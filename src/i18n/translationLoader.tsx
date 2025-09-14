// =============================================================================
// FILE: src/i18n/translationLoader.ts
// Dynamic translation loader for code splitting
// =============================================================================

export const loadTranslations = async (language: string) => {
  try {
    const translations = await import(`./locales/${language}.json`);
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translations for language: ${language}`, error);
    // Fallback to English
    const fallback = await import('./locales/en.json');
    return fallback.default;
  }
};
