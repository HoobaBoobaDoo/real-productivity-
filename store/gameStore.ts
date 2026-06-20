import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS, AchievementId } from '../constants/achievements';
import { levelFromXp, xpRewardForMinutes } from '../utils/xp';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalXp: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  categoryId: string;
  description: string;
  minutes: number;
  xpEarned: number;
  timestamp: string;
}

export interface WeeklyGoal {
  id: string;
  categoryId: string;
  targetMinutes: number;
  weekStart: string;
}

export interface GameState {
  // Global
  globalXp: number;
  unlockedAchievements: AchievementId[];
  // Categories
  categories: Category[];
  // Logs
  activityLogs: ActivityLog[];
  // Goals
  weeklyGoals: WeeklyGoal[];
  // Streak
  currentStreak: number;
  lastActiveDate: string | null;
  longestStreak: number;
  // Notifications
  recentUnlocks: AchievementId[];
}

export interface GameActions {
  addCategory: (name: string, icon: string, color: string) => void;
  removeCategory: (id: string) => void;
  logActivity: (categoryId: string, description: string, minutes: number) => AchievementId[];
  setWeeklyGoal: (categoryId: string, targetMinutes: number) => void;
  removeWeeklyGoal: (goalId: string) => void;
  clearRecentUnlocks: () => void;
  resetAll: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'youtube', name: 'YouTube', icon: '🎬', color: '#ff6b9d', totalXp: 0, createdAt: new Date().toISOString() },
  { id: 'gamedev', name: 'Game Dev', icon: '🎮', color: '#7c6fff', totalXp: 0, createdAt: new Date().toISOString() },
];

const INITIAL_STATE: GameState = {
  globalXp: 0,
  unlockedAchievements: [],
  categories: DEFAULT_CATEGORIES,
  activityLogs: [],
  weeklyGoals: [],
  currentStreak: 0,
  lastActiveDate: null,
  longestStreak: 0,
  recentUnlocks: [],
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function checkAchievements(state: GameState, newLogs: ActivityLog[], addedXp: number): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const already = new Set(state.unlockedAchievements);

  const totalLogs = state.activityLogs.length + newLogs.length;
  const totalMinutes = state.activityLogs.reduce((s, l) => s + l.minutes, 0) +
    newLogs.reduce((s, l) => s + l.minutes, 0);
  const totalHours = totalMinutes / 60;
  const newGlobalXp = state.globalXp + addedXp;
  const { level } = levelFromXp(newGlobalXp);

  const check = (id: AchievementId, cond: boolean) => {
    if (cond && !already.has(id)) unlocked.push(id);
  };

  check('first_log', totalLogs >= 1);
  check('log_5', totalLogs >= 5);
  check('log_25', totalLogs >= 25);
  check('log_100', totalLogs >= 100);

  check('streak_3', state.currentStreak >= 3);
  check('streak_7', state.currentStreak >= 7);
  check('streak_14', state.currentStreak >= 14);
  check('streak_30', state.currentStreak >= 30);

  check('level_5', level >= 5);
  check('level_10', level >= 10);
  check('level_20', level >= 20);
  check('level_50', level >= 50);

  check('total_1h', totalHours >= 1);
  check('total_10h', totalHours >= 10);
  check('total_50h', totalHours >= 50);
  check('total_100h', totalHours >= 100);
  check('total_500h', totalHours >= 500);

  const usedCategories = new Set([
    ...state.activityLogs.map(l => l.categoryId),
    ...newLogs.map(l => l.categoryId),
  ]);
  check('multi_cat', usedCategories.size >= 3);

  const logHour = new Date(newLogs[0]?.timestamp || Date.now()).getHours();
  check('night_owl', logHour >= 0 && logHour < 4);
  check('early_bird', logHour >= 4 && logHour < 7);

  // Category level checks
  for (const cat of state.categories) {
    const catNewXp = newLogs.filter(l => l.categoryId === cat.id).reduce((s, l) => s + l.xpEarned, 0);
    const catTotal = cat.totalXp + catNewXp;
    const catLevel = levelFromXp(catTotal).level;
    if (!already.has('category_level_5')) check('category_level_5', catLevel >= 5);
    if (!already.has('category_level_10')) check('category_level_10', catLevel >= 10);
  }

  return unlocked;
}

