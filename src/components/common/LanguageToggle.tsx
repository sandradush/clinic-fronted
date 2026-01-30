import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'rw', name: 'Kinyarwanda' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="language-toggle">
      <button className="language-btn">
        <Globe size={16} />
        <span>{currentLanguage.name}</span>
      </button>
      <div className="language-dropdown">
        {languages.map((language) => (
          <button
            key={language.code}
            className={`dropdown-item ${i18n.language === language.code ? 'active' : ''}`}
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageToggle;
