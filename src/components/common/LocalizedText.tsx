import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface LocalizedTextProps {
  translationKey: string;
  values?: Record<string, any>;
  fallback?: string;
  className?: string;
  as?: React.ElementType; // Use React.ElementType instead of keyof JSX.IntrinsicElements
  children?: React.ReactNode;
}

const LocalizedText: React.FC<LocalizedTextProps> = ({
  translationKey,
  values,
  fallback,
  className = '',
  as: Component = 'span', // Component is now typed as React.ElementType
  children,
}) => {
  const { t, isRTL } = useTranslation();

  const directionClass = isRTL ? 'rtl' : 'ltr';
  const textDirection = isRTL ? 'rtl' : 'ltr';

  return (
    <Component
      className={`${className} ${directionClass}`}
      dir={textDirection}
    >
      {t(translationKey, fallback || translationKey, values)}
      {children}
    </Component>
  );
};

export default LocalizedText;