function updateStreak(state: GameState): { currentStreak: number; longestStreak: number } {
  const today = todayStr();
  if (state.lastActiveDate === today) {
    return { currentStreak: state.currentStreak, longestStreak: state.longestStreak };
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = state.lastActiveDate === yesterdayStr ? state.currentStreak + 1 : 1;
  return { currentStreak: newStreak, longestStreak: Math.max(newStreak, state.longestStreak) };
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addCategory: (name, icon, color) => {
        const id = `cat_${Date.now()}`;
        set(s => ({
          categories: [...s.categories, { id, name, icon, color, totalXp: 0, createdAt: new Date().toISOString() }],
        }));
      },

      removeCategory: (id) => {
        set(s => ({
          categories: s.categories.filter(c => c.id !== id),
          weeklyGoals: s.weeklyGoals.filter(g => g.categoryId !== id),
        }));
      },

      logActivity: (categoryId, description, minutes) => {
        const state = get();
        const xpEarned = xpRewardForMinutes(minutes);
        const newLog: ActivityLog = {
          id: `log_${Date.now()}`,
          categoryId,
          description,
          minutes,
          xpEarned,
          timestamp: new Date().toISOString(),
        };

        const newAchievements = checkAchievements(state, [newLog], xpEarned);
        const achievementXp = newAchievements.reduce((s, id) => {
          const def = ACHIEVEMENTS.find(a => a.id === id);
          return s + (def?.xpReward ?? 0);
        }, 0);

        const streakUpdate = updateStreak(state);

        set(s => ({
          globalXp: s.globalXp + xpEarned + achievementXp,
          activityLogs: [newLog, ...s.activityLogs],
          categories: s.categories.map(c =>
            c.id === categoryId ? { ...c, totalXp: c.totalXp + xpEarned } : c
          ),
          unlockedAchievements: [...s.unlockedAchievements, ...newAchievements],
          recentUnlocks: [...newAchievements],
          currentStreak: streakUpdate.currentStreak,
          longestStreak: streakUpdate.longestStreak,
          lastActiveDate: todayStr(),
        }));

        return newAchievements;
      },

      setWeeklyGoal: (categoryId, targetMinutes) => {
        const weekStart = getWeekStart(new Date());
        set(s => {
          const existing = s.weeklyGoals.find(
            g => g.categoryId === categoryId && g.weekStart === weekStart
          );
          if (existing) {
            return {
              weeklyGoals: s.weeklyGoals.map(g =>
                g.id === existing.id ? { ...g, targetMinutes } : g
              ),
            };
          }
          return {
            weeklyGoals: [
              ...s.weeklyGoals,
              { id: `goal_${Date.now()}`, categoryId, targetMinutes, weekStart },
            ],
          };
        });
      },

      removeWeeklyGoal: (goalId) => {
        set(s => ({ weeklyGoals: s.weeklyGoals.filter(g => g.id !== goalId) }));
      },

      clearRecentUnlocks: () => set({ recentUnlocks: [] }),

      resetAll: () => set({ ...INITIAL_STATE, categories: DEFAULT_CATEGORIES }),
    }),
    {
      name: 'levelup-game-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors
export function useCurrentWeekLogs() {
  const logs = useGameStore(s => s.activityLogs);
  const weekStart = getWeekStart(new Date());
  return logs.filter(l => l.timestamp >= weekStart);
}

export function useMinutesForCategoryThisWeek(categoryId: string) {
  const weekLogs = useCurrentWeekLogs();
  return weekLogs.filter(l => l.categoryId === categoryId).reduce((s, l) => s + l.minutes, 0);
}
