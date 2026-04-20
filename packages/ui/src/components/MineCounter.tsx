import { useMinesweeperStore } from '../stores/minesweeperStore';
import { useMineVariantStore } from '../stores/mineVariantStore';

interface MineCounterAdapter {
  config: { mineCount: number } | null;
  flagCount: number;
}

function useStandardMineCounterStore(): MineCounterAdapter {
  return {
    config: useMinesweeperStore((s) => s.config),
    flagCount: useMinesweeperStore((s) => s.flagCount),
  };
}

function useVariantMineCounterStore(): MineCounterAdapter {
  return {
    config: useMineVariantStore((s) => s.config),
    flagCount: useMineVariantStore((s) => s.flagCount),
  };
}

export function MineCounter({ variant = false }: { variant?: boolean }) {
  const store = variant ? useVariantMineCounterStore() : useStandardMineCounterStore();
  const { config, flagCount } = store;

  if (!config) return null;

  const remaining = Math.max(0, config.mineCount - flagCount);

  const display = String(remaining).padStart(3, '0');

  return (
    <div className="mine-counter">
      <span className="mine-counter__icon">💣</span>
      <span className="mine-counter__display">{display}</span>
    </div>
  );
}
