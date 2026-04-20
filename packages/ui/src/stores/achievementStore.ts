import { create } from 'zustand';
import { STORAGE_KEYS } from '@shudu/shared';
import type { Difficulty } from '@shudu/core';
import type { MineDifficulty } from '@shudu/minesweeper-core';
import type { GameStatistics } from './gameStore';
import type { MineGameStatistics } from './minesweeperStore';

export type AchievementCategory = 'sudoku' | 'minesweeper' | 'general';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  hidden: boolean;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export interface AchievementState {
  unlocked: UnlockedAchievement[];
}

interface AchievementStore {
  achievements: Achievement[];
  unlocked: UnlockedAchievement[];
  recentlyUnlocked: string | null;

  isUnlocked: (id: string) => boolean;
  unlock: (id: string) => void;
  clearRecentlyUnlocked: () => void;
  getUnlockedCount: (category?: AchievementCategory) => number;
  getTotalCount: (category?: AchievementCategory) => number;
  checkSudokuAchievements: (stats: GameStatistics, difficulty: Difficulty, elapsedTime: number, mistakes: number, hintsUsed: number) => string[];
  checkMinesweeperAchievements: (stats: MineGameStatistics, difficulty: MineDifficulty, elapsedTime: number, isWin: boolean) => string[];
  reset: () => void;
}

const SUDOKU_ACHIEVEMENTS: Achievement[] = [
  { id: 'sudoku_first_win', name: '初出茅庐', description: '完成第一道数独', icon: '🎯', category: 'sudoku', hidden: false },
  { id: 'sudoku_easy_10', name: '入门玩家', description: '完成10道简单数独', icon: '🌱', category: 'sudoku', hidden: false },
  { id: 'sudoku_medium_5', name: '进阶挑战', description: '完成5道中等数独', icon: '📈', category: 'sudoku', hidden: false },
  { id: 'sudoku_hard_3', name: '高手之路', description: '完成3道困难数独', icon: '🏔️', category: 'sudoku', hidden: false },
  { id: 'sudoku_expert_1', name: '数独大师', description: '完成1道专家数独', icon: '👑', category: 'sudoku', hidden: false },
  { id: 'sudoku_no_mistakes', name: '完美无瑕', description: '零错误完成一道数独', icon: '💎', category: 'sudoku', hidden: false },
  { id: 'sudoku_no_hints', name: '独立思考', description: '不使用提示完成一道数独', icon: '🧠', category: 'sudoku', hidden: false },
  { id: 'sudoku_speed_easy', name: '闪电手', description: '5分钟内完成简单数独', icon: '⚡', category: 'sudoku', hidden: false },
  { id: 'sudoku_speed_medium', name: '速解高手', description: '15分钟内完成中等数独', icon: '🏃', category: 'sudoku', hidden: false },
  { id: 'sudoku_speed_hard', name: '极速推理', description: '30分钟内完成困难数独', icon: '🚀', category: 'sudoku', hidden: false },
  { id: 'sudoku_streak_3', name: '三连胜', description: '连续完成3道数独', icon: '🔥', category: 'sudoku', hidden: false },
  { id: 'sudoku_streak_7', name: '七连胜', description: '连续完成7道数独', icon: '🌟', category: 'sudoku', hidden: false },
  { id: 'sudoku_streak_30', name: '三十连胜', description: '连续完成30道数独', icon: '💫', category: 'sudoku', hidden: true },
  { id: 'sudoku_total_50', name: '半百之功', description: '累计完成50道数独', icon: '📊', category: 'sudoku', hidden: false },
  { id: 'sudoku_total_100', name: '百题斩', description: '累计完成100道数独', icon: '💯', category: 'sudoku', hidden: false },
  { id: 'sudoku_all_difficulty', name: '全能选手', description: '在所有难度等级都完成过数独', icon: '🏅', category: 'sudoku', hidden: false },
  { id: 'sudoku_expert_no_hints', name: '至高荣耀', description: '不使用提示完成专家数独', icon: '🏆', category: 'sudoku', hidden: true },
];

