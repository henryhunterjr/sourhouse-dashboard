// Game Types for The Great Bread Showdown

export type Tier = 'Fresh from the Oven' | 'Crusty Veteran' | 'Master Baker';
export type GameMode = 'classic' | 'practice' | 'daily';
export type Category = 'Terminology' | 'Techniques' | 'Science' | 'Troubleshooting' | 'Equipment' | 'Ingredients' | 'History & Culture';

export interface Question {
  id: string;
  tier: Tier;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: Category;
  learnMoreTerm?: string;
  learnMoreUrl?: string;
  blogUrl?: string;
}

export interface GameState {
  mode: GameMode;
  tier: Tier;
  questionIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: boolean[];
  questionsUsed: string[];
  timeRemaining?: number;
  isPaused: boolean;
  isComplete: boolean;
  currentQuestionStartTime?: number;
}

export interface GameResult {
  mode: GameMode;
  tier: Tier;
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  bestStreak: number;
  timeBonuses: number;
  missedQuestions: {
    question: Question;
    userAnswer: number;
  }[];
  newBadges: string[];
  date: string;
}

export type BadgeId =
  | 'first_loaf'
  | 'speed_demon'
  | 'perfectionist'
  | 'triple_threat'
  | 'knowledge_hungry'
  | 'streak_master'
  | 'daily_baker'
  | 'early_riser'
  | 'star_baker';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
}

export interface PlayerStats {
  highScores: {
    'Fresh from the Oven': number;
    'Crusty Veteran': number;
    'Master Baker': number;
  };
  dailyScore: number;
  dailyLastPlayed: string | null;
  dailyStreak: number;
  badges: BadgeId[];
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  learnMoreClicks: number;
  challengesSent: number;
  challengesWon: number;
}

export interface DailyChallenge {
  date: string;
  questionIds: string[];
  completed: boolean;
  score: number;
}

export interface ChallengeData {
  tier: Tier;
  score: number;
  name: string;
  date: string;
}

// Timer settings by tier (in seconds)
export const TIMER_SETTINGS: Record<Tier, number> = {
  'Fresh from the Oven': 30,
  'Crusty Veteran': 20,
  'Master Baker': 15,
};

// Score multipliers based on time remaining
export const SCORE_MULTIPLIERS = {
  FAST: 3,    // First third of time
  MEDIUM: 2,  // Middle third
  SLOW: 1,    // Final third
};

export const BASE_POINTS = 100;
export const QUESTIONS_PER_GAME = 10;
export const DAILY_QUESTIONS = 5;
