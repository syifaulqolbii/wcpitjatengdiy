import React from 'react';
import { CalendarX2, Trophy, History } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'schedule' | 'leaderboard' | 'history';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ type, title, description, actionLabel, actionHref }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'schedule':
        return (
          <div className="w-32 h-32 mb-8 relative flex items-center justify-center">
            <CalendarX2 className="w-24 h-24 text-muted-foreground stroke-[1]" />
            <div className="absolute w-4 h-4 rounded-full bg-primary blur-[8px] animate-pulse"></div>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="w-32 h-32 mb-8 relative flex items-center justify-center">
            <Trophy className="w-24 h-24 text-muted-foreground stroke-[1]" />
            <div className="absolute bottom-2 w-8 h-2 rounded bg-primary blur-[4px]"></div>
          </div>
        );
      case 'history':
        return (
          <div className="w-32 h-32 mb-8 relative flex items-center justify-center">
            <History className="w-24 h-24 text-muted-foreground stroke-[1]" />
            <div className="absolute w-12 h-1 bg-primary blur-[2px] transform rotate-45 translate-x-2 -translate-y-2"></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 relative min-h-[50vh] w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,118,0.15)_0%,transparent_70%)] opacity-40 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        {getIcon()}
        <h2 className="font-display text-3xl font-bold tracking-tight mb-4 text-foreground uppercase">{title}</h2>
        <p className="font-sans text-base text-muted-foreground max-w-xs mb-8">{description}</p>
        
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <button className="bg-primary text-background font-bold py-4 px-8 rounded font-sans text-lg hover:shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all uppercase tracking-widest">
              {actionLabel}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
