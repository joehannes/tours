import React, { useEffect, useState } from 'react';
import { useStory } from '../../contexts/StoryContext';
import { StoryHeader } from './StoryHeader';
import { StoryNodeCard, StoryNode } from './StoryNodeCard';
import { BundleRecommendationCard } from './BundleRecommendationCard';
import { StoryFloatingControls } from './StoryFloatingControls';
import { useIntl } from 'react-intl';

export const GuidedStoryContainer: React.FC = () => {
  const { activeNodeId, themeVariant } = useStory();
  const intl = useIntl();
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch story nodes depending on locale
  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      try {
        const lang = intl.locale.startsWith('es') ? 'es' : 'en';
        const res = await fetch(`/data/story-nodes-${lang}.json`);
        if (res.ok) {
          const data = await res.json();
          setNodes(data);
        }
      } catch (err) {
        console.warn('Failed to load story nodes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [intl.locale]);

  const currentNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const getBackgroundGradient = () => {
    switch (themeVariant) {
      case 'jungle_green':
        return 'from-slate-950 via-emerald-950/80 to-slate-950';
      case 'sunset_gold':
        return 'from-slate-950 via-amber-950/70 to-slate-950';
      case 'vip_obsidian':
        return 'from-slate-950 via-slate-900 to-black';
      default:
        return 'from-slate-950 via-teal-950/80 to-slate-950';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBackgroundGradient()} transition-colors duration-1000 flex flex-col relative overflow-hidden`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <StoryHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex items-center justify-center relative z-10 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-white">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-['Poppins',sans-serif] text-slate-300">Loading your Dominican story...</p>
          </div>
        ) : activeNodeId === 'recommendation' ? (
          <BundleRecommendationCard />
        ) : currentNode ? (
          <StoryNodeCard node={currentNode} />
        ) : (
          <div className="text-white text-center">Story node not found.</div>
        )}
      </main>

      {/* Floating Mode Bar */}
      <StoryFloatingControls />
    </div>
  );
};
