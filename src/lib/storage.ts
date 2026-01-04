import { PlayerStats, Tier } from '@/types';

const STORAGE_PREFIX = 'breadShowdown_';

const defaultStats: PlayerStats = {
  highScores: {
    'Fresh from the Oven': 0,
    'Crusty Veteran': 0,
    'Master Baker': 0,
  },
  dailyScore: 0,
  dailyLastPlayed: null,
  dailyStreak: 0,
  badges: [],
  totalGames: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  learnMoreClicks: 0,
  challengesSent: 0,
  challengesWon: 0,
};

export const getPlayerStats = (): PlayerStats => {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}stats`);
    return stored ? { ...defaultStats, ...JSON.parse(stored) } : defaultStats;
  } catch {
    return defaultStats;
  }
};

export const savePlayerStats = (stats: PlayerStats): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}stats`, JSON.stringify(stats));
};

export const updateHighScore = (tier: Tier, score: number): boolean => {
  const stats = getPlayerStats();
  if (score > stats.highScores[tier]) {
    stats.highScores[tier] = score;
    savePlayerStats(stats);
    return true;
  }
  return false;
};

export const addBadge = (badgeId: string): boolean => {
  const stats = getPlayerStats();
  if (!stats.badges.includes(badgeId as any)) {
    stats.badges.push(badgeId as any);
    savePlayerStats(stats);
    return true;
  }
  return false;
};

export const getSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${STORAGE_PREFIX}soundEnabled`) === 'true';
};

export const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}soundEnabled`, String(enabled));
};
