// =============================================================================
// COMPONENT: Header Component with i18n support
// File path: src/components/layout/Header.tsx
// =============================================================================

import { ChevronRight } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

interface HeaderProps {
  title?: string;
  titleKey?: string; // For translation key
  subtitle?: string;
  subtitleKey?: string; // For translation key
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  titleKey,
  subtitle,
  subtitleKey,
  rightAction,
  showBack,
  onBack,
}) => {
  const { t, isRTL } = useTranslation();

  const displayTitle = titleKey ? t(titleKey) : title;
  const displaySubtitle = subtitleKey ? t(subtitleKey) : subtitle;

  return (
    <div className={`flex items-center justify-between p-4 bg-white border-b border-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            aria-label={t('common.back')}
          >
            <ChevronRight 
              size={20} 
              className={`text-gray-600 ${isRTL ? 'rotate-0' : 'rotate-180'}`} 
            />
          </button>
        )}
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-lg font-semibold text-gray-900">{displayTitle}</h1>
          {displaySubtitle && <p className="text-sm text-gray-500">{displaySubtitle}</p>}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
};

export default Header;