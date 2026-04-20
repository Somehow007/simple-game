import { useEffect, useState, useCallback, useRef } from 'react';
import {
  useGameStore,
  useMinesweeperStore,
  useKeyboardShortcuts,
  useMineKeyboardShortcuts,
  useSoundEffects,
  ToastContainer,
  showToast,
  ShortcutHelpPanel,
  ShortcutCustomizer,
  Grid,
  Numpad,
  Timer,
  Toolbar,
  WinDialog,
  MineGrid,
  MineCounter,
  FaceButton,
  FlagToggle,
  MineToolbar,
  GameEndDialog,
  MineStatsPanel,
  SudokuStatsPanel,
  MineShortcutHelp,
  AchievementPanel,
  AchievementUnlockNotification,
  DailyChallengePanel,
  useAchievementStore,
  useDailyChallengeStore,
  useSudokuVariantStore,
  useMineVariantStore,
  TIMED_CONFIGS,
} from '@shudu/ui';
import type { SudokuVariant, MineVariant } from '@shudu/ui';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_GIVEN_COUNT,
  MINE_DIFFICULTY_LABELS,
  MINE_DIFFICULTY_INFO,
  formatTime,
} from '@shudu/shared';
import { type Difficulty } from '@shudu/core';
import type { MineDifficulty } from '@shudu/minesweeper-core';
import type { MiniGridSize } from '@shudu/core';

type Page =
  | 'home'
  | 'sudoku-start'
  | 'sudoku-game'
  | 'minesweeper-start'
  | 'minesweeper-game'
  | 'settings'
  | 'stats'
  | 'achievements'
  | 'daily-challenge'
  | 'sudoku-variant'
  | 'sudoku-variant-game'
  | 'mine-variant'
  | 'mine-variant-game';

const SUDOKU_DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#22c55e',
  medium: '#3b82f6',
  hard: '#f59e0b',
  expert: '#ef4444',
};

const MINE_DIFFICULTY_COLORS: Record<MineDifficulty, string> = {
  beginner: '#22c55e',
  intermediate: '#3b82f6',
  advanced: '#f59e0b',
  expert: '#ef4444',
};

const SUDOKU_DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: '基础排除法 · 5-15分钟',
  medium: '隐性唯一法 · 15-30分钟',
  hard: '高级技巧 · 30-60分钟',
  expert: '多种技巧组合 · 60分钟+',
};

const SUDOKU_VARIANT_INFO: Record<Exclude<SudokuVariant, 'standard'>, { icon: string; name: string; desc: string }> = {
  diagonal: { icon: '↗️', name: '对角线数独', desc: '两条对角线也必须包含1-9' },
  mini4: { icon: '🔹', name: '迷你数独 4×4', desc: '2×2宫格 · 数字1-4' },
  mini6: { icon: '🔷', name: '迷你数独 6×6', desc: '2×3宫格 · 数字1-6' },
};

const MINE_VARIANT_INFO: Record<Exclude<MineVariant, 'standard'>, { icon: string; name: string; desc: string }> = {
  timed: { icon: '⏱️', name: '极限计时', desc: '限时完成 · 与时间赛跑' },
  blind: { icon: '🙈', name: '盲扫模式', desc: '不显示数字 · 纯逻辑推理' },
};

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <span className="dialog__title">{title}</span>
        </div>
        <div className="dialog__body">
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>{message}</p>
        </div>
        <div className="dialog__footer">
          <button className="dialog__btn dialog__btn--cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="dialog__btn dialog__btn--danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function OverlayPanel({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="overlay-panel-bg" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-panel__header">
          <span className="overlay-panel__title">{title}</span>
          <button className="dialog__close" onClick={onClose}>✕</button>
        </div>
        <div className="overlay-panel__body">
          {children}
        </div>
      </div>
    </div>
  );
}

