import React from 'react';
import { useStory } from '../../contexts/StoryContext';
import { FormattedMessage } from 'react-intl';
import { FaBookOpen, FaThList, FaRedoAlt } from 'react-icons/fa';

export const StoryFloatingControls: React.FC = () => {
  const { mode, toggleMode, resetStory, activeNodeId } = useStory();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
      <div className="flex items-center justify-center gap-2 p-2 rounded-full backdrop-blur-2xl bg-slate-950/80 border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
        <button
          onClick={toggleMode}
          className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            mode === 'story'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <FaBookOpen /> <FormattedMessage id="floating.guidedStory" defaultMessage="Guided Story" />
        </button>

        <button
          onClick={toggleMode}
          className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            mode === 'catalogue'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <FaThList /> <FormattedMessage id="floating.fullCatalogue" defaultMessage="Catalogue" />
        </button>

        {activeNodeId !== 'welcome' && (
          <button
            onClick={resetStory}
            className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition-all text-xs"
            title="Reset Journey"
          >
            <FaRedoAlt />
          </button>
        )}
      </div>
    </div>
  );
};
