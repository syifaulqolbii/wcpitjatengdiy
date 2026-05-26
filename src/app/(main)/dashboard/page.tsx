"use client";

import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useMyGroup } from '@/hooks/useMyGroup';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { Flag } from '@/components/shared/Flag';
import { useTournamentPrediction } from '@/hooks/useTournamentPrediction';
import { useSettings } from '@/hooks/useSettings';
import { ChampionPickModal } from '@/components/predictions/ChampionPickModal';
import { Trophy, Clock, AlertCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const { data: myGroup } = useMyGroup();
  const groupId = myGroup?.groupId ?? undefined;
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard(groupId, !!groupId);
  const { data: liveMatches, isLoading: isLiveLoading } = useMatches('live');
  const { data: upcomingMatches, isLoading: isUpcomingLoading } = useMatches('upcoming');
  const { data: finishedMatches, isLoading: isFinishedLoading } = useMatches('finished');
  const { data: predictions, isLoading: isPredictionsLoading } = usePredictions();
  const { data: championData, isLoading: isChampionLoading } = useTournamentPrediction();
  const { data: settings } = useSettings();
  const lockInMinutes = settings?.lockInMinutes ? parseInt(settings.lockInMinutes, 10) : 15;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const userStats = leaderboard?.find((entry) => entry.userId === userId);

  const liveMatch = liveMatches && liveMatches.length > 0 ? liveMatches[0] : null;
  const nextMatch = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  const heroMatch = liveMatch || nextMatch;
  const isLive = !!liveMatch;

  const recentResults = finishedMatches
    ? [...finishedMatches]
        .sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime())
        .slice(0, 3)
    : [];

  const getPrediction = (matchId: string) => predictions?.find((p) => p.matchId === matchId);

  const getCountdownLabel = (kickoffTime: Date | string) => {
    const diff = new Date(kickoffTime).getTime() - Date.now();
    if (diff <= 0) return 'Kickoff sudah dimulai';

    const minutes = Math.floor(diff / 60000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;

    if (days > 0) return `${days} hari ${hours} jam lagi`;
    if (hours > 0) return `${hours} jam ${remainingMinutes} menit lagi`;
    return `${Math.max(remainingMinutes, 1)} menit lagi`;
  };

  return (
    <div className="space-y-8 relative z-10">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 flex-col justify-center px-4 py-2 hidden md:flex">
          {isSessionLoading ? (
            <Skeleton className="h-10 w-48 mb-2 bg-muted/50" />
          ) : (
            <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Halo, {session?.user?.name?.split(' ')[0] || 'User'}</h1>
          )}
          <p className="text-muted-foreground text-sm mt-1">Ready for today&apos;s matches?</p>
        </div>

        <div className="col-span-1 md:col-span-3">
          <div className="md:hidden px-4 py-2 mb-4">
            {isSessionLoading ? (
              <Skeleton className="h-8 w-40 mb-2 bg-muted/50" />
            ) : (
              <h1 className="font-display text-2xl font-black tracking-tight text-foreground">Halo, {session?.user?.name?.split(' ')[0] || 'User'}</h1>
            )}
          </div>

          {!isChampionLoading && championData && (
            <div className="mb-4">
              {championData.winner !== null && championData.prediction ? (
                <div
                  className={cn(
                    'rounded-xl p-4 flex items-center justify-between border',
                    (championData.prediction.points || 0) > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Trophy
                      className={cn(
                        'w-6 h-6',
                        (championData.prediction.points || 0) > 0 ? 'text-green-500' : 'text-red-500'
                      )}
                    />
                    <div>
                      <p className="font-bold text-sm text-foreground">Tebakan Juara: {championData.prediction.predictedWinnerFlag} {championData.prediction.predictedWinner}</p>
                      <p
                        className={cn(
                          'text-xs font-bold',
                          (championData.prediction.points || 0) > 0 ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {(championData.prediction.points || 0) > 0 ? `Benar! (+${championData.prediction.points} pts)` : 'Salah (0 pts)'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {championData.isLocked && championData.winner === null && championData.prediction && (
                <div className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between border border-border/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-sm text-foreground">Tebakan Juara Terkunci</p>
                      <p className="text-xs text-muted-foreground">Pilihan Anda: {championData.prediction.predictedWinnerFlag} {championData.prediction.predictedWinner}</p>
                    </div>
                  </div>
                </div>
              )}

              {championData.isLocked && !championData.prediction && championData.winner === null && (
                <div className="bg-secondary/30 rounded-xl p-4 flex items-center justify-between border border-border/50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-sm text-foreground">Tebakan Juara Ditutup</p>
                      <p className="text-xs text-muted-foreground">Anda melewatkan tebakan juara.</p>
                    </div>
                  </div>
                </div>
              )}

              {!championData.isLocked && championData.prediction && (
                <div className="bg-green-500/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between border border-green-500/30 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-green-500">Tebakan Juara Tersimpan</p>
                      <p className="text-xs text-muted-foreground">Pilihan Anda: {championData.prediction.predictedWinnerFlag} {championData.prediction.predictedWinner}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-background text-foreground text-xs font-bold px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    UBAH TEBAKAN
                  </button>
                </div>
              )}

              {!championData.isLocked && !championData.prediction && (
                <div className="bg-amber-500/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between border border-amber-500/30 gap-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-amber-500">Tebak Juara Dunia</p>
                      <p className="text-xs text-muted-foreground">Bonus {championData.bonusPoints} pts. Sebelum kick-off pertama!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 text-background text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)] whitespace-nowrap"
                  >
                    TEBAK JUARA
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-3 gap-3 md:gap-6">
          <div className="bg-card rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group border border-border/50">
            <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,230,118,0.15)_inset]" />
            <span className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Total Poin</span>
            {isLeaderboardLoading || isSessionLoading ? (
              <Skeleton className="h-10 w-16 bg-muted/50" />
            ) : (
              <span className="font-display text-2xl md:text-4xl font-black text-primary">{userStats?.totalPoints || 0}</span>
            )}
          </div>

          <div className="bg-card rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group border border-border/50">
            <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,230,118,0.15)_inset]" />
            <span className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Rank</span>
            {isLeaderboardLoading || isSessionLoading ? (
              <Skeleton className="h-10 w-16 bg-muted/50" />
            ) : (
              <span className="font-display text-2xl md:text-4xl font-black text-foreground">#{userStats?.rank || '-'}</span>
            )}
          </div>

          <div className="bg-card rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group border border-border/50">
            <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,230,118,0.15)_inset]" />
            <span className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Perfect</span>
            {isLeaderboardLoading || isSessionLoading ? (
              <Skeleton className="h-10 w-16 bg-muted/50" />
            ) : (
              <span className="font-display text-2xl md:text-4xl font-black text-primary">{userStats?.perfectScores || 0}<span className="text-lg md:text-2xl align-top ml-1">⭐</span></span>
            )}
          </div>
        </div>
      </section>

      <section className="relative rounded-xl overflow-hidden bg-card/50 shadow-[0px_24px_48px_rgba(0,0,0,0.4)] group border border-border/50 min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/30 to-background pointer-events-none" />

        {isLiveLoading || isUpcomingLoading ? (
          <Skeleton className="w-full h-full absolute inset-0 rounded-xl bg-muted/20" />
        ) : heroMatch ? (
          <div className="relative p-6 md:p-10 flex flex-col items-center w-full">
            <div
              className={cn(
                'flex items-center gap-2 mb-6 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border',
                isLive ? 'border-destructive/30' : 'border-primary/30'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isLive ? 'bg-destructive shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse' : 'bg-primary shadow-[0_0_8px_rgba(0,230,118,0.8)]'
                )}
              />
              <span className={cn('text-xs font-bold uppercase tracking-widest', isLive ? 'text-destructive' : 'text-primary')}>
                {isLive ? 'Live Now' : 'Next Match'}
              </span>
            </div>

            <div className="grid w-full max-w-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 md:gap-12">
              <div className="flex min-w-0 flex-col items-center text-center">
                <Flag flag={heroMatch.flagA} size="xl" className="mb-2 w-16 shrink-0 md:w-36" />
                <span className="max-w-full break-words font-display text-sm font-bold uppercase leading-tight tracking-tight text-foreground md:text-xl">{heroMatch.teamA}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-3 py-2 shadow-xl backdrop-blur-md md:gap-4 md:px-4">
                <span className="font-display text-4xl font-black tracking-tighter text-primary md:text-7xl">{heroMatch.scoreA ?? '-'}</span>
                <span className="font-display font-bold text-2xl text-muted-foreground">-</span>
                <span className="font-display text-4xl font-black tracking-tighter text-foreground md:text-7xl">{heroMatch.scoreB ?? '-'}</span>
              </div>

              <div className="flex min-w-0 flex-col items-center text-center">
                <Flag flag={heroMatch.flagB} size="xl" className="mb-2 w-16 shrink-0 opacity-80 md:w-36" />
                <span className="max-w-full break-words font-display text-sm font-bold uppercase leading-tight tracking-tight text-muted-foreground md:text-xl">{heroMatch.teamB}</span>
              </div>
            </div>

            {(() => {
              if (isPredictionsLoading || isSessionLoading) {
                return <Skeleton className="h-28 w-full max-w-xl mt-8 rounded-lg bg-background/40" />;
              }

              const prediction = getPrediction(heroMatch.id);
              const lockTime = new Date(heroMatch.kickoffTime).getTime() - lockInMinutes * 60 * 1000;
              const isLocked = isLive || lockTime <= Date.now();
              const countdownLabel = isLive ? 'Pertandingan sedang berlangsung' : getCountdownLabel(heroMatch.kickoffTime);

              if (prediction) {
                return (
                  <div className="mt-8 w-full max-w-xl bg-background/60 backdrop-blur-md rounded-lg p-4 border border-primary/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <span className="text-xs text-primary font-bold uppercase tracking-widest">Prediksi Tersimpan</span>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="font-display font-black text-xl text-foreground">{prediction.predictedA}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-display font-black text-xl text-foreground">{prediction.predictedB}</span>
                        </div>
                      </div>
                    </div>
                    <a href="/predictions" className="inline-flex items-center justify-center gap-2 rounded-md border border-border/50 bg-card px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary">
                      {isLocked ? 'Lihat Detail' : 'Ubah Prediksi'}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                );
              }

              if (isLocked) {
                return (
                  <div className="mt-8 w-full max-w-xl bg-background/60 backdrop-blur-md rounded-lg p-4 border border-border/50 flex items-center gap-3">
                    <Lock className="h-6 w-6 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Prediksi Terkunci</span>
                      <p className="mt-1 text-sm text-muted-foreground">Kamu belum submit prediksi untuk match ini.</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mt-8 w-full max-w-xl bg-primary/10 backdrop-blur-md rounded-lg p-4 border border-primary/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_0_20px_rgba(0,230,118,0.1)]">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-widest">Belum Ada Prediksi</span>
                      <p className="mt-1 text-sm text-muted-foreground">Deadline: {lockInMinutes} menit sebelum kickoff · {countdownLabel}</p>
                    </div>
                  </div>
                  <a href="/predictions?filter=open" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-background transition-colors hover:bg-primary/90">
                    Prediksi Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="relative p-6 md:p-10 flex flex-col items-center w-full">
            <div className="text-center font-display text-muted-foreground uppercase tracking-widest text-lg font-bold text-balance">Tidak Ada Pertandingan Aktif atau Mendatang</div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-xl md:text-2xl tracking-tight text-foreground uppercase">Hasil Terakhir</h2>
          <a className="text-primary text-sm font-bold uppercase tracking-wider hover:text-primary/80 transition-colors" href="/dashboard/results">Lihat Semua</a>
        </div>

        {isFinishedLoading || isPredictionsLoading || isSessionLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-xl bg-muted/50" />
            <Skeleton className="h-24 w-full rounded-xl bg-muted/50" />
            <Skeleton className="h-24 w-full rounded-xl bg-muted/50 md:hidden" />
          </div>
        ) : recentResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentResults.map((match) => {
              const prediction = getPrediction(match.id);
              const points = prediction?.points ?? 0;
              const hasPrediction = !!prediction;

              return (
                <div key={match.id} className={`bg-card rounded-xl p-5 border border-border/50 flex items-center justify-between relative overflow-hidden transition-opacity ${points > 0 ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${points > 0 ? 'bg-primary' : 'bg-muted'}`} />
                  <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:gap-6">
                    <div className="flex min-w-0 flex-col items-center text-center">
                      <Flag flag={match.flagA} size="md" className="mb-1 w-8 shrink-0 md:w-12" />
                      <span className="max-w-full break-words font-display text-[10px] font-bold uppercase leading-tight text-foreground md:text-xs">{match.teamA}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 bg-secondary/30 px-3 md:px-4 py-2 rounded-lg font-display font-black text-xl md:text-2xl tracking-tighter">
                      <span className="text-foreground">{match.scoreA}</span>
                      <span className="text-muted-foreground text-lg">-</span>
                      <span className="text-muted-foreground">{match.scoreB}</span>
                    </div>
                    <div className="flex min-w-0 flex-col items-center text-center">
                      <Flag flag={match.flagB} size="md" className="mb-1 w-8 shrink-0 opacity-80 md:w-12" />
                      <span className="max-w-full break-words font-display text-[10px] font-bold uppercase leading-tight text-muted-foreground md:text-xs">{match.teamB}</span>
                    </div>
                  </div>
                  {hasPrediction ? (
                    <div className={`border px-3 py-1 rounded-full font-bold text-xs md:text-sm whitespace-nowrap ${points > 0 ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]' : 'bg-secondary text-muted-foreground border-border/50'}`}>
                      +{points} pts
                    </div>
                  ) : (
                    <div className="bg-secondary text-muted-foreground border border-border/50 px-3 py-1 rounded-full font-bold text-xs md:text-sm whitespace-nowrap">
                      Missed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState type="history" title="Belum Ada Hasil" description="Belum ada pertandingan yang selesai sejauh ini." />
        )}
      </section>

      {championData && (
        <ChampionPickModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          existingPrediction={championData.prediction}
          deadline={championData.deadline}
          bonusPoints={championData.bonusPoints}
        />
      )}
    </div>
  );
}
