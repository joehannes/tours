import React, { useEffect, useState } from 'react';
import { useI18n, type Locale } from '../contexts/I18nContext';
import SoundToggle from './SoundToggle';

const DIRECTIONS: Array<{ code: Locale; short: string; name: string; direction: 'north' | 'east' | 'south' | 'west' }> = [
  { code: 'en', short: 'EN', name: 'English', direction: 'north' },
  { code: 'de', short: 'DE', name: 'Deutsch', direction: 'east' },
  { code: 'es', short: 'ES', name: 'Español', direction: 'south' },
  { code: 'fr', short: 'FR', name: 'Français', direction: 'west' },
];

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const [selectedCode, setSelectedCode] = useState<Locale>(locale);
  useEffect(() => setSelectedCode(locale), [locale]);
  const selected = DIRECTIONS.find((item) => item.code === selectedCode) ?? DIRECTIONS[0];

  return (
    <div className="language-compass" aria-label="Language and sound controls">
      <span className="compass-rings" aria-hidden="true" />
      <span className={`compass-needle compass-needle-${selected.direction}`} aria-hidden="true" />
      {DIRECTIONS.map((language) => (
        <button
          key={language.code}
          type="button"
          title={language.name}
          aria-label={`Switch language to ${language.name}`}
          aria-pressed={selectedCode === language.code}
          onClick={() => {
            setSelectedCode(language.code);
            setLocale(language.code);
          }}
          className={`compass-language compass-language-${language.direction} ${selectedCode === language.code ? 'active' : ''}`}
        >
          {language.short}
        </button>
      ))}
      <div className="compass-sound" title="Sound effects"><SoundToggle /></div>
    </div>
  );
};

export default LanguageSwitcher;
