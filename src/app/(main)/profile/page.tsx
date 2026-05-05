"use client";

import React, { useState, useMemo } from 'react';
import { Star, Check, X, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { usePredictions } from '@/hooks/usePredictions';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'sonner';
import { Flag } from '@/components/shared/Flag';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userId = session?.user?.id;
  
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard();
  const { data: predictions, isLoading: isPredictionsLoading } = usePredictions();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const userStats = useMemo(() => {
    if (!leaderboard || !userId) return null;
    return leaderboard.find((entry) => entry.userId === userId);
  }, [leaderboard, userId]);

  // Filter finished matches from predictions
  const finishedPredictions = useMemo(() => {
    if (!predictions) return [];
    // Only show predictions where the match is finished
    return predictions.filter(p => p.match && p.match.status === 'finished').sort((a, b) => {
        if (!a.match || !b.match) return 0;
        return new Date(b.match.kickoffTime).getTime() - new Date(a.match.kickoffTime).getTime();
    });
  }, [predictions]);

  const groupedPredictions = useMemo(() => {
    const groups: Record<string, typeof finishedPredictions> = {};
    for (const pred of finishedPredictions) {
      if (!pred.match) continue;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateStr = formatInTimeZone(new Date(pred.match.kickoffTime), tz, 'dd MMM yyyy');
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(pred);
      } catch(e) {
        const dateStr = 'Unknown Date';
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(pred);
      }
    }
    return groups;
  }, [finishedPredictions]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Isi semua field password');
      return;
    }
    
    setIsSubmittingPassword(true);
    try {
      // @ts-expect-error changePassword might not be perfectly typed depending on plugin
      const res = await authClient.changePassword({
        newPassword,
        currentPassword,
      });
      if (res.error) {
        toast.error(res.error.message || 'Gagal mengganti password');
      } else {
        toast.success('Password berhasil diubah!');
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengganti password. Silakan coba lagi.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (isSessionLoading || isLeaderboardLoading || isPredictionsLoading) {
    return (
      <div className="relative z-10 max-w-lg mx-auto px-4 md:px-0 pb-10">
        <Skeleton className="h-12 w-48 my-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-lg mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0, 230, 118, 0.05) 0%, transparent 60%)' }}></div>

      {/* Header */}
      <header className="flex items-center justify-between py-6 relative z-10">
        <h1 className="font-display font-black tracking-tighter uppercase text-foreground text-3xl md:text-4xl">PROFIL</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* Player Card Profile */}
        <section className="relative">
          <div className="bg-card rounded-xl p-6 shadow-[0px_24px_48px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col items-center border border-border/50">
            {/* Diagonal Grid Background Accent */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #00E676 25%, transparent 25%, transparent 50%, #00E676 50%, #00E676 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }}></div>
            
            <div className="relative z-10 mb-4">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                <span className="font-display font-black text-4xl text-primary tracking-tighter">{session?.user?.name ? getInitials(session.user.name) : 'U'}</span>
              </div>
            </div>
            
            <h2 className="font-display font-black text-3xl tracking-tight uppercase text-foreground mb-1 z-10 relative">{session?.user?.name || 'User'}</h2>
            <p className="text-muted-foreground text-sm font-medium mb-6 z-10 relative">{session?.user?.email || 'user@email.com'}</p>
            
            {/* Stats Row */}
            <div className="flex w-full justify-between items-center bg-secondary/80 backdrop-blur-md rounded-lg p-4 z-10 relative border border-border/50">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-1">Poin</span>
                <span className="font-display font-bold text-2xl text-primary">{userStats?.totalPoints ?? 0}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-1">Peringkat</span>
                <span className="font-display font-bold text-2xl text-foreground">#{userStats?.rank ?? '-'}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-1">Sempurna</span>
                <span className="font-display font-bold text-xl text-yellow-400 flex items-center gap-1">
                  {userStats?.perfectScores ?? 0} <Star className="w-4 h-4 fill-yellow-400" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Prediction History */}
        <section>
          <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-sm"></span>
            RIWAYAT PREDIKSI
          </h3>
          
          {Object.keys(groupedPredictions).length === 0 ? (
            <div className="bg-card rounded-lg border border-border/50 p-6 text-center text-muted-foreground font-medium text-sm">
              Belum ada riwayat prediksi dari pertandingan yang selesai.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(groupedPredictions).map(([dateStr, preds]) => (
                <div key={dateStr}>
                  <div className="sticky top-16 md:top-20 z-20 bg-background/90 backdrop-blur-md py-2 mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{dateStr}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {preds.map(pred => {
                      const match = pred.match;
                      if (!match) return null;
                      
                      const points = pred.points ?? 0;
                      const isWin = points > 0;
                      const isPerfect = points === 3;
                      
                      return (
                        <div key={pred.id} className="bg-card rounded-lg p-4 border border-border/50 flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 w-1/3 min-w-0">
                              <Flag flag={match.flagA} size="sm" />
                              <span className="font-display text-xs md:text-sm font-bold text-foreground uppercase truncate">{match.teamA}</span>
                            </div>
                            <div className="font-display font-black text-xl md:text-2xl tracking-tighter text-foreground bg-secondary/50 px-3 py-1 rounded border border-border/30">
                              {pred.predictedA} - {pred.predictedB}
                            </div>
                            <div className="flex items-center gap-2 w-1/3 justify-end min-w-0">
                              <span className="font-display text-xs md:text-sm font-bold text-foreground uppercase truncate">{match.teamB}</span>
                              <Flag flag={match.flagB} size="sm" className="opacity-80" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center bg-background py-2 px-3 rounded border border-border/50">
                            <span className="text-xs text-muted-foreground font-medium">Hasil: {match.scoreA}-{match.scoreB}</span>
                            {isWin ? (
                              <span className={`text-xs font-bold ${isPerfect ? 'text-primary bg-primary/10' : 'text-cyan-400 bg-cyan-400/10'} px-2 py-1 rounded-sm flex items-center gap-1`}>
                                <Check className="w-3.5 h-3.5" /> +{points} PTS
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-sm flex items-center gap-1">
                                <X className="w-3.5 h-3.5" /> 0 PTS
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Account Settings */}
        <section>
          <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-border rounded-sm"></span>
            PENGATURAN AKUN
          </h3>
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden flex flex-col">
            <button 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left active:scale-[0.98]"
            >
              <span className="font-medium text-foreground text-sm">Ganti Password</span>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isChangingPassword ? 'rotate-90' : ''}`} />
            </button>
            
            {isChangingPassword && (
              <div className="p-4 border-t border-border/50 bg-secondary/20">
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground font-medium">Password Lama</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-background border border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground font-medium">Password Baru</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-background border border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmittingPassword}
                    className="mt-2 bg-primary text-primary-foreground py-2 rounded-md font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isSubmittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Password Baru'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Logout Button */}
        <div className="mt-4 pb-8">
          <button 
            onClick={handleLogout}
            className="w-full py-4 rounded border border-destructive text-destructive font-display font-bold uppercase tracking-widest text-sm hover:bg-destructive/10 transition-colors active:scale-[0.98] flex justify-center items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
        
      </div>
    </div>
  );
}
