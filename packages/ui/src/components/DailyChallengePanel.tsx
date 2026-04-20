import { useDailyChallengeStore } from '../stores/dailyChallengeStore';
import { formatTime } from '@shudu/shared';
import { DIFFICULTY_LABELS, MINE_DIFFICULTY_LABELS } from '@shudu/shared';

export function DailyChallengePanel({
  onStartSudoku,
  onStartMine,
}: {
  onStartSudoku: () => void;
  onStartMine: () => void;
}) {
  const today = useDailyChallengeStore((s) => s.today);
  const isSudokuCompleted = useDailyChallengeStore((s) => s.isSudokuCompleted());
  const isMineCompleted = useDailyChallengeStore((s) => s.isMineCompleted());
  const getSudokuResult = useDailyChallengeStore((s) => s.getSudokuResult());
  const getMineResult = useDailyChallengeStore((s) => s.getMineResult());
  const getStreak = useDailyChallengeStore((s) => s.getStreak);
  const getDailySudokuPuzzle = useDailyChallengeStore((s) => s.getDailySudokuPuzzle());
  const getDailyMineConfig = useDailyChallengeStore((s) => s.getDailyMineConfig());

  const sudokuStreak = getStreak('sudoku');
  const mineStreak = getStreak('minesweeper');

  const sudokuDifficulty = getDailySudokuPuzzle.difficulty;
  const mineDifficulty = getDailyMineConfig.difficulty;

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const dayOfWeek = new Date(today).getDay();

  return (
    <div className="daily-challenge-panel">
      <div className="daily-challenge-panel__header">
        <span className="daily-challenge-panel__date">
          📅 {today} 星期{dayNames[dayOfWeek]}
        </span>
      </div>

      <div className="daily-challenge-panel__cards">
        <div className={`daily-challenge-card ${isSudokuCompleted ? 'daily-challenge-card--completed' : ''}`}>
          <div className="daily-challenge-card__header">
            <span className="daily-challenge-card__icon">🎮</span>
            <span className="daily-challenge-card__title">数独每日挑战</span>
          </div>
          <div className="daily-challenge-card__info">
            <span className="daily-challenge-card__difficulty">
              难度: {DIFFICULTY_LABELS[sudokuDifficulty]}
            </span>
            {sudokuStreak > 0 && (
              <span className="daily-challenge-card__streak">
                🔥 连续 {sudokuStreak} 天
              </span>
            )}
          </div>
          {isSudokuCompleted && getSudokuResult ? (
            <div className="daily-challenge-card__result">
              <span className="daily-challenge-card__completed">✅ 已完成</span>
              <span className="daily-challenge-card__time">
                用时: {formatTime(getSudokuResult.elapsedTime)}
              </span>
            </div>
          ) : (
            <button className="daily-challenge-card__btn" onClick={onStartSudoku}>
              开始挑战
            </button>
          )}
        </div>

        <div className={`daily-challenge-card ${isMineCompleted ? 'daily-challenge-card--completed' : ''}`}>
          <div className="daily-challenge-card__header">
            <span className="daily-challenge-card__icon">💣</span>
            <span className="daily-challenge-card__title">扫雷每日挑战</span>
          </div>
          <div className="daily-challenge-card__info">
            <span className="daily-challenge-card__difficulty">
              难度: {MINE_DIFFICULTY_LABELS[mineDifficulty]}
            </span>
            {mineStreak > 0 && (
              <span className="daily-challenge-card__streak">
                🔥 连续 {mineStreak} 天
              </span>
            )}
          </div>
          {isMineCompleted && getMineResult ? (
            <div className="daily-challenge-card__result">
              <span className="daily-challenge-card__completed">✅ 已完成</span>
              <span className="daily-challenge-card__time">
                用时: {formatTime(getMineResult.elapsedTime)}
              </span>
            </div>
          ) : (
            <button className="daily-challenge-card__btn" onClick={onStartMine}>
              开始挑战
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
