"use client";

import React from 'react';
import { Star, Minus, Users } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { authClient } from '@/lib/auth-client';
import { useMyGroup } from '@/hooks/useMyGroup';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { RankChangeBadge } from '@/components/leaderboard/RankChangeBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';

export default function LeaderboardPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data: myGroup, isLoading: isGroupLoading } = useMyGroup();
  const groupId = myGroup?.groupId ?? undefined;
  const groupName = myGroup?.groupName ?? null;

  const { data: leaderboard, isLoading } = useLeaderboard(groupId, !isGroupLoading && !!groupId);

  if (isGroupLoading || isLoading) {
    return (
      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
        <section className="pt-4 md:pt-8 pb-4 relative">
          <Skeleton className="h-12 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </section>
        <section className="relative pt-8 pb-8 mt-4 md:mt-8 flex justify-center items-end gap-2 h-56 md:h-64">
           <Skeleton className="w-[30%] h-32 rounded-t-lg" />
           <Skeleton className="w-[35%] h-48 rounded-t-lg" />
           <Skeleton className="w-[30%] h-28 rounded-t-lg" />
        </section>
        <section className="flex flex-col gap-2 mt-4 md:mt-8">
           <Skeleton className="w-full h-20 rounded-lg" />
           <Skeleton className="w-full h-20 rounded-lg" />
           <Skeleton className="w-full h-20 rounded-lg" />
        </section>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 mt-10">
        <EmptyState
          type="leaderboard"
          title="Belum Ada Grup"
          description="Kamu belum bergabung ke grup manapun. Hubungi admin WCP IT Jateng DIY untuk mendapatkan kode undangan."
        />
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
     return (
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 mt-10">
           <EmptyState type="leaderboard" title="Klasemen Kosong" description="Belum ada data klasemen untuk grupmu." />
        </div>
     );
  }

  const top3 = leaderboard.slice(0, 3);
  const rank1 = top3.find(r => r.rank === 1) || leaderboard[0];
  const rank2 = top3.find(r => r.rank === 2) || leaderboard[1];
  const rank3 = top3.find(r => r.rank === 3) || leaderboard[2];
  const rest = leaderboard.slice(3);

  const getShortName = (name: string) => {
    if (!name) return 'User';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0]} ${parts[1][0]}.`;
    return name;
  };

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      <section className="pt-4 md:pt-8 pb-4 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 -translate-x-1/4"></div>
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none shadow-sm text-foreground">
                KLASEMEN
            </h1>
            <UserAvatar name={session?.user?.name} image={(session?.user as { image?: string | null } | undefined)?.image} className="h-10 w-10 border border-border/50 bg-card md:h-12 md:w-12" textClassName="text-lg text-primary" />
        </div>
        {groupName && (
          <div className="flex items-center gap-2 mt-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold text-primary uppercase tracking-wider">{groupName}</span>
          </div>
        )}
        <p className="font-sans text-muted-foreground text-xs md:text-sm tracking-wide">Update otomatis setiap 30 detik</p>
      </section>

      {/* Podium Section */}
      <section className="relative pt-8 pb-8 mt-4 md:mt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-end justify-center gap-2 h-56 md:h-64">
          {rank2 && (
            <div className="flex flex-col items-center w-[30%] translate-y-4">
              <UserAvatar name={rank2.name} image={rank2.image} className={`w-14 h-14 md:w-16 md:h-16 bg-card border-2 border-slate-300 mb-2 shadow-[0_0_15px_rgba(203,213,225,0.2)] relative z-20 ${rank2.userId === userId ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} textClassName="text-lg md:text-xl text-slate-300" />
              <div className="bg-secondary/40 w-full rounded-t-lg border-t border-slate-400/20 flex flex-col items-center pt-3 pb-4 h-32 md:h-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-400/5 to-transparent"></div>
                <span className="font-display font-bold text-3xl md:text-4xl text-slate-300 relative z-10 opacity-40">2</span>
                <div className="relative z-10 mt-1"><RankChangeBadge rankChange={rank2.rankChange} /></div>
                <span className="font-display font-bold text-sm md:text-base text-foreground mt-auto relative z-10 truncate w-full text-center px-1">{getShortName(rank2.name)}</span>
                <span className="font-sans text-xs md:text-sm text-primary font-semibold relative z-10">{rank2.totalPoints} pts</span>
              </div>
            </div>
          )}
          {rank1 && (
            <div className="flex flex-col items-center w-[35%] z-20">
              <div className="relative">
                <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] z-20">
                  <Star className="w-6 h-6 md:w-8 md:h-8 fill-yellow-400 text-yellow-400" />
                </div>
                <UserAvatar name={rank1.name} image={rank1.image} className={`w-16 h-16 md:w-20 md:h-20 bg-card border-2 border-yellow-400 mb-2 shadow-[0_0_20px_rgba(250,204,21,0.3)] relative z-10 ${rank1.userId === userId ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} textClassName="text-xl md:text-2xl text-yellow-400" />
              </div>
              <div className="bg-secondary/60 w-full rounded-t-lg border-t border-yellow-400/30 flex flex-col items-center pt-2 pb-6 h-40 md:h-48 relative overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent"></div>
                <span className="font-display font-black text-5xl md:text-6xl text-yellow-400 relative z-10 opacity-30 drop-shadow-md">1</span>
                <div className="relative z-10 mt-1"><RankChangeBadge rankChange={rank1.rankChange} /></div>
                <span className="font-display font-bold text-base md:text-lg text-foreground mt-auto relative z-10 truncate w-full text-center px-1">{getShortName(rank1.name)}</span>
                <span className="font-sans text-sm md:text-base text-primary font-bold relative z-10 bg-primary/10 px-2 py-0.5 rounded mt-1">{rank1.totalPoints} pts</span>
              </div>
            </div>
          )}
          {rank3 && (
            <div className="flex flex-col items-center w-[30%] translate-y-8">
              <UserAvatar name={rank3.name} image={rank3.image} className={`w-12 h-12 md:w-14 md:h-14 bg-card border-2 border-amber-600 mb-2 shadow-[0_0_15px_rgba(217,119,6,0.2)] relative z-20 ${rank3.userId === userId ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} textClassName="text-base md:text-lg text-amber-600" />
              <div className="bg-secondary/20 w-full rounded-t-lg border-t border-amber-600/20 flex flex-col items-center pt-3 pb-3 h-28 md:h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 to-transparent"></div>
                <span className="font-display font-bold text-2xl md:text-3xl text-amber-600 relative z-10 opacity-40">3</span>
                <div className="relative z-10 mt-1"><RankChangeBadge rankChange={rank3.rankChange} /></div>
                <span className="font-display font-bold text-sm md:text-base text-foreground mt-auto relative z-10 truncate w-full text-center px-1">{getShortName(rank3.name)}</span>
                <span className="font-sans text-xs md:text-sm text-primary font-semibold relative z-10">{rank3.totalPoints} pts</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard List */}
      <section className="flex flex-col gap-2 mt-4 md:mt-8">
        {rest.map((entry, index) => {
          const isCurrentUser = entry.userId === userId;
          const isTied = index > 0 && entry.rank === rest[index - 1].rank;
          return (
            <div
              key={entry.userId}
              className={`rounded-lg p-3 md:p-4 flex items-center gap-4 relative overflow-hidden border ${isCurrentUser ? 'bg-card/80 border-primary border-l-4 shadow-[0_4px_20px_rgba(0,230,118,0.05)]' : 'bg-card border-border/50'}`}
            >
              {isCurrentUser && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
              )}
              <div className="w-8 md:w-12 text-center flex-shrink-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1 relative z-10">
                <span className={`font-display font-black text-xl md:text-2xl ${isCurrentUser ? 'text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]' : 'text-muted-foreground opacity-50'}`}>
                  {entry.rank}
                </span>
                <RankChangeBadge rankChange={entry.rankChange} />
                {isTied && !isCurrentUser && <Minus className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />}
              </div>
              <UserAvatar name={entry.name} image={entry.image} className="h-10 w-10 border border-border/50 bg-secondary md:h-12 md:w-12" textClassName="text-sm text-primary md:text-base" />
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base md:text-lg text-foreground truncate">{getShortName(entry.name)}</h3>
                  {isCurrentUser && (
                    <span className="bg-primary/20 text-primary text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`font-sans text-xs md:text-sm ${isCurrentUser ? 'text-foreground' : 'text-muted-foreground'}`}>{entry.totalPoints} pts</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span className={`font-sans text-[10px] md:text-xs flex items-center gap-0.5 font-bold ${entry.perfectScores > 0 ? 'text-yellow-400' : 'text-muted-foreground/50'}`}>
                    {entry.perfectScores} <Star className={`w-3 h-3 ${entry.perfectScores > 0 ? 'fill-yellow-400' : ''}`} />
                  </span>
                </div>
              </div>
              <div className={`font-display font-black text-2xl md:text-3xl pr-2 relative z-10 ${isCurrentUser ? 'text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.3)]' : 'text-primary opacity-90'}`}>
                {entry.totalPoints}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
