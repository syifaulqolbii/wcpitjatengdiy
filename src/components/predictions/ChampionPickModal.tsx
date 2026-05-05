import React, { useState, useEffect } from 'react';
import { WC2026_TEAMS, Team } from '@/lib/wc2026-teams';
import { useSubmitChampionPick, useUpdateChampionPick } from '@/hooks/useTournamentPrediction';
import { toast } from 'sonner';
import { Loader2, X, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Flag } from '@/components/shared/Flag';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

interface ChampionPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPrediction: any | null;
  deadline: string;
  bonusPoints: number;
}

export function ChampionPickModal({
  isOpen,
  onClose,
  existingPrediction,
  deadline,
  bonusPoints,
}: ChampionPickModalProps) {
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const submitMutation = useSubmitChampionPick();
  const updateMutation = useUpdateChampionPick();

  useEffect(() => {
    if (existingPrediction?.predictedWinner) {
      setSelectedTeamName(existingPrediction.predictedWinner);
    }
  }, [existingPrediction]);

  if (!isOpen) return null;

  const isUpdating = !!existingPrediction;
  const isPending = submitMutation.isPending || updateMutation.isPending;

  const filteredTeams = WC2026_TEAMS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeam = WC2026_TEAMS.find(t => t.name === selectedTeamName);

  const handleSubmit = async () => {
    if (!selectedTeam) {
      toast.error('Silakan pilih tim terlebih dahulu');
      return;
    }

    const payload = {
      predictedWinner: selectedTeam.name,
      predictedWinnerFlag: selectedTeam.flag,
    };

    try {
      if (isUpdating) {
        await updateMutation.mutateAsync(payload);
        toast.success('Tebakan juara berhasil diperbarui!');
      } else {
        await submitMutation.mutateAsync(payload);
        toast.success('Tebakan juara berhasil disimpan!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan tebakan');
    }
  };

  // Format deadline to WIB
  const deadlineDate = new Date(deadline);
  const zonedDeadline = toZonedTime(deadlineDate, 'Asia/Jakarta');
  const formattedDeadline = format(zonedDeadline, "dd MMM yyyy, HH.mm 'WIB'", { locale: id });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-border/50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-600/20 to-card p-6 border-b border-border/30 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">TEBAK JUARA PIALA DUNIA 2026</h2>
          <p className="text-muted-foreground text-sm font-sans">
            Pilih tim juara dan dapatkan bonus poin!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400">Deadline Terkunci:</p>
              <p className="text-sm text-muted-foreground">{formattedDeadline}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Pilih Tim Jagoan Anda
            </label>
            
            <div className="mb-3 relative">
              <input 
                type="text" 
                placeholder="Cari tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/30 border border-border/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTeams.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">Tim tidak ditemukan</p>
              )}
              {filteredTeams.map((team) => (
                <button
                  key={team.name}
                  type="button"
                  onClick={() => setSelectedTeamName(team.name)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-all ${
                    selectedTeamName === team.name 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]' 
                      : 'bg-background border-border/30 hover:border-border text-foreground hover:bg-secondary/20'
                  }`}
                >
                  <Flag flag={team.flag} size="sm" className="shrink-0" />
                  <span className="font-bold flex-1">{team.name}</span>
                  {selectedTeamName === team.name && (
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-primary">
              ⭐ Bonus {bonusPoints} poin jika tebakan Anda benar!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30 bg-secondary/10 flex gap-3">
          <button 
            onClick={onClose}
            type="button"
            className="flex-1 py-3 px-4 rounded-lg font-bold text-sm text-foreground bg-transparent border border-border hover:bg-secondary/50 transition-colors"
          >
            Nanti Saja
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedTeamName || isPending}
            type="button"
            className="flex-1 py-3 px-4 rounded-lg font-bold text-sm text-background bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(22,163,74,0.3)]"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isUpdating ? 'Ubah Tebakan' : 'Simpan Tebakan'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
