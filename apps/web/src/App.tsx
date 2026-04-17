import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@shudu/ui';
import { Grid } from '@shudu/ui';
import { Numpad } from '@shudu/ui';
import { Timer } from '@shudu/ui';
import { Toolbar } from '@shudu/ui';
import { WinDialog } from '@shudu/ui';
import { DIFFICULTY_LABELS, DIFFICULTY_GIVEN_COUNT } from '@shudu/shared';
import type { Difficulty } from '@shudu/core';

type Page = 'start' | 'game' | 'settings' | 'stats';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#22c55e',
  medium: '#3b82f6',
  hard: '#f59e0b',
  expert: '#ef4444',
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: '基础排除法 · 5-15分钟',
  medium: '隐性唯一法 · 15-30分钟',
  hard: '高级技巧 · 30-60分钟',
  expert: '多种技巧组合 · 60分钟+',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function StartPage({ onStartGame }: { onStartGame: (difficulty: Difficulty) => void }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const showTimer = useGameStore((s) => s.settings.showTimer);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      onStartGame(selectedDifficulty);
    }, 400);
  }, [onStartGame, selectedDifficulty]);

  return (
    <div className={`start-page ${isTransitioning ? 'start-page--leaving' : ''}`}>
      <div className="start-page__content">
        <div className="start-page__logo">
          <div className="start-page__grid-icon">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <span key={n} className="start-page__grid-cell">{n}</span>
            ))}
          </div>
          <h1 className="start-page__title">数独</h1>
          <p className="start-page__subtitle">锻炼你的逻辑思维</p>
        </div>

        <div className="start-page__section">
          <h3 className="start-page__section-title">选择难度</h3>
          <div className="start-page__difficulty-list">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={`start-page__difficulty-card ${selectedDifficulty === d ? 'start-page__difficulty-card--selected' : ''}`}
                onClick={() => setSelectedDifficulty(d)}
                style={{
                  '--difficulty-color': DIFFICULTY_COLORS[d],
                } as React.CSSProperties}
              >
                <span className="start-page__difficulty-name">{DIFFICULTY_LABELS[d]}</span>
                <span className="start-page__difficulty-desc">{DIFFICULTY_DESCRIPTIONS[d]}</span>
                <span className="start-page__difficulty-given">
                  {DIFFICULTY_GIVEN_COUNT[d][0]}-{DIFFICULTY_GIVEN_COUNT[d][1]} 个提示数
                </span>
                {selectedDifficulty === d && (
                  <span className="start-page__difficulty-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="start-page__section">
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

        <button className="start-page__start-btn" onClick={handleStart}>
          开始游戏
        </button>
      </div>
    </div>
  );
}

function GamePage() {
  const grid = useGameStore((s) => s.grid);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const difficulty = useGameStore((s) => s.difficulty);
  const mistakes = useGameStore((s) => s.mistakes);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const newGame = useGameStore((s) => s.newGame);
  const isPaused = useGameStore((s) => s.isPaused);

  const [showWinDialog, setShowWinDialog] = useState(false);

  useEffect(() => {
    if (isCompleted) {
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
        <Timer />
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
    </div>
  );
}

function SettingsPage({ onBack }: { onBack: () => void }) {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <div className="settings-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2>设置</h2>
      </div>
      <div className="settings-list">
        <div className="settings-item">
          <span className="settings-item__label">主题</span>
          <div className="settings-item__control">
            <button
              className={`toggle-btn ${settings.theme === 'light' ? 'toggle-btn--active' : ''}`}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              ☀️ 亮色
            </button>
            <button
              className={`toggle-btn ${settings.theme === 'dark' ? 'toggle-btn--active' : ''}`}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              🌙 暗色
            </button>
          </div>
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
    </div>
  );
}

function StatsPage({ onBack }: { onBack: () => void }) {
  const statistics = useGameStore((s) => s.statistics);

  return (
    <div className="stats-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2>统计</h2>
      </div>
      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-card__value">{statistics.gamesPlayed}</span>
          <span className="stats-card__label">已玩局数</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">{statistics.gamesWon}</span>
          <span className="stats-card__label">胜利局数</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">
            {statistics.gamesPlayed > 0
              ? Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100)
              : 0}%
          </span>
          <span className="stats-card__label">胜率</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">{statistics.currentStreak}</span>
          <span className="stats-card__label">当前连胜</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">{statistics.bestStreak}</span>
          <span className="stats-card__label">最佳连胜</span>
        </div>
      </div>
      <div className="stats-best-times">
        <h3>最佳时间</h3>
        {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
          <div key={d} className="stats-best-time-item">
            <span className="stats-best-time-item__difficulty">{DIFFICULTY_LABELS[d]}</span>
            <span className="stats-best-time-item__time">
              {statistics.bestTimes[d] !== null ? formatTime(statistics.bestTimes[d]!) : '--:--'}
            </span>
          </div>
        ))}
      </div>
      <div className="stats-distribution">
        <h3>难度分布</h3>
        {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
          <div key={d} className="stats-distribution-item">
            <span className="stats-distribution-item__label">{DIFFICULTY_LABELS[d]}</span>
            <div className="stats-distribution-item__bar-container">
              <div
                className="stats-distribution-item__bar"
                style={{
                  width: `${statistics.gamesPlayed > 0 ? (statistics.difficultyDistribution[d] / statistics.gamesPlayed) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="stats-distribution-item__count">{statistics.difficultyDistribution[d]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('start');
  const settings = useGameStore((s) => s.settings);
  const newGame = useGameStore((s) => s.newGame);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleStartGame = useCallback((difficulty: Difficulty) => {
    newGame(difficulty);
    setCurrentPage('game');
  }, [newGame]);

  return (
    <div className="app">
      {currentPage !== 'start' && (
        <nav className="app-nav">
          <button
            className={`nav-btn ${currentPage === 'game' ? 'nav-btn--active' : ''}`}
            onClick={() => setCurrentPage('game')}
          >
            🎮 游戏
          </button>
          <button
            className={`nav-btn ${currentPage === 'stats' ? 'nav-btn--active' : ''}`}
            onClick={() => setCurrentPage('stats')}
          >
            📊 统计
          </button>
          <button
            className={`nav-btn ${currentPage === 'settings' ? 'nav-btn--active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            ⚙️ 设置
          </button>
        </nav>
      )}
      <main className="app-main">
        {currentPage === 'start' && <StartPage onStartGame={handleStartGame} />}
        {currentPage === 'game' && <GamePage />}
        {currentPage === 'settings' && <SettingsPage onBack={() => setCurrentPage('game')} />}
        {currentPage === 'stats' && <StatsPage onBack={() => setCurrentPage('game')} />}
      </main>
    </div>
  );
}
