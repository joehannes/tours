import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useI18n } from './I18nContext';
import { usePlannerCopy } from '../planner/usePlannerCopy';
import { buildPlan } from '../planner/engine';
import { buildCatalogue, loadPlannerCatalogue } from '../planner/catalogueSource';
import { defaultsForParty, StepDef, StepId, visibleSteps } from '../planner/questions';
import { CatalogueEntry, DayPlan, EMPTY_PROFILE, TravelProfile } from '../planner/types';
import type { PartyType } from '../planner/tourProfiles';

export type PlannerStage = 'intro' | 'questions' | 'result';

interface PlannerContextValue {
  stage: PlannerStage;
  start: () => void;
  reset: () => void;
  resume: () => void;

  profile: TravelProfile;
  setAnswer: <K extends keyof TravelProfile>(key: K, value: TravelProfile[K]) => void;
  patchProfile: (patch: Partial<TravelProfile>) => void;

  steps: StepDef[];
  stepIndex: number;
  currentStep: StepDef | undefined;
  goNext: () => void;
  goBack: () => void;
  goToStep: (id: StepId) => void;
  progress: number;

  catalogue: CatalogueEntry[];
  loading: boolean;
  plan: DayPlan | null;

  pinned: string[];
  banned: string[];
  addTour: (key: string) => void;
  removeTour: (key: string) => void;

  hasProgress: boolean;
}

const STORAGE_KEY = 'ferreras_planner_v2';

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

interface PersistedState {
  stage: PlannerStage;
  profile: TravelProfile;
  stepIndex: number;
  pinned: string[];
  banned: string[];
}

const readPersisted = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
};

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { locale } = useI18n();
  const copy = usePlannerCopy();

  const [stage, setStage] = useState<PlannerStage>('intro');
  const [profile, setProfile] = useState<TravelProfile>(EMPTY_PROFILE);
  const [stepIndex, setStepIndex] = useState(0);
  const [pinned, setPinned] = useState<string[]>([]);
  const [banned, setBanned] = useState<string[]>([]);
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Restore a session in progress.
  useEffect(() => {
    const saved = readPersisted();
    if (saved.profile) setProfile({ ...EMPTY_PROFILE, ...saved.profile });
    if (saved.stage) setStage(saved.stage);
    if (typeof saved.stepIndex === 'number') setStepIndex(saved.stepIndex);
    if (Array.isArray(saved.pinned)) setPinned(saved.pinned);
    if (Array.isArray(saved.banned)) setBanned(saved.banned);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const snapshot: PersistedState = { stage, profile, stepIndex, pinned, banned };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* storage full or blocked — the planner still works, it just won't resume */
    }
  }, [hydrated, stage, profile, stepIndex, pinned, banned]);

  // Live catalogue, reloaded whenever the language changes.
  useEffect(() => {
    let current = true;
    setLoading(true);

    loadPlannerCatalogue(locale)
      .then((tours) => {
        if (!current) return;
        setCatalogue(buildCatalogue(tours));
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [locale]);

  const steps = useMemo(() => visibleSteps(profile), [profile]);

  const patchProfile = useCallback((patch: Partial<TravelProfile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const setAnswer = useCallback(
    <K extends keyof TravelProfile>(key: K, value: TravelProfile[K]) => {
      setProfile((current) => {
        const next: TravelProfile = { ...current, [key]: value };
        // Choosing a party type seeds a realistic headcount the guest can adjust.
        if (key === 'partyType' && value) {
          Object.assign(next, defaultsForParty(value as PartyType));
        }
        return next;
      });
    },
    []
  );

  const goNext = useCallback(() => {
    setStepIndex((index) => {
      if (index >= steps.length - 1) {
        setStage('result');
        return index;
      }
      return index + 1;
    });
  }, [steps.length]);

  const goBack = useCallback(() => {
    setStepIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToStep = useCallback(
    (id: StepId) => {
      const index = steps.findIndex((step) => step.id === id);
      if (index >= 0) {
        setStepIndex(index);
        setStage('questions');
      }
    },
    [steps]
  );

  const start = useCallback(() => {
    setStage('questions');
    setStepIndex(0);
  }, []);

  const resume = useCallback(() => {
    setStage(profile.partyType ? 'result' : 'questions');
  }, [profile.partyType]);

  const reset = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    setStepIndex(0);
    setPinned([]);
    setBanned([]);
    setStage('questions');
  }, []);

  const addTour = useCallback((key: string) => {
    setBanned((current) => current.filter((item) => item !== key));
    setPinned((current) => (current.includes(key) ? current : [...current, key]));
  }, []);

  const removeTour = useCallback((key: string) => {
    setPinned((current) => current.filter((item) => item !== key));
    setBanned((current) => (current.includes(key) ? current : [...current, key]));
  }, []);

  const plan = useMemo(() => {
    if (catalogue.length === 0) return null;
    const usable = catalogue.filter((entry) => !banned.includes(entry.profile.key));
    return buildPlan(usable, profile, copy, locale, pinned);
  }, [catalogue, banned, pinned, profile, copy, locale]);

  const progress = steps.length > 0 ? Math.min(1, (stepIndex + 1) / steps.length) : 0;
  const hasProgress = Boolean(profile.partyType);

  const value: PlannerContextValue = {
    stage,
    start,
    reset,
    resume,
    profile,
    setAnswer,
    patchProfile,
    steps,
    stepIndex: Math.min(stepIndex, Math.max(0, steps.length - 1)),
    currentStep: steps[Math.min(stepIndex, Math.max(0, steps.length - 1))],
    goNext,
    goBack,
    goToStep,
    progress,
    catalogue,
    loading,
    plan,
    pinned,
    banned,
    addTour,
    removeTour,
    hasProgress,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};

export const usePlanner = (): PlannerContextValue => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
