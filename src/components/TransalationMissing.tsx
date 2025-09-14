// =============================================================================
// FILE: src/components/common/TranslationMissing.tsx
// Component to handle missing translations in development
// =============================================================================

import React from 'react';

interface TranslationMissingProps {
  translationKey: string;
  language: string;
}

const TranslationMissing: React.FC<TranslationMissingProps> = ({
  translationKey,
  language,
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 m-1 text-xs">
      <p className="text-yellow-700">
        Missing translation: <code>{translationKey}</code> for language <code>{language}</code>
      </p>
    </div>
  );
};

export default TranslationMissing;