const MINESWEEPER_ACHIEVEMENTS: Achievement[] = [
  { id: 'mine_first_win', name: '初次排雷', description: '第一次赢得扫雷', icon: '🎖️', category: 'minesweeper', hidden: false },
  { id: 'mine_beginner_10', name: '新兵训练', description: '赢得10场初级扫雷', icon: '🔰', category: 'minesweeper', hidden: false },
  { id: 'mine_intermediate_5', name: '老兵出击', description: '赢得5场中级扫雷', icon: '⚔️', category: 'minesweeper', hidden: false },
  { id: 'mine_advanced_3', name: '雷场精英', description: '赢得3场高级扫雷', icon: '🛡️', category: 'minesweeper', hidden: false },
  { id: 'mine_expert_1', name: '扫雷王者', description: '赢得1场专家扫雷', icon: '👑', category: 'minesweeper', hidden: false },
  { id: 'mine_speed_beginner', name: '快手排雷', description: '30秒内完成初级扫雷', icon: '⚡', category: 'minesweeper', hidden: false },
  { id: 'mine_speed_intermediate', name: '极速排雷', description: '3分钟内完成中级扫雷', icon: '🏃', category: 'minesweeper', hidden: false },
  { id: 'mine_speed_advanced', name: '闪电排雷', description: '10分钟内完成高级扫雷', icon: '🚀', category: 'minesweeper', hidden: false },
  { id: 'mine_streak_3', name: '三连排雷', description: '连续赢得3场扫雷', icon: '🔥', category: 'minesweeper', hidden: false },
  { id: 'mine_streak_7', name: '七连排雷', description: '连续赢得7场扫雷', icon: '🌟', category: 'minesweeper', hidden: false },
  { id: 'mine_streak_30', name: '三十连排雷', description: '连续赢得30场扫雷', icon: '💫', category: 'minesweeper', hidden: true },
  { id: 'mine_total_50', name: '排雷老兵', description: '累计赢得50场扫雷', icon: '📊', category: 'minesweeper', hidden: false },
  { id: 'mine_total_100', name: '百战百胜', description: '累计赢得100场扫雷', icon: '💯', category: 'minesweeper', hidden: false },
  { id: 'mine_all_difficulty', name: '全能排雷兵', description: '在所有难度等级都赢得过扫雷', icon: '🏅', category: 'minesweeper', hidden: false },
  { id: 'mine_flag_master', name: '旗帜大师', description: '累计放置500面旗帜', icon: '🚩', category: 'minesweeper', hidden: false },
];

const GENERAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'daily_first', name: '每日挑战者', description: '完成第一次每日挑战', icon: '📅', category: 'general', hidden: false },
  { id: 'daily_streak_7', name: '坚持不懈', description: '连续7天完成每日挑战', icon: '📆', category: 'general', hidden: false },
  { id: 'daily_streak_30', name: '月度达人', description: '连续30天完成每日挑战', icon: '🗓️', category: 'general', hidden: true },
];

const ALL_ACHIEVEMENTS: Achievement[] = [
  ...SUDOKU_ACHIEVEMENTS,
  ...MINESWEEPER_ACHIEVEMENTS,
  ...GENERAL_ACHIEVEMENTS,
];

