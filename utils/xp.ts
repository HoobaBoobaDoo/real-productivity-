// XP needed to reach level n from level n-1
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

// Total XP needed to reach level n from level 1
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

// Derive current level from total accumulated XP
export function levelFromXp(totalXp: number): { level: number; currentXp: number; neededXp: number; progress: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  return { level, currentXp: remaining, neededXp: needed, progress: remaining / needed };
}

export function xpRewardForMinutes(minutes: number): number {
  return Math.floor(minutes * 2);
}

export function levelTitle(level: number): string {
  const titles = [
    'Newcomer', 'Apprentice', 'Journeyman', 'Adept', 'Skilled',
    'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic',
    'Demigod', 'Ascended', 'Immortal', 'Divine', 'Transcendent',
  ];
  const idx = Math.min(Math.floor((level - 1) / 3), titles.length - 1);
  return titles[idx];
}

export function categoryLevelTitle(level: number): string {
  const titles = [
    'Beginner', 'Novice', 'Apprentice', 'Practitioner', 'Journeyman',
    'Skilled', 'Proficient', 'Expert', 'Veteran', 'Elite',
    'Master', 'Grandmaster', 'Legend',
  ];
  const idx = Math.min(level - 1, titles.length - 1);
  return titles[idx];
}
