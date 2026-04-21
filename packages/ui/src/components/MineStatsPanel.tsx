import { useMinesweeperStore } from '../stores/minesweeperStore';
import { MINE_DIFFICULTY_LABELS, formatTime } from '@shudu/shared';
import type { MineDifficulty } from '@shudu/minesweeper-core';

export function MineStatsPanel() {
  const statistics = useMinesweeperStore((s) => s.statistics);

  const winRate = statistics.gamesPlayed > 0
    ? Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100)
    : 0;

  const flagAccuracy = statistics.totalFlagsPlaced > 0
    ? Math.round((statistics.totalCorrectFlags / statistics.totalFlagsPlaced) * 100 * 100) / 100
    : 0;

  const avgClicks = statistics.gamesPlayed > 0
    ? Math.round(statistics.totalClicks / statistics.gamesPlayed)
    : 0;

  const recentGames = statistics.gameHistory.slice(-10).reverse();

  const difficultyStats = (['beginner', 'intermediate', 'advanced', 'expert'] as MineDifficulty[]).map((d) => {
    const played = statistics.difficultyDistribution[d];
    const won = statistics.difficultyWins[d];
    return {
      difficulty: d,
      label: MINE_DIFFICULTY_LABELS[d],
      played,
      won,
      winRate: played > 0 ? Math.round((won / played) * 100) : 0,
      bestTime: statistics.bestTimes[d],
      avgTime: statistics.averageTimes[d],
    };
  });

  return (
    <div className="stats-panel">
      <div className="stats-panel__overview">
        <div className="stats-panel__card">
          <span className="stats-panel__card-value">{statistics.gamesPlayed}</span>
          <span className="stats-panel__card-label">总局数</span>
        </div>
        <div className="stats-panel__card">
          <span className="stats-panel__card-value stats-panel__card-value--win">{statistics.gamesWon}</span>
          <span className="stats-panel__card-label">胜利</span>
        </div>
        <div className="stats-panel__card">
          <span className="stats-panel__card-value stats-panel__card-value--lose">{statistics.gamesLost}</span>
          <span className="stats-panel__card-label">失败</span>
        </div>
        <div className="stats-panel__card">
          <span className="stats-panel__card-value">{winRate}%</span>
          <span className="stats-panel__card-label">胜率</span>
        </div>
        <div className="stats-panel__card">
          <span className="stats-panel__card-value">{statistics.currentStreak}</span>
          <span className="stats-panel__card-label">当前连胜</span>
        </div>
        <div className="stats-panel__card">
          <span className="stats-panel__card-value">{statistics.bestStreak}</span>
          <span className="stats-panel__card-label">最佳连胜</span>
        </div>
      </div>

      <div className="stats-panel__section">
        <h3 className="stats-panel__section-title">各难度统计</h3>
        <div className="stats-panel__difficulty-table">
          <div className="stats-panel__table-header">
            <span>难度</span>
            <span>局数</span>
            <span>胜率</span>
            <span>最佳</span>
            <span>平均</span>
          </div>
          {difficultyStats.map((ds) => (
            <div key={ds.difficulty} className="stats-panel__table-row">
              <span className="stats-panel__table-difficulty">{ds.label}</span>
              <span>{ds.played}</span>
              <span>{ds.winRate}%</span>
              <span>{formatTime(ds.bestTime!, true)}</span>
              <span>{formatTime(ds.avgTime, true)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-panel__section">
        <h3 className="stats-panel__section-title">高级数据</h3>
        <div className="stats-panel__advanced">
          <div className="stats-panel__advanced-item">
            <span className="stats-panel__advanced-label">总点击次数</span>
            <span className="stats-panel__advanced-value">{statistics.totalClicks}</span>
          </div>
          <div className="stats-panel__advanced-item">
            <span className="stats-panel__advanced-label">平均每局点击</span>
            <span className="stats-panel__advanced-value">{avgClicks}</span>
          </div>
          <div className="stats-panel__advanced-item">
            <span className="stats-panel__advanced-label">总揭开格数</span>
            <span className="stats-panel__advanced-value">{statistics.totalCellsRevealed}</span>
          </div>
          <div className="stats-panel__advanced-item">
            <span className="stats-panel__advanced-label">标旗准确率</span>
            <span className="stats-panel__advanced-value">{flagAccuracy}%</span>
          </div>
        </div>
      </div>

      {recentGames.length > 0 && (
        <div className="stats-panel__section">
          <h3 className="stats-panel__section-title">最近游戏</h3>
          <div className="stats-panel__history">
            {recentGames.map((game, i) => (
              <div key={i} className={`stats-panel__history-item ${game.won ? 'stats-panel__history-item--win' : 'stats-panel__history-item--lose'}`}>
                <span className="stats-panel__history-result">{game.won ? '✅' : '❌'}</span>
                <span className="stats-panel__history-difficulty">{MINE_DIFFICULTY_LABELS[game.difficulty]}</span>
                <span className="stats-panel__history-time">{formatTime(game.time)}</span>
                <span className="stats-panel__history-clicks">{game.clicks}次</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
