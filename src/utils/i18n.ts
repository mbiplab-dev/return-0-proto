// =============================================================================
// FILE: src/utils/i18n.ts
// Additional i18n utilities
// =============================================================================

import type { TFunction } from 'i18next';

// Format numbers according to the current locale
export const formatNumber = (
  number: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(number);
};

// Format dates according to the current locale
export const formatDate = (
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date passed to formatDate:', date);
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};


// Format time with proper locale
export const formatTime = (
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);
};

// Get relative time (e.g., "2 minutes ago")
export const getRelativeTime = (
  date: Date | string,
  locale: string,
  t: TFunction
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return t('common.justNow', 'Just now');
  } else if (diffMinutes < 60) {
    return t('common.minutesAgo', '{{count}} min ago', { count: diffMinutes });
  } else if (diffHours < 24) {
    return t('common.hoursAgo', '{{count}}h ago', { count: diffHours });
  } else if (diffDays < 7) {
    return t('common.daysAgo', '{{count}}d ago', { count: diffDays });
  } else {
    return formatDate(dateObj, locale, { month: 'short', day: 'numeric' });
  }
};

// Get greeting based on time of day
export const getTimeBasedGreeting = (t: TFunction): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return t('home.goodMorning');
  } else if (hour < 17) {
    return t('home.goodAfternoon');
  } else {
    return t('home.goodEvening');
  }
};

// Helper to get proper text direction classes
export const getDirectionClasses = (isRTL: boolean) => ({
  text: isRTL ? 'text-right' : 'text-left',
  margin: isRTL ? 'mr-auto' : 'ml-auto',
  padding: isRTL ? 'pr-4' : 'pl-4',
  float: isRTL ? 'float-right' : 'float-left',
  border: isRTL ? 'border-r' : 'border-l',
});

