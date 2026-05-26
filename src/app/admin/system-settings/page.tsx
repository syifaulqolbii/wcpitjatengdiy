"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Info, Link as LinkIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useAllTournamentPredictions, useCalculateChampionPoints } from '@/hooks/useTournamentPrediction';
import { WC2026_TEAMS } from '@/lib/wc2026-teams';
import { Flag } from '@/components/shared/Flag';
import { toast } from 'sonner';

const settingsSchema = z.object({
  perfectScore: z.coerce.number().int().min(1, "Minimal 1").max(10, "Maksimal 10"),
  correctResult: z.coerce.number().int().min(0, "Minimal 0"),
  wrongPrediction: z.coerce.number().int(),
  lockInMinutes: z.coerce.number().int().min(5, "Minimal 5").max(60, "Maksimal 60"),
  inviteEnabled: z.boolean(),
  invitation_code: z.string().min(6, 'Minimal 6 karakter').max(30, 'Maksimal 30 karakter').regex(/^[a-zA-Z0-9]+$/, 'Hanya huruf dan angka'),
});

type SettingsFormData = z.output<typeof settingsSchema>;
type SettingsFormInput = z.input<typeof settingsSchema>;

function utcToWibInput(isoUtc: string) {
  const date = new Date(isoUtc);
  if (Number.isNaN(date.getTime())) return '';
  const wibMs = date.getTime() + (7 * 60 * 60 * 1000);
  return new Date(wibMs).toISOString().slice(0, 16);
}

function wibInputToUtcIso(localValue: string) {
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  const utcMs = date.getTime() - (7 * 60 * 60 * 1000);
  return new Date(utcMs).toISOString();
}

