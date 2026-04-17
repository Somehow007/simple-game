export const APP_NAME = '数独';
export const APP_VERSION = '0.0.0';

export const STORAGE_KEYS = {
  GAME_STATE: 'shudu_game_state',
  SETTINGS: 'shudu_settings',
  STATISTICS: 'shudu_statistics',
  BEST_TIMES: 'shudu_best_times',
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

export const THEME_OPTIONS = ['light', 'dark'] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

export const INPUT_MODES = ['normal', 'note'] as const;
export type InputMode = (typeof INPUT_MODES)[number];
