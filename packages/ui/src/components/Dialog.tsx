import type { ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = '确定',
  cancelText = '取消',
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <h2 className="dialog__title">{title}</h2>
          <button className="dialog__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="dialog__body">{children}</div>
        {onConfirm && (
          <div className="dialog__footer">
            <button className="dialog__btn dialog__btn--cancel" onClick={onClose}>
              {cancelText}
            </button>
            <button className="dialog__btn dialog__btn--confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface WinDialogProps {
  isOpen: boolean;
  elapsedTime: number;
  difficulty: string;
  mistakes: number;
  hintsUsed: number;
  onNewGame: () => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function WinDialog({
  isOpen,
  elapsedTime,
  difficulty,
  mistakes,
  hintsUsed,
  onNewGame,
  onClose,
}: WinDialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} title="🎉 恭喜完成！" onClose={onClose}>
      <div className="win-dialog">
        <div className="win-dialog__stat">
          <span className="win-dialog__label">难度</span>
          <span className="win-dialog__value">{difficulty}</span>
        </div>
        <div className="win-dialog__stat">
          <span className="win-dialog__label">用时</span>
          <span className="win-dialog__value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="win-dialog__stat">
          <span className="win-dialog__label">错误</span>
          <span className="win-dialog__value">{mistakes}</span>
        </div>
        <div className="win-dialog__stat">
          <span className="win-dialog__label">提示</span>
          <span className="win-dialog__value">{hintsUsed}</span>
        </div>
        <button className="win-dialog__new-game" onClick={onNewGame}>
          开始新游戏
        </button>
      </div>
    </Dialog>
  );
}
