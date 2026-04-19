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
} from '@shudu/ui';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_GIVEN_COUNT,
  MINE_DIFFICULTY_LABELS,
  MINE_DIFFICULTY_INFO,
  formatTime,
} from '@shudu/shared';
import type { Difficulty } from '@shudu/core';
import type { MineDifficulty } from '@shudu/minesweeper-core';

type Page =
  | 'home'
  | 'sudoku-start'
  | 'sudoku-game'
  | 'minesweeper-start'
  | 'minesweeper-game'
  | 'settings'
  | 'stats';

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

function SudokuStartPage({ onStartGame, onResumeGame, onBack }: { onStartGame: (difficulty: Difficulty) => void; onResumeGame: () => void; onBack: () => void }) {
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

function MinesweeperStartPage({ onStartGame, onResumeGame, onBack }: { onStartGame: (difficulty: MineDifficulty) => void; onResumeGame: () => void; onBack: () => void }) {
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

  const [showWinDialog, setShowWinDialog] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { play } = useSoundEffects();

  useEffect(() => {
    if (!grid && hasSavedGame()) {
      resumeGame();
    }
  }, []);

  useEffect(() => {
    if (isCompleted) {
      play('complete', 'sudoku');
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

  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  const settings = useGameStore((s) => s.settings);
  const newGame = useGameStore((s) => s.newGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const mineNewGame = useMinesweeperStore((s) => s.newGame);
  const mineResetGame = useMinesweeperStore((s) => s.resetGame);
  const mineResumeGame = useMinesweeperStore((s) => s.resumeGame);

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

  return (
    <div className="app">
      <main className="app-main">
        {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentPage === 'sudoku-start' && <SudokuStartPage onStartGame={handleSudokuStart} onResumeGame={handleSudokuResume} onBack={handleHomeBack} />}
        {currentPage === 'sudoku-game' && <SudokuGamePage onBack={handleSudokuBack} />}
        {currentPage === 'minesweeper-start' && <MinesweeperStartPage onStartGame={handleMinesweeperStart} onResumeGame={handleMinesweeperResume} onBack={handleHomeBack} />}
        {currentPage === 'minesweeper-game' && <MinesweeperGamePage onBack={handleMinesweeperBack} />}
        {currentPage === 'settings' && <SettingsPage onBack={handleHomeBack} />}
        {currentPage === 'stats' && <StatsPage onBack={handleHomeBack} />}
      </main>
      <ShortcutHelpPanel isOpen={showShortcutPanel} onClose={() => setShowShortcutPanel(false)} />
      <ToastContainer />
    </div>
  );
}
