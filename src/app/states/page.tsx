"use client";

import React from 'react';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';

export default function StatesShowcasePage() {
  return (
    <div className="min-h-screen bg-background p-10 font-sans text-foreground">
      <h1 className="font-display font-black text-4xl mb-12 tracking-tighter text-primary">UI STATES SHOWCASE</h1>
      
      <div className="space-y-20">
        {/* Error & Locked States */}
        <section>
          <h2 className="font-display font-bold text-2xl mb-8 border-b border-border/50 pb-4">Error & Locked States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border/50">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">404 Not Found</h3>
              </div>
              <div className="bg-background relative">
                <ErrorState 
                  type="404"
                  title="Laman Tidak Ditemukan"
                  description="Sepertinya kamu salah jalur. Yuk balik ke lapangan."
                  actionLabel="Kembali ke Dashboard"
                  actionHref="#"
                />
              </div>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border/50">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Session Expired (Locked)</h3>
              </div>
              <div className="bg-background relative">
                <ErrorState 
                  type="locked"
                  title="Sesi Kamu Telah Berakhir"
                  description="Silakan login kembali untuk melanjutkan."
                  actionLabel="Login Ulang"
                  actionHref="#"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="font-display font-bold text-2xl mb-8 border-b border-border/50 pb-4">Empty State Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border/50">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Jadwal Belum Tersedia</h3>
              </div>
              <EmptyState 
                type="schedule"
                title="JADWAL BELUM TERSEDIA"
                description="Pertandingan akan muncul di sini saat admin menambahkan jadwal."
              />
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border/50">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Belum Ada Peringkat</h3>
              </div>
              <EmptyState 
                type="leaderboard"
                title="BELUM ADA PERINGKAT"
                description="Klasemen akan terisi setelah pertandingan pertama selesai."
              />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="bg-secondary/30 p-4 border-b border-border/50">
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Belum Ada Riwayat</h3>
              </div>
              <EmptyState 
                type="history"
                title="BELUM ADA RIWAYAT"
                description="Mulai buat prediksimu sebelum kick-off pertama!"
                actionLabel="Lihat Jadwal Prediksi"
                actionHref="#"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
