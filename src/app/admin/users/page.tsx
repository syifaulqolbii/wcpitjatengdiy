"use client";

import React, { useState } from 'react';
import { Search, Link as LinkIcon, Key, Trash2, X, Copy, Clock, Shield, UsersRound, History, Trophy } from 'lucide-react';
import { useUsers, useUpdateUserRole, useDeleteUser, useRecoverUserAccount, useInjectChampion } from '@/hooks/useUsers';
import { MAX_USER_SLOTS } from '@/lib/constants';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useGroups, useAssignUserToGroup } from '@/hooks/useGroups';
import { useUserPredictions } from '@/hooks/usePredictions';
import { Skeleton } from '@/components/ui/skeleton';
import { Flag } from '@/components/shared/Flag';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { WC2026_TEAMS } from '@/lib/wc2026-teams';

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recoverUser, setRecoverUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [historyUser, setHistoryUser] = useState<{ id: string; name: string } | null>(null);
  const [recoveryName, setRecoveryName] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: usersData, isLoading: isUsersLoading } = useUsers();
  const { data: leaderboard } = useLeaderboard();
  const { data: groupsData } = useGroups();

  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const recoverAccount = useRecoverUserAccount();
  const assignUserToGroup = useAssignUserToGroup();

  const { data: userPredictions, isLoading: isPredictionsLoading } = useUserPredictions(historyUser?.id);

  const [assignGroupUser, setAssignGroupUser] = useState<{ id: string; name: string; groupId?: string | null } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const [injectChampionUser, setInjectChampionUser] = useState<{ id: string; name: string } | null>(null);
  const [selectedChampionName, setSelectedChampionName] = useState('');
  const injectChampion = useInjectChampion();

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Yakin mengubah role user ini menjadi ${newRole}?`)) {
      updateRole.mutate({ userId, role: newRole });
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Yakin ingin menghapus user ini secara permanen?')) {
      deleteUser.mutate(userId);
    }
  };

  const openRecoveryModal = (user: { id: string; name: string; email: string }) => {
    setRecoverUser(user);
    setRecoveryName(user.name);
    setRecoveryEmail(user.email);
    setTemporaryPassword('');
    setConfirmPassword('');
  };

  const closeRecoveryModal = () => {
    setRecoverUser(null);
    setRecoveryName('');
    setRecoveryEmail('');
    setTemporaryPassword('');
    setConfirmPassword('');
  };

  const handleRecoverAccount = async () => {    if (!recoverUser) return;

    const nextName = recoveryName.trim();
    const nextEmail = recoveryEmail.trim().toLowerCase();
    const nameChanged = nextName !== recoverUser.name;
    const emailChanged = nextEmail !== recoverUser.email.toLowerCase();
    const passwordChanged = temporaryPassword.length > 0;

    if (!nameChanged && !emailChanged && !passwordChanged) {
      toast.error('Ubah nama, email, atau isi password sementara');
      return;
    }

    if (nameChanged && (nextName.length < 2 || nextName.length > 50)) {
      toast.error('Nama harus antara 2 hingga 50 karakter');
      return;
    }

    if (emailChanged && (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail))) {
      toast.error('Format email tidak valid');
      return;
    }

    if (passwordChanged && temporaryPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }

    if (passwordChanged && temporaryPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak sama');
      return;
    }

    await recoverAccount.mutateAsync({
      userId: recoverUser.id,
      name: nameChanged ? nextName : undefined,
      email: emailChanged ? nextEmail : undefined,
      password: passwordChanged ? temporaryPassword : undefined,
    });
    closeRecoveryModal();
  };

  const users = usersData || [];
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignGroup = async () => {
    if (!assignGroupUser || !selectedGroupId) { toast.error('Pilih grup terlebih dahulu'); return; }
    await assignUserToGroup.mutateAsync({ groupId: selectedGroupId, userId: assignGroupUser.id });
    setAssignGroupUser(null);
    setSelectedGroupId('');
  };

  const handleInjectChampion = async () => {
    if (!injectChampionUser || !selectedChampionName) { toast.error('Pilih tim juara terlebih dahulu'); return; }
    const team = WC2026_TEAMS.find(t => t.name === selectedChampionName);
    if (!team) return;
    
    await injectChampion.mutateAsync({
      userId: injectChampionUser.id,
      predictedWinner: team.name,
      predictedWinnerFlag: team.flag
    });
    setInjectChampionUser(null);
    setSelectedChampionName('');
  };

  return (
    <>
      {/* TopAppBar (Header) */}
      <header className="flex justify-between items-center px-10 py-6 sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-foreground">MANAJEMEN PENGGUNA</h2>
            <span className="bg-secondary text-muted-foreground font-sans text-xs px-2 py-1 rounded tracking-widest uppercase border border-border/30">Admin View</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              className="bg-card border-none text-foreground font-sans text-sm rounded py-2 pl-10 pr-4 w-64 focus:ring-1 focus:ring-primary outline-none placeholder:text-muted-foreground shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              placeholder="Search Users..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-10 flex-1 flex flex-col">
        
        {/* Context Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-display text-4xl font-black tracking-tighter mb-2 text-foreground">PENGGUNA <span className="text-primary">PREDICTOR</span></h3>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-muted-foreground uppercase tracking-widest">Total Slots</span>
              <div className="flex items-center gap-2 bg-secondary/80 px-3 py-1 rounded">
                <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                <span className="font-display text-sm font-bold text-yellow-400">{users.length}/{MAX_USER_SLOTS} Terisi</span>
              </div>
            </div>
          </div>
          <div className="group relative">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-transparent border border-border text-muted-foreground font-display uppercase tracking-tighter text-sm py-2 px-4 rounded hover:bg-secondary/50 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Generate Invite Link
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-card rounded-lg flex-1 border border-border/50 overflow-hidden flex flex-col relative min-w-0">
          <div className="absolute -right-20 -top-20 text-[200px] font-display font-black text-secondary opacity-50 select-none pointer-events-none leading-none">30</div>
          
          <div className="overflow-x-auto relative z-10">
          {/* Table Header */}
          <div className="grid min-w-[980px] grid-cols-[56px_minmax(140px,1.4fr)_minmax(220px,1.8fr)_minmax(140px,1fr)_minmax(170px,1.2fr)_120px_140px] gap-4 p-4 border-b border-border/50 bg-secondary/30 font-display text-xs uppercase tracking-widest text-muted-foreground">
            <div className="pl-2">No</div>
            <div>Nama</div>
            <div>Email</div>
            <div>Grup</div>
            <div>Poin & Role</div>
            <div>Bergabung</div>
            <div className="text-right pr-2">Aksi</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 font-sans text-sm">
            {isUsersLoading ? (
               <div className="p-4 flex flex-col gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
               </div>
            ) : filteredUsers.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">Tidak ada user ditemukan.</div>
            ) : (
              filteredUsers.map((user, index) => {
                const isAdmin = user.role === 'admin';
                const userStats = leaderboard?.find(l => l.userId === user.id);
                const points = userStats?.totalPoints ?? 0;
                const groupName = user.groupName;

                return (
                  <div key={user.id} className="grid min-w-[980px] grid-cols-[56px_minmax(140px,1.4fr)_minmax(220px,1.8fr)_minmax(140px,1fr)_minmax(170px,1.2fr)_120px_140px] gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/40 border-l-2 border-l-transparent hover:border-l-primary transition-colors">
                    <div className="pl-2 font-display text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="font-medium text-foreground truncate pr-2">{user.name}</div>
                    <div className="text-muted-foreground truncate pr-2">{user.email}</div>
                    <div className="text-muted-foreground truncate pr-2">
                      {groupName ? (
                        <span className="inline-flex max-w-full items-center px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-display uppercase tracking-wider truncate">
                          {groupName}
                        </span>
                      ) : (
                        <span className="text-xs uppercase tracking-wider">Belum ada</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display font-bold text-primary">{points} pts</span>
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-[10px] font-display uppercase tracking-wider">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50 text-[10px] font-display uppercase tracking-wider">
                          User
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground font-sans text-xs uppercase tracking-wider">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </div>
                    <div className="flex justify-end gap-2 pr-2">
                      <button
                        onClick={() => setHistoryUser({ id: user.id, name: user.name })}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Lihat Riwayat Prediksi"
                      >
                        <History className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setAssignGroupUser({ id: user.id, name: user.name, groupId: (user as { groupId?: string | null }).groupId }); setSelectedGroupId(''); }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Assign Grup"
                      >
                        <UsersRound className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setInjectChampionUser({ id: user.id, name: user.name }); setSelectedChampionName(''); }}
                        className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
                        title="Inject Tebakan Juara"
                      >
                        <Trophy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openRecoveryModal(user)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Edit Profil / Pulihkan Akun"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRoleChange(user.id, user.role || 'user')}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Ubah Role (Admin/User)"
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive/80 hover:text-destructive transition-colors p-1"
                        title="Hapus User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-between items-center relative z-10">
            <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Showing {filteredUsers.length} Users</span>
          </div>
        </div>
      </div>

      {/* Modal Overlay: Invite New User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          {/* Ambient Light behind modal */}
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-md shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-700 absolute top-0 left-0"></div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Undang Anggota Baru</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Bagikan tautan ini kepada calon peserta.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="relative group">
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Tautan Registrasi</label>
                  <div className="flex items-center bg-secondary rounded border border-border/50 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <LinkIcon className="text-muted-foreground px-3 w-10 h-4" />
                    <input 
                      className="bg-transparent border-none text-foreground font-sans text-sm w-full py-3 pr-4 focus:ring-0 outline-none selection:bg-primary selection:text-background" 
                      readOnly 
                      type="text" 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/login?mode=register`}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-secondary/50 p-4 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary w-5 h-5" />
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground">Tautan dapat digunakan.</p>
                      <p className="font-sans text-xs text-muted-foreground">Sisa slot: {MAX_USER_SLOTS - users.length}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                     navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/login?mode=register`);
                     setIsModalOpen(false);
                     toast.success('Tautan disalin!');
                  }}
                  className="w-full bg-primary text-background font-display uppercase tracking-tight font-bold py-4 rounded hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,230,118,0.15)] hover:shadow-[0_0_25px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Salin Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay: Account Recovery */}
      {recoverUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="bg-card border border-border/50 rounded-xl w-full max-w-lg shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-700 absolute top-0 left-0"></div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Edit Profil & Akun</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Ubah identitas atau bantu user masuk kembali.</p>
                </div>
                <button onClick={closeRecoveryModal} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="bg-secondary/50 p-4 rounded-lg border border-border/30">
                  <p className="font-display text-sm font-semibold text-foreground">{recoverUser.name}</p>
                  <p className="font-sans text-xs text-muted-foreground mt-1">{recoverUser.email}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70 mt-2 break-all">ID: {recoverUser.id}</p>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-muted-foreground">
                  Perubahan ini mempertahankan userId yang sama, jadi prediksi dan poin user tidak hilang.
                </div>

                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Nama Pengguna</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                    type="text"
                    value={recoveryName}
                    onChange={(e) => setRecoveryName(e.target.value)}
                    placeholder="Budi - Tim A"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Email / Login Baru</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="nama@wc.local"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Password Sementara</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                    type="password"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="Minimal 8 karakter (kosongkan jika tidak diubah)"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Konfirmasi Password</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password sementara"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeRecoveryModal}
                    disabled={recoverAccount.isPending}
                    className="flex-1 border border-border text-muted-foreground font-display uppercase tracking-tight font-bold py-4 rounded hover:bg-secondary/50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRecoverAccount}
                    disabled={recoverAccount.isPending}
                    className="flex-1 bg-primary text-background font-display uppercase tracking-tight font-bold py-4 rounded hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,230,118,0.15)] hover:shadow-[0_0_25px_rgba(0,230,118,0.3)] disabled:opacity-50 disabled:hover:shadow-none"
                  >
                    {recoverAccount.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Grup */}
      {assignGroupUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-md shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-700 absolute top-0 left-0"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Assign Grup</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Pilih grup untuk <span className="text-foreground font-semibold">{assignGroupUser.name}</span>.</p>
                </div>
                <button onClick={() => setAssignGroupUser(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Pilih Grup</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">-- Pilih grup --</option>
                    {groupsData?.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.inviteCode})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setAssignGroupUser(null)} className="flex-1 border border-border text-muted-foreground font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-secondary/50 transition-colors">
                    Batal
                  </button>
                  <button
                    onClick={handleAssignGroup}
                    disabled={!selectedGroupId || assignUserToGroup.isPending}
                    className="flex-1 bg-primary text-background font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {assignUserToGroup.isPending ? 'Menyimpan...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: History Predictions */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-2xl shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-700 absolute top-0 left-0"></div>
            <div className="p-6 md:p-8 flex flex-col flex-1 min-h-0">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Riwayat Prediksi</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Melihat semua tebakan milik <span className="text-foreground font-semibold">{historyUser.name}</span>.</p>
                </div>
                <button onClick={() => setHistoryUser(null)} className="text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 rounded-full p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                {isPredictionsLoading ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                ) : !userPredictions || userPredictions.length === 0 ? (
                  <div className="text-center p-8 bg-secondary/30 rounded-lg border border-border/30">
                    <p className="text-muted-foreground font-sans">Belum ada tebakan dari user ini.</p>
                  </div>
                ) : (
                  userPredictions.map((pred: any) => {
                    const match = pred.match;
                    const isUpcoming = match.status === 'upcoming';
                    const hasResult = match.scoreA !== null && match.scoreB !== null;
                    
                    return (
                      <div key={pred.id} className="bg-secondary/30 border border-border/30 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1 flex items-center justify-end gap-3 text-right">
                            <span className="font-display font-bold text-sm md:text-base text-foreground">{match.teamA}</span>
                            <Flag flag={match.flagA} size="sm" className="w-6 md:w-8 shrink-0" />
                          </div>
                          
                          <div className="bg-background border border-border/50 rounded px-3 py-1 flex items-center gap-2 shadow-inner">
                            <span className="font-display font-black text-primary">{pred.predictedA}</span>
                            <span className="text-muted-foreground text-xs">-</span>
                            <span className="font-display font-black text-primary">{pred.predictedB}</span>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-start gap-3">
                            <Flag flag={match.flagB} size="sm" className="w-6 md:w-8 shrink-0" />
                            <span className="font-display font-bold text-sm md:text-base text-foreground">{match.teamB}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 min-w-[150px] border-t md:border-t-0 border-border/30 pt-3 md:pt-0">
                          {isUpcoming ? (
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">
                              {format(new Date(match.kickoffTime), 'dd MMM HH:mm')}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {hasResult ? (
                                <div className="text-xs font-sans text-muted-foreground mr-2">
                                  Skor Asli: <span className="font-bold text-foreground">{match.scoreA}-{match.scoreB}</span>
                                </div>
                              ) : null}
                              <span className={`px-2 py-1 rounded text-xs font-display font-bold uppercase tracking-wider ${pred.points && pred.points > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
                                {pred.points !== null ? `+${pred.points} Pts` : 'Pending'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inject Juara */}
      {injectChampionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-md shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-amber-700 absolute top-0 left-0"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" /> Inject Juara
                  </h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Set tebakan juara untuk <span className="text-foreground font-semibold">{injectChampionUser.name}</span>.</p>
                </div>
                <button onClick={() => setInjectChampionUser(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Pilih Tim Juara</label>
                  <select
                    value={selectedChampionName}
                    onChange={(e) => setSelectedChampionName(e.target.value)}
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">-- Pilih Tim Juara --</option>
                    {WC2026_TEAMS.map(t => (
                      <option key={t.name} value={t.name}>{t.flag} {t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setInjectChampionUser(null)} className="flex-1 border border-border text-muted-foreground font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-secondary/50 transition-colors">
                    Batal
                  </button>
                  <button
                    onClick={handleInjectChampion}
                    disabled={!selectedChampionName || injectChampion.isPending}
                    className="flex-1 bg-amber-500 text-black font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-amber-400 transition-all disabled:opacity-50"
                  >
                    {injectChampion.isPending ? 'Menyimpan...' : 'Inject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