function GameSettingsPanel({ game }: { game: 'sudoku' | 'minesweeper' }) {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const mineSettings = useMinesweeperStore((s) => s.settings);
  const updateMineSettings = useMinesweeperStore((s) => s.updateSettings);

  if (game === 'sudoku') {
    return (
      <div className="settings-list">
        <div className="settings-item">
          <span className="settings-item__label">主题</span>
          <div className="settings-item__control">
            <button
              className={`toggle-btn ${settings.theme === 'light' ? 'toggle-btn--active' : ''}`}
              onClick={() => { updateSettings({ theme: 'light' }); updateMineSettings({ theme: 'light' }); }}
            >
              ☀️ 亮色
            </button>
            <button
              className={`toggle-btn ${settings.theme === 'dark' ? 'toggle-btn--active' : ''}`}
              onClick={() => { updateSettings({ theme: 'dark' }); updateMineSettings({ theme: 'dark' }); }}
            >
              🌙 暗色
            </button>
          </div>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">音效</span>
          <button
            className={`switch ${settings.soundEnabled ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">高亮错误</span>
          <button
            className={`switch ${settings.highlightErrors ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ highlightErrors: !settings.highlightErrors })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">高亮相同数字</span>
          <button
            className={`switch ${settings.highlightSameNumbers ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ highlightSameNumbers: !settings.highlightSameNumbers })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">自动清除笔记</span>
          <button
            className={`switch ${settings.autoRemoveNotes ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ autoRemoveNotes: !settings.autoRemoveNotes })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
        <div className="settings-item">
          <span className="settings-item__label">显示计时器</span>
          <button
            className={`switch ${settings.showTimer ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ showTimer: !settings.showTimer })}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-list">
      <div className="settings-item">
        <span className="settings-item__label">主题</span>
        <div className="settings-item__control">
          <button
            className={`toggle-btn ${mineSettings.theme === 'light' ? 'toggle-btn--active' : ''}`}
            onClick={() => { updateSettings({ theme: 'light' }); updateMineSettings({ theme: 'light' }); }}
          >
            ☀️ 亮色
          </button>
          <button
            className={`toggle-btn ${mineSettings.theme === 'dark' ? 'toggle-btn--active' : ''}`}
            onClick={() => { updateSettings({ theme: 'dark' }); updateMineSettings({ theme: 'dark' }); }}
          >
            🌙 暗色
          </button>
        </div>
      </div>
      <div className="settings-item">
        <span className="settings-item__label">音效</span>
        <button
          className={`switch ${mineSettings.soundEnabled ? 'switch--on' : ''}`}
          onClick={() => updateMineSettings({ soundEnabled: !mineSettings.soundEnabled })}
        >
          <span className="switch__thumb" />
        </button>
      </div>
      <div className="settings-item">
        <span className="settings-item__label">显示计时器</span>
        <button
          className={`switch ${mineSettings.showTimer ? 'switch--on' : ''}`}
          onClick={() => updateMineSettings({ showTimer: !mineSettings.showTimer })}
        >
          <span className="switch__thumb" />
        </button>
      </div>
      <div className="settings-item">
        <span className="settings-item__label">问号标记</span>
        <button
          className={`switch ${mineSettings.questionMarkEnabled ? 'switch--on' : ''}`}
          onClick={() => updateMineSettings({ questionMarkEnabled: !mineSettings.questionMarkEnabled })}
        >
          <span className="switch__thumb" />
        </button>
      </div>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const hasSudokuSaved = useGameStore((s) => s.hasSavedGame);
  const hasMineSaved = useMinesweeperStore((s) => s.hasSavedGame);
  const getUnlockedCount = useAchievementStore((s) => s.getUnlockedCount);
  const getTotalCount = useAchievementStore((s) => s.getTotalCount);

  return (
    <div className="home-page">
      <div className="home-page__content">
        <div className="home-page__logo">
          <div className="home-page__icon">🧩</div>
          <h1 className="home-page__title">益智游戏合集</h1>
          <p className="home-page__subtitle">锻炼你的逻辑思维</p>
        </div>

        <div className="home-page__games">
          <div className="home-page__game-card-wrapper">
            <button
              className="home-page__game-card"
              onClick={() => onNavigate('sudoku-start')}
            >
              <span className="home-page__game-icon">🎮</span>
              <div className="home-page__game-info">
                <span className="home-page__game-name">数独</span>
                <span className="home-page__game-desc">经典数字逻辑推理游戏</span>
                <span className="home-page__game-tags">9×9 网格 · 唯一解 · 笔记模式</span>
              </div>
              <span className="home-page__game-arrow">›</span>
            </button>
            {hasSudokuSaved() && (
              <button
                className="home-page__resume-btn"
                onClick={() => onNavigate('sudoku-game')}
              >
                ▶ 继续上次游戏
              </button>
            )}
          </div>

          <div className="home-page__game-card-wrapper">
            <button
              className="home-page__game-card"
              onClick={() => onNavigate('minesweeper-start')}
            >
              <span className="home-page__game-icon">💣</span>
              <div className="home-page__game-info">
                <span className="home-page__game-name">扫雷</span>
                <span className="home-page__game-desc">经典策略推理游戏</span>
                <span className="home-page__game-tags">避开地雷 · 标记旗帜 · 逻辑推理</span>
              </div>
              <span className="home-page__game-arrow">›</span>
            </button>
            {hasMineSaved() && (
              <button
                className="home-page__resume-btn"
                onClick={() => onNavigate('minesweeper-game')}
              >
                ▶ 继续上次游戏
              </button>
            )}
          </div>
        </div>

        <div className="home-page__p2-section">
          <button className="home-page__p2-card" onClick={() => onNavigate('daily-challenge')}>
            <span className="home-page__p2-icon">📅</span>
            <div className="home-page__p2-info">
              <span className="home-page__p2-name">每日挑战</span>
              <span className="home-page__p2-desc">每日一道专属谜题</span>
            </div>
            <span className="home-page__game-arrow">›</span>
          </button>
          <button className="home-page__p2-card" onClick={() => onNavigate('achievements')}>
            <span className="home-page__p2-icon">🏆</span>
            <div className="home-page__p2-info">
              <span className="home-page__p2-name">成就</span>
              <span className="home-page__p2-desc">{getUnlockedCount()}/{getTotalCount()} 已解锁</span>
            </div>
            <span className="home-page__game-arrow">›</span>
          </button>
        </div>

        <div className="home-page__footer">
          <button className="home-page__footer-btn" onClick={() => onNavigate('settings')}>
            ⚙️ 设置
          </button>
          <button className="home-page__footer-btn" onClick={() => onNavigate('stats')}>
            📊 统计
          </button>
        </div>
      </div>
    </div>
  );
}

function SudokuStartPage({ onStartGame, onResumeGame, onBack, onStartVariant }: { onStartGame: (difficulty: Difficulty) => void; onResumeGame: () => void; onBack: () => void; onStartVariant: (variant: SudokuVariant, difficulty?: Difficulty) => void }) {
  const showTimer = useGameStore((s) => s.settings.showTimer);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const hasSavedGame = useGameStore((s) => s.hasSavedGame);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleDifficultyClick = useCallback((d: Difficulty) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onStartGame(d);
    }, 350);
  }, [onStartGame]);

  return (
    <div className={`start-page ${isTransitioning ? 'start-page--leaving' : ''}`}>
      <div className="start-page__content">
        <div className="start-page__header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="start-page__logo">
          <div className="start-page__grid-icon">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <span key={n} className="start-page__grid-cell">{n}</span>
            ))}
          </div>
          <h1 className="start-page__title">数独</h1>
          <p className="start-page__subtitle">锻炼你的逻辑思维</p>
        </div>

        {hasSavedGame() && (
          <div className="start-page__section">
            <button className="start-page__resume-card" onClick={onResumeGame}>
              <span className="start-page__resume-icon">▶️</span>
              <div className="start-page__resume-info">
                <span className="start-page__resume-title">继续上次游戏</span>
                <span className="start-page__resume-desc">恢复未完成的数独进度</span>
              </div>
              <span className="start-page__difficulty-arrow">›</span>
            </button>
          </div>
        )}

        <div className="start-page__section">
          <h3 className="start-page__section-title">选择难度开始游戏</h3>
          <div className="start-page__difficulty-list">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                className="start-page__difficulty-card"
                onClick={() => handleDifficultyClick(d)}
                style={{
                  '--difficulty-color': SUDOKU_DIFFICULTY_COLORS[d],
                } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">
                  {d === 'easy' ? '🟢' : d === 'medium' ? '🔵' : d === 'hard' ? '🟡' : '🔴'}
                </span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{DIFFICULTY_LABELS[d]}</span>
                  <span className="start-page__difficulty-desc">{SUDOKU_DIFFICULTY_DESCRIPTIONS[d]}</span>
                  <span className="start-page__difficulty-given">
                    {DIFFICULTY_GIVEN_COUNT[d][0]}-{DIFFICULTY_GIVEN_COUNT[d][1]} 个提示数
                  </span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="start-page__section">
          <h3 className="start-page__section-title">游戏变体</h3>
          <div className="start-page__difficulty-list">
            {(Object.entries(SUDOKU_VARIANT_INFO) as [Exclude<SudokuVariant, 'standard'>, typeof SUDOKU_VARIANT_INFO[keyof typeof SUDOKU_VARIANT_INFO]][]).map(([key, info]) => (
              <button
                key={key}
                className="start-page__difficulty-card"
                onClick={() => onStartVariant(key)}
                style={{ '--difficulty-color': '#8b5cf6' } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">{info.icon}</span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{info.name}</span>
                  <span className="start-page__difficulty-desc">{info.desc}</span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="start-page__section">
          <button className="start-page__option-row" onClick={() => setShowStats(true)} style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span className="start-page__option-label">📊 查看统计</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>›</span>
          </button>
          <div className="start-page__option-row">
            <span className="start-page__option-label">⏱️ 显示计时器</span>
            <button
              className={`switch ${showTimer ? 'switch--on' : ''}`}
              onClick={() => updateSettings({ showTimer: !showTimer })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
        </div>
      </div>
      <OverlayPanel isOpen={showStats} title="📊 数独统计" onClose={() => setShowStats(false)}>
        <SudokuStatsPanel />
      </OverlayPanel>
    </div>
  );
}

function MinesweeperStartPage({ onStartGame, onResumeGame, onBack, onNavigateToVariant }: { onStartGame: (difficulty: MineDifficulty) => void; onResumeGame: () => void; onBack: () => void; onNavigateToVariant: (variant: Exclude<MineVariant, 'standard'>) => void }) {
  const hasSavedGame = useMinesweeperStore((s) => s.hasSavedGame);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleDifficultyClick = useCallback((d: MineDifficulty) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onStartGame(d);
    }, 350);
  }, [onStartGame]);

  return (
    <div className={`start-page ${isTransitioning ? 'start-page--leaving' : ''}`}>
      <div className="start-page__content">
        <div className="start-page__header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="start-page__logo">
          <div className="start-page__mine-icon">💣</div>
          <h1 className="start-page__title">扫雷</h1>
          <p className="start-page__subtitle">避开地雷 · 标记旗帜 · 逻辑推理</p>
        </div>

        {hasSavedGame() && (
          <div className="start-page__section">
            <button className="start-page__resume-card" onClick={onResumeGame}>
              <span className="start-page__resume-icon">▶️</span>
              <div className="start-page__resume-info">
                <span className="start-page__resume-title">继续上次游戏</span>
                <span className="start-page__resume-desc">恢复未完成的扫雷进度</span>
              </div>
              <span className="start-page__difficulty-arrow">›</span>
            </button>
          </div>
        )}

        <div className="start-page__section">
          <h3 className="start-page__section-title">选择难度开始游戏</h3>
          <div className="start-page__difficulty-list">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as MineDifficulty[]).map((d) => (
              <button
                key={d}
                className="start-page__difficulty-card"
                onClick={() => handleDifficultyClick(d)}
                style={{
                  '--difficulty-color': MINE_DIFFICULTY_COLORS[d],
                } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">
                  {d === 'beginner' ? '🟢' : d === 'intermediate' ? '🔵' : d === 'advanced' ? '🟡' : '🔴'}
                </span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{MINE_DIFFICULTY_LABELS[d]}</span>
                  <span className="start-page__difficulty-desc">
                    {MINE_DIFFICULTY_INFO[d].grid} · {MINE_DIFFICULTY_INFO[d].mines}雷 · {MINE_DIFFICULTY_INFO[d].time}
                  </span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="start-page__section">
          <h3 className="start-page__section-title">游戏变体</h3>
          <div className="start-page__difficulty-list">
            {(Object.entries(MINE_VARIANT_INFO) as [Exclude<MineVariant, 'standard'>, typeof MINE_VARIANT_INFO[keyof typeof MINE_VARIANT_INFO]][]).map(([key, info]) => (
              <button
                key={key}
                className="start-page__difficulty-card"
                onClick={() => onNavigateToVariant(key)}
                style={{ '--difficulty-color': '#8b5cf6' } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">{info.icon}</span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{info.name}</span>
                  <span className="start-page__difficulty-desc">{info.desc}</span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="start-page__section">
          <button className="start-page__option-row" onClick={() => setShowStats(true)} style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span className="start-page__option-label">📊 查看统计</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>›</span>
          </button>
        </div>
      </div>
      <OverlayPanel isOpen={showStats} title="📊 扫雷统计" onClose={() => setShowStats(false)}>
        <MineStatsPanel />
      </OverlayPanel>
    </div>
  );
}

function SudokuGamePage({ onBack }: { onBack: () => void }) {
  const grid = useGameStore((s) => s.grid);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const difficulty = useGameStore((s) => s.difficulty);
  const mistakes = useGameStore((s) => s.mistakes);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const newGame = useGameStore((s) => s.newGame);
  const isPaused = useGameStore((s) => s.isPaused);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const hasSavedGame = useGameStore((s) => s.hasSavedGame);
  const statistics = useGameStore((s) => s.statistics);
  const checkSudokuAchievements = useAchievementStore((s) => s.checkSudokuAchievements);

  const [showWinDialog, setShowWinDialog] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const { play } = useSoundEffects();

  useEffect(() => {
    if (!grid && hasSavedGame()) {
      resumeGame();
    }
  }, []);

  useEffect(() => {
    if (isCompleted) {
      play('complete', 'sudoku');
      checkSudokuAchievements(statistics, difficulty, elapsedTime, mistakes, hintsUsed);
      setShowWinDialog(true);
    }
  }, [isCompleted]);

  const handleNewGame = useCallback(() => {
    setShowWinDialog(false);
    newGame(difficulty);
  }, [newGame, difficulty]);

  if (!grid) return null;

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back-btn" onClick={() => setShowBackConfirm(true)} title="返回主界面">
          ← 主界面
        </button>
        <Timer />
        <button className="game-header-btn" onClick={() => setShowStats(true)} title="统计">📊</button>
        <button className="game-header-btn" onClick={() => setShowAchievements(true)} title="成就">🏆</button>
        <button className="game-header-btn" onClick={() => setShowSettings(true)} title="设置">⚙️</button>
      </div>
      <div className={`game-board ${isPaused ? 'game-board--paused' : ''}`}>
        {isPaused ? (
          <div className="game-pause-overlay">
            <span>游戏已暂停</span>
          </div>
        ) : (
          <Grid />
        )}
      </div>
      <Toolbar />
      <Numpad />
      <WinDialog
        isOpen={showWinDialog}
        elapsedTime={elapsedTime}
        difficulty={DIFFICULTY_LABELS[difficulty]}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        onNewGame={handleNewGame}
        onClose={() => setShowWinDialog(false)}
      />
      <ConfirmDialog
        isOpen={showBackConfirm}
        title="返回主界面"
        message="当前游戏进度将自动保存，下次可以继续游戏。确定要返回主界面吗？"
        confirmText="确定返回"
        cancelText="继续游戏"
        onConfirm={onBack}
        onCancel={() => setShowBackConfirm(false)}
      />
      <OverlayPanel isOpen={showStats} title="📊 数独统计" onClose={() => setShowStats(false)}>
        <SudokuStatsPanel />
      </OverlayPanel>
      <OverlayPanel isOpen={showAchievements} title="🏆 成就" onClose={() => setShowAchievements(false)}>
        <AchievementPanel category="sudoku" />
      </OverlayPanel>
      <OverlayPanel isOpen={showSettings} title="⚙️ 数独设置" onClose={() => setShowSettings(false)}>
        <GameSettingsPanel game="sudoku" />
      </OverlayPanel>
    </div>
  );
}

function MinesweeperGamePage({ onBack }: { onBack: () => void }) {
  const grid = useMinesweeperStore((s) => s.grid);
  const isGameOver = useMinesweeperStore((s) => s.isGameOver);
  const isWin = useMinesweeperStore((s) => s.isWin);
  const elapsedTime = useMinesweeperStore((s) => s.elapsedTime);
  const difficulty = useMinesweeperStore((s) => s.difficulty);
  const isPaused = useMinesweeperStore((s) => s.isPaused);
  const clickCount = useMinesweeperStore((s) => s.clickCount);
  const newGame = useMinesweeperStore((s) => s.newGame);
  const setElapsedTime = useMinesweeperStore((s) => s.setElapsedTime);
  const showTimer = useMinesweeperStore((s) => s.settings.showTimer);
  const resumeGame = useMinesweeperStore((s) => s.resumeGame);
  const hasSavedGame = useMinesweeperStore((s) => s.hasSavedGame);
  const statistics = useMinesweeperStore((s) => s.statistics);
  const checkMinesweeperAchievements = useAchievementStore((s) => s.checkMinesweeperAchievements);

  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toastRef = useRef((message: string) => showToast(message));
  const { play } = useSoundEffects();

  useMineKeyboardShortcuts({
    onShowShortcuts: () => setShowShortcutHelp((prev) => !prev),
    onToast: toastRef.current,
    onBack: () => setShowBackConfirm(true),
  });

  useEffect(() => {
    if (!grid && hasSavedGame()) {
      resumeGame();
    }
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (grid && !isPaused && !isGameOver && showTimer) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(useMinesweeperStore.getState().elapsedTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [grid, isPaused, isGameOver, showTimer, setElapsedTime]);

  useEffect(() => {
    if (isGameOver) {
      if (isWin) {
        play('win', 'minesweeper');
        checkMinesweeperAchievements(statistics, difficulty, elapsedTime, true);
      } else {
        play('explode', 'minesweeper');
      }
      setShowEndDialog(true);
    }
  }, [isGameOver]);

  const handleNewGame = useCallback(() => {
    setShowEndDialog(false);
    newGame(difficulty);
  }, [newGame, difficulty]);

  const handleReview = useCallback(() => {
    setShowEndDialog(false);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setShowEndDialog(false);
    onBack();
  }, [onBack]);

  if (!grid) return null;

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back-btn" onClick={() => setShowBackConfirm(true)} title="返回">
          ← 返回
        </button>
        <MineCounter />
        <FaceButton />
        {showTimer && (
          <div className={`timer ${isPaused ? 'timer--paused' : ''}`}>
            <span className="timer__display">{formatTime(elapsedTime)}</span>
          </div>
        )}
        <button className="game-header-btn" onClick={() => setShowStats(true)} title="统计">📊</button>
        <button className="game-header-btn" onClick={() => setShowAchievements(true)} title="成就">🏆</button>
        <button className="game-header-btn" onClick={() => setShowSettings(true)} title="设置">⚙️</button>
        <button
          className="game-header-btn"
          onClick={() => setShowShortcutHelp((prev) => !prev)}
          title="快捷键帮助"
        >
          ⌨️
        </button>
      </div>
      <div className="mine-game-board">
        <MineGrid />
      </div>
      <MineToolbar />
      <div className="numpad-actions">
        <FlagToggle />
        {clickCount > 0 && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            点击: {clickCount}
          </span>
        )}
      </div>
      <OverlayPanel isOpen={showShortcutHelp} title="⌨️ 快捷键" onClose={() => setShowShortcutHelp(false)}>
        <MineShortcutHelp />
      </OverlayPanel>
      <OverlayPanel isOpen={showStats} title="📊 扫雷统计" onClose={() => setShowStats(false)}>
        <MineStatsPanel />
      </OverlayPanel>
      <OverlayPanel isOpen={showAchievements} title="🏆 成就" onClose={() => setShowAchievements(false)}>
        <AchievementPanel category="minesweeper" />
      </OverlayPanel>
      <OverlayPanel isOpen={showSettings} title="⚙️ 扫雷设置" onClose={() => setShowSettings(false)}>
        <GameSettingsPanel game="minesweeper" />
      </OverlayPanel>
      <GameEndDialog
        isOpen={showEndDialog}
        isWin={isWin}
        elapsedTime={elapsedTime}
        difficulty={MINE_DIFFICULTY_LABELS[difficulty]}
        clickCount={clickCount}
        onNewGame={handleNewGame}
        onReview={handleReview}
        onBackToMenu={handleBackToMenu}
      />
      <ConfirmDialog
        isOpen={showBackConfirm}
        title="返回"
        message="当前游戏进度将自动保存，下次可以继续游戏。确定要返回吗？"
        confirmText="确定返回"
        cancelText="继续游戏"
        onConfirm={onBack}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}

function DailyChallengePage({ onBack, onStartDailySudoku, onStartDailyMine }: { onBack: () => void; onStartDailySudoku: () => void; onStartDailyMine: () => void }) {
  return (
    <div className="start-page">
      <div className="start-page__content">
        <div className="start-page__header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="start-page__logo">
          <div className="start-page__mine-icon">📅</div>
          <h1 className="start-page__title">每日挑战</h1>
          <p className="start-page__subtitle">每日一道专属谜题 · 与全球玩家同台竞技</p>
        </div>
        <DailyChallengePanel
          onStartSudoku={onStartDailySudoku}
          onStartMine={onStartDailyMine}
        />
      </div>
    </div>
  );
}

function AchievementsPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'all' | 'sudoku' | 'minesweeper' | 'general'>('all');

  return (
    <div className="stats-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2>🏆 成就</h2>
      </div>
      <div className="settings-tabs">
        {(['all', 'sudoku', 'minesweeper', 'general'] as const).map((tab) => (
          <button
            key={tab}
            className={`settings-tab ${activeTab === tab ? 'settings-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? '全部' : tab === 'sudoku' ? '数独' : tab === 'minesweeper' ? '扫雷' : '通用'}
          </button>
        ))}
      </div>
      <AchievementPanel category={activeTab === 'all' ? undefined : activeTab} />
    </div>
  );
}