export default function AdminSystemSettingsPage() {
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [origin, setOrigin] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [championPoints, setChampionPoints] = useState('30');
  const [championDeadlineWib, setChampionDeadlineWib] = useState('');
  const [championWinner, setChampionWinner] = useState('');

  const calculateChampionPoints = useCalculateChampionPoints();
  const selectedChampionTeam = WC2026_TEAMS.find((team) => team.name === championWinner) || null;
  const { data: allChampionPredictions } = useAllTournamentPredictions(
    Boolean(settings?.champion_deadline && new Date() >= new Date(settings.champion_deadline))
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<SettingsFormInput, unknown, SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      perfectScore: 3,
      correctResult: 1,
      wrongPrediction: 0,
      lockInMinutes: 15,
      inviteEnabled: true,
      invitation_code: '',
    }
  });

  // Keep perfectScore watch to validate correctResult dynamically
  watch("perfectScore");
  watch("inviteEnabled");

  useEffect(() => {
    if (settings) {
      reset({
        perfectScore: parseInt(settings.perfectScore, 10),
        correctResult: parseInt(settings.correctResult, 10),
        wrongPrediction: parseInt(settings.wrongPrediction, 10),
        lockInMinutes: parseInt(settings.lockInMinutes, 10),
        inviteEnabled: settings.inviteEnabled === 'true',
        invitation_code: settings.invitation_code || '',
      });
      setChampionPoints(settings.champion_points || '30');
      setChampionDeadlineWib(utcToWibInput(settings.champion_deadline || '2026-06-10T19:00:00Z'));
      setChampionWinner(settings.champion_winner || '');
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    if (data.correctResult >= data.perfectScore) {
      toast.error("Correct Result harus kurang dari Perfect Score");
      return;
    }
    
    try {
      await updateSettings.mutateAsync({
        perfectScore: data.perfectScore.toString(),
        correctResult: data.correctResult.toString(),
        wrongPrediction: data.wrongPrediction.toString(),
        lockInMinutes: data.lockInMinutes.toString(),
        inviteEnabled: data.inviteEnabled.toString(),
        invitation_code: data.invitation_code,
      });
      // The reset happens automatically via useQuery invalidate, or we can manually reset to clean isDirty
      reset(data);
      toast.success('Kode undangan berhasil diperbarui');
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveChampionPoints = async () => {
    const parsed = Number(championPoints);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error('Poin bonus harus angka bulat minimal 0');
      return;
    }

    await updateSettings.mutateAsync({ champion_points: String(parsed) });
  };

  const handleSaveChampionDeadline = async () => {
    const utcIso = wibInputToUtcIso(championDeadlineWib);
    if (!utcIso) {
      toast.error('Deadline tidak valid');
      return;
    }

    await updateSettings.mutateAsync({ champion_deadline: utcIso });
  };

  const handleCalculateChampionPoints = async () => {
    if (!championWinner) {
      toast.error('Pilih tim juara terlebih dulu');
      return;
    }

    const selectedTeam = WC2026_TEAMS.find((team) => team.name === championWinner);
    const confirmed = window.confirm(
      `Kalkulasi poin bonus untuk tebakan juara?\nJuara: ${selectedTeam?.flag || ''} ${championWinner}\nAksi ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      const result = await calculateChampionPoints.mutateAsync({ winner: championWinner });
      toast.success(`Kalkulasi selesai! ${result.correct} user benar, ${result.wrong} user salah`);
    } catch {
      // handled by global mutation error
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = `${origin}/login?mode=register&inv=${settings?.invitation_code || ''}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const inviteUrl = `${origin}/login?mode=register&inv=${settings?.invitation_code || ''}`;

  if (isSettingsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center px-10 py-6 sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-foreground">SYSTEM CONFIGURATION</h2>
            <span className="bg-secondary text-muted-foreground font-sans text-xs px-2 py-1 rounded tracking-widest uppercase border border-border/30">Admin View</span>
          </div>
          <p className="font-sans text-muted-foreground text-sm mt-1 tracking-widest">Pengaturan Global Permainan</p>
        </div>
      </header>

      <div className="p-10 max-w-5xl mx-auto w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          {/* SECTION 1: PENGATURAN POIN */}
          <section className="bg-card rounded-xl p-8 border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">PENGATURAN POIN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Perfect Score */}
              <div className="bg-secondary/30 p-4 rounded-lg border border-border/30">
                <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Perfect Score</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-display text-2xl font-black text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    {...register("perfectScore")}
                  />
                </div>
                {errors.perfectScore && <p className="text-destructive text-xs mt-2 font-bold">{errors.perfectScore.message}</p>}
                <p className="text-xs text-muted-foreground mt-2">Tebak pemenang & skor dengan tepat.</p>
              </div>

              {/* Correct Result */}
              <div className="bg-secondary/30 p-4 rounded-lg border border-border/30">
                <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Correct Result</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-display text-2xl font-black text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                    {...register("correctResult")}
                  />
                </div>
                {errors.correctResult && <p className="text-destructive text-xs mt-2 font-bold">{errors.correctResult.message}</p>}
                <p className="text-xs text-muted-foreground mt-2">Tebak pemenang saja dengan benar.</p>
              </div>

              {/* Wrong Prediction */}
              <div className="bg-secondary/10 p-4 rounded-lg border border-border/10 opacity-70">
                <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Wrong Prediction</label>
                <div className="relative">
                  <input 
                    type="number" 
                    disabled
                    className="w-full bg-background/50 border border-border/30 rounded-md py-3 px-4 text-muted-foreground font-display text-2xl font-black text-center cursor-not-allowed shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                    {...register("wrongPrediction")}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Tebakan salah.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-lg border border-primary/20 mb-8">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-primary">
                Perubahan poin akan langsung berlaku untuk pertandingan yang belum dihitung (unsettled). Untuk re-kalkulasi keseluruhan, gunakan tombol di halaman Match Management.
              </p>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={!isDirty || updateSettings.isPending}
                className="bg-primary text-background font-display font-bold px-8 py-3 rounded uppercase tracking-wider hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-[0_0_15px_rgba(151,169,255,0.2)] hover:shadow-[0_0_25px_rgba(151,169,255,0.4)]"
              >
                {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Simpan Pengaturan Poin
              </button>
            </div>
          </section>

          {/* SECTION 2: PENGATURAN LOCK-IN */}
          <section className="bg-card rounded-xl p-8 border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">PENGATURAN LOCK-IN</h3>
            
            <div className="bg-secondary/30 p-6 rounded-lg border border-border/30 mb-8 max-w-md">
              <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">BATAS WAKTU (Sebelum Kick-Off)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  className="w-24 bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-display text-2xl font-black text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                  {...register("lockInMinutes")}
                />
                <span className="font-display text-lg text-muted-foreground font-bold uppercase tracking-widest">Menit</span>
              </div>
              {errors.lockInMinutes && <p className="text-destructive text-xs mt-2 font-bold">{errors.lockInMinutes.message}</p>}
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={!isDirty || updateSettings.isPending}
                className="bg-primary text-background font-display font-bold px-8 py-3 rounded uppercase tracking-wider hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-[0_0_15px_rgba(151,169,255,0.2)] hover:shadow-[0_0_25px_rgba(151,169,255,0.4)]"
              >
                {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Simpan Batas Waktu
              </button>
            </div>
          </section>

          {/* SECTION 3: MANAJEMEN INVITE */}
          <section className="bg-card rounded-xl p-8 border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">MANAJEMEN INVITE</h3>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="p-6 bg-secondary/30 rounded-lg border border-border/30">
                    <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Kode Undangan Aktif</label>
                    <div className="relative mb-2">
                      <input 
                        type={showInviteCode ? "text" : "password"}
                        className="w-full bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-sans text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] pr-12"
                        {...register("invitation_code")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                        onClick={() => setShowInviteCode(!showInviteCode)}
                      >
                        {showInviteCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.invitation_code && <p className="text-destructive text-xs mt-2 font-bold">{errors.invitation_code.message}</p>}
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <span className="text-yellow-500">⚠️</span> Siapapun yang memiliki kode ini dapat mendaftar
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center pb-2">
                   <button 
                      type="submit" 
                      disabled={!isDirty || updateSettings.isPending}
                      className="bg-primary text-background font-display font-bold px-8 py-3 rounded uppercase tracking-wider hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(151,169,255,0.2)] hover:shadow-[0_0_25px_rgba(151,169,255,0.4)] w-full"
                    >
                      {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      SIMPAN KODE BARU
                    </button>
                </div>
              </div>

              <div className="h-px bg-border/50 w-full"></div>

              <div className="p-6 bg-secondary/30 rounded-lg border border-border/30">
                <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Invite Link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-background rounded border border-border/50 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <LinkIcon className="text-muted-foreground px-3 w-10 h-4" />
                    <input 
                      className="bg-transparent border-none text-muted-foreground font-sans text-sm w-full py-3 pr-4 focus:ring-0 outline-none select-all" 
                      readOnly 
                      value={inviteUrl}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className="bg-secondary text-foreground font-display font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-secondary/80 transition-colors border border-border/50 flex items-center min-w-[160px] justify-center"
                  >
                    {isCopied ? "✅ Tersalin!" : "📋 Salin Link"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-xl p-8 border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">TEBAKAN JUARA</h3>

            <div className="space-y-6">
              <div className="bg-secondary/30 p-6 rounded-lg border border-border/30 flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Poin Bonus Tebak Juara</label>
                  <input
                    type="number"
                    min={0}
                    value={championPoints}
                    onChange={(e) => setChampionPoints(e.target.value)}
                    className="w-full md:max-w-xs bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-display text-xl font-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveChampionPoints}
                  disabled={updateSettings.isPending}
                  className="bg-primary text-background font-display font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </button>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg border border-border/30 flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Deadline Tebakan (WIB)</label>
                  <input
                    type="datetime-local"
                    value={championDeadlineWib}
                    onChange={(e) => setChampionDeadlineWib(e.target.value)}
                    className="w-full md:max-w-sm bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveChampionDeadline}
                  disabled={updateSettings.isPending}
                  className="bg-primary text-background font-display font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </button>
              </div>

              {settings?.champion_deadline && new Date() >= new Date(settings.champion_deadline) && (
                <div className="bg-secondary/30 p-6 rounded-lg border border-border/30">
                  <p className="font-sans text-sm text-foreground">
                    {allChampionPredictions?.stats.submitted || 0} dari {allChampionPredictions?.stats.total || 0} user sudah tebak juara
                  </p>
                </div>
              )}

              <div className="bg-secondary/30 p-6 rounded-lg border border-border/30 flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Input Juara & Kalkulasi</label>
                  {selectedChampionTeam && (
                    <div className="mb-3 flex items-center gap-3 bg-background/60 border border-border/40 rounded-md px-3 py-2">
                      <Flag flag={selectedChampionTeam.flag} size="sm" className="shrink-0" />
                      <span className="font-sans text-sm text-foreground">Preview: {selectedChampionTeam.name}</span>
                    </div>
                  )}
                  <select
                    value={championWinner}
                    onChange={(e) => setChampionWinner(e.target.value)}
                    className="w-full bg-background border border-border/50 rounded-md py-3 px-4 text-foreground font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="">Pilih tim juara</option>
                    {WC2026_TEAMS.map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.flag} {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleCalculateChampionPoints}
                  disabled={calculateChampionPoints.isPending}
                  className="bg-amber-500 text-black font-display font-bold px-6 py-3 rounded uppercase tracking-wider hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {calculateChampionPoints.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  KALKULASI POIN JUARA
                </button>
              </div>
            </div>
          </section>

        </form>
      </div>
    </>
  );
}
