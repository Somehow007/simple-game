export const STORAGE_KEYS = {
  SETTINGS: 'shudu_settings',
  STATISTICS: 'shudu_statistics',
  SHORTCUTS: 'shudu_shortcuts',
  SAVED_GAME: 'shudu_saved_game',
  MINESWEEPER_SETTINGS: 'shudu_minesweeper_settings',
  MINESWEEPER_STATISTICS: 'shudu_minesweeper_statistics',
  MINESWEEPER_SAVED_GAME: 'shudu_minesweeper_saved_game',
} as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家',
};

export const DIFFICULTY_GIVEN_COUNT: Record<string, [number, number]> = {
  easy: [36, 45],
  medium: [30, 35],
  hard: [25, 29],
  expert: [20, 24],
};

export const MINE_DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};

export const MINE_DIFFICULTY_INFO: Record<string, { grid: string; mines: number; time: string }> = {
  beginner:     { grid: '9×9',   mines: 10,  time: '2-5分钟' },
  intermediate: { grid: '16×16', mines: 40,  time: '5-15分钟' },
  advanced:     { grid: '30×16', mines: 99,  time: '15-30分钟' },
  expert:       { grid: '30×20', mines: 130, time: '30-60分钟' },
};

export const THEME_OPTIONS = ['light', 'dark'] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];
