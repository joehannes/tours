import React from 'react';
import { useStory, ThemeVariant } from '../../contexts/StoryContext';

export interface StoryOption {
  id: string;
  label: string;
  description: string;
  nextNodeId?: string;
  theme?: ThemeVariant;
  answerKey?: string;
  answerValue?: any;
  action?: string;
}

export interface StoryNode {
  id: string;
  hostTitle: string;
  subtitle: string;
  narrative: string;
  mediaImage?: string;
  question: string;
  options: StoryOption[];
  isRecommendation?: boolean;
}

interface StoryNodeCardProps {
  node: StoryNode;
}

export const StoryNodeCard: React.FC<StoryNodeCardProps> = ({ node }) => {
  const { answerQuestion, toggleMode, themeVariant } = useStory();

  const getBorderColor = () => {
    switch (themeVariant) {
      case 'jungle_green': return 'border-emerald-500/40 shadow-[0_20px_50px_rgba(16,185,129,0.25)]';
      case 'sunset_gold': return 'border-amber-400/40 shadow-[0_20px_50px_rgba(251,191,36,0.25)]';
      case 'vip_obsidian': return 'border-amber-300/60 shadow-[0_25px_60px_rgba(245,158,11,0.3)] bg-slate-950/90';
      default: return 'border-teal-400/40 shadow-[0_20px_50px_rgba(13,148,136,0.25)]';
    }
  };

  const handleSelectOption = (option: StoryOption) => {
    if (option.action === 'switch_catalogue') {
      toggleMode();
      return;
    }

    if (option.answerKey && option.answerValue !== undefined) {
      answerQuestion(
        option.answerKey as any,
        option.answerValue,
        option.nextNodeId || 'recommendation',
        option.theme
      );
    } else if (option.nextNodeId) {
      answerQuestion('vibe' as any, option.id, option.nextNodeId, option.theme);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto rounded-[32px] p-6 sm:p-10 backdrop-blur-2xl bg-slate-900/80 border ${getBorderColor()} text-white transition-all duration-700 animate-fadeIn`}>
      {/* Host Avatar & Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-teal-400 shadow-xl shrink-0">
          <img
            src="https://cdn.pixabay.com/photo/2016/11/19/14/00/beach-1836467_1280.jpg"
            alt="Francisco Ferreras"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            {node.subtitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',serif] text-white tracking-tight leading-tight">
            {node.hostTitle}
          </h2>
        </div>
      </div>

      {/* Host Narrative */}
      <div className="prose prose-invert max-w-none text-slate-200 text-base sm:text-lg leading-relaxed mb-8 font-['Poppins',sans-serif]">
        <p>{node.narrative}</p>
      </div>

      {/* Optional Media Frame */}
      {node.mediaImage && (
        <div className="relative mb-8 rounded-2xl overflow-hidden aspect-[16/9] shadow-2xl border border-white/10 group">
          <img
            src={node.mediaImage}
            alt={node.hostTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Question Prompt */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-amber-300 font-['Playfair_Display',serif] mb-4">
          {node.question}
        </h3>

        {/* Choice Options */}
        <div className="grid gap-4">
          {node.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className="group relative w-full text-left p-5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-teal-400/80 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  {option.label}
                </h4>
                <p className="text-sm text-slate-300 mt-1 font-['Poppins',sans-serif]">
                  {option.description}
                </p>
              </div>

              <span className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 group-hover:bg-teal-400 group-hover:text-slate-950 transition-all">
                Select →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
