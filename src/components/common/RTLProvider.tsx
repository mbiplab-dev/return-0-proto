// =============================================================================
// FILE: src/components/common/RTLProvider.tsx
// Provider for RTL support
// =============================================================================

import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface RTLProviderProps {
  children: React.ReactNode;
}

const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { isRTL, i18n } = useTranslation();

  useEffect(() => {
    // Update document direction when language changes
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Add RTL class to body for additional styling if needed
    if (isRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [isRTL, i18n.language]);

  return <>{children}</>;
};

export default RTLProvider;


