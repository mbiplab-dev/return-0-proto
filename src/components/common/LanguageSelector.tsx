// =============================================================================
// COMPONENT: Language Selector
// File path: src/components/common/LanguageSelector.tsx
// =============================================================================

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";
import { supportedLanguages, getLanguageByCode } from "../../i18n/languages";

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showNativeName?: boolean;
  compact?: boolean;
  onSelect?: () => void; // Add onSelect prop
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = "",
  showFlag = true,
  showNativeName = true,
  compact = false,
  onSelect, // Destructure onSelect
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    getLanguageByCode(i18n.language) || supportedLanguages[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);

      // Update document direction for RTL languages
      const selectedLang = getLanguageByCode(languageCode);
      document.documentElement.dir = selectedLang?.rtl ? "ltr" : "ltr";

      // Store in localStorage
      localStorage.setItem("i18nextLng", languageCode);

      // Call onSelect callback if provided
      if (onSelect) {
        onSelect();
      }
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 bg-white/80 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label="Select language"
        >
          <Globe size={16} className="text-gray-600" />
          {showFlag && <span className="text-sm">{currentLanguage.flag}</span>}
          <ChevronDown
            size={14}
            className={`text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      i18n.language === language.code
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {showFlag && (
                      <span className="text-lg">{language.flag}</span>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{language.name}</div>
                      {showNativeName && (
                        <div className="text-sm text-gray-500">
                          {language.nativeName}
                        </div>
                      )}
                    </div>
                    {i18n.language === language.code && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Globe size={20} className="text-gray-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Language</div>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              {showFlag && <span>{currentLanguage.flag}</span>}
              <span>
                {showNativeName
                  ? currentLanguage.nativeName
                  : currentLanguage.name}
              </span>
            </div>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    i18n.language === language.code
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {showFlag && <span className="text-lg">{language.flag}</span>}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{language.name}</div>
                    {showNativeName &&
                      language.nativeName !== language.name && (
                        <div className="text-sm text-gray-500">
                          {language.nativeName}
                        </div>
                      )}
                  </div>
                  {i18n.language === language.code && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;