"use client";

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useSettings } from '@/hooks/useSettings';
import { Match } from '@/types';
import { MatchCard } from './match-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInTimeZone } from 'date-fns-tz';

function PredictionsPageContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'open' ? 'open' : 'all';
  const [filter, setFilter] = useState<'all' | 'open' | 'finished'>(initialFilter);
  const { data: matches, isLoading: isMatchesLoading } = useMatches();
  const { data: predictions, isLoading: isPredictionsLoading } = usePredictions();
  const { data: settings } = useSettings();
  const lockInMinutes = settings?.lockInMinutes ? parseInt(settings.lockInMinutes, 10) : 15;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const getPrediction = (matchId: string) => predictions?.find(p => p.matchId === matchId);

  const filteredMatches = useMemo(() => {
    if (!matches || !mounted) return [];
    return matches.filter(match => {
      if (filter === 'all') return true;
      if (filter === 'finished') return match.status === 'finished';
      if (filter === 'open') {
        const isLocked = new Date(match.kickoffTime).getTime() - lockInMinutes * 60 * 1000 <= Date.now();
        return match.status !== 'finished' && !isLocked;
      }
      return true;
    });
  }, [matches, filter, lockInMinutes]);

  const groupedMatches = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    for (const match of filteredMatches) {
      // Group by "Group A - 15 Jun 2026"
      try {
        const tz = 'Asia/Jakarta';
        const dateStr = formatInTimeZone(new Date(match.kickoffTime), tz, 'dd MMM yyyy');
        const groupKey = `${match.group} — ${dateStr}`;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(match);
      } catch {
        // Fallback if formatInTimeZone fails for any reason
        const groupKey = match.group;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(match);
      }
    }
    return groups;
  }, [filteredMatches]);

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      {/* Hero Title & Filters */}
      <section className="pt-4 md:pt-8 pb-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase mb-6 leading-none shadow-sm text-foreground">
          PREDIKSI
        </h1>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button 
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${filter === 'all' ? 'bg-card text-primary border border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-muted-foreground hover:text-foreground border border-transparent'}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setFilter('open')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${filter === 'open' ? 'bg-card text-primary border border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-muted-foreground hover:text-foreground border border-transparent'}`}
          >
            Terbuka
          </button>
          <button 
            onClick={() => setFilter('finished')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${filter === 'finished' ? 'bg-card text-primary border border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-muted-foreground hover:text-foreground border border-transparent'}`}
          >
            Selesai
          </button>
        </div>
      </section>

      {/* Match Feed */}
      <section className="flex flex-col gap-5">
        {(isMatchesLoading || isPredictionsLoading || !mounted) ? (
          <>
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center py-10 text-muted-foreground font-display font-bold uppercase tracking-widest">
            Tidak ada pertandingan.
          </div>
        ) : (
          Object.entries(groupedMatches).map(([groupKey, groupMatches]) => (
            <React.Fragment key={groupKey}>
              {/* Sticky Group Header */}
              <div className="sticky top-[64px] md:top-[80px] z-40 bg-background/90 backdrop-blur-xl py-3 -mx-4 px-4 md:-mx-8 md:px-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                <h2 className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase font-sans">{groupKey}</h2>
              </div>

              {groupMatches.map((match) => (
                <MatchCard key={match.id} match={match} prediction={getPrediction(match.id)} />
              ))}
            </React.Fragment>
          ))
        )}
      </section>
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense fallback={null}>
      <PredictionsPageContent />
    </Suspense>
  );
}
