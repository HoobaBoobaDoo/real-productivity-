export type AchievementId =
  | 'first_log'
  | 'log_5' | 'log_25' | 'log_100'
  | 'streak_3' | 'streak_7' | 'streak_14' | 'streak_30'
  | 'level_5' | 'level_10' | 'level_20' | 'level_50'
  | 'total_1h' | 'total_10h' | 'total_50h' | 'total_100h' | 'total_500h'
  | 'goal_first' | 'goal_week' | 'goal_month'
  | 'category_level_5' | 'category_level_10'
  | 'multi_cat' | 'night_owl' | 'early_bird';

export interface AchievementDef {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_log', name: 'First Step', description: 'Log your first activity', icon: '🌱', xpReward: 50, rarity: 'common' },
  { id: 'log_5', name: 'Getting Going', description: 'Log 5 activities', icon: '🏃', xpReward: 75, rarity: 'common' },
  { id: 'log_25', name: 'In the Groove', description: 'Log 25 activities', icon: '🔥', xpReward: 150, rarity: 'uncommon' },
  { id: 'log_100', name: 'Century Mark', description: 'Log 100 activities', icon: '💯', xpReward: 500, rarity: 'rare' },
  { id: 'streak_3', name: 'Hat Trick', description: '3 day streak', icon: '⚡', xpReward: 100, rarity: 'common' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🗡️', xpReward: 250, rarity: 'uncommon' },
  { id: 'streak_14', name: 'Fortnight Fighter', description: '14 day streak', icon: '⚔️', xpReward: 500, rarity: 'rare' },
  { id: 'streak_30', name: 'Unstoppable', description: '30 day streak', icon: '🏆', xpReward: 1000, rarity: 'epic' },
  { id: 'level_5', name: 'Level Up!', description: 'Reach level 5', icon: '⭐', xpReward: 100, rarity: 'common' },
  { id: 'level_10', name: 'Double Digits', description: 'Reach level 10', icon: '🌟', xpReward: 300, rarity: 'uncommon' },
  { id: 'level_20', name: 'Veteran', description: 'Reach level 20', icon: '💫', xpReward: 750, rarity: 'rare' },
  { id: 'level_50', name: 'Transcendent', description: 'Reach level 50', icon: '✨', xpReward: 2000, rarity: 'legendary' },
  { id: 'total_1h', name: 'Hour Power', description: 'Log 1 hour total', icon: '⏱️', xpReward: 50, rarity: 'common' },
  { id: 'total_10h', name: 'Ten Hours Deep', description: 'Log 10 hours total', icon: '⌛', xpReward: 200, rarity: 'uncommon' },
  { id: 'total_50h', name: 'Dedicated', description: 'Log 50 hours total', icon: '🕐', xpReward: 600, rarity: 'rare' },
  { id: 'total_100h', name: 'Centurion', description: 'Log 100 hours total', icon: '🥇', xpReward: 1500, rarity: 'epic' },
  { id: 'total_500h', name: 'The Grind Never Stops', description: 'Log 500 hours total', icon: '👑', xpReward: 5000, rarity: 'legendary' },
  { id: 'goal_first', name: 'Goal Getter', description: 'Complete your first weekly goal', icon: '🎯', xpReward: 150, rarity: 'common' },
  { id: 'goal_week', name: 'Perfect Week', description: 'Complete all goals in a week', icon: '🌈', xpReward: 400, rarity: 'rare' },
  { id: 'goal_month', name: 'Month Master', description: 'Complete all goals for 4 weeks in a row', icon: '📅', xpReward: 1000, rarity: 'epic' },
  { id: 'category_level_5', name: 'Specialist', description: 'Reach level 5 in any category', icon: '🎖️', xpReward: 200, rarity: 'uncommon' },
  { id: 'category_level_10', name: 'Expert Craftsman', description: 'Reach level 10 in any category', icon: '🏅', xpReward: 600, rarity: 'rare' },
  { id: 'multi_cat', name: 'Renaissance', description: 'Log in 3+ different categories', icon: '🎨', xpReward: 200, rarity: 'uncommon' },
  { id: 'night_owl', name: 'Night Owl', description: 'Log an activity after midnight', icon: '🦉', xpReward: 75, rarity: 'common' },
  { id: 'early_bird', name: 'Early Bird', description: 'Log an activity before 7am', icon: '🐦', xpReward: 75, rarity: 'common' },
];

export const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#ffd700',
} as const;
