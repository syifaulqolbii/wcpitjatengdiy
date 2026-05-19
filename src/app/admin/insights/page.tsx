"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useUserPredictions } from '@/hooks/usePredictions';
import { useMatches } from '@/hooks/useMatches';
import { useAllTournamentPredictions } from '@/hooks/useTournamentPrediction';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Trophy, Download, ChevronDown, Award } from 'lucide-react';
import { LeaderboardEntry } from '@/types';
import { format } from 'date-fns';
import { UserAvatar } from '@/components/shared/UserAvatar';

// ─── PlayerCard Component ───
// Mem-fetch prediksinya sendiri untuk kalkulasi 5 match terakhir
function PlayerCard({ 
  entry, 
  totalMatchesFinished, 
  onClick, 
  isActive,
  championPick
}: { 
  entry: LeaderboardEntry; 
  totalMatchesFinished: number;
  onClick: () => void;
  isActive: boolean;
  championPick?: { predictedWinner: string; predictedWinnerFlag: string } | null;
}) {
  const { data: predictions, isLoading } = useUserPredictions(entry.userId);

  const akurasi = entry.totalPredicted > 0 
    ? Math.round(((entry.perfectScores + (entry.correctResults || 0)) / entry.totalPredicted) * 100) 
    : 0;

  const partisipasi = totalMatchesFinished > 0
    ? Math.round((entry.totalPredicted / totalMatchesFinished) * 100)
    : 0;

  // 5 match terakhir (berdasarkan data predictions yang memiliki points !== null)
  const last5 = useMemo(() => {
    if (!predictions) return [];
    // Filter yang sudah ada nilainya (points !== null)
    const finished = predictions.filter(p => p.points !== null);
    // Sort descending by submittedAt or match kickoff
    finished.sort((a, b) => {
      // asumsi match ada di dalam prediction.match
      const timeA = a.match ? new Date(a.match.kickoffTime).getTime() : new Date(a.submittedAt).getTime();
      const timeB = b.match ? new Date(b.match.kickoffTime).getTime() : new Date(b.submittedAt).getTime();
      return timeB - timeA;
    });
    return finished.slice(0, 5).reverse(); // reverse agar yang paling kanan adalah yang terbaru
  }, [predictions]);

  return (
    <div 
      onClick={onClick}
      className={`bg-card/50 border ${isActive ? 'border-primary ring-1 ring-primary' : 'border-border/50'} rounded-xl p-6 relative overflow-hidden group cursor-pointer hover:bg-secondary/20 transition-all`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={entry.name} image={entry.image} className="h-12 w-12 border border-border/50 bg-secondary" textClassName="text-xl font-black text-foreground" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">{entry.name}</h3>
            <p className="font-sans text-xs text-muted-foreground">User ID: {entry.userId.substring(0,8)}...</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {entry.rank === 1 ? (
            <Trophy className="text-yellow-400 w-8 h-8 fill-yellow-400" />
          ) : entry.rank === 2 ? (
            <Trophy className="text-gray-400 w-8 h-8 fill-gray-400" />
          ) : entry.rank === 3 ? (
            <Trophy className="text-amber-700 w-8 h-8 fill-amber-700" />
          ) : (
            <span className="font-display font-black text-2xl text-muted-foreground opacity-50">#{entry.rank}</span>
          )}
          <span className={`font-display font-bold text-xs mt-1 ${entry.rank <= 3 ? (entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-400' : 'text-amber-700') : 'text-muted-foreground'}`}>
            {entry.rank <= 3 ? `${entry.rank}${entry.rank===1?'st':entry.rank===2?'nd':'rd'} Rank` : 'Rank'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Poin</p>
          <p className="font-display font-black text-2xl text-primary">{entry.totalPoints}</p>
        </div>
        <div>
          <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Perfect</p>
          <p className="font-display font-black text-xl text-foreground">{entry.perfectScores}</p>
        </div>
        <div>
          <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Prediksi</p>
          <p className="font-display font-black text-xl text-foreground">{entry.totalPredicted}</p>
        </div>
        <div>
          <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Akurasi</p>
          <p className="font-display font-black text-xl text-secondary">{akurasi}%</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between font-display text-[10px] font-bold uppercase tracking-wider mb-2">
          <span className="text-muted-foreground">Tingkat Partisipasi</span>
          <span className={partisipasi > 80 ? 'text-primary' : partisipasi > 50 ? 'text-amber-500' : 'text-destructive'}>
            {partisipasi}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${partisipasi > 80 ? 'bg-primary' : partisipasi > 50 ? 'bg-amber-500' : 'bg-destructive'} transition-all`} 
            style={{ width: `${Math.min(partisipasi, 100)}%` }}
          ></div>
        </div>
      </div>

      <div>
        <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">5 Match Terakhir</p>
        <div className="flex items-end gap-2 h-10 border-b border-border/30 pb-0.5">
          {isLoading ? (
            <Skeleton className="w-full h-full bg-secondary/50" />
          ) : last5.length === 0 ? (
            <span className="text-xs text-muted-foreground font-sans">Belum ada riwayat</span>
          ) : (
            last5.map((p, idx) => {
              // Points mapping:
              // 5 (or max) -> perfect -> height 100%, green
              // 2 (or >0) -> correct -> height 60%, blue/secondary
              // 0 -> miss -> height 20%, red
              const isPerfect = p.points && p.points >= 3;
              const isCorrect = p.points && p.points > 0 && p.points < 3;
              const isMiss = p.points === 0;

              let bgClass = "bg-secondary/20";
              let height = "10%";
              
              if (isPerfect) { bgClass = "bg-primary"; height = "100%"; }
              else if (isCorrect) { bgClass = "bg-blue-400"; height = "60%"; }
              else if (isMiss) { bgClass = "bg-destructive"; height = "25%"; }

              return (
                <div key={idx} className={`w-full ${bgClass} rounded-t-sm transition-all hover:opacity-80`} style={{ height }}></div>
              );
            })
          )}
          {/* Fill empty slots if < 5 */}
          {Array.from({ length: Math.max(0, 5 - last5.length) }).map((_, i) => (
             <div key={`empty-${i}`} className="w-full bg-transparent border border-dashed border-border/30 rounded-t-sm" style={{ height: "10%" }}></div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        {championPick ? (
          <p className="font-sans text-xs text-foreground">
            Tebak Juara: {championPick.predictedWinnerFlag} {championPick.predictedWinner}
          </p>
        ) : (
          <p className="font-sans text-xs text-muted-foreground italic">Belum tebak juara</p>
        )}
      </div>
    </div>
  );
}

export default function AdminUserInsightPage() {
  const { data: leaderboard, isLoading: isLoadingLB } = useLeaderboard();
  const { data: matches } = useMatches();
  const { data: allChampionPredictions } = useAllTournamentPredictions();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Poin Tertinggi');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Auto select rank 1
  useEffect(() => {
    if (leaderboard && leaderboard.length > 0 && !selectedUserId) {
      setSelectedUserId(leaderboard[0].userId);
    }
  }, [leaderboard, selectedUserId]);

  const totalMatchesFinished = matches?.filter(m => m.status === 'finished').length || 0;

  const filteredAndSortedData = useMemo(() => {
    if (!leaderboard) return [];
    let data = [...leaderboard];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(u => u.name.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case 'Poin Tertinggi':
        data.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'Poin Terendah':
        data.sort((a, b) => a.totalPoints - b.totalPoints);
        break;
      case 'Paling Aktif':
        data.sort((a, b) => b.totalPredicted - a.totalPredicted);
        break;
      case 'Bergabung Terbaru':
        // Jika ada properti createdAt di user, kita bisa sort. 
        // Tapi sementara tidak ada, kita abaikan atau fallback ke rank
        data.sort((a, b) => a.rank - b.rank);
        break;
    }

    return data;
  }, [leaderboard, searchQuery, sortBy]);

  const selectedUser = useMemo(() => {
    return leaderboard?.find(u => u.userId === selectedUserId);
  }, [leaderboard, selectedUserId]);

  const { data: selectedPredictions, isLoading: isLoadingPredictions } = useUserPredictions(selectedUserId ?? undefined);

  const handleGenerateReport = () => {
    window.print();
  };

  return (
    <div className="p-10 flex-1 flex flex-col lg:flex-row gap-8 relative z-10 w-full overflow-x-hidden min-h-screen">
      {/* Background Noise Setup */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] -z-10 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>

      {/* Left Column: Grid */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase">USER INSIGHT</h2>
            <p className="font-sans text-muted-foreground mt-2 text-lg">Analisis performa prediksi pemain</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative group focus-within:ring-1 focus-within:ring-primary/50 rounded-lg flex-1 sm:w-64 bg-secondary/30 border border-border/50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                className="bg-transparent text-foreground border-none rounded-lg pl-10 pr-4 py-2.5 w-full focus:ring-0 font-sans text-sm outline-none placeholder:text-muted-foreground" 
                placeholder="Cari pemain..." 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Sort Dropdown */}
            <div className="relative bg-secondary/30 border border-border/50 rounded-lg flex-shrink-0">
              <select 
                className="appearance-none bg-transparent text-foreground border-none rounded-lg pl-4 pr-10 py-2.5 font-display font-bold text-xs uppercase tracking-wider focus:ring-0 outline-none w-full h-full cursor-pointer"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option className="bg-background text-foreground">Poin Tertinggi</option>
                <option className="bg-background text-foreground">Poin Terendah</option>
                <option className="bg-background text-foreground">Paling Aktif</option>
                <option className="bg-background text-foreground">Bergabung Terbaru</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {/* Generate Report */}
            <button 
              onClick={handleGenerateReport}
              className="bg-primary text-background px-4 py-2.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(63,255,139,0.3)] transition-all flex items-center justify-center flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Report
            </button>
          </div>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
          {isLoadingLB ? (
            <>
              <Skeleton className="h-72 w-full rounded-xl bg-secondary/50" />
              <Skeleton className="h-72 w-full rounded-xl bg-secondary/50" />
              <Skeleton className="h-72 w-full rounded-xl bg-secondary/50" />
              <Skeleton className="h-72 w-full rounded-xl bg-secondary/50" />
            </>
          ) : filteredAndSortedData.length === 0 ? (
            <div className="col-span-1 xl:col-span-2 py-20 text-center text-muted-foreground font-sans">
              Tidak ada pemain yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            filteredAndSortedData.map(entry => (
              <PlayerCard 
                key={entry.userId} 
                entry={entry} 
                totalMatchesFinished={totalMatchesFinished}
                onClick={() => setSelectedUserId(entry.userId)}
                isActive={selectedUserId === entry.userId}
                championPick={allChampionPredictions?.predictions.find((p) => p.userId === entry.userId) || null}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Detail Pemain */}
      <aside className="w-full lg:w-[35%] xl:w-[30%] min-w-[320px] bg-card/40 border border-border/50 rounded-2xl flex flex-col overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.4)] h-[calc(100vh-5rem)] sticky top-8">
        {selectedUser ? (
          <>
            {/* Panel Header / Hero */}
            <div className="relative bg-secondary/30 p-8 pb-6 flex flex-col items-center text-center border-b border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none"></div>
              
              <UserAvatar name={selectedUser.name} image={selectedUser.image} className="mb-4 h-24 w-24 border-4 border-primary/20 bg-background shadow-[0_0_20px_rgba(0,0,0,0.3)] relative z-10" textClassName="text-4xl font-black text-foreground" />
              
              <h3 className="font-display font-bold text-2xl text-foreground relative z-10">{selectedUser.name}</h3>
              <p className="font-sans text-xs text-muted-foreground mb-4 relative z-10">ID: {selectedUser.userId.substring(0,12)}...</p>
              
              <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-2 relative z-10 border border-border/50 shadow-md">
                {selectedUser.rank <= 3 ? (
                  <Trophy className={`w-4 h-4 ${selectedUser.rank === 1 ? 'text-yellow-400 fill-yellow-400' : selectedUser.rank === 2 ? 'text-gray-400 fill-gray-400' : 'text-amber-700 fill-amber-700'}`} />
                ) : (
                  <Award className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={`font-display font-bold text-sm tracking-wider ${selectedUser.rank === 1 ? 'text-yellow-400' : selectedUser.rank === 2 ? 'text-gray-400' : selectedUser.rank === 3 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                  RANK {selectedUser.rank}
                </span>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-px bg-border/50 border-b border-border/50">
              <div className="bg-background/40 backdrop-blur-sm p-4 text-center hover:bg-background/60 transition-colors">
                <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Poin</p>
                <p className="font-display font-black text-3xl text-primary tracking-tighter">{selectedUser.totalPoints}</p>
              </div>
              <div className="bg-background/40 backdrop-blur-sm p-4 text-center hover:bg-background/60 transition-colors">
                <p className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Akurasi</p>
                <p className="font-display font-black text-3xl text-foreground tracking-tighter">
                  {selectedUser.totalPredicted > 0 
                    ? Math.round(((selectedUser.perfectScores + (selectedUser.correctResults || 0)) / selectedUser.totalPredicted) * 100) 
                    : 0}%
                </p>
              </div>
            </div>

            {/* Prediction History List */}
            <div className="p-6 flex-1 overflow-y-auto">
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Riwayat Prediksi</h4>
              <div className="space-y-4">
                {isLoadingPredictions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg bg-secondary/50" />
                    <Skeleton className="h-24 w-full rounded-lg bg-secondary/50" />
                    <Skeleton className="h-24 w-full rounded-lg bg-secondary/50" />
                  </div>
                ) : !selectedPredictions || selectedPredictions.length === 0 ? (
                  <p className="text-center text-sm font-sans text-muted-foreground py-10">Belum ada riwayat prediksi yang selesai.</p>
                ) : (
                  // Sort predictions by submittedAt or kickoff, showing finished ones
                  selectedPredictions
                    .filter(p => p.points !== null)
                    .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .map(p => {
                      const isPerfect = p.points && p.points >= 3;
                      const isCorrect = p.points && p.points > 0 && p.points < 3;
                      const isMiss = p.points === 0;

                      let borderColor = "border-border";
                      let badgeBg = "bg-secondary/50 text-foreground";
                      let badgeText = "Terkalkulasi";
                      let pointsColor = "text-foreground";
                      let pointsPrefix = "+";

                      if (isPerfect) {
                        borderColor = "border-primary";
                        badgeBg = "bg-primary/20 text-primary";
                        badgeText = "Perfect Score";
                        pointsColor = "text-primary";
                      } else if (isCorrect) {
                        borderColor = "border-blue-500/50";
                        badgeBg = "bg-blue-500/20 text-blue-400";
                        badgeText = "Tebak Pemenang";
                        pointsColor = "text-blue-400";
                      } else if (isMiss) {
                        borderColor = "border-destructive/50";
                        badgeBg = "bg-destructive/20 text-destructive";
                        badgeText = "Meleset";
                        pointsColor = "text-destructive";
                        pointsPrefix = "";
                      }

                      return (
                        <div key={p.id} className={`bg-secondary/10 flex flex-col p-4 rounded-lg border-l-4 ${borderColor} hover:bg-secondary/30 transition-colors`}>
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-sans text-xs text-muted-foreground">{format(new Date(p.submittedAt), 'dd MMM HH:mm')}</span>
                            <span className={`${badgeBg} font-display font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded`}>
                              {badgeText}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-display font-black text-foreground">
                              {p.match?.teamA} vs {p.match?.teamB}
                            </span>
                            <span className={`font-display font-black text-xl ${pointsColor}`}>
                              {pointsPrefix}{p.points}
                            </span>
                          </div>
                          <div className="flex gap-6 font-sans text-sm">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Tebakan</span>
                              <span className="text-foreground font-bold font-display">{p.predictedA} - {p.predictedB}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Hasil Asli</span>
                              <span className="text-foreground font-bold font-display">{p.match?.scoreA ?? '-'} - {p.match?.scoreB ?? '-'}</span>
                            </div>
                          </div>
                        </div>
                      );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-display font-bold">Pilih Pemain</p>
            <p className="font-sans text-sm mt-1">Klik salah satu kartu di sebelah kiri untuk melihat detail performa dan riwayat prediksinya.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
