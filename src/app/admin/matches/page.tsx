"use client";

import React, { useState } from 'react';
import { PlusSquare, Edit, Trash2, Flag as LucideFlag, Zap, X, Loader2, Save, Eye } from 'lucide-react';
import { useMatches, useUpdateMatch, useDeleteMatch, useCreateMatch } from '@/hooks/useMatches';
import { useMatchPredictions } from '@/hooks/usePredictions';
import { Match } from '@/types';
import { Flag as CountryFlag } from '@/components/shared/Flag';
import { formatInTimeZone } from 'date-fns-tz';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type ModalType = 'input' | 'edit' | 'create' | null;

export default function AdminMatchesPage() {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');

  // Form states for Create/Edit
  const [formData, setFormData] = useState<Partial<Match>>({
    teamA: '', teamB: '', flagA: '', flagB: '', group: '', kickoffTime: new Date()
  });

  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [calcProgress, setCalcProgress] = useState({ current: 0, total: 0, isCalculating: false });

  const { data: matches, isLoading } = useMatches();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const createMatch = useCreateMatch();
  const { data: matchPredictions, isLoading: isPredictionsLoading } = useMatchPredictions(
    isDetailModalOpen ? selectedMatch?.id : undefined
  );

  const handleOpenDetailModal = (match: Match) => {
    setSelectedMatch(match);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMatch(null);
  };

  const getPredictionOutcome = (predictedA: number, predictedB: number, match: Match) => {
    if (predictedA > predictedB) return `${match.teamA} menang`;
    if (predictedB > predictedA) return `${match.teamB} menang`;
    return 'Seri';
  };

  const handleOpenInputModal = (match: Match) => {
    setSelectedMatch(match);
    setScoreA(match.scoreA?.toString() ?? '');
    setScoreB(match.scoreB?.toString() ?? '');
    setModalType('input');
  };

  const handleOpenEditModal = (match: Match) => {
    setSelectedMatch(match);
    setFormData({
      teamA: match.teamA, teamB: match.teamB, flagA: match.flagA, flagB: match.flagB, 
      group: match.group, kickoffTime: match.kickoffTime, status: match.status
    });
    setModalType('edit');
  };

  const handleOpenCreateModal = () => {
    setSelectedMatch(null);
    setFormData({
      teamA: '', teamB: '', flagA: '', flagB: '', group: '', kickoffTime: new Date(), status: 'upcoming'
    });
    setModalType('create');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedMatch(null);
  };

  const handleSaveScore = async () => {
    if (!selectedMatch) return;
    if (scoreA === '' || scoreB === '') {
      toast.error('Skor tidak boleh kosong');
      return;
    }

    const a = parseInt(scoreA, 10);
    const b = parseInt(scoreB, 10);

    if (isNaN(a) || isNaN(b)) {
      toast.error('Skor harus berupa angka');
      return;
    }

    try {
      await updateMatch.mutateAsync({
        id: selectedMatch.id,
        scoreA: a,
        scoreB: b,
      });
      handleCloseModal();
    } catch {
      // Error handled by hook
    }
  };

  const handleSaveMatch = async () => {
    try {
      if (modalType === 'create') {
        await createMatch.mutateAsync(formData as Match);
      } else if (modalType === 'edit' && selectedMatch) {
        await updateMatch.mutateAsync({ id: selectedMatch.id, ...formData });
      }
      handleCloseModal();
    } catch {
      // Handled by hook
    }
  };

  const handleDelete = async (match?: Match) => {
    const targetMatch = match || selectedMatch;
    if (!targetMatch) return;
    
    if (confirm('Yakin ingin menghapus pertandingan ini? Pastikan belum ada prediksi untuk pertandingan ini.')) {
      try {
        await deleteMatch.mutateAsync(targetMatch.id);
        if (selectedMatch?.id === targetMatch.id) {
          handleCloseModal();
        }
      } catch {
        // Handled by hook
      }
    }
  };

  const handleCalculateAll = async () => {
    if (!matches) return;
    const finishedMatches = matches.filter(m => m.status === 'finished');
    if (finishedMatches.length === 0) {
      toast.info("Tidak ada match dengan status Selesai untuk dihitung.");
      setIsCalcModalOpen(false);
      return;
    }
    
    setCalcProgress({ current: 0, total: finishedMatches.length, isCalculating: true });
    
    let successCount = 0;
    for (let i = 0; i < finishedMatches.length; i++) {
      try {
        await fetch(`/api/matches/${finishedMatches[i].id}/calculate`, { method: 'POST' });
        successCount++;
      } catch (e) {
        console.error(e);
      }
      setCalcProgress(prev => ({ ...prev, current: i + 1 }));
    }
    
    toast.success(`Kalkulasi selesai untuk ${successCount} match`);
    setCalcProgress({ current: 0, total: 0, isCalculating: false });
    setIsCalcModalOpen(false);
  };

  return (
    <>
      <header className="px-10 pt-12 pb-8 flex justify-between items-end relative z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent opacity-50 -z-10 h-48"></div>
        <div>
          <h2 className="font-display font-black text-4xl tracking-tighter text-foreground uppercase drop-shadow-md">MANAJEMEN PERTANDINGAN</h2>
          <p className="font-sans text-muted-foreground text-sm mt-1 uppercase tracking-widest">Jadwal & Hasil Pertandingan</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-primary text-background font-display font-bold text-sm px-6 py-3 rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,230,118,0.25)] transition-all flex items-center"
        >
          <PlusSquare className="mr-2 w-5 h-5" />
          Tambah Match
        </button>
      </header>

      <section className="px-10 pb-24 flex-1 flex flex-col relative">
        <div className="bg-card rounded-lg flex-1 flex flex-col overflow-hidden relative shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-border/50">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border/50 text-muted-foreground font-sans text-xs uppercase tracking-widest">
                  <th className="py-4 px-6 font-medium">Grup/Babak</th>
                  <th className="py-4 px-6 font-medium">Tim A vs Tim B</th>
                  <th className="py-4 px-6 font-medium">Tanggal & Waktu</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium text-center">Hasil</th>
                  <th className="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-sans text-sm divide-y divide-border/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center">
                      <Skeleton className="h-8 w-full max-w-2xl mx-auto mb-2" />
                      <Skeleton className="h-8 w-full max-w-2xl mx-auto" />
                    </td>
                  </tr>
                ) : matches?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-muted-foreground">
                      Belum ada data pertandingan.
                    </td>
                  </tr>
                ) : (
                  matches?.map((match) => {
                    const isFinished = match.status === 'finished';
                    const isLive = match.status === 'live';
                    const isUpcoming = match.status === 'upcoming';

                    let statusUI = (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border/50 capitalize">
                        {match.status}
                      </span>
                    );

                    if (isUpcoming) {
                      statusUI = (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border/50">
                          Upcoming
                        </span>
                      );
                    } else if (isLive) {
                      statusUI = (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/50 shadow-[0_0_10px_rgba(255,113,108,0.5)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse"></span>
                          Live
                        </span>
                      );
                    } else if (isFinished) {
                      statusUI = (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                          Selesai
                        </span>
                      );
                    }

                    return (
                      <tr key={match.id} className="hover:bg-secondary/30 transition-colors group relative overflow-hidden">
                        {isLive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>}
                        <td className="py-5 px-6">
                          <span className="bg-secondary/80 px-2 py-1 rounded text-foreground font-display text-xs uppercase">{match.group}</span>
                        </td>
                        <td className="py-5 px-6 font-display text-lg tracking-tight">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-foreground">{match.teamA}</span>
                            <span className="text-muted-foreground text-xs font-sans">vs</span>
                            <span className="font-bold text-foreground">{match.teamB}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-muted-foreground">
                          <div className="font-medium text-foreground">
                            {formatInTimeZone(new Date(match.kickoffTime), Intl.DateTimeFormat().resolvedOptions().timeZone, 'dd MMM yyyy')}
                          </div>
                          <div className="text-xs font-sans">
                            {formatInTimeZone(new Date(match.kickoffTime), Intl.DateTimeFormat().resolvedOptions().timeZone, 'HH:mm')}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          {statusUI}
                        </td>
                        <td className="py-5 px-6 text-center text-muted-foreground font-display text-lg">
                          {isFinished || isLive ? (
                            <span className={isLive ? 'text-destructive font-black text-xl' : 'text-foreground font-bold text-xl'}>
                              {match.scoreA} : {match.scoreB}
                            </span>
                          ) : (
                            "- : -"
                          )}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenDetailModal(match)}
                              className="p-2 text-cyan-300 hover:text-cyan-200 transition-colors rounded bg-background flex items-center justify-center border border-cyan-300/30"
                              title="Detail Prediksi"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenInputModal(match)}
                              className="p-2 text-primary hover:text-primary transition-colors rounded bg-secondary/80 flex items-center justify-center border border-primary/20 shadow-[0_0_8px_rgba(0,230,118,0.2)]" 
                              title="Input Hasil"
                            >
                              <LucideFlag className="w-4 h-4" />
                            </button>
                            {(isLive || isUpcoming) && (
                              <button 
                                onClick={() => handleOpenEditModal(match)}
                                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded bg-background flex items-center justify-center border border-border/50" 
                                title="Edit Match"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(match)}
                              disabled={deleteMatch.isPending}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded bg-background flex items-center justify-center border border-border/50 disabled:opacity-50" 
                              title="Hapus Match"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={handleOpenCreateModal}
            className="text-muted-foreground font-display font-bold text-sm px-6 py-3 rounded uppercase tracking-wider hover:text-foreground hover:bg-secondary transition-all flex items-center border border-border/50"
          >
            <PlusSquare className="mr-2 w-5 h-5" />
            New Match
          </button>
        </div>
      </section>

      {/* FIXED GLOBAL CALCULATE BUTTON */}
      <div className="fixed bottom-10 right-10 z-40">
        <button 
           onClick={() => setIsCalcModalOpen(true)}
           className="bg-amber-500 text-background font-display font-bold text-sm px-6 py-4 rounded-full uppercase tracking-wider hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all flex items-center shadow-xl border-2 border-amber-600/50"
        >
          <Zap className="mr-2 w-5 h-5" />
          Trigger Kalkulasi Poin
        </button>
      </div>

      {/* MODAL OVERLAY: CALCULATION PROGRESS */}
      {isCalcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => !calcProgress.isCalculating && setIsCalcModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-card rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] border border-border/50 overflow-hidden flex flex-col p-8 items-center text-center">
             <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
             </div>
             
             {!calcProgress.isCalculating && calcProgress.current === 0 ? (
               <>
                 <h3 className="font-display font-bold text-2xl tracking-tighter text-foreground mb-4 uppercase">Mulai Kalkulasi?</h3>
                 <p className="text-muted-foreground font-sans text-sm mb-8">
                   Hitung poin untuk SEMUA match yang sudah selesai dan belum terkalkul?
                 </p>
                 <div className="flex w-full gap-4">
                   <button onClick={() => setIsCalcModalOpen(false)} className="flex-1 bg-secondary text-foreground font-display font-bold py-3 rounded uppercase tracking-wider hover:bg-secondary/80 transition-colors">
                     Batal
                   </button>
                   <button onClick={handleCalculateAll} className="flex-1 bg-amber-500 text-background font-display font-bold py-3 rounded uppercase tracking-wider hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-colors">
                     Ya, Hitung Semua
                   </button>
                 </div>
               </>
             ) : (
               <>
                 <h3 className="font-display font-bold text-xl tracking-tighter text-foreground mb-4 uppercase">Kalkulasi Berjalan</h3>
                 <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(calcProgress.current / calcProgress.total) * 100}%` }}></div>
                 </div>
                 <p className="text-muted-foreground font-sans text-sm font-bold flex items-center justify-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Menghitung {calcProgress.current}/{calcProgress.total} match...
                 </p>
               </>
             )}
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: DETAIL PREDIKSI */}
      {isDetailModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleCloseDetailModal}></div>

          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-8 py-6">
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">Detail Prediksi</h3>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <CountryFlag flag={selectedMatch.flagA} size="sm" />
                  <span className="font-display font-bold uppercase text-foreground">{selectedMatch.teamA}</span>
                  <span>vs</span>
                  <span className="font-display font-bold uppercase text-foreground">{selectedMatch.teamB}</span>
                  <CountryFlag flag={selectedMatch.flagB} size="sm" />
                </div>
              </div>
              <button onClick={handleCloseDetailModal} className="text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-8">
              {isPredictionsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : !matchPredictions || matchPredictions.length === 0 ? (
                <div className="rounded-lg border border-border/50 bg-background/40 p-8 text-center">
                  <p className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Belum ada prediksi untuk match ini.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 text-center font-medium">Prediksi</th>
                        <th className="px-4 py-3 font-medium">Outcome</th>
                        <th className="px-4 py-3 text-center font-medium">Poin</th>
                        <th className="px-4 py-3 text-right font-medium">Submit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {matchPredictions.map((prediction) => (
                        <tr key={prediction.id} className="bg-card/40">
                          <td className="px-4 py-4">
                            <div className="font-display font-bold uppercase text-foreground">{prediction.user?.name ?? 'Unknown User'}</div>
                            <div className="text-xs text-muted-foreground">{prediction.user?.email}</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center rounded-md bg-secondary px-3 py-1 font-display text-base font-black text-foreground">
                              {prediction.predictedA} : {prediction.predictedB}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                              {getPredictionOutcome(prediction.predictedA, prediction.predictedB, selectedMatch)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={prediction.points && prediction.points > 0 ? 'font-display font-black text-primary' : 'font-display font-bold text-muted-foreground'}>
                              {prediction.points ?? '-'} pts
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-xs text-muted-foreground">
                            {formatInTimeZone(new Date(prediction.submittedAt), Intl.DateTimeFormat().resolvedOptions().timeZone, 'dd MMM yyyy HH:mm')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: INPUT HASIL / CREATE / EDIT */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleCloseModal}></div>
          
          <div className="relative w-full max-w-lg bg-card rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border/50 bg-secondary/30 flex justify-between items-center">
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
                {modalType === 'input' ? 'Input Hasil' : modalType === 'create' ? 'Tambah Match' : 'Edit Match'}
              </h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col relative overflow-y-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-20 pointer-events-none"></div>
              
              {modalType === 'input' ? (
                <div className="flex items-center justify-center w-full gap-6 relative z-10">
                  <div className="flex flex-col items-center">
                    <div className="font-display text-lg md:text-2xl font-black mb-4 tracking-tighter text-foreground flex items-center gap-2 max-w-48 text-center leading-tight">
                      <CountryFlag flag={selectedMatch?.flagA ?? ''} size="md" /> {selectedMatch?.teamA.toUpperCase()}
                    </div>
                    <input 
                      aria-label="Score Team A" 
                      className="w-24 h-28 bg-secondary border-none rounded-lg text-center font-display text-5xl font-black text-primary focus:ring-1 focus:ring-border focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                      min="0" 
                      type="number" 
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                    />
                  </div>
                  
                  <div className="font-display text-xl font-bold text-muted-foreground opacity-50 px-4 mt-12">
                    VS
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="font-display text-lg md:text-2xl font-black mb-4 tracking-tighter text-foreground flex items-center gap-2 max-w-48 text-center leading-tight">
                      {selectedMatch?.teamB.toUpperCase()} <CountryFlag flag={selectedMatch?.flagB ?? ''} size="md" />
                    </div>
                    <input 
                      aria-label="Score Team B" 
                      className="w-24 h-28 bg-secondary border-none rounded-lg text-center font-display text-5xl font-black text-foreground focus:ring-1 focus:ring-border focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                      min="0" 
                      type="number" 
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Grup/Babak</label>
                      <input 
                        className="w-full bg-secondary border-none rounded text-sm p-3 focus:ring-1 focus:ring-primary outline-none" 
                        placeholder="Group A"
                        value={formData.group}
                        onChange={e => setFormData({...formData, group: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Waktu (Lokal)</label>
                      <input 
                        type="datetime-local"
                        className="w-full bg-secondary border-none rounded text-sm p-3 focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]" 
                        value={formData.kickoffTime ? new Date(new Date(formData.kickoffTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                        onChange={e => setFormData({...formData, kickoffTime: new Date(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 items-end border border-border/30 p-4 rounded-lg bg-secondary/20">
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-sm uppercase text-foreground">Tim A (Home)</h4>
                      <div>
                        <label className="block text-[10px] uppercase text-muted-foreground mb-1">Nama Negara</label>
                        <input className="w-full bg-secondary border-none rounded text-sm p-2" value={formData.teamA} onChange={e => setFormData({...formData, teamA: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-muted-foreground mb-1">Emoji Bendera</label>
                        <input className="w-full bg-secondary border-none rounded text-sm p-2" value={formData.flagA} onChange={e => setFormData({...formData, flagA: e.target.value})} placeholder="🇩🇪" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-sm uppercase text-foreground text-right">Tim B (Away)</h4>
                      <div>
                        <label className="block text-[10px] uppercase text-muted-foreground mb-1 text-right">Nama Negara</label>
                        <input className="w-full bg-secondary border-none rounded text-sm p-2 text-right" value={formData.teamB} onChange={e => setFormData({...formData, teamB: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-muted-foreground mb-1 text-right">Emoji Bendera</label>
                        <input className="w-full bg-secondary border-none rounded text-sm p-2 text-right" value={formData.flagB} onChange={e => setFormData({...formData, flagB: e.target.value})} placeholder="🇦🇷" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</label>
                    <select 
                      className="w-full bg-secondary border-none rounded text-sm p-3 focus:ring-1 focus:ring-primary outline-none appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as Match['status']})}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="finished">Finished</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-8 py-6 bg-background/50 flex flex-col gap-3">
              <div className="flex justify-end gap-3 w-full">
                <button onClick={handleCloseModal} className="bg-secondary text-foreground font-display font-bold text-sm px-6 py-3 rounded uppercase tracking-wider hover:bg-secondary/80 transition-colors border border-border/50">
                  Batal
                </button>
                <button 
                  onClick={modalType === 'input' ? handleSaveScore : handleSaveMatch} 
                  disabled={updateMatch.isPending || createMatch.isPending} 
                  className="bg-primary text-background font-display font-bold text-sm px-8 py-3 rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all flex items-center"
                >
                  {(updateMatch.isPending || createMatch.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (modalType === 'input' ? null : <Save className="w-4 h-4 mr-2" />)}
                  Simpan
                </button>
              </div>

              {/* Hapus Match diletakkan di bawah form edit */}
              {modalType === 'edit' && selectedMatch && (
                <button 
                  onClick={() => handleDelete(selectedMatch)}
                  disabled={deleteMatch.isPending}
                  className="w-full mt-2 py-3 border border-destructive/30 text-destructive bg-destructive/5 rounded flex items-center justify-center font-display uppercase text-sm font-bold hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Match Ini
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
