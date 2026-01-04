import { Badge } from '@/types';

export const badges: Badge[] = [
  { id: 'first_loaf', name: 'First Loaf', description: 'Complete your first quiz', icon: '🍞' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Answer 5 questions in under 5 seconds each', icon: '⚡' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Get 100% on any tier', icon: '💯' },
  { id: 'triple_threat', name: 'Triple Threat', description: 'Complete all three tiers', icon: '🎯' },
  { id: 'knowledge_hungry', name: 'Knowledge Hungry', description: 'Click Learn More 10+ times', icon: '📚' },
  { id: 'streak_master', name: 'Streak Master', description: 'Achieve a 10-question streak', icon: '🔥' },
  { id: 'daily_baker', name: 'Daily Baker', description: 'Complete Daily Bread 7 days in a row', icon: '📅' },
  { id: 'early_riser', name: 'Early Riser', description: 'Complete Daily Bread before 8am', icon: '🌅' },
  { id: 'star_baker', name: 'Star Baker', description: 'Score 100% on Master Baker', icon: '🏆' },
];

export const getBadge = (id: string): Badge | undefined => {
  return badges.find(b => b.id === id);
};
