"use client";

import React, { useState } from 'react';
import { PlusSquare, Edit, Trash2, Flag, Zap, X } from 'lucide-react';

export default function AdminMatchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Header Area */}
      <header className="px-10 pt-12 pb-8 flex justify-between items-end relative z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent opacity-50 -z-10 h-48"></div>
        <div>
          <h2 className="font-display font-black text-4xl tracking-tighter text-foreground uppercase drop-shadow-md">MANAJEMEN PERTANDINGAN</h2>
          <p className="font-sans text-muted-foreground text-sm mt-1 uppercase tracking-widest">Jadwal & Hasil Pertandingan</p>
        </div>
        <button className="bg-primary text-background font-display font-bold text-sm px-6 py-3 rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,230,118,0.25)] transition-all flex items-center">
          <PlusSquare className="mr-2 w-5 h-5" />
          Tambah Match
        </button>
      </header>

      {/* Data Section */}
      <section className="px-10 pb-10 flex-1 flex flex-col">
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
                
                {/* Row 1: Upcoming */}
                <tr className="hover:bg-secondary/30 transition-colors group">
                  <td className="py-5 px-6">
                    <span className="bg-secondary/80 px-2 py-1 rounded text-foreground font-display text-xs">GRUP A</span>
                  </td>
                  <td className="py-5 px-6 font-display text-lg tracking-tight">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-foreground">BRA</span>
                      <span className="text-muted-foreground text-xs font-sans">vs</span>
                      <span className="font-bold text-foreground">GER</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-muted-foreground">
                    <div className="font-medium text-foreground">15 Jun 2026</div>
                    <div className="text-xs font-sans">20:00 UTC</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border/50">
                      Upcoming
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center text-muted-foreground font-display text-lg">
                    - : -
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded bg-background flex items-center justify-center border border-border/50" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded bg-background flex items-center justify-center border border-border/50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2: Live */}
                <tr className="hover:bg-secondary/30 transition-colors group relative overflow-hidden bg-secondary/10">
                  <td className="py-5 px-6">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>
                    <span className="bg-secondary/80 px-2 py-1 rounded text-foreground font-display text-xs">GRUP B</span>
                  </td>
                  <td className="py-5 px-6 font-display text-lg tracking-tight">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-foreground">ARG</span>
                      <span className="text-muted-foreground text-xs font-sans">vs</span>
                      <span className="font-bold text-foreground">ESP</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-muted-foreground">
                    <div className="font-medium text-foreground">16 Jun 2026</div>
                    <div className="text-xs font-sans">18:00 UTC</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/50 shadow-[0_0_10px_rgba(255,113,108,0.5)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse"></span>
                      Live
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center text-foreground font-display text-xl tracking-tighter text-destructive">
                    2 : 1
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 text-primary hover:text-primary transition-colors rounded bg-secondary/80 flex items-center justify-center border border-primary/20 shadow-[0_0_8px_rgba(0,230,118,0.2)]" 
                        title="Input Hasil"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded bg-background flex items-center justify-center border border-border/50" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 3: Selesai */}
                <tr className="hover:bg-secondary/30 transition-colors group">
                  <td className="py-5 px-6">
                    <span className="bg-secondary/80 px-2 py-1 rounded text-foreground font-display text-xs">GRUP C</span>
                  </td>
                  <td className="py-5 px-6 font-display text-lg tracking-tight">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-foreground opacity-50">ENG</span>
                      <span className="text-muted-foreground text-xs font-sans">vs</span>
                      <span className="font-bold text-foreground">FRA</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-muted-foreground">
                    <div className="font-medium text-foreground">14 Jun 2026</div>
                    <div className="text-xs font-sans">15:00 UTC</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Selesai
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center font-display text-xl tracking-tighter">
                    <span className="text-muted-foreground">0</span>
                    <span className="text-muted-foreground text-sm mx-1 font-sans">:</span>
                    <span className="text-primary font-bold">3</span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded bg-background flex items-center justify-center border border-border/50" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-8 flex justify-end">
          <button className="bg-cyan-400 text-background font-display font-bold text-sm px-6 py-3 rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,205,236,0.3)] transition-all flex items-center">
            <Zap className="mr-2 w-5 h-5" />
            Trigger Kalkulasi Poin
          </button>
        </div>
      </section>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-card rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] border border-border/50 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-border/50 bg-secondary/30 flex justify-between items-center">
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">Input Hasil</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 flex flex-col items-center relative">
              {/* Subtle background texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-20 pointer-events-none"></div>
              
              <div className="flex items-center justify-center w-full gap-6 relative z-10">
                {/* Team A Input */}
                <div className="flex flex-col items-center">
                  <div className="font-display text-2xl font-black mb-4 tracking-tighter text-foreground flex items-center gap-2">
                    <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e6-1f1f7.png" alt="ARG" className="w-8 h-8" /> ARG
                  </div>
                  <input 
                    aria-label="Score Team A" 
                    className="w-24 h-28 bg-secondary border-none rounded-lg text-center font-display text-5xl font-black text-primary focus:ring-1 focus:ring-border focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                    min="0" 
                    type="number" 
                    defaultValue="2"
                  />
                </div>
                
                {/* VS Separator */}
                <div className="font-display text-xl font-bold text-muted-foreground opacity-50 px-4 mt-12">
                  VS
                </div>
                
                {/* Team B Input */}
                <div className="flex flex-col items-center">
                  <div className="font-display text-2xl font-black mb-4 tracking-tighter text-foreground flex items-center gap-2">
                    ESP <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ea-1f1f8.png" alt="ESP" className="w-8 h-8" />
                  </div>
                  <input 
                    aria-label="Score Team B" 
                    className="w-24 h-28 bg-secondary border-none rounded-lg text-center font-display text-5xl font-black text-foreground focus:ring-1 focus:ring-border focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                    min="0" 
                    type="number" 
                    defaultValue="1"
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-6 bg-background/50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-secondary text-foreground font-display font-bold text-sm px-6 py-3 rounded uppercase tracking-wider hover:bg-secondary/80 transition-colors mr-3 border border-border/50">
                Batal
              </button>
              <button onClick={() => setIsModalOpen(false)} className="bg-primary text-background font-display font-bold text-sm px-8 py-3 rounded uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all">
                Konfirmasi
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
