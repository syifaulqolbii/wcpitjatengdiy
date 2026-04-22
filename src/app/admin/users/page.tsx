"use client";

import React, { useState } from 'react';
import { Search, Bell, Settings, Link as LinkIcon, Key, Trash2, ChevronLeft, ChevronRight, X, Copy, Clock } from 'lucide-react';

export default function AdminUsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                <span className="font-display text-sm font-bold text-yellow-400">30/30 Terisi</span>
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
            {/* Tooltip
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-card text-foreground text-xs font-sans rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-border/50">
              Kuota penuh
            </div> */}
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-card rounded-lg flex-1 border border-border/50 overflow-hidden flex flex-col relative">
          {/* Decorative Layer */}
          <div className="absolute -right-20 -top-20 text-[200px] font-display font-black text-secondary opacity-50 select-none pointer-events-none leading-none">30</div>
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-secondary/30 font-display text-xs uppercase tracking-widest text-muted-foreground relative z-10">
            <div className="col-span-1 pl-2">No</div>
            <div className="col-span-3">Nama</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Bergabung</div>
            <div className="col-span-1 text-right pr-2">Aksi</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto relative z-10 font-sans text-sm">
            
            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/40 border-l-2 border-l-transparent hover:border-l-primary transition-colors">
              <div className="col-span-1 pl-2 font-display text-muted-foreground">01</div>
              <div className="col-span-3 font-medium text-foreground">Andi Prasetyo</div>
              <div className="col-span-3 text-muted-foreground">andi.p@example.com</div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-display uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Aktif
                </span>
              </div>
              <div className="col-span-2 text-muted-foreground font-sans text-xs uppercase tracking-wider">12 Agu 2023</div>
              <div className="col-span-1 flex justify-end gap-2 pr-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Reset Password">
                  <Key className="w-5 h-5" />
                </button>
                <button className="text-destructive/80 hover:text-destructive transition-colors p-1" title="Hapus">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/40 border-l-2 border-l-transparent hover:border-l-primary transition-colors">
              <div className="col-span-1 pl-2 font-display text-muted-foreground">02</div>
              <div className="col-span-3 font-medium text-foreground">Budi Santoso</div>
              <div className="col-span-3 text-muted-foreground">budi.s@example.com</div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50 text-xs font-display uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                  Belum Login
                </span>
              </div>
              <div className="col-span-2 text-muted-foreground font-sans text-xs uppercase tracking-wider">15 Agu 2023</div>
              <div className="col-span-1 flex justify-end gap-2 pr-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Reset Password">
                  <Key className="w-5 h-5" />
                </button>
                <button className="text-destructive/80 hover:text-destructive transition-colors p-1" title="Hapus">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/40 border-l-2 border-l-transparent hover:border-l-primary transition-colors">
              <div className="col-span-1 pl-2 font-display text-muted-foreground">03</div>
              <div className="col-span-3 font-medium text-foreground">Citra Kirana</div>
              <div className="col-span-3 text-muted-foreground">citra.k@example.com</div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-display uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Aktif
                </span>
              </div>
              <div className="col-span-2 text-muted-foreground font-sans text-xs uppercase tracking-wider">18 Agu 2023</div>
              <div className="col-span-1 flex justify-end gap-2 pr-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Reset Password">
                  <Key className="w-5 h-5" />
                </button>
                <button className="text-destructive/80 hover:text-destructive transition-colors p-1" title="Hapus">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/40 border-l-2 border-l-transparent hover:border-l-primary transition-colors">
              <div className="col-span-1 pl-2 font-display text-muted-foreground">04</div>
              <div className="col-span-3 font-medium text-foreground">Dewi Lestari</div>
              <div className="col-span-3 text-muted-foreground">dewi.l@example.com</div>
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-display uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Aktif
                </span>
              </div>
              <div className="col-span-2 text-muted-foreground font-sans text-xs uppercase tracking-wider">20 Agu 2023</div>
              <div className="col-span-1 flex justify-end gap-2 pr-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Reset Password">
                  <Key className="w-5 h-5" />
                </button>
                <button className="text-destructive/80 hover:text-destructive transition-colors p-1" title="Hapus">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

          {/* Table Footer / Pagination */}
          <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-between items-center relative z-10">
            <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Showing 1-30 of 30 Users</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 font-display text-xs">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay: Invite New User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          {/* Ambient Light behind modal */}
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="bg-card border border-border/50 rounded-xl w-full max-w-md shadow-[0px_24px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Decorative Modal Header */}
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
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">Tautan Undangan</label>
                  <div className="flex items-center bg-secondary rounded border border-border/50 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <LinkIcon className="text-muted-foreground px-3 w-10 h-4" />
                    <input 
                      className="bg-transparent border-none text-foreground font-sans text-sm w-full py-3 pr-4 focus:ring-0 outline-none selection:bg-primary selection:text-background" 
                      readOnly 
                      type="text" 
                      value="predictorwc26.com/join/x82k91"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-secondary/50 p-4 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary w-5 h-5" />
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground">Link berlaku 24 jam.</p>
                      <p className="font-sans text-xs text-muted-foreground">Sisa slot: 3</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(false)}
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
    </>
  );
}
