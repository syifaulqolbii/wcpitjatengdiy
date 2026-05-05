"use client";

import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '@/types';
import { Timer, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { useSubmitPrediction, useUpdatePrediction } from '@/hooks/usePredictions';
import { Flag } from '@/components/shared/Flag';

export function MatchCard({ match, prediction }: { match: Match; prediction?: Prediction }) {
  const [predictedA, setPredictedA] = useState<string>(prediction?.predictedA?.toString() ?? '');
  const [predictedB, setPredictedB] = useState<string>(prediction?.predictedB?.toString() ?? '');

  const submitMut = useSubmitPrediction();
  const updateMut = useUpdatePrediction();

  useEffect(() => {
    if (prediction) {
      setPredictedA(prediction.predictedA.toString());
      setPredictedB(prediction.predictedB.toString());
    }
  }, [prediction]);

  const isLocked = new Date(match.kickoffTime).getTime() - 15 * 60 * 1000 <= Date.now();
  const isFinished = match.status === 'finished';

  const timeUntilLock = new Date(match.kickoffTime).getTime() - 15 * 60 * 1000 - Date.now();
  const hoursUntilLock = Math.max(0, Math.floor(timeUntilLock / (1000 * 60 * 60)));
  const minsUntilLock = Math.max(0, Math.floor((timeUntilLock % (1000 * 60 * 60)) / (1000 * 60)));

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
  const compactTeamNameClass = "font-display text-sm md:text-xl font-bold text-muted-foreground uppercase leading-tight break-words max-w-28 md:max-w-40";
  const lockedTeamNameClass = "font-display text-sm md:text-xl font-black text-muted-foreground tracking-tight uppercase leading-tight break-words max-w-28 md:max-w-40";
  const activeTeamNameClass = "font-display text-base md:text-2xl font-black tracking-tight text-foreground uppercase leading-tight break-words max-w-32 md:max-w-48";

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
          
          <div className="flex justify-between items-center w-full mb-4">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <Flag flag={match.flagA} size="md" className="opacity-80" />
              <span className={compactTeamNameClass}>{match.teamA}</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-5 px-4 md:px-6 py-2 bg-secondary/50 rounded-lg shadow-inner border border-border/30">
              <div className={`text-2xl md:text-3xl font-display font-black ${isWin ? 'text-muted-foreground' : 'text-foreground'}`}>{match.scoreA}</div>
              <span className="text-border font-bold text-sm">—</span>
              <div className={`text-2xl md:text-3xl font-display font-black ${isWin ? 'text-primary' : 'text-foreground'}`}>{match.scoreB}</div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end min-w-0 text-right">
              <span className={`${compactTeamNameClass} ${isWin ? 'text-primary drop-shadow-[0_0_10px_rgba(0,230,118,0.3)]' : 'text-muted-foreground'}`}>{match.teamB}</span>
              <Flag flag={match.flagB} size="md" />
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
        
        <div className="flex justify-between items-center w-full z-10 relative opacity-60">
          <div className="flex flex-col items-center gap-2 flex-1 text-center">
            <Flag flag={match.flagA} size="lg" className="grayscale" />
            <span className={lockedTeamNameClass}>{match.teamA}</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-12 h-14 md:w-14 md:h-16 bg-secondary/80 rounded-md flex items-center justify-center text-2xl md:text-3xl font-display font-black text-muted-foreground border border-border/50">{prediction?.predictedA ?? '-'}</div>
            <span className="text-muted-foreground/40 font-black text-lg md:text-xl">:</span>
            <div className="w-12 h-14 md:w-14 md:h-16 bg-secondary/80 rounded-md flex items-center justify-center text-2xl md:text-3xl font-display font-black text-muted-foreground border border-border/50">{prediction?.predictedB ?? '-'}</div>
          </div>
          
          <div className="flex flex-col items-center gap-2 flex-1 text-center">
            <Flag flag={match.flagB} size="lg" className="grayscale" />
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
          {hoursUntilLock > 0 ? `Kunci dalam ${hoursUntilLock}j ${minsUntilLock}m` : `Kunci dalam ${minsUntilLock}m`}
        </div>
      </div>
      
      <div className="flex justify-between items-center w-full z-10 mb-8">
        <div className="flex flex-col items-center gap-3 flex-1 text-center">
          <Flag flag={match.flagA} size="xl" />
          <span className={activeTeamNameClass}>{match.teamA}</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 bg-secondary/50 p-2 md:p-3 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border border-border/50">
          <input 
            type="number" 
            placeholder="-" 
            value={predictedA}
            onChange={(e) => setPredictedA(e.target.value)}
            min="0"
            className="w-12 h-16 md:w-16 md:h-20 bg-transparent rounded text-center text-3xl md:text-4xl font-display font-black text-foreground border-none focus:ring-0 focus:outline focus:outline-primary/50 focus:outline-offset-0 focus:bg-secondary transition-colors placeholder:text-muted-foreground/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
          />
          <span className="text-muted-foreground/50 font-black text-lg md:text-xl">:</span>
          <input 
            type="number" 
            placeholder="-" 
            value={predictedB}
            onChange={(e) => setPredictedB(e.target.value)}
            min="0"
            className="w-12 h-16 md:w-16 md:h-20 bg-transparent rounded text-center text-3xl md:text-4xl font-display font-black text-foreground border-none focus:ring-0 focus:outline focus:outline-primary/50 focus:outline-offset-0 focus:bg-secondary transition-colors placeholder:text-muted-foreground/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
          />
        </div>
        
        <div className="flex flex-col items-center gap-3 flex-1 text-center">
          <Flag flag={match.flagB} size="xl" />
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