function loadUnlocked(): UnlockedAchievement[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveUnlocked(unlocked: UnlockedAchievement[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
  } catch {}
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  achievements: ALL_ACHIEVEMENTS,
  unlocked: loadUnlocked(),
  recentlyUnlocked: null,

  isUnlocked: (id) => get().unlocked.some((a) => a.id === id),

  unlock: (id) => {
    const { unlocked } = get();
    if (unlocked.some((a) => a.id === id)) return;
    const newUnlocked = [...unlocked, { id, unlockedAt: new Date().toISOString() }];
    saveUnlocked(newUnlocked);
    set({ unlocked: newUnlocked, recentlyUnlocked: id });
  },

  clearRecentlyUnlocked: () => {
    set({ recentlyUnlocked: null });
  },

  getUnlockedCount: (category) => {
    const { unlocked, achievements } = get();
    const filtered = category
      ? achievements.filter((a) => a.category === category)
      : achievements;
    const ids = new Set(filtered.map((a) => a.id));
    return unlocked.filter((u) => ids.has(u.id)).length;
  },

  getTotalCount: (category) => {
    const { achievements } = get();
    return category
      ? achievements.filter((a) => a.category === category).length
      : achievements.length;
  },

  checkSudokuAchievements: (stats, difficulty, elapsedTime, mistakes, hintsUsed) => {
    const newlyUnlocked: string[] = [];
    const { isUnlocked, unlock } = get();

    if (!isUnlocked('sudoku_first_win') && stats.gamesWon >= 1) {
      unlock('sudoku_first_win'); newlyUnlocked.push('sudoku_first_win');
    }
    if (!isUnlocked('sudoku_easy_10') && stats.difficultyWins.easy >= 10) {
      unlock('sudoku_easy_10'); newlyUnlocked.push('sudoku_easy_10');
    }
    if (!isUnlocked('sudoku_medium_5') && stats.difficultyWins.medium >= 5) {
      unlock('sudoku_medium_5'); newlyUnlocked.push('sudoku_medium_5');
    }
    if (!isUnlocked('sudoku_hard_3') && stats.difficultyWins.hard >= 3) {
      unlock('sudoku_hard_3'); newlyUnlocked.push('sudoku_hard_3');
    }
    if (!isUnlocked('sudoku_expert_1') && stats.difficultyWins.expert >= 1) {
      unlock('sudoku_expert_1'); newlyUnlocked.push('sudoku_expert_1');
    }
    if (!isUnlocked('sudoku_no_mistakes') && mistakes === 0) {
      unlock('sudoku_no_mistakes'); newlyUnlocked.push('sudoku_no_mistakes');
    }
    if (!isUnlocked('sudoku_no_hints') && hintsUsed === 0) {
      unlock('sudoku_no_hints'); newlyUnlocked.push('sudoku_no_hints');
    }
    if (!isUnlocked('sudoku_speed_easy') && difficulty === 'easy' && elapsedTime <= 300) {
      unlock('sudoku_speed_easy'); newlyUnlocked.push('sudoku_speed_easy');
    }
    if (!isUnlocked('sudoku_speed_medium') && difficulty === 'medium' && elapsedTime <= 900) {
      unlock('sudoku_speed_medium'); newlyUnlocked.push('sudoku_speed_medium');
    }
    if (!isUnlocked('sudoku_speed_hard') && difficulty === 'hard' && elapsedTime <= 1800) {
      unlock('sudoku_speed_hard'); newlyUnlocked.push('sudoku_speed_hard');
    }
    if (!isUnlocked('sudoku_streak_3') && stats.currentStreak >= 3) {
      unlock('sudoku_streak_3'); newlyUnlocked.push('sudoku_streak_3');
    }
    if (!isUnlocked('sudoku_streak_7') && stats.currentStreak >= 7) {
      unlock('sudoku_streak_7'); newlyUnlocked.push('sudoku_streak_7');
    }
    if (!isUnlocked('sudoku_streak_30') && stats.currentStreak >= 30) {
      unlock('sudoku_streak_30'); newlyUnlocked.push('sudoku_streak_30');
    }
    if (!isUnlocked('sudoku_total_50') && stats.gamesWon >= 50) {
      unlock('sudoku_total_50'); newlyUnlocked.push('sudoku_total_50');
    }
    if (!isUnlocked('sudoku_total_100') && stats.gamesWon >= 100) {
      unlock('sudoku_total_100'); newlyUnlocked.push('sudoku_total_100');
    }
    if (!isUnlocked('sudoku_all_difficulty')) {
      const { easy, medium, hard, expert } = stats.difficultyWins;
      if (easy > 0 && medium > 0 && hard > 0 && expert > 0) {
        unlock('sudoku_all_difficulty'); newlyUnlocked.push('sudoku_all_difficulty');
      }
    }
    if (!isUnlocked('sudoku_expert_no_hints') && difficulty === 'expert' && hintsUsed === 0) {
      unlock('sudoku_expert_no_hints'); newlyUnlocked.push('sudoku_expert_no_hints');
    }

    return newlyUnlocked;
  },

  checkMinesweeperAchievements: (stats, difficulty, elapsedTime, isWin) => {
    const newlyUnlocked: string[] = [];
    const { isUnlocked, unlock } = get();

    if (!isWin) return newlyUnlocked;

    if (!isUnlocked('mine_first_win') && stats.gamesWon >= 1) {
      unlock('mine_first_win'); newlyUnlocked.push('mine_first_win');
    }
    if (!isUnlocked('mine_beginner_10') && stats.difficultyWins.beginner >= 10) {
      unlock('mine_beginner_10'); newlyUnlocked.push('mine_beginner_10');
    }
    if (!isUnlocked('mine_intermediate_5') && stats.difficultyWins.intermediate >= 5) {
      unlock('mine_intermediate_5'); newlyUnlocked.push('mine_intermediate_5');
    }
    if (!isUnlocked('mine_advanced_3') && stats.difficultyWins.advanced >= 3) {
      unlock('mine_advanced_3'); newlyUnlocked.push('mine_advanced_3');
    }
    if (!isUnlocked('mine_expert_1') && stats.difficultyWins.expert >= 1) {
      unlock('mine_expert_1'); newlyUnlocked.push('mine_expert_1');
    }
    if (!isUnlocked('mine_speed_beginner') && difficulty === 'beginner' && elapsedTime <= 30) {
      unlock('mine_speed_beginner'); newlyUnlocked.push('mine_speed_beginner');
    }
    if (!isUnlocked('mine_speed_intermediate') && difficulty === 'intermediate' && elapsedTime <= 180) {
      unlock('mine_speed_intermediate'); newlyUnlocked.push('mine_speed_intermediate');
    }
    if (!isUnlocked('mine_speed_advanced') && difficulty === 'advanced' && elapsedTime <= 600) {
      unlock('mine_speed_advanced'); newlyUnlocked.push('mine_speed_advanced');
    }
    if (!isUnlocked('mine_streak_3') && stats.currentStreak >= 3) {
      unlock('mine_streak_3'); newlyUnlocked.push('mine_streak_3');
    }
    if (!isUnlocked('mine_streak_7') && stats.currentStreak >= 7) {
      unlock('mine_streak_7'); newlyUnlocked.push('mine_streak_7');
    }
    if (!isUnlocked('mine_streak_30') && stats.currentStreak >= 30) {
      unlock('mine_streak_30'); newlyUnlocked.push('mine_streak_30');
    }
    if (!isUnlocked('mine_total_50') && stats.gamesWon >= 50) {
      unlock('mine_total_50'); newlyUnlocked.push('mine_total_50');
    }
    if (!isUnlocked('mine_total_100') && stats.gamesWon >= 100) {
      unlock('mine_total_100'); newlyUnlocked.push('mine_total_100');
    }
    if (!isUnlocked('mine_all_difficulty')) {
      const { beginner, intermediate, advanced, expert } = stats.difficultyWins;
      if (beginner > 0 && intermediate > 0 && advanced > 0 && expert > 0) {
        unlock('mine_all_difficulty'); newlyUnlocked.push('mine_all_difficulty');
      }
    }
    if (!isUnlocked('mine_flag_master') && stats.totalFlagsPlaced >= 500) {
      unlock('mine_flag_master'); newlyUnlocked.push('mine_flag_master');
    }

    return newlyUnlocked;
  },

  reset: () => {
    saveUnlocked([]);
    set({ unlocked: [], recentlyUnlocked: null });
  },
}));
