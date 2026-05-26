"use client";

import React, { useMemo, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useMatches } from '@/hooks/useMatches';
import { usePredictions } from '@/hooks/usePredictions';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useUsers } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Loader2, Edit, Flag as LucideFlag, X, MemoryStick, Filter, TrendingUp, Users, Swords, PieChart, Trophy } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'sonner';
import { Match } from '@/types';
import Link from 'next/link';
import { Flag as CountryFlag } from '@/components/shared/Flag';
import { useAllTournamentPredictions } from '@/hooks/useTournamentPrediction';

export default function AdminDashboardPage() {
  const { data: session } = authClient.useSession();
  
  const { data: users, isLoading: isUsersLoading } = useUsers();
  const { data: matches, isLoading: isMatchesLoading } = useMatches();
  const { data: predictions, isLoading: isPredictionsLoading } = usePredictions();
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard();
  const { data: championPredictions, isLoading: isChampionLoading } = useAllTournamentPredictions();

  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [matchToCalc, setMatchToCalc] = useState<Match | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Computations
  const totalUsers = users?.length || 0;
  
  const totalMatches = matches?.length || 0;
  const finishedMatchesCount = matches?.filter(m => m.status === 'finished').length || 0;
  const liveMatchesCount = matches?.filter(m => m.status === 'live').length || 0;
  const upcomingMatchesCount = matches?.filter(m => m.status === 'upcoming').length || 0;

  const totalPredictions = predictions?.length || 0;

  let averagePoints = 0;
  if (leaderboard && leaderboard.length > 0) {
    const totalPoints = leaderboard.reduce((acc, curr) => acc + curr.totalPoints, 0);
    averagePoints = totalPoints / leaderboard.length;
  }

  // Today Matches
  const today = new Date();
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayDateString = formatInTimeZone(today, localTz, 'yyyy-MM-dd');

  const todayMatches = matches?.filter(m => {
    const matchDateString = formatInTimeZone(new Date(m.kickoffTime), localTz, 'yyyy-MM-dd');
    return matchDateString === todayDateString;
  }).sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()) || [];

  const handleCalculateMatch = async () => {
    if (!matchToCalc) return;
    setIsCalculating(true);
    try {
      const res = await fetch(`/api/matches/${matchToCalc.id}/calculate`, { method: 'POST' });
      if (!res.ok) throw new Error('Server error');
      toast.success(`Kalkulasi poin untuk ${matchToCalc.teamA} vs ${matchToCalc.teamB} berhasil!`);
    } catch (error) {
      toast.error('Gagal melakukan kalkulasi poin');
    } finally {
      setIsCalculating(false);
      setIsCalcModalOpen(false);
      setMatchToCalc(null);
    }
  };

  const openCalcModal = (match: Match) => {
    setMatchToCalc(match);
    setIsCalcModalOpen(true);
  };

  // Champion Predictions Summary
  const championDistribution = React.useMemo(() => {
    if (!championPredictions?.predictions) return [];
    const countMap: Record<string, { team: string; flag: string; count: number }> = {};
    for (const p of championPredictions.predictions) {
      if (!countMap[p.predictedWinner]) {
        countMap[p.predictedWinner] = { team: p.predictedWinner, flag: p.predictedWinnerFlag, count: 0 };
      }
      countMap[p.predictedWinner].count++;
    }
    return Object.values(countMap).sort((a, b) => b.count - a.count);
  }, [championPredictions]);

  const formatRelativeTime = (date: Date | string) => {
    const diffMinutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  const activityFeed = useMemo(() => {
    const predictionActivities = (predictions ?? []).map((prediction) => ({
      id: `prediction-${prediction.id}`,
      at: new Date(prediction.submittedAt),
      message: `${prediction.user?.name ?? 'User'} submit prediksi ${prediction.match?.teamA ?? ''} vs ${prediction.match?.teamB ?? ''}`,
      color: 'bg-primary',
      textColor: 'text-primary',
      iconText: 'User',
    }));

    const userActivities = (users ?? []).map((user) => ({
      id: `user-${user.id}`,
      at: new Date(user.createdAt),
      message: `${user.name} bergabung${user.groupName ? ` di grup ${user.groupName}` : ''}`,
      color: 'bg-tertiary',
      textColor: 'text-tertiary',
      iconText: 'User',
    }));

    const matchActivities = (matches ?? [])
      .filter((match) => match.status === 'live' || match.status === 'finished')
      .map((match) => ({
        id: `match-${match.id}-${match.status}`,
        at: new Date(match.kickoffTime),
        message: match.status === 'live'
          ? `${match.teamA} vs ${match.teamB} sedang live`
          : `${match.teamA} vs ${match.teamB} selesai ${match.scoreA ?? '-'}-${match.scoreB ?? '-'}`,
        color: match.status === 'live' ? 'bg-destructive' : 'bg-outline-variant',
        textColor: match.status === 'live' ? 'text-destructive' : 'text-on-surface-variant',
        iconText: match.status === 'live' ? 'Live' : 'Match',
      }));

    const championActivities = (championPredictions?.predictions ?? []).map((prediction) => ({
      id: `champion-${prediction.id}`,
      at: new Date(prediction.submittedAt),
      message: `${prediction.userName ?? 'User'} memilih juara ${prediction.predictedWinnerFlag} ${prediction.predictedWinner}`,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      iconText: 'Juara',
    }));

    return [...predictionActivities, ...userActivities, ...matchActivities, ...championActivities]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 8)
      .map((activity) => ({ ...activity, time: formatRelativeTime(activity.at) }));
  }, [championPredictions, matches, predictions, users]);

  return (
    <div className="p-8 content-layer flex-1 flex flex-col relative z-10 w-full overflow-x-hidden">
      {/* Background Noise Setup (from stitch) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] -z-10 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>

      {/* Page Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase mb-1">ADMIN DASHBOARD</h2>
          <p className="font-sans text-muted-foreground text-lg">Selamat datang, {session?.user?.name || 'Admin'}</p>
        </div>
        {/* Quick Action / Status */}
        <div className="flex items-center gap-4 bg-secondary/30 px-4 py-2 rounded border border-border/50">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">System Online & Active</span>
        </div>
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* Stat Card 1: Pengguna */}
        <div className="bg-card/50 border border-border/50 p-6 rounded relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pengguna</p>
            <Users className="w-5 h-5 text-primary opacity-50" />
          </div>
          {isUsersLoading ? (
            <Skeleton className="h-10 w-24 bg-muted/50 mb-3" />
          ) : (
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="font-display text-4xl font-bold text-foreground">{totalUsers}</h3>
              <span className="font-sans text-sm text-muted-foreground">Active</span>
            </div>
          )}
          <div className="mt-2 flex justify-between">
            <span className="font-sans text-xs text-primary">Platform Access</span>
            <span className="font-sans text-xs text-muted-foreground">Live Data</span>
          </div>
        </div>

        {/* Stat Card 2: Pertandingan */}
        <div className="bg-card/50 border border-border/50 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/80"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pertandingan</p>
            <Swords className="w-5 h-5 text-primary opacity-50" />
          </div>
          {isMatchesLoading ? (
            <Skeleton className="h-10 w-24 bg-muted/50 mb-3" />
          ) : (
            <>
              <h3 className="font-display text-4xl font-bold text-foreground mb-3">{totalMatches}</h3>
              <div className="flex flex-wrap gap-2 font-display font-bold text-[10px] uppercase tracking-wider">
                <span className="bg-secondary/80 px-2 py-1 rounded text-muted-foreground">{finishedMatchesCount} Selesai</span>
                <span className="bg-destructive/10 border border-destructive/30 px-2 py-1 rounded text-destructive flex items-center">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse"></span>
                  {liveMatchesCount} Live
                </span>
                <span className="bg-secondary/80 px-2 py-1 rounded text-muted-foreground">{upcomingMatchesCount} Upcoming</span>
              </div>
            </>
          )}
        </div>

        {/* Stat Card 3: Prediksi */}
        <div className="bg-card/50 border border-border/50 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/60"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">Prediksi Masuk</p>
            <PieChart className="w-5 h-5 text-primary opacity-50" />
          </div>
          {isPredictionsLoading ? (
            <Skeleton className="h-10 w-24 bg-muted/50 mb-2" />
          ) : (
            <h3 className="font-display text-4xl font-bold text-foreground mb-2">{totalPredictions}</h3>
          )}
          <div className="flex items-center gap-1 text-primary text-xs font-sans mt-3 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Real-time tracking</span>
          </div>
        </div>

        {/* Stat Card 4: Poin */}
        <div className="bg-card/50 border border-border/50 p-6 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/40"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">Rata-rata Poin</p>
            <TrendingUp className="w-5 h-5 text-primary opacity-50" />
          </div>
          {isLeaderboardLoading ? (
            <Skeleton className="h-10 w-24 bg-muted/50 mb-2" />
          ) : (
            <div className="flex items-baseline gap-1 mb-2">
              <h3 className="font-display text-4xl font-bold text-foreground">{averagePoints.toFixed(1)}</h3>
              <span className="font-sans text-sm text-muted-foreground">pts</span>
            </div>
          )}
          {/* Chart placeholder graphic */}
          <div className="w-full h-12 mt-2 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxwYXRoIGQ9Ik0wLDEwIEwxMCw4IEwyMCw5IEwzMCw1IEw0MCw3IEw1MCwzIEw2MCw2IEw3MCwyIEw4MCw0IEw5MCwxIEwxMDAsMTAiIGZpbGw9IiMzZmZmOGIiIG9wYWNpdHk9IjAuMiIvPjxwYXRoIGQ9Ik0wLDEwIEwxMCw4IEwyMCw5IEwzMCw1IEw0MCw3IEw1MCwzIEw2MCw2IEw3MCwyIEw4MCw0IEw5MCwxIiBmaWxsPSJub25lIiBzdHJva2U9IiMzZmZmOGIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-no-repeat bg-bottom bg-cover"></div>
        </div>
      </section>

      {/* Main Content Area Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Column (70%) */}
        <div className="lg:w-[70%] flex flex-col gap-6">
          {/* Pertandingan Hari Ini Section */}
          <section className="bg-card/50 border border-border/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
              <h3 className="font-display text-xl font-bold text-foreground tracking-tight uppercase">PERTANDINGAN HARI INI</h3>
              <Link href="/admin/matches" className="text-xs font-display font-bold uppercase text-primary hover:text-primary/80 transition-colors flex items-center gap-1 tracking-wider">
                View Full Schedule
              </Link>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-muted-foreground font-display font-bold text-xs uppercase tracking-wider border-b border-border/50">
                    <th className="pb-3 px-4 font-medium">Waktu</th>
                    <th className="pb-3 px-4 font-medium">Match</th>
                    <th className="pb-3 px-4 font-medium">Grup</th>
                    <th className="pb-3 px-4 font-medium">Status</th>
                    <th className="pb-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-sm divide-y divide-border/30">
                  {isMatchesLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center">
                        <Skeleton className="h-10 w-full mb-2 bg-secondary/50" />
                        <Skeleton className="h-10 w-full bg-secondary/50" />
                      </td>
                    </tr>
                  ) : todayMatches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-muted-foreground">
                        Tidak ada pertandingan yang dijadwalkan hari ini.
                      </td>
                    </tr>
                  ) : (
                    todayMatches.map((match) => {
                      const isFinished = match.status === 'finished';
                      const isLive = match.status === 'live';
                      const isUpcoming = match.status === 'upcoming';
                      const matchTime = formatInTimeZone(new Date(match.kickoffTime), Intl.DateTimeFormat().resolvedOptions().timeZone, 'HH:mm');

                      return (
                        <tr key={match.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">{matchTime}</td>
                          <td className={`py-4 px-4 font-display font-black tracking-tight text-foreground text-sm md:text-base ${isFinished ? 'opacity-60' : ''}`}>
                            <CountryFlag flag={match.flagA} size="sm" className="mr-2" /> {match.teamA.toUpperCase()}
                            {isFinished || isLive ? (
                              <span className="text-muted-foreground text-sm font-bold px-3">
                                {match.scoreA ?? '-'} : {match.scoreB ?? '-'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs font-normal px-3">vs</span>
                            )}
                            {match.teamB.toUpperCase()} <CountryFlag flag={match.flagB} size="sm" className="ml-2" />
                          </td>
                          <td className="py-4 px-4 text-muted-foreground font-display text-xs uppercase">{match.group}</td>
                          <td className="py-4 px-4">
                            {isLive ? (
                              <div className="inline-flex items-center gap-1.5 bg-destructive/20 border border-destructive/30 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(255,113,108,0.2)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></span>
                                <span className="text-destructive text-xs font-display font-bold tracking-widest uppercase">LIVE</span>
                              </div>
                            ) : isUpcoming ? (
                              <div className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full">
                                <span className="text-muted-foreground text-xs font-display font-bold tracking-widest uppercase">Upcoming</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/20 px-2.5 py-1 rounded-full">
                                <span className="text-primary text-xs font-display font-bold tracking-widest uppercase">Selesai</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              {isFinished ? (
                                <button 
                                  onClick={() => openCalcModal(match)}
                                  className="bg-amber-500/20 hover:bg-amber-500 text-amber-500 hover:text-background border border-amber-500/50 font-display text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center"
                                  title="Trigger Kalkulasi Poin"
                                >
                                  <Zap className="w-3 h-3 mr-1" /> Kalkulasi Poin
                                </button>
                              ) : (
                                <>
                                  <Link href="/admin/matches" className="bg-background border border-border/50 hover:bg-secondary text-primary p-2 rounded transition-colors" title="Input Hasil">
                                    <LucideFlag className="w-4 h-4" />
                                  </Link>
                                  {isLive && (
                                    <Link href="/admin/matches" className="bg-background border border-border/50 hover:bg-secondary text-muted-foreground p-2 rounded transition-colors" title="Edit Data">
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* System Diagnostics Mini Panel */}
          <section className="bg-card/50 border border-border/50 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border border-border/50">
                <MemoryStick className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">System Load</h4>
                <p className="font-sans text-xs text-muted-foreground">Calculation engine is idling</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-display text-2xl font-black text-foreground">{totalPredictions}</span>
              <span className="block font-sans text-xs text-muted-foreground">Total Prediksi</span>
            </div>
          </section>

          {/* Prediksi Juara Section */}
          <section className="bg-card/50 border border-border/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground tracking-tight uppercase">PREDIKSI JUARA</h3>
              </div>
              {!isChampionLoading && championPredictions && (
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-primary">{championPredictions.stats.submitted}</span>
                  <span className="font-sans text-xs text-muted-foreground">/ {championPredictions.stats.total} user sudah memilih</span>
                </div>
              )}
            </div>

            {isChampionLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full bg-muted/50" />
                <Skeleton className="h-10 w-full bg-muted/50" />
                <Skeleton className="h-10 w-full bg-muted/50" />
              </div>
            ) : !championPredictions || championPredictions.predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-sans text-sm">
                Belum ada user yang memilih juara.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top Picks Distribution */}
                <div>
                  <h4 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Distribusi Pilihan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {championDistribution.map((item) => (
                      <div key={item.team} className="flex items-center justify-between bg-secondary/50 border border-border/30 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CountryFlag flag={item.flag} size="sm" className="w-6" />
                          <span className="font-display text-sm font-bold text-foreground">{item.team}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary/30 w-16 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(item.count / championPredictions.stats.submitted) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-display text-xs font-bold text-primary min-w-[2rem] text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail Per User */}
                <div>
                  <h4 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Detail Per User</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-muted-foreground font-display font-bold text-[10px] uppercase tracking-wider border-b border-border/50">
                          <th className="pb-3 px-3 font-medium">No</th>
                          <th className="pb-3 px-3 font-medium">User</th>
                          <th className="pb-3 px-3 font-medium">Pilihan Juara</th>
                          <th className="pb-3 px-3 font-medium">Waktu Submit</th>
                          <th className="pb-3 px-3 font-medium text-right">Poin</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans text-sm divide-y divide-border/30">
                        {championPredictions.predictions.map((pred, idx) => (
                          <tr key={pred.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-3 font-display text-muted-foreground text-xs">{String(idx + 1).padStart(2, '0')}</td>
                            <td className="py-3 px-3 font-medium text-foreground">{pred.userName}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <CountryFlag flag={pred.predictedWinnerFlag} size="sm" className="w-5" />
                                <span className="font-display text-sm font-bold text-foreground">{pred.predictedWinner}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-muted-foreground text-xs">
                              {formatInTimeZone(new Date(pred.submittedAt), Intl.DateTimeFormat().resolvedOptions().timeZone, 'dd MMM yyyy, HH:mm')}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {pred.points !== null ? (
                                <span className={`font-display font-bold text-sm ${pred.points > 0 ? 'text-primary' : 'text-destructive'}`}>
                                  {pred.points > 0 ? '+' : ''}{pred.points}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column (30%) */}
        <aside className="lg:w-[30%]">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 h-full sticky top-8">
            <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
              <h3 className="font-display text-lg font-bold text-foreground tracking-tight uppercase">AKTIVITAS TERBARU</h3>
              <button className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            
            {/* Activity Feed */}
            {isUsersLoading || isPredictionsLoading || isMatchesLoading || isChampionLoading ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-14 w-full bg-muted/50" />
                <Skeleton className="h-14 w-full bg-muted/50" />
                <Skeleton className="h-14 w-full bg-muted/50" />
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 text-center text-sm text-muted-foreground">
                Belum ada aktivitas terbaru.
              </div>
            ) : (
              <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-border/50">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="relative pl-8">
                    <div className={`absolute left-[0.35rem] top-1 w-2.5 h-2.5 rounded-full ${activity.color} z-10 ring-4 ring-background`}></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-3">
                        <span className={`font-display text-[10px] ${activity.textColor} font-bold uppercase tracking-wider bg-background px-2 py-0.5 rounded border border-border/50`}>
                          {activity.iconText}
                        </span>
                        <span className="font-sans text-[10px] text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                      <p className="font-sans text-sm text-foreground leading-tight mt-1">{activity.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full mt-8 py-2.5 bg-secondary/60 border border-border/50 text-muted-foreground text-xs font-display font-bold uppercase tracking-wider rounded text-center">
              Menampilkan {activityFeed.length} aktivitas terbaru
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Kalkulasi Poin */}
      {isCalcModalOpen && matchToCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => !isCalculating && setIsCalcModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-card rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] border border-border/50 overflow-hidden flex flex-col p-8 items-center text-center">
             <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
             </div>
             
             {!isCalculating ? (
               <>
                 <h3 className="font-display font-bold text-2xl tracking-tighter text-foreground mb-4 uppercase">Kalkulasi Poin?</h3>
                 <p className="text-muted-foreground font-sans text-sm mb-8">
                   Anda akan menghitung dan membagikan poin prediksi untuk pertandingan <span className="font-bold text-foreground">{matchToCalc.teamA} vs {matchToCalc.teamB}</span>. Lanjutkan?
                 </p>
                 <div className="flex w-full gap-4">
                   <button onClick={() => setIsCalcModalOpen(false)} className="flex-1 bg-secondary border border-border/50 text-foreground font-display font-bold py-3 rounded uppercase tracking-wider hover:bg-secondary/80 transition-colors text-sm">
                     Batal
                   </button>
                   <button onClick={handleCalculateMatch} className="flex-1 bg-amber-500 text-background font-display font-bold py-3 rounded uppercase tracking-wider hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-colors text-sm">
                     Ya, Hitung
                   </button>
                 </div>
               </>
             ) : (
               <>
                 <h3 className="font-display font-bold text-xl tracking-tighter text-foreground mb-4 uppercase">Kalkulasi Berjalan</h3>
                 <div className="w-full flex justify-center mb-4">
                   <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                 </div>
                 <p className="text-muted-foreground font-sans text-sm font-bold">
                   Menghitung poin untuk {matchToCalc.teamA} vs {matchToCalc.teamB}...
                 </p>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
