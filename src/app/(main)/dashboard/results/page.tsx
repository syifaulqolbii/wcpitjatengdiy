"use client";

import React, { useMemo } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { Skeleton } from '@/components/ui/skeleton';
import { Flag } from '@/components/shared/Flag';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import Link from 'next/link';

export default function ResultsPage() {
  const { data: matches, isLoading: isMatchesLoading } = useMatches('finished');
  const { data: predictions, isLoading: isPredictionsLoading } = usePredictions();

  const getPrediction = (matchId: string) => predictions?.find(p => p.matchId === matchId);

  const groupedMatches = useMemo(() => {
    if (!matches) return {};
    const groups: Record<string, typeof matches> = {};
    const sorted = [...matches].sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime());
    for (const match of sorted) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateStr = formatInTimeZone(new Date(match.kickoffTime), tz, 'dd MMM yyyy');
        const groupKey = `${match.group} — ${dateStr}`;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(match);
      } catch {
        const groupKey = match.group;
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(match);
      }
    }
    return groups;
  }, [matches]);

  const totalPoints = useMemo(() => {
    if (!matches || !predictions) return 0;
    return matches.reduce((sum, match) => {
      const pred = getPrediction(match.id);
      return sum + (pred?.points ?? 0);
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, predictions]);

  const isLoading = isMatchesLoading || isPredictionsLoading;

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      <section className="pt-4 md:pt-8 pb-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase mb-2 leading-none text-foreground">
          HASIL AKHIR
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Semua pertandingan yang sudah selesai dan poin prediksimu.
        </p>

        {!isLoading && matches && matches.length > 0 && (
          <div className="mt-4 flex gap-4">
            <div className="bg-card border border-border/50 rounded-lg px-4 py-3">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Poin</div>
              <div className="text-2xl font-display font-black text-primary">{totalPoints}</div>
            </div>
            <div className="bg-card border border-border/50 rounded-lg px-4 py-3">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Pertandingan</div>
              <div className="text-2xl font-display font-black text-foreground">{matches.length}</div>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-5">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        ) : !matches || matches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-display font-bold uppercase tracking-widest">
            Belum ada pertandingan yang selesai.
          </div>
        ) : (
          Object.entries(groupedMatches).map(([groupKey, groupMatches]) => (
            <React.Fragment key={groupKey}>
              <div className="sticky top-[64px] md:top-[80px] z-40 bg-background/90 backdrop-blur-xl py-3 -mx-4 px-4 md:-mx-8 md:px-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                <h2 className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase font-sans">{groupKey}</h2>
              </div>

              {groupMatches!.map((match) => {
                const prediction = getPrediction(match.id);
                const points = prediction?.points ?? 0;
                const isWin = points > 0;
                const hasPrediction = !!prediction;

                return (
                  <div key={match.id} className="bg-card rounded-xl flex flex-col relative overflow-hidden border border-border/50">
                    <div className={`absolute top-0 left-0 w-1.5 h-full z-20 ${isWin ? 'bg-primary' : 'bg-destructive'}`}></div>
                    {isWin && <div className="absolute -right-6 -bottom-6 text-[120px] font-display font-black text-primary/5 pointer-events-none select-none leading-none z-0">WIN</div>}

                    <div className="p-5 flex flex-col z-10">
                      <div className="flex justify-between items-center mb-5">
                        <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em]">Selesai</div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-sm backdrop-blur-sm ${isWin ? 'bg-secondary/50 text-primary border-border/50' : 'bg-secondary/50 text-destructive border-border/50'}`}>
                          {isWin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {points} PTS
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:gap-4 mb-4">
                        <div className="flex items-center gap-2 md:gap-4 min-w-0">
                          <Flag flag={match.flagA} size="md" className="w-7 shrink-0 opacity-80 md:w-12" />
                          <span className="min-w-0 max-w-full font-display text-xs md:text-xl font-bold text-muted-foreground uppercase leading-tight break-words">{match.teamA}</span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-5 px-3 md:px-6 py-2 bg-secondary/50 rounded-lg shadow-inner border border-border/30">
                          <div className={`text-2xl md:text-3xl font-display font-black ${isWin ? 'text-muted-foreground' : 'text-foreground'}`}>{match.scoreA}</div>
                          <span className="text-border font-bold text-sm">—</span>
                          <div className={`text-2xl md:text-3xl font-display font-black ${isWin ? 'text-primary' : 'text-foreground'}`}>{match.scoreB}</div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 justify-end min-w-0 text-right">
                          <span className={`min-w-0 max-w-full font-display text-xs md:text-xl font-bold uppercase leading-tight break-words ${isWin ? 'text-primary drop-shadow-[0_0_10px_rgba(0,230,118,0.3)]' : 'text-muted-foreground'}`}>{match.teamB}</span>
                          <Flag flag={match.flagB} size="md" className="w-7 shrink-0 md:w-12" />
                        </div>
                      </div>

                      {hasPrediction ? (
                        <div className="mt-2 pt-3 border-t border-border/50 flex justify-between items-center bg-secondary/30 -mx-5 px-5 -mb-5 pb-5">
                          <span className="text-xs text-muted-foreground font-medium">Prediksimu</span>
                          <span className="text-sm font-display font-bold text-muted-foreground tracking-wider text-right">{match.teamA} {prediction!.predictedA} - {prediction!.predictedB} {match.teamB}</span>
                        </div>
                      ) : (
                        <div className="mt-2 pt-3 border-t border-border/50 flex justify-between items-center bg-secondary/30 -mx-5 px-5 -mb-5 pb-5">
                          <span className="text-xs text-muted-foreground font-medium">Prediksimu</span>
                          <span className="text-sm font-display font-bold text-muted-foreground tracking-wider">Missed</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))
        )}
      </section>
    </div>
  );
}