function SudokuVariantPage({ onBack, onStartVariant }: { onBack: () => void; onStartVariant: (variant: SudokuVariant, difficulty?: Difficulty) => void }) {
  return (
    <div className="start-page">
      <div className="start-page__content">
        <div className="start-page__header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="start-page__logo">
          <div className="start-page__mine-icon">🔀</div>
          <h1 className="start-page__title">数独变体</h1>
          <p className="start-page__subtitle">挑战不同规则的数独玩法</p>
        </div>

        <div className="start-page__section">
          <h3 className="start-page__section-title">选择变体</h3>
          <div className="start-page__difficulty-list">
            {(Object.entries(SUDOKU_VARIANT_INFO) as [Exclude<SudokuVariant, 'standard'>, typeof SUDOKU_VARIANT_INFO[keyof typeof SUDOKU_VARIANT_INFO]][]).map(([key, info]) => (
              <button
                key={key}
                className="start-page__difficulty-card"
                onClick={() => onStartVariant(key)}
                style={{ '--difficulty-color': '#8b5cf6' } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">{info.icon}</span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{info.name}</span>
                  <span className="start-page__difficulty-desc">{info.desc}</span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSudokuGrid({ gridSize }: { gridSize: MiniGridSize }) {
  const miniGrid = useSudokuVariantStore((s) => s.miniGrid);
  const miniSolution = useSudokuVariantStore((s) => s.miniSolution);
  const selectCell = useSudokuVariantStore((s) => s.selectCell);
  const setMiniValue = useSudokuVariantStore((s) => s.setMiniValue);
  const clearMiniValue = useSudokuVariantStore((s) => s.clearMiniValue);
  const isCompleted = useSudokuVariantStore((s) => s.isCompleted);
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null);

  if (!miniGrid) return null;

  const boxRows = gridSize === 4 ? 2 : 2;
  const boxCols = gridSize === 4 ? 2 : 3;
  const maxVal = gridSize;

  const handleCellClick = (row: number, col: number) => {
    if (miniGrid[row][col].isGiven) return;
    setSelectedPos({ row, col });
    selectCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedPos) return;
    setMiniValue(selectedPos.row, selectedPos.col, num);
  };

  const handleClear = () => {
    if (!selectedPos) return;
    clearMiniValue(selectedPos.row, selectedPos.col);
  };

  return (
    <div>
      <div className="mini-sudoku-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '1px',
        backgroundColor: 'var(--color-border)',
        border: '2px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        maxWidth: gridSize === 4 ? '280px' : '360px',
        margin: '0 auto',
      }}>
        {miniGrid.map((row, r) =>
          row.map((cell, c) => {
            const isBoxBorderRight = (c + 1) % boxCols === 0 && c < gridSize - 1;
            const isBoxBorderBottom = (r + 1) % boxRows === 0 && r < gridSize - 1;
            const isSelected = selectedPos?.row === r && selectedPos?.col === c;
            const isWrong = cell.value !== 0 && miniSolution && cell.value !== miniSolution[r][c];

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  width: gridSize === 4 ? '64px' : '56px',
                  height: gridSize === 4 ? '64px' : '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: gridSize === 4 ? '24px' : '20px',
                  fontWeight: cell.isGiven ? 'bold' : 'normal',
                  color: cell.isGiven ? 'var(--color-text)' : isWrong ? '#ef4444' : '#3b82f6',
                  backgroundColor: isSelected ? 'var(--color-cell-selected)' : 'var(--color-cell-bg)',
                  cursor: cell.isGiven ? 'default' : 'pointer',
                  borderRight: isBoxBorderRight ? '2px solid var(--color-border)' : undefined,
                  borderBottom: isBoxBorderBottom ? '2px solid var(--color-border)' : undefined,
                  transition: 'background-color 0.15s',
                }}
              >
                {cell.value !== 0 ? cell.value : ''}
              </div>
            );
          })
        )}
      </div>
      {!isCompleted && (
        <div className="numpad" style={{ marginTop: '16px' }}>
          <div className="numpad__row">
            {Array.from({ length: maxVal }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className="numpad__btn"
                onClick={() => handleNumberInput(n)}
              >
                {n}
              </button>
            ))}
            <button className="numpad__btn numpad__btn--erase" onClick={handleClear}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SudokuVariantGamePage({ onBack }: { onBack: () => void }) {
  const variant = useSudokuVariantStore((s) => s.variant);
  const grid = useSudokuVariantStore((s) => s.grid);
  const miniGridSize = useSudokuVariantStore((s) => s.miniGridSize);
  const isCompleted = useSudokuVariantStore((s) => s.isCompleted);
  const elapsedTime = useSudokuVariantStore((s) => s.elapsedTime);
  const mistakes = useSudokuVariantStore((s) => s.mistakes);
  const hintsUsed = useSudokuVariantStore((s) => s.hintsUsed);
  const isPaused = useSudokuVariantStore((s) => s.isPaused);
  const setElapsedTime = useSudokuVariantStore((s) => s.setElapsedTime);
  const newGame = useSudokuVariantStore((s) => s.newGame);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(useSudokuVariantStore.getState().elapsedTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isCompleted, setElapsedTime]);

  useEffect(() => {
    if (isCompleted) {
      setShowWinDialog(true);
    }
  }, [isCompleted]);

  const handleNewGame = useCallback(() => {
    setShowWinDialog(false);
    newGame(variant);
  }, [newGame, variant]);

  const variantLabel = variant === 'diagonal' ? '对角线数独' : variant === 'mini4' ? '迷你4×4' : '迷你6×6';

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back-btn" onClick={() => setShowBackConfirm(true)} title="返回主界面">
          ← 主界面
        </button>
        <span className="toolbar__difficulty">{variantLabel}</span>
        <div className="timer">
          <span className="timer__display">{formatTime(elapsedTime)}</span>
        </div>
        <button className="game-header-btn" onClick={() => setShowStats(true)} title="统计">📊</button>
        <button className="game-header-btn" onClick={() => setShowAchievements(true)} title="成就">🏆</button>
        <button className="game-header-btn" onClick={() => setShowSettings(true)} title="设置">⚙️</button>
      </div>
      <div className={`game-board ${isPaused ? 'game-board--paused' : ''}`} style={variant !== 'diagonal' ? { aspectRatio: 'auto' } : undefined}>
        {isPaused ? (
          <div className="game-pause-overlay">
            <span>游戏已暂停</span>
          </div>
        ) : (
          <>
            {variant === 'diagonal' && grid ? (
              <div style={{ position: 'relative' }}>
                <Grid variant />
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  pointerEvents: 'none',
                }}>
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="var(--color-diagonal, #8b5cf6)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />
                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="var(--color-diagonal, #8b5cf6)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />
                  </svg>
                </div>
              </div>
            ) : variant === 'mini4' || variant === 'mini6' ? (
              <MiniSudokuGrid gridSize={miniGridSize} />
            ) : null}
          </>
        )}
      </div>
      <Toolbar variant />
      {variant === 'diagonal' && <Numpad variant />}
      <WinDialog
        isOpen={showWinDialog}
        elapsedTime={elapsedTime}
        difficulty={variantLabel}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        onNewGame={handleNewGame}
        onClose={() => setShowWinDialog(false)}
      />
      <ConfirmDialog
        isOpen={showBackConfirm}
        title="返回主界面"
        message="当前游戏进度将自动保存，下次可以继续游戏。确定要返回主界面吗？"
        confirmText="确定返回"
        cancelText="继续游戏"
        onConfirm={onBack}
        onCancel={() => setShowBackConfirm(false)}
      />
      <OverlayPanel isOpen={showStats} title="📊 数独统计" onClose={() => setShowStats(false)}>
        <SudokuStatsPanel />
      </OverlayPanel>
      <OverlayPanel isOpen={showAchievements} title="🏆 成就" onClose={() => setShowAchievements(false)}>
        <AchievementPanel category="sudoku" />
      </OverlayPanel>
      <OverlayPanel isOpen={showSettings} title="⚙️ 数独设置" onClose={() => setShowSettings(false)}>
        <GameSettingsPanel game="sudoku" />
      </OverlayPanel>
    </div>
  );
}

