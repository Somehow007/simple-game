import { useMinesweeperStore } from '../stores/minesweeperStore';
import { useMineVariantStore } from '../stores/mineVariantStore';

interface FlagToggleAdapter {
  flagMode: boolean;
  toggleFlagMode: () => void;
}

function useStandardFlagStore(): FlagToggleAdapter {
  return {
    flagMode: useMinesweeperStore((s) => s.flagMode),
    toggleFlagMode: useMinesweeperStore((s) => s.toggleFlagMode),
  };
}

function useVariantFlagStore(): FlagToggleAdapter {
  return {
    flagMode: useMineVariantStore((s) => s.flagMode),
    toggleFlagMode: useMineVariantStore((s) => s.toggleFlagMode),
  };
}

export function FlagToggle({ variant = false }: { variant?: boolean }) {
  const store = variant ? useVariantFlagStore() : useStandardFlagStore();
  const { flagMode, toggleFlagMode } = store;

  return (
    <button
      className={`numpad-action-btn ${flagMode ? 'numpad-action-btn--active' : ''}`}
      onClick={toggleFlagMode}
      title={flagMode ? '切换到揭开模式 (N)' : '切换到标旗模式 (N)'}
    >
      {flagMode ? '🚩 标旗' : '👆 揭开'}
    </button>
  );
}
