import { Tier, TIMER_SETTINGS, SCORE_MULTIPLIERS, BASE_POINTS } from '@/types';

export const calculateScore = (
  tier: Tier,
  timeRemaining: number,
  isCorrect: boolean,
  isPracticeMode: boolean
): number => {
  if (!isCorrect) return 0;
  if (isPracticeMode) return BASE_POINTS;

  const totalTime = TIMER_SETTINGS[tier];
  const timeUsed = totalTime - timeRemaining;
  const timeRatio = timeUsed / totalTime;

  let multiplier = SCORE_MULTIPLIERS.SLOW;
  if (timeRatio <= 0.33) {
    multiplier = SCORE_MULTIPLIERS.FAST;
  } else if (timeRatio <= 0.66) {
    multiplier = SCORE_MULTIPLIERS.MEDIUM;
  }

  return BASE_POINTS * multiplier;
};

export const getStreakMessage = (streak: number): { message: string; emoji: string } | null => {
  if (streak >= 10) return { message: 'Golden Crust!', emoji: '👑' };
  if (streak >= 7) return { message: 'Bread Boss!', emoji: '🌟' };
  if (streak >= 5) return { message: 'Rising Star!', emoji: '⭐' };
  if (streak >= 3) return { message: 'On a Roll!', emoji: '🔥' };
  return null;
};

export const getScoreBadge = (score: number, maxScore: number): { title: string; icon: string } => {
  const percentage = (score / maxScore) * 100;
  if (percentage === 100) return { title: 'STAR BAKER', icon: '🏆' };
  if (percentage >= 80) return { title: 'MASTER', icon: '🌟' };
  if (percentage >= 60) return { title: 'SKILLED', icon: '⭐' };
  if (percentage >= 40) return { title: 'APPRENTICE', icon: '🍞' };
  return { title: 'BEGINNER', icon: '🌱' };
};
