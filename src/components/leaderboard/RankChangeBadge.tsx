import { ArrowDown, ArrowUp } from 'lucide-react';

type RankChangeBadgeProps = {
  rankChange: number | null;
};

export function RankChangeBadge({ rankChange }: RankChangeBadgeProps) {
  if (rankChange === null) {
    return (
      <span className="inline-flex items-center rounded bg-blue-500/15 px-1.5 py-0.5 font-display text-[9px] font-bold leading-none text-blue-400">
        NEW
      </span>
    );
  }

  if (rankChange === 0) {
    return (
      <span className="inline-flex items-center font-display text-[10px] font-bold leading-none text-muted-foreground/70">
        0
      </span>
    );
  }

  if (rankChange > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-display text-[10px] font-bold leading-none text-green-400">
        <ArrowUp className="h-3 w-3" />
        {rankChange}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 font-display text-[10px] font-bold leading-none text-red-400">
      <ArrowDown className="h-3 w-3" />
      {Math.abs(rankChange)}
    </span>
  );
}
