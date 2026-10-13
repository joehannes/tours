import React, { useEffect, useState } from 'react';
import { useI18n, type Locale } from '../contexts/I18nContext';
import SoundToggle from './SoundToggle';

const DIRECTIONS: Array<{ code: Locale; short: string; name: string; direction: 'north' | 'east' | 'south' | 'west' }> = [
  { code: 'en', short: 'EN', name: 'English', direction: 'north' },
  { code: 'de', short: 'DE', name: 'Deutsch', direction: 'east' },
  { code: 'es', short: 'ES', name: 'Español', direction: 'south' },
  { code: 'fr', short: 'FR', name: 'Français', direction: 'west' },
];

const FLAG_BACKGROUNDS: Record<Locale, string> = {
  en: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(60,130,246,0.52) 30%, rgba(12,74,110,0.78) 100%)',
  de: 'linear-gradient(135deg, rgba(255,205,0,0.7) 0 33%, rgba(0,0,0,0.18) 33% 66%, rgba(255,0,0,0.72) 66% 100%)',
  es: 'linear-gradient(135deg, rgba(255,205,0,0.72) 0 33%, rgba(255,255,255,0.88) 33% 66%, rgba(198,40,40,0.82) 66% 100%)',
  fr: 'linear-gradient(135deg, rgba(0,85,164,0.75) 0 33%, rgba(255,255,255,0.9) 33% 66%, rgba(239,65,53,0.8) 66% 100%)',
};

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const [selectedCode, setSelectedCode] = useState<Locale>(locale);
  useEffect(() => setSelectedCode(locale), [locale]);
  const selected = DIRECTIONS.find((item) => item.code === selectedCode) ?? DIRECTIONS[0];
  const compassBackground = FLAG_BACKGROUNDS[selectedCode] ?? FLAG_BACKGROUNDS.en;

  return (
    <div className="language-compass" aria-label="Language and sound controls" style={{ background: compassBackground }}>
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