function MineVariantPage({ onBack, onStartVariant, initialVariant }: { onBack: () => void; onStartVariant: (variant: MineVariant, difficulty: MineDifficulty) => void; initialVariant?: Exclude<MineVariant, 'standard'> }) {
  const [selectedVariant, setSelectedVariant] = useState<Exclude<MineVariant, 'standard'>>(initialVariant || 'timed');

  return (
    <div className="start-page">
      <div className="start-page__content">
        <div className="start-page__header">
          <button className="back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="start-page__logo">
          <div className="start-page__mine-icon">🔀</div>
          <h1 className="start-page__title">扫雷变体</h1>
          <p className="start-page__subtitle">挑战不同规则的扫雷玩法</p>
        </div>

        <div className="start-page__section">
          <h3 className="start-page__section-title">选择变体</h3>
          <div className="start-page__difficulty-list">
            {(Object.entries(MINE_VARIANT_INFO) as [Exclude<MineVariant, 'standard'>, typeof MINE_VARIANT_INFO[keyof typeof MINE_VARIANT_INFO]][]).map(([key, info]) => (
              <button
                key={key}
                className={`start-page__difficulty-card ${selectedVariant === key ? 'start-page__difficulty-card--selected' : ''}`}
                onClick={() => setSelectedVariant(key)}
                style={{ '--difficulty-color': '#8b5cf6' } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">{info.icon}</span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{info.name}</span>
                  <span className="start-page__difficulty-desc">{info.desc}</span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="start-page__section">
          <h3 className="start-page__section-title">选择难度</h3>
          <div className="start-page__difficulty-list">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as MineDifficulty[]).map((d) => (
              <button
                key={d}
                className="start-page__difficulty-card"
                onClick={() => onStartVariant(selectedVariant, d)}
                style={{ '--difficulty-color': MINE_DIFFICULTY_COLORS[d] } as React.CSSProperties}
              >
                <span className="start-page__difficulty-icon">
                  {d === 'beginner' ? '🟢' : d === 'intermediate' ? '🔵' : d === 'advanced' ? '🟡' : '🔴'}
                </span>
                <div className="start-page__difficulty-info">
                  <span className="start-page__difficulty-name">{MINE_DIFFICULTY_LABELS[d]}</span>
                  <span className="start-page__difficulty-desc">
                    {MINE_DIFFICULTY_INFO[d].grid} · {MINE_DIFFICULTY_INFO[d].mines}雷
                    {selectedVariant === 'timed' && ` · 限时${TIMED_CONFIGS[d].timeLimit}秒`}
                  </span>
                </div>
                <span className="start-page__difficulty-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MineVariantGamePage({ onBack }: { onBack: () => void }) {
  const variant = useMineVariantStore((s) => s.variant);
  const grid = useMineVariantStore((s) => s.grid);
  const config = useMineVariantStore((s) => s.config);
  const isGameOver = useMineVariantStore((s) => s.isGameOver);
  const isWin = useMineVariantStore((s) => s.isWin);
  const elapsedTime = useMineVariantStore((s) => s.elapsedTime);
  const difficulty = useMineVariantStore((s) => s.difficulty);
  const isPaused = useMineVariantStore((s) => s.isPaused);
  const clickCount = useMineVariantStore((s) => s.clickCount);
  const timeRemaining = useMineVariantStore((s) => s.timeRemaining);
  const isTimedMode = useMineVariantStore((s) => s.isTimedMode);
  const newGame = useMineVariantStore((s) => s.newGame);
  const firstClick = useMineVariantStore((s) => s.firstClick);

  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (grid && !isPaused && !isGameOver && !firstClick) {
      intervalRef.current = setInterval(() => {
        const store = useMineVariantStore.getState();
        store.setElapsedTime(store.elapsedTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [grid, isPaused, isGameOver, firstClick]);

  useEffect(() => {
    if (isGameOver) {
      setShowEndDialog(true);
    }
  }, [isGameOver]);

  const handleNewGame = useCallback(() => {
    setShowEndDialog(false);
    newGame(difficulty, variant);
  }, [newGame, difficulty, variant]);

  const handleReview = useCallback(() => {
    setShowEndDialog(false);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setShowEndDialog(false);
    onBack();
  }, [onBack]);

  const variantLabel = variant === 'timed' ? '极限计时' : variant === 'blind' ? '盲扫模式' : '标准';

  if (!grid || !config) return null;

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back-btn" onClick={() => setShowBackConfirm(true)} title="返回">
          ← 返回
        </button>
        <MineCounter variant />
        <FaceButton variant />
        {isTimedMode() ? (
          <div className={`timer ${timeRemaining <= 30 ? 'timer--warning' : ''}`}>
            <span className="timer__display">{formatTime(timeRemaining)}</span>
          </div>
        ) : (
          <div className={`timer ${isPaused ? 'timer--paused' : ''}`}>
            <span className="timer__display">{formatTime(elapsedTime)}</span>
          </div>
        )}
        <button className="game-header-btn" onClick={() => setShowStats(true)} title="统计">📊</button>
        <button className="game-header-btn" onClick={() => setShowAchievements(true)} title="成就">🏆</button>
        <button className="game-header-btn" onClick={() => setShowSettings(true)} title="设置">⚙️</button>
        <button
          className="game-header-btn"
          onClick={() => setShowShortcutHelp((prev) => !prev)}
          title="快捷键帮助"
        >
          ⌨️
        </button>
      </div>
      <div className="mine-game-board">
        <MineGrid variant />
      </div>
      <MineToolbar variant />
      <div className="numpad-actions">
        <FlagToggle variant />
        {clickCount > 0 && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            点击: {clickCount}
          </span>
        )}
      </div>
      <OverlayPanel isOpen={showShortcutHelp} title="⌨️ 快捷键" onClose={() => setShowShortcutHelp(false)}>
        <MineShortcutHelp />
      </OverlayPanel>
      <OverlayPanel isOpen={showStats} title="📊 扫雷统计" onClose={() => setShowStats(false)}>
        <MineStatsPanel />
      </OverlayPanel>
      <OverlayPanel isOpen={showAchievements} title="🏆 成就" onClose={() => setShowAchievements(false)}>
        <AchievementPanel category="minesweeper" />
      </OverlayPanel>
      <OverlayPanel isOpen={showSettings} title="⚙️ 扫雷设置" onClose={() => setShowSettings(false)}>
        <GameSettingsPanel game="minesweeper" />
      </OverlayPanel>
      <GameEndDialog
        isOpen={showEndDialog}
        isWin={isWin}
        elapsedTime={elapsedTime}
        difficulty={`${variantLabel} · ${MINE_DIFFICULTY_LABELS[difficulty]}`}
        clickCount={clickCount}
        onNewGame={handleNewGame}
        onReview={handleReview}
        onBackToMenu={handleBackToMenu}
      />
      <ConfirmDialog
        isOpen={showBackConfirm}
        title="返回"
        message="当前游戏进度将自动保存，下次可以继续游戏。确定要返回吗？"
        confirmText="确定返回"
        cancelText="继续游戏"
        onConfirm={onBack}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}

function SettingsPage({ onBack }: { onBack: () => void }) {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const mineSettings = useMinesweeperStore((s) => s.settings);
  const updateMineSettings = useMinesweeperStore((s) => s.updateSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'shortcuts'>('general');

  return (
    <div className="settings-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2>设置</h2>
      </div>
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'general' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          通用
        </button>
        <button
          className={`settings-tab ${activeTab === 'shortcuts' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveTab('shortcuts')}
        >
          ⌨️ 快捷键
        </button>
      </div>
      {activeTab === 'general' ? (
        <div className="settings-list">
          <div className="settings-item">
            <span className="settings-item__label">主题</span>
            <div className="settings-item__control">
              <button
                className={`toggle-btn ${settings.theme === 'light' ? 'toggle-btn--active' : ''}`}
                onClick={() => { updateSettings({ theme: 'light' }); updateMineSettings({ theme: 'light' }); }}
              >
                ☀️ 亮色
              </button>
              <button
                className={`toggle-btn ${settings.theme === 'dark' ? 'toggle-btn--active' : ''}`}
                onClick={() => { updateSettings({ theme: 'dark' }); updateMineSettings({ theme: 'dark' }); }}
              >
                🌙 暗色
              </button>
            </div>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">数独 · 音效</span>
            <button
              className={`switch ${settings.soundEnabled ? 'switch--on' : ''}`}
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">数独 · 高亮错误</span>
            <button
              className={`switch ${settings.highlightErrors ? 'switch--on' : ''}`}
              onClick={() => updateSettings({ highlightErrors: !settings.highlightErrors })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">数独 · 高亮相同数字</span>
            <button
              className={`switch ${settings.highlightSameNumbers ? 'switch--on' : ''}`}
              onClick={() => updateSettings({ highlightSameNumbers: !settings.highlightSameNumbers })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">数独 · 自动清除笔记</span>
            <button
              className={`switch ${settings.autoRemoveNotes ? 'switch--on' : ''}`}
              onClick={() => updateSettings({ autoRemoveNotes: !settings.autoRemoveNotes })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">数独 · 显示计时器</span>
            <button
              className={`switch ${settings.showTimer ? 'switch--on' : ''}`}
              onClick={() => updateSettings({ showTimer: !settings.showTimer })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">扫雷 · 音效</span>
            <button
              className={`switch ${mineSettings.soundEnabled ? 'switch--on' : ''}`}
              onClick={() => updateMineSettings({ soundEnabled: !mineSettings.soundEnabled })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">扫雷 · 显示计时器</span>
            <button
              className={`switch ${mineSettings.showTimer ? 'switch--on' : ''}`}
              onClick={() => updateMineSettings({ showTimer: !mineSettings.showTimer })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <span className="settings-item__label">扫雷 · 问号标记</span>
            <button
              className={`switch ${mineSettings.questionMarkEnabled ? 'switch--on' : ''}`}
              onClick={() => updateMineSettings({ questionMarkEnabled: !mineSettings.questionMarkEnabled })}
            >
              <span className="switch__thumb" />
            </button>
          </div>
        </div>
      ) : (
        <ShortcutCustomizer />
      )}
    </div>
  );
}

function StatsPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'sudoku' | 'minesweeper'>('sudoku');

  return (
    <div className="stats-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2>📊 游戏统计</h2>
      </div>
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'sudoku' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveTab('sudoku')}
        >
          数独
        </button>
        <button
          className={`settings-tab ${activeTab === 'minesweeper' ? 'settings-tab--active' : ''}`}
          onClick={() => setActiveTab('minesweeper')}
        >
          扫雷
        </button>
      </div>
      {activeTab === 'sudoku' ? <SudokuStatsPanel /> : <MineStatsPanel />}
    </div>
  );
}

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showShortcutPanel, setShowShortcutPanel] = useState(false);
  const [mineVariantPreselect, setMineVariantPreselect] = useState<Exclude<MineVariant, 'standard'>>('timed');
  const settings = useGameStore((s) => s.settings);
  const newGame = useGameStore((s) => s.newGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const mineNewGame = useMinesweeperStore((s) => s.newGame);
  const mineResetGame = useMinesweeperStore((s) => s.resetGame);
  const mineResumeGame = useMinesweeperStore((s) => s.resumeGame);
  const sudokuVariantNewGame = useSudokuVariantStore((s) => s.newGame);
  const sudokuVariantResetGame = useSudokuVariantStore((s) => s.resetGame);
  const mineVariantNewGame = useMineVariantStore((s) => s.newGame);
  const mineVariantResetGame = useMineVariantStore((s) => s.resetGame);

  const toastRef = useRef((message: string) => showToast(message));

  useKeyboardShortcuts({
    onShowShortcuts: () => setShowShortcutPanel((prev) => !prev),
    onToast: toastRef.current,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleSudokuStart = useCallback((difficulty: Difficulty) => {
    newGame(difficulty);
    navigateTo('sudoku-game');
  }, [newGame, navigateTo]);

  const handleSudokuResume = useCallback(() => {
    if (resumeGame()) {
      navigateTo('sudoku-game');
    }
  }, [resumeGame, navigateTo]);

  const handleMinesweeperStart = useCallback((difficulty: MineDifficulty) => {
    mineNewGame(difficulty);
    navigateTo('minesweeper-game');
  }, [mineNewGame, navigateTo]);

  const handleMinesweeperResume = useCallback(() => {
    if (mineResumeGame()) {
      navigateTo('minesweeper-game');
    }
  }, [mineResumeGame, navigateTo]);

  const handleSudokuBack = useCallback(() => {
    resetGame();
    navigateTo('sudoku-start');
  }, [resetGame, navigateTo]);

  const handleMinesweeperBack = useCallback(() => {
    mineResetGame();
    navigateTo('minesweeper-start');
  }, [mineResetGame, navigateTo]);

  const handleHomeBack = useCallback(() => {
    navigateTo('home');
  }, [navigateTo]);

  const handleDailySudokuStart = useCallback(() => {
    const puzzle = useDailyChallengeStore.getState().getDailySudokuPuzzle();
    newGame(puzzle.difficulty);
    navigateTo('sudoku-game');
  }, [newGame, navigateTo]);

  const handleDailyMineStart = useCallback(() => {
    const { difficulty } = useDailyChallengeStore.getState().getDailyMineConfig();
    mineNewGame(difficulty);
    navigateTo('minesweeper-game');
  }, [mineNewGame, navigateTo]);

  const handleSudokuVariantStart = useCallback((variant: SudokuVariant, difficulty?: Difficulty) => {
    sudokuVariantNewGame(variant, difficulty);
    navigateTo('sudoku-variant-game');
  }, [sudokuVariantNewGame, navigateTo]);

  const handleSudokuVariantBack = useCallback(() => {
    sudokuVariantResetGame();
    navigateTo('sudoku-variant');
  }, [sudokuVariantResetGame, navigateTo]);

  const handleMineVariantStart = useCallback((variant: MineVariant, difficulty: MineDifficulty) => {
    mineVariantNewGame(difficulty, variant);
    navigateTo('mine-variant-game');
  }, [mineVariantNewGame, navigateTo]);

  const handleMineVariantBack = useCallback(() => {
    mineVariantResetGame();
    navigateTo('mine-variant');
  }, [mineVariantResetGame, navigateTo]);

  return (
    <div className="app">
      <main className="app-main">
        {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentPage === 'sudoku-start' && <SudokuStartPage onStartGame={handleSudokuStart} onResumeGame={handleSudokuResume} onBack={handleHomeBack} onStartVariant={handleSudokuVariantStart} />}
        {currentPage === 'sudoku-game' && <SudokuGamePage onBack={handleSudokuBack} />}
        {currentPage === 'minesweeper-start' && <MinesweeperStartPage onStartGame={handleMinesweeperStart} onResumeGame={handleMinesweeperResume} onBack={handleHomeBack} onNavigateToVariant={(v) => { setMineVariantPreselect(v); navigateTo('mine-variant'); }} />}
        {currentPage === 'minesweeper-game' && <MinesweeperGamePage onBack={handleMinesweeperBack} />}
        {currentPage === 'settings' && <SettingsPage onBack={handleHomeBack} />}
        {currentPage === 'stats' && <StatsPage onBack={handleHomeBack} />}
        {currentPage === 'achievements' && <AchievementsPage onBack={handleHomeBack} />}
        {currentPage === 'daily-challenge' && <DailyChallengePage onBack={handleHomeBack} onStartDailySudoku={handleDailySudokuStart} onStartDailyMine={handleDailyMineStart} />}
        {currentPage === 'sudoku-variant' && <SudokuVariantPage onBack={() => navigateTo('sudoku-start')} onStartVariant={handleSudokuVariantStart} />}
        {currentPage === 'sudoku-variant-game' && <SudokuVariantGamePage onBack={handleSudokuVariantBack} />}
        {currentPage === 'mine-variant' && <MineVariantPage onBack={() => navigateTo('minesweeper-start')} onStartVariant={handleMineVariantStart} initialVariant={mineVariantPreselect} />}
        {currentPage === 'mine-variant-game' && <MineVariantGamePage onBack={handleMineVariantBack} />}
      </main>
      <ShortcutHelpPanel isOpen={showShortcutPanel} onClose={() => setShowShortcutPanel(false)} />
      <AchievementUnlockNotification />
      <ToastContainer />
    </div>
  );
}
