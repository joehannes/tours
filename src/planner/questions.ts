/**
 * The question flow.
 *
 * Steps are declarative so the UI stays dumb: it renders whatever the current
 * step describes and the flow decides what is relevant. Solo travellers never
 * see a headcount stepper, childless groups never see kid ages, and every step
 * knows when it counts as answered.
 */
import type {
  AdultAgeBand,
  AimKey,
  BudgetBand,
  ConstraintKey,
  DayShape,
  KidAgeBand,
  TransportChoice,
  TravelProfile,
} from './types';
import type { InterestKey, OccasionKey, PartyType } from './tourProfiles';

export type StepId =
  | 'partyType'
  | 'headcount'
  | 'adultAge'
  | 'energy'
  | 'interests'
  | 'aim'
  | 'dayShape'
  | 'days'
  | 'budget'
  | 'transport'
  | 'constraints'
  | 'occasion'
  | 'logistics';

export type StepKind = 'choice' | 'multi' | 'counts' | 'scale' | 'stepper' | 'logistics';

export interface StepDef {
  id: StepId;
  kind: StepKind;
  /** Can be passed without answering. */
  optional?: boolean;
  /** Hidden when it cannot tell us anything new. */
  applies?: (profile: TravelProfile) => boolean;
  isAnswered: (profile: TravelProfile) => boolean;
  /** Single-choice steps jump forward on tap; multi-selects wait. */
  autoAdvance?: boolean;
}

export const PARTY_TYPES: PartyType[] = ['solo', 'couple', 'family', 'friends', 'multigen'];
export const ADULT_AGES: AdultAgeBand[] = ['young', 'prime', 'mature', 'senior'];
export const KID_AGES: KidAgeBand[] = ['toddler', 'child', 'tween', 'teen'];
export const INTERESTS: InterestKey[] = [
  'beach_island',
  'snorkel_reef',
  'wildlife',
  'adrenaline',
  'offroad',
  'culture',
  'nightlife',
  'food_drink',
  'views_photo',
  'relax',
];
export const AIMS: AimKey[] = ['stories', 'unwind', 'together', 'adrenaline', 'romance', 'discover', 'party'];
export const DAY_SHAPES: DayShape[] = ['signature', 'balanced', 'packed', 'max'];
export const BUDGETS: BudgetBand[] = ['value', 'balanced', 'premium', 'open'];
export const TRANSPORTS: TransportChoice[] = ['included', 'private_day', 'private_full'];
export const CONSTRAINTS: ConstraintKey[] = [
  'non_swimmer',
  'seasick',
  'limited_mobility',
  'no_early',
  'no_alcohol',
  'early_nights',
  'sun_sensitive',
];
export const OCCASIONS: OccasionKey[] = ['none', 'honeymoon', 'anniversary', 'birthday', 'bachelor', 'reunion'];

export const MAX_INTERESTS = 5;

export const STEPS: StepDef[] = [
  {
    id: 'partyType',
    kind: 'choice',
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.partyType),
  },
  {
    id: 'headcount',
    kind: 'counts',
    applies: (p) => p.partyType !== 'solo',
    isAnswered: (p) => p.adults + p.children > 0,
  },
  {
    id: 'adultAge',
    kind: 'choice',
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.adultAge),
  },
  {
    id: 'energy',
    kind: 'scale',
    isAnswered: () => true,
  },
  {
    id: 'interests',
    kind: 'multi',
    isAnswered: (p) => p.interests.length > 0,
  },
  {
    id: 'aim',
    kind: 'choice',
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.aim),
  },
  {
    id: 'dayShape',
    kind: 'choice',
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.dayShape),
  },
  {
    id: 'days',
    kind: 'stepper',
    isAnswered: (p) => p.days >= 1,
  },
  {
    id: 'budget',
    kind: 'choice',
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.budget),
  },
  {
    id: 'transport',
    kind: 'choice',
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.transport),
  },
  {
    id: 'constraints',
    kind: 'multi',
    optional: true,
    isAnswered: () => true,
  },
  {
    id: 'occasion',
    kind: 'choice',
    optional: true,
    autoAdvance: true,
    isAnswered: (p) => Boolean(p.occasion),
  },
  {
    id: 'logistics',
    kind: 'logistics',
    optional: true,
    isAnswered: () => true,
  },
];

export const visibleSteps = (profile: TravelProfile): StepDef[] =>
  STEPS.filter((step) => (step.applies ? step.applies(profile) : true));

/** Sensible defaults so a skipped headcount still prices correctly. */
export const defaultsForParty = (party: PartyType): Partial<TravelProfile> => {
  switch (party) {
    case 'solo':
      return { adults: 1, children: 0, kidAges: [] };
    case 'couple':
      return { adults: 2, children: 0, kidAges: [] };
    case 'family':
      return { adults: 2, children: 2, kidAges: ['child'] };
    case 'friends':
      return { adults: 4, children: 0, kidAges: [] };
    case 'multigen':
      return { adults: 4, children: 2, kidAges: ['child'] };
    default:
      return {};
  }
};
