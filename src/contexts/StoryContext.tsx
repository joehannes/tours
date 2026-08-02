import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAnswers, RecommendedBundle, computeRecommendation } from '../utils/storyRecommendationEngine';

export type DisplayMode = 'story' | 'catalogue';
export type ThemeVariant = 'ocean_blue' | 'sunset_gold' | 'jungle_green' | 'vip_obsidian';

interface StoryContextType {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  activeNodeId: string;
  userAnswers: UserAnswers;
  recommendedBundle: RecommendedBundle | null;
  themeVariant: ThemeVariant;
  answerQuestion: (answerKey: keyof UserAnswers, value: any, nextNodeId?: string, theme?: ThemeVariant) => void;
  jumpToNode: (nodeId: string) => void;
  toggleMode: () => void;
  resetStory: () => void;
  getWhatsAppUrl: (locale?: string) => string;
}

const STORAGE_KEY = 'ferreras_story_session_v1';

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<DisplayMode>('story');
  const [activeNodeId, setActiveNodeId] = useState<string>('welcome');
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('ocean_blue');
  const [recommendedBundle, setRecommendedBundle] = useState<RecommendedBundle | null>(null);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setModeState(parsed.mode);
        if (parsed.activeNodeId) setActiveNodeId(parsed.activeNodeId);
        if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
        if (parsed.themeVariant) setThemeVariant(parsed.themeVariant);
        if (parsed.recommendedBundle) setRecommendedBundle(parsed.recommendedBundle);
      }
    } catch (e) {
      console.warn('Failed to parse story session from localStorage', e);
    }
  }, []);

  // Save state updates to localStorage
  const saveState = (
    newMode: DisplayMode,
    newNodeId: string,
    newAnswers: UserAnswers,
    newTheme: ThemeVariant,
    newBundle: RecommendedBundle | null
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode: newMode,
          activeNodeId: newNodeId,
          userAnswers: newAnswers,
          themeVariant: newTheme,
          recommendedBundle: newBundle,
        })
      );
    } catch (e) {
      console.warn('Failed to save story session to localStorage', e);
    }
  };

  const setMode = (newMode: DisplayMode) => {
    setModeState(newMode);
    saveState(newMode, activeNodeId, userAnswers, themeVariant, recommendedBundle);
  };

  const toggleMode = () => {
    const nextMode = mode === 'story' ? 'catalogue' : 'story';
    setMode(nextMode);
  };

  const answerQuestion = (
    answerKey: keyof UserAnswers,
    value: any,
    nextNodeId: string = 'recommendation',
    theme?: ThemeVariant
  ) => {
    const updatedAnswers = { ...userAnswers, [answerKey]: value };
    setUserAnswers(updatedAnswers);

    let updatedTheme = theme || themeVariant;
    let computedBundle = recommendedBundle;

    if (nextNodeId === 'recommendation') {
      computedBundle = computeRecommendation(updatedAnswers);
      if (computedBundle.themeVariant) {
        updatedTheme = computedBundle.themeVariant;
      }
      setRecommendedBundle(computedBundle);
    }

    if (theme) {
      setThemeVariant(theme);
    }

    setActiveNodeId(nextNodeId);
    saveState(mode, nextNodeId, updatedAnswers, updatedTheme, computedBundle);
  };

  const jumpToNode = (nodeId: string) => {
    setActiveNodeId(nodeId);
    saveState(mode, nodeId, userAnswers, themeVariant, recommendedBundle);
  };

  const resetStory = () => {
    setActiveNodeId('welcome');
    setUserAnswers({});
    setThemeVariant('ocean_blue');
    setRecommendedBundle(null);
    setModeState('story');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const getWhatsAppUrl = (locale: string = 'en') => {
    const isEs = locale.startsWith('es');
    const bundleName = recommendedBundle?.title || 'Custom Tour Bundle';
    const price = recommendedBundle?.finalPriceUSD || 0;
    const party = userAnswers.partyType || 'traveller';
    const vibe = userAnswers.vibe || 'adventure';

    const text = isEs
      ? `¡Hola Francisco! Completé la guía interactiva en ferreras.tours. 🌴%0A` +
        `• Grupo: ${party}%0A` +
        `• Estilo: ${vibe}%0A` +
        `• Combo Sugerido: *${bundleName}*%0A` +
        `• Est. Total: $${price} USD%0A` +
        `¿Podemos confirmar disponibilidad para las próximas fechas?`
      : `Hi Francisco! I completed your guided story journey on ferreras.tours. 🌴%0A` +
        `• Group: ${party}%0A` +
        `• Vibe: ${vibe}%0A` +
        `• Custom Bundle: *${bundleName}*%0A` +
        `• Est. Total: $${price} USD%0A` +
        `Can we check availability for my upcoming dates?`;

    return `https://wa.me/18296395171?text=${text}`;
  };

  return (
    <StoryContext.Provider
      value={{
        mode,
        setMode,
        activeNodeId,
        userAnswers,
        recommendedBundle,
        themeVariant,
        answerQuestion,
        jumpToNode,
        toggleMode,
        resetStory,
        getWhatsAppUrl,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};
