import React from 'react';
import { useStory } from '../../contexts/StoryContext';
import LanguageSwitcher from '../LanguageSwitcher';
import SoundToggle from '../SoundToggle';
import { FormattedMessage } from 'react-intl';

export const StoryHeader: React.FC = () => {
  const { mode, toggleMode, activeNodeId, resetStory, themeVariant } = useStory();

  const getStepNumber = () => {
    switch (activeNodeId) {
      case 'welcome': return 1;
      case 'party_type': return 2;
      case 'vibe_check': return 3;
      case 'transport_needs': return 4;
      case 'recommendation': return 5;
      default: return 1;
    }
  };

  const currentStep = getStepNumber();
  const progressPercent = (currentStep / 5) * 100;

  const getBadgeColor = () => {
    switch (themeVariant) {
      case 'jungle_green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'sunset_gold': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'vip_obsidian': return 'bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]';
      default: return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-4 py-3 sm:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <span className="font-['Playfair_Display',serif] text-xl font-bold text-white tracking-tight">
            Ferreras<span className="text-teal-400">.tours</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor()}`}>
            📖 <span className="hidden sm:inline">Guided</span> Journey
          </span>
        </div>

        {/* Progress Bar */}
        {mode === 'story' && (
          <div className="flex-1 max-w-xs mx-4 hidden md:block">
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
              <span>Progress</span>
              <span>Step {currentStep} of 5</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-amber-300 to-orange-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Mode Switcher & Tools */}
        <div className="flex items-center gap-3">
          <SoundToggle />
          <LanguageSwitcher />

          <button
            onClick={toggleMode}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-md"
          >
            {mode === 'story' ? (
              <>
                <span>🛍️</span> <FormattedMessage id="header.catalogueView" defaultMessage="Catalogue View" />
              </>
            ) : (
              <>
                <span>📖</span> <FormattedMessage id="header.storyView" defaultMessage="Resume Story" />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
