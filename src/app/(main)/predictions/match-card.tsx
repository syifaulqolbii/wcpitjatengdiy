"use client";

import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '@/types';
import { Timer, Lock, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { useSubmitPrediction, useUpdatePrediction } from '@/hooks/usePredictions';
import { useSettings } from '@/hooks/useSettings';
import { Flag } from '@/components/shared/Flag';
import { STAGE_SCORING } from '@/lib/scoring-engine';

export function MatchCard({ match, prediction }: { match: Match; prediction?: Prediction }) {
  const [predictedA, setPredictedA] = useState<string>(prediction?.predictedA?.toString() ?? '');
  const [predictedB, setPredictedB] = useState<string>(prediction?.predictedB?.toString() ?? '');
  const [, forceTick] = useState(0);

  const submitMut = useSubmitPrediction();
  const updateMut = useUpdatePrediction();
  const { data: settings } = useSettings();
  const lockInMinutes = settings?.lockInMinutes ? parseInt(settings.lockInMinutes, 10) : 15;

  useEffect(() => {
    if (prediction) {
      setPredictedA(prediction.predictedA.toString());
      setPredictedB(prediction.predictedB.toString());
    }
  }, [prediction]);

  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const lockOffsetMs = lockInMinutes * 60 * 1000;
  const isLocked = new Date(match.kickoffTime).getTime() - lockOffsetMs <= Date.now();
  const isFinished = match.status === 'finished';

  const timeUntilLock = new Date(match.kickoffTime).getTime() - lockOffsetMs - Date.now();
  const daysUntilLock = Math.max(0, Math.floor(timeUntilLock / (1000 * 60 * 60 * 24)));
  const hoursUntilLock = Math.max(0, Math.floor((timeUntilLock % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minsUntilLock = Math.max(0, Math.floor((timeUntilLock % (1000 * 60 * 60)) / (1000 * 60)));

  const lockLabel = daysUntilLock > 0
    ? `Kunci dalam ${daysUntilLock} hari ${hoursUntilLock} jam ${minsUntilLock} menit`
    : hoursUntilLock > 0
      ? `Kunci dalam ${hoursUntilLock} jam ${minsUntilLock} menit`
      : `Kunci dalam ${minsUntilLock} menit`;

  const handleSave = () => {
    if (!predictedA || !predictedB) return;
    const a = parseInt(predictedA, 10);
    const b = parseInt(predictedB, 10);
    if (isNaN(a) || isNaN(b)) return;

    if (prediction?.id && prediction.id !== 'temp-id') {
      updateMut.mutate({ id: prediction.id, predictedA: a, predictedB: b });
    } else {
      submitMut.mutate({ matchId: match.id, predictedA: a, predictedB: b });
    }
  };

  const isSubmitting = submitMut.isPending || updateMut.isPending;
  const compactTeamNameClass = "min-w-0 max-w-full font-display text-xs md:text-xl font-bold text-muted-foreground uppercase leading-tight break-words";
  const lockedTeamNameClass = "min-w-0 max-w-full font-display text-xs md:text-xl font-black text-muted-foreground tracking-tight uppercase leading-tight break-words";
  const activeTeamNameClass = "min-w-0 max-w-full font-display text-sm md:text-2xl font-black tracking-tight text-foreground uppercase leading-tight break-words";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a safe empty placeholder that will always match SSR
    return (
      <div className="bg-card rounded-xl p-6 h-[250px] flex flex-col relative overflow-hidden border border-border/50 opacity-50"></div>
    );
  }

  if (isFinished) {
    const points = prediction?.points ?? 0;
    const isWin = points > 0;
    return (
      <div className="bg-card rounded-xl flex flex-col relative overflow-hidden border border-border/50">
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
              <span className={compactTeamNameClass}>{match.teamA}</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-5 px-3 md:px-6 py-2 bg-secondary/50 rounded-lg shadow-inner border border-border/30">
              <div className={`text-2xl md:text-3xl font-display font-black ${isWin ? 'text-muted-foreground' : 'text-foreground'}`}>{match.scoreA}</div>
              <span className="text-border font-bold text-sm">—</span>
              <div className={`text-2xl md:text-3xl font-display font-black ${isWin ? 'text-primary' : 'text-foreground'}`}>{match.scoreB}</div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 justify-end min-w-0 text-right">
              <span className={`${compactTeamNameClass} ${isWin ? 'text-primary drop-shadow-[0_0_10px_rgba(0,230,118,0.3)]' : 'text-muted-foreground'}`}>{match.teamB}</span>
              <Flag flag={match.flagB} size="md" className="w-7 shrink-0 md:w-12" />
            </div>
          </div>
          
          {prediction ? (
             <div className="mt-2 pt-3 border-t border-border/50 flex justify-between items-center bg-secondary/30 -mx-5 px-5 -mb-5 pb-5">
              <span className="text-xs text-muted-foreground font-medium">Prediksimu</span>
              <span className="text-sm font-display font-bold text-muted-foreground tracking-wider text-right">{match.teamA} {prediction.predictedA} - {prediction.predictedB} {match.teamB}</span>
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
  }

  if (isLocked) {
    return (
      <div className="bg-card/50 rounded-xl p-6 flex flex-col relative overflow-hidden border border-border/30">
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-20 pointer-events-none"></div>
        
        <div className="flex justify-center items-center mb-6 z-10 relative">
          <div className="bg-secondary text-muted-foreground px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-border/50">
            <Lock className="w-3.5 h-3.5" />
            Terkunci
          </div>
        </div>
        
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 md:gap-4 z-10 relative opacity-60">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center">
            <Flag flag={match.flagA} size="lg" className="w-14 shrink-0 grayscale md:w-20" />
            <span className={lockedTeamNameClass}>{match.teamA}</span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-4">
            <div className="w-10 h-12 md:w-14 md:h-16 bg-secondary/80 rounded-md flex items-center justify-center text-2xl md:text-3xl font-display font-black text-muted-foreground border border-border/50">{prediction?.predictedA ?? '-'}</div>
            <span className="text-muted-foreground/40 font-black text-lg md:text-xl">:</span>
            <div className="w-10 h-12 md:w-14 md:h-16 bg-secondary/80 rounded-md flex items-center justify-center text-2xl md:text-3xl font-display font-black text-muted-foreground border border-border/50">{prediction?.predictedB ?? '-'}</div>
          </div>
          
          <div className="flex min-w-0 flex-col items-center gap-2 text-center">
            <Flag flag={match.flagB} size="lg" className="w-14 shrink-0 grayscale md:w-20" />
            <span className={lockedTeamNameClass}>{match.teamB}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 flex flex-col relative overflow-hidden group border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-8 z-10">
        <div className="text-primary text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
          <Timer className="w-4 h-4" />
          {lockLabel}
        </div>
        {match.stage !== 'group_stage' && (
          <div className="flex items-center gap-1 bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-500/30">
            <Flame className="w-3.5 h-3.5" />
            MAX {(STAGE_SCORING[match.stage] ?? STAGE_SCORING.group_stage).perfectScore} PTS
          </div>
        )}
      </div>
      
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 md:gap-6 z-10 mb-8">
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
          <Flag flag={match.flagA} size="xl" className="w-16 shrink-0 md:w-36" />
          <span className={activeTeamNameClass}>{match.teamA}</span>
        </div>
        
        <div className="flex items-center gap-1 md:gap-4 bg-secondary/50 p-1.5 md:p-3 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border border-border/50">
          <input 
            type="number" 
            placeholder="-" 
            value={predictedA}
            onChange={(e) => setPredictedA(e.target.value)}
            min="0"
            className="w-9 h-14 md:w-16 md:h-20 bg-transparent rounded text-center text-2xl md:text-4xl font-display font-black text-foreground border-none focus:ring-0 focus:outline focus:outline-primary/50 focus:outline-offset-0 focus:bg-secondary transition-colors placeholder:text-muted-foreground/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
          />
          <span className="text-muted-foreground/50 font-black text-lg md:text-xl">:</span>
          <input 
            type="number" 
            placeholder="-" 
            value={predictedB}
            onChange={(e) => setPredictedB(e.target.value)}
            min="0"
            className="w-9 h-14 md:w-16 md:h-20 bg-transparent rounded text-center text-2xl md:text-4xl font-display font-black text-foreground border-none focus:ring-0 focus:outline focus:outline-primary/50 focus:outline-offset-0 focus:bg-secondary transition-colors placeholder:text-muted-foreground/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
          />
        </div>
        
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
          <Flag flag={match.flagB} size="xl" className="w-16 shrink-0 md:w-36" />
          <span className={activeTeamNameClass}>{match.teamB}</span>
        </div>
      </div>
      
      <button 
        onClick={handleSave}
        disabled={isSubmitting || !predictedA || !predictedB}
        className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold uppercase tracking-widest hover:shadow-[0_0_24px_rgba(0,230,118,0.3)] hover:-translate-y-0.5 transition-all duration-200 z-10 text-sm disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
      >
        {isSubmitting ? 'Menyimpan...' : (prediction ? 'Update Prediksi' : 'Simpan Prediksi')}
      </button>
    </div>
  );
}
