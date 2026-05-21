"use client";

import React, { useState } from 'react';
import { Users, Plus, Copy, Trash2, X, RefreshCw, Pencil, UserMinus, UserPlus } from 'lucide-react';
import { useGroups, useGroupMembers, useCreateGroup, useUpdateGroup, useDeleteGroup, useAssignUserToGroup, useRemoveUserFromGroup } from '@/hooks/useGroups';
import { useUsers } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminGroupsPage() {
  const { data: groups, isLoading } = useGroups();
  const { data: usersData } = useUsers();

  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const assignUser = useAssignUserToGroup();
  const removeUser = useRemoveUserFromGroup();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<{ id: string; name: string; inviteCode: string } | null>(null);
  const [membersGroupId, setMembersGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [assignUserId, setAssignUserId] = useState('');

  const { data: members, isLoading: isMembersLoading } = useGroupMembers(membersGroupId);

  const membersGroup = groups?.find(g => g.id === membersGroupId);
  const allUsers = usersData?.users ?? [];
  const unassignedUsers = allUsers.filter(u => {
    const member = members?.find(m => m.id === u.id);
    return !member;
  });

  const handleCreate = async () => {
    if (!newGroupName.trim()) { toast.error('Nama grup wajib diisi'); return; }
    await createGroup.mutateAsync({ name: newGroupName.trim(), inviteCode: newGroupCode.trim() || undefined });
    setIsCreateModalOpen(false);
    setNewGroupName('');
    setNewGroupCode('');
  };

  const handleUpdate = async () => {
    if (!editGroup) return;
    await updateGroup.mutateAsync({ groupId: editGroup.id, name: editGroupName });
    setEditGroup(null);
  };

  const handleRegenerateCode = async () => {
    if (!editGroup) return;
    await updateGroup.mutateAsync({ groupId: editGroup.id, name: editGroupName, regenerateCode: true });
    setEditGroup(null);
  };

  const handleDelete = (groupId: string, name: string) => {
    if (confirm(`Yakin hapus grup "${name}"? Semua member akan dikeluarkan dari grup ini.`)) {
      deleteGroup.mutate(groupId);
      if (membersGroupId === groupId) setMembersGroupId(null);
    }
  };

  const handleAssign = async () => {
    if (!membersGroupId || !assignUserId) { toast.error('Pilih user terlebih dahulu'); return; }
    await assignUser.mutateAsync({ groupId: membersGroupId, userId: assignUserId });
    setAssignUserId('');
  };

  const handleRemove = (userId: string) => {
    if (!membersGroupId) return;
    if (confirm('Keluarkan user ini dari grup?')) {
      removeUser.mutate({ groupId: membersGroupId, userId });
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-10 py-6 sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-foreground">MANAJEMEN GRUP</h2>
          <span className="bg-secondary text-muted-foreground font-sans text-xs px-2 py-1 rounded tracking-widest uppercase border border-border/30">Admin View</span>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-background font-display uppercase tracking-tight text-sm font-bold py-2 px-4 rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Grup Baru
        </button>
      </header>

      <div className="p-10 flex-1 flex flex-col gap-6">
        <div>
          <h3 className="font-display text-4xl font-black tracking-tighter mb-2 text-foreground">DAFTAR <span className="text-primary">GRUP</span></h3>
          <p className="font-sans text-sm text-muted-foreground">Kelola grup dan kode undangan. Setiap user hanya bisa bergabung ke satu grup.</p>
        </div>

        {/* Groups Table */}
        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-secondary/30 font-display text-xs uppercase tracking-widest text-muted-foreground">
            <div className="col-span-1 pl-2">No</div>
            <div className="col-span-3">Nama Grup</div>
            <div className="col-span-3">Kode Undangan</div>
            <div className="col-span-2">Member</div>
            <div className="col-span-2">Dibuat</div>
            <div className="col-span-1 text-right pr-2">Aksi</div>
          </div>

          <div className="font-sans text-sm">
            {isLoading ? (
              <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !groups || groups.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Belum ada grup. Buat grup pertama!</div>
            ) : (
              groups.map((group, index) => (
                <div key={group.id} className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/40 border-l-2 transition-colors ${membersGroupId === group.id ? 'border-l-primary bg-secondary/20' : 'border-l-transparent'}`}>
                  <div className="col-span-1 pl-2 font-display text-muted-foreground">{String(index + 1).padStart(2, '0')}</div>
                  <div className="col-span-3 font-medium text-foreground truncate">{group.name}</div>
                  <div className="col-span-3 flex items-center gap-2">
                    <code className="bg-secondary px-2 py-1 rounded text-primary font-mono text-sm font-bold tracking-widest">{group.inviteCode}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(group.inviteCode); toast.success('Kode disalin!'); }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Salin kode"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-display font-bold text-foreground">{group.memberCount}</span>
                  </div>
                  <div className="col-span-2 text-muted-foreground text-xs uppercase tracking-wider">
                    {format(new Date(group.createdAt), 'dd MMM yyyy')}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1 pr-2">
                    <button
                      onClick={() => { setMembersGroupId(membersGroupId === group.id ? null : group.id); setAssignUserId(''); }}
                      className={`transition-colors p-1 ${membersGroupId === group.id ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                      title="Lihat Member"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setEditGroup(group); setEditGroupName(group.name); }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Edit Grup"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id, group.name)}
                      className="text-destructive/80 hover:text-destructive transition-colors p-1"
                      title="Hapus Grup"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Members Panel */}
        {membersGroupId && membersGroup && (
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-display font-bold text-sm uppercase tracking-widest text-foreground">
                  Member: <span className="text-primary">{membersGroup.name}</span>
                </h4>
              </div>
              <button onClick={() => setMembersGroupId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assign User */}
            <div className="p-4 border-b border-border/30 flex items-center gap-3">
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="flex-1 bg-secondary border border-border/50 rounded px-3 py-2 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Pilih user untuk ditambahkan...</option>
                {unassignedUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!assignUserId || assignUser.isPending}
                className="flex items-center gap-2 bg-primary text-background font-display uppercase tracking-tight text-xs font-bold py-2 px-4 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                Tambah
              </button>
            </div>

            {/* Members List */}
            <div className="font-sans text-sm">
              {isMembersLoading ? (
                <div className="p-4 flex flex-col gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !members || members.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">Belum ada member di grup ini.</div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between px-4 py-3 border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display font-bold text-primary text-sm">{member.totalPoints} pts</span>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="text-destructive/70 hover:text-destructive transition-colors p-1"
                        title="Keluarkan dari grup"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Buat Grup */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-md shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-700 absolute top-0 left-0"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Buat Grup Baru</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Grup akan mendapat kode undangan unik.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Nama Grup</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Contoh: Tim Kantor A"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Kode Undangan (opsional)</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-mono text-sm focus:ring-1 focus:ring-primary outline-none uppercase"
                    type="text"
                    value={newGroupCode}
                    onChange={(e) => setNewGroupCode(e.target.value.toUpperCase())}
                    placeholder="Kosongkan untuk auto-generate"
                    maxLength={12}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 border border-border text-muted-foreground font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-secondary/50 transition-colors">
                    Batal
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={createGroup.isPending}
                    className="flex-1 bg-primary text-background font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {createGroup.isPending ? 'Membuat...' : 'Buat Grup'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Grup */}
      {editGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-md shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-700 absolute top-0 left-0"></div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-display text-2xl font-bold tracking-tight text-foreground">Edit Grup</h4>
                  <p className="font-sans text-sm text-muted-foreground mt-1">Ubah nama atau regenerate kode undangan.</p>
                </div>
                <button onClick={() => setEditGroup(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Nama Grup</label>
                  <input
                    className="w-full bg-secondary border border-border/50 rounded px-4 py-3 text-foreground font-sans text-sm focus:ring-1 focus:ring-primary outline-none"
                    type="text"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                  />
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">Kode Saat Ini</p>
                    <code className="font-mono font-bold text-primary tracking-widest">{editGroup.inviteCode}</code>
                  </div>
                  <button
                    onClick={handleRegenerateCode}
                    disabled={updateGroup.isPending}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground border border-border/50 px-3 py-2 rounded text-xs font-display uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditGroup(null)} className="flex-1 border border-border text-muted-foreground font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-secondary/50 transition-colors">
                    Batal
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateGroup.isPending}
                    className="flex-1 bg-primary text-background font-display uppercase tracking-tight font-bold py-3 rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {updateGroup.isPending ? 'Menyimpan...' : 'Simpan'}
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
