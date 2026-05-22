"use client";

import React, { useState } from 'react';
import { Search, Bell, Settings, Link as LinkIcon, Key, Trash2, X, Copy, Clock, Shield, UsersRound } from 'lucide-react';
import { useUsers, useUpdateUserRole, useDeleteUser, useRecoverUserAccount } from '@/hooks/useUsers';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useGroups, useAssignUserToGroup } from '@/hooks/useGroups';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recoverUser, setRecoverUser] = useState<{ id: string; name: string; email: string } | null>(null);
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

  const [assignGroupUser, setAssignGroupUser] = useState<{ id: string; name: string; groupId?: string | null } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

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
    setRecoveryEmail(user.email);
    setTemporaryPassword('');
    setConfirmPassword('');
  };

  const closeRecoveryModal = () => {
    setRecoverUser(null);
    setRecoveryEmail('');
    setTemporaryPassword('');
    setConfirmPassword('');
  };

  const handleRecoverAccount = async () => {    if (!recoverUser) return;

    const nextEmail = recoveryEmail.trim().toLowerCase();
    const emailChanged = nextEmail !== recoverUser.email.toLowerCase();
    const passwordChanged = temporaryPassword.length > 0;

    if (!emailChanged && !passwordChanged) {
      toast.error('Ubah email atau isi password sementara dulu');
      return;
    }

    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
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
      email: emailChanged ? nextEmail : undefined,
      password: passwordChanged ? temporaryPassword : undefined,
    });
    closeRecoveryModal();
  };

  const users = usersData?.users || [];
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
          <div className="flex items-center gap-4 text-primary">
            <button className="hover:bg-secondary/50 transition-colors p-2 rounded-full flex">
              <Bell className="w-5 h-5" />
            </button>
            <button className="hover:bg-secondary/50 transition-colors p-2 rounded-full flex">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden border border-border/50 flex items-center justify-center font-display font-bold text-primary">
            A
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
                <span className="font-display text-sm font-bold text-yellow-400">{users.length}/30 Terisi</span>
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
                        onClick={() => { setAssignGroupUser({ id: user.id, name: user.name, groupId: (user as { groupId?: string | null }).groupId }); setSelectedGroupId(''); }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Assign Grup"
                      >
                        <UsersRound className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openRecoveryModal(user)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Pulihkan Akun"
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
                      <p className="font-sans text-xs text-muted-foreground">Sisa slot: {30 - users.length}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                     navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/login?mode=register`);
                     setIsModalOpen(false);
                     alert('Tautan disalin!');
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
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Pulihkan Akun</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Bantu user masuk lagi tanpa membuat akun baru.</p>
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
                  Recovery ini mempertahankan userId yang sama, jadi prediksi dan poin user tidak hilang. Jangan hapus dan buat ulang user untuk kasus lupa login.
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
                    placeholder="Kosongkan jika hanya ubah email"
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
                    {recoverAccount.isPending ? 'Memulihkan...' : 'Pulihkan Akun'}
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
    </>
  );
}
