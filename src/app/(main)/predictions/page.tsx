import React from 'react';
import { Timer, Lock, CheckCircle2, XCircle } from 'lucide-react';

export default function PredictionsPage() {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      {/* Hero Title & Filters */}
      <section className="pt-4 md:pt-8 pb-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase mb-6 leading-none shadow-sm text-foreground">
          PREDIKSI
        </h1>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button className="whitespace-nowrap bg-card text-primary border border-border/50 px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(0,0,0,0.2)]">Semua</button>
          <button className="whitespace-nowrap bg-transparent text-muted-foreground hover:text-foreground transition-colors px-5 py-2.5 rounded-full text-sm font-bold border border-transparent">Terbuka</button>
          <button className="whitespace-nowrap bg-transparent text-muted-foreground hover:text-foreground transition-colors px-5 py-2.5 rounded-full text-sm font-bold border border-transparent">Selesai</button>
        </div>
      </section>

      {/* Match Feed */}
      <section className="flex flex-col gap-5">
        
        {/* Sticky Group Header */}
        <div className="sticky top-[64px] md:top-[80px] z-40 bg-background/90 backdrop-blur-xl py-3 -mx-4 px-4 md:-mx-8 md:px-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <h2 className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase font-sans">GROUP A — 15 Jun 2026</h2>
        </div>

        {/* Match Card 1: Open Prediction */}
        <div className="bg-card rounded-xl p-6 flex flex-col relative overflow-hidden group border border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 z-10">
            <div className="text-primary text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <Timer className="w-4 h-4" />
              Kunci dalam 1j 24m
            </div>
          </div>
          
          <div className="flex justify-between items-center w-full z-10 mb-8">
            <div className="flex flex-col items-center gap-3 flex-1">
              <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1fa-1f1f8.png" alt="USA" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg" />
              <span className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground">USA</span>
            </div>
            
            {/* Score Input Container */}
            <div className="flex items-center gap-2 md:gap-4 bg-secondary/50 p-2 md:p-3 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border border-border/50">
              <input type="number" placeholder="-" className="w-12 h-16 md:w-16 md:h-20 bg-transparent rounded text-center text-3xl md:text-4xl font-display font-black text-foreground border-none focus:ring-0 focus:outline focus:outline-primary/50 focus:outline-offset-0 focus:bg-secondary transition-colors placeholder:text-muted-foreground/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <span className="text-muted-foreground/50 font-black text-lg md:text-xl">:</span>
              <input type="number" placeholder="-" className="w-12 h-16 md:w-16 md:h-20 bg-transparent rounded text-center text-3xl md:text-4xl font-display font-black text-foreground border-none focus:ring-0 focus:outline focus:outline-primary/50 focus:outline-offset-0 focus:bg-secondary transition-colors placeholder:text-muted-foreground/30 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            </div>
            
            <div className="flex flex-col items-center gap-3 flex-1">
              <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3f4-e0067-e0062-e0077-e006c-e0073-e007f.png" alt="WAL" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg" />
              <span className="font-display text-2xl md:text-3xl font-black tracking-tight text-foreground">WAL</span>
            </div>
          </div>
          
          <button className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold uppercase tracking-widest hover:shadow-[0_0_24px_rgba(0,230,118,0.3)] hover:-translate-y-0.5 transition-all duration-200 z-10 text-sm">
            Simpan Prediksi
          </button>
        </div>

        {/* Match Card 2: Locked */}
        <div className="bg-card/50 rounded-xl p-6 flex flex-col relative overflow-hidden border border-border/30">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-20 pointer-events-none"></div>
          
          <div className="flex justify-center items-center mb-6 z-10 relative">
            <div className="bg-secondary text-muted-foreground px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-border/50">
              <Lock className="w-3.5 h-3.5" />
              Terkunci
            </div>
          </div>
          
          <div className="flex justify-between items-center w-full z-10 relative opacity-60">
            <div className="flex flex-col items-center gap-2 flex-1">
              <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.png" alt="ENG" className="w-10 h-10 md:w-12 md:h-12 grayscale" />
              <span className="font-display text-2xl font-black text-muted-foreground tracking-tight">ENG</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-16 bg-secondary/80 rounded-md flex items-center justify-center text-3xl font-display font-black text-muted-foreground border border-border/50">1</div>
              <span className="text-muted-foreground/40 font-black text-xl">:</span>
              <div className="w-14 h-16 bg-secondary/80 rounded-md flex items-center justify-center text-3xl font-display font-black text-muted-foreground border border-border/50">1</div>
            </div>
            
            <div className="flex flex-col items-center gap-2 flex-1">
              <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ee-1f1f7.png" alt="IRA" className="w-10 h-10 md:w-12 md:h-12 grayscale" />
              <span className="font-display text-2xl font-black text-muted-foreground tracking-tight">IRA</span>
            </div>
          </div>
        </div>

        {/* Match Card 3: Finished (Win) */}
        <div className="bg-card rounded-xl flex flex-col relative overflow-hidden border border-border/50">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary z-20"></div>
          <div className="absolute -right-6 -bottom-6 text-[120px] font-display font-black text-primary/5 pointer-events-none select-none leading-none z-0">WIN</div>
          
          <div className="p-5 flex flex-col z-10">
            <div className="flex justify-between items-center mb-5">
              <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em]">Selesai</div>
              <div className="bg-secondary/50 text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-border/50 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                +3 PTS
              </div>
            </div>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4 flex-1">
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f8-1f1f3.png" alt="SEN" className="w-8 h-8 opacity-70" />
                <span className="font-display text-2xl font-bold text-muted-foreground">SEN</span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-5 px-4 md:px-6 py-2 bg-secondary/50 rounded-lg shadow-inner border border-border/30">
                <div className="text-2xl md:text-3xl font-display font-black text-muted-foreground">0</div>
                <span className="text-border font-bold text-sm">—</span>
                <div className="text-2xl md:text-3xl font-display font-black text-primary">2</div>
              </div>
              
              <div className="flex items-center gap-4 flex-1 justify-end">
                <span className="font-display text-2xl font-bold text-primary drop-shadow-[0_0_10px_rgba(0,230,118,0.3)]">NED</span>
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f3-1f1f1.png" alt="NED" className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Match Card 4: Finished (Loss) */}
        <div className="bg-card rounded-xl flex flex-col relative overflow-hidden border border-border/50">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive z-20"></div>
          
          <div className="p-5 flex flex-col z-10">
            <div className="flex justify-between items-center mb-5">
              <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em]">Selesai</div>
              <div className="bg-secondary/50 text-destructive px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-border/50 shadow-sm">
                <XCircle className="w-3.5 h-3.5" />
                0 PTS
              </div>
            </div>
            
            <div className="flex justify-between items-center w-full mb-4">
              <div className="flex items-center gap-4 flex-1">
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e6-1f1f7.png" alt="ARG" className="w-8 h-8" />
                <span className="font-display text-2xl font-bold text-muted-foreground">ARG</span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-5 px-4 md:px-6 py-2">
                <div className="text-2xl md:text-3xl font-display font-black text-foreground">1</div>
                <span className="text-border font-bold text-sm">—</span>
                <div className="text-2xl md:text-3xl font-display font-black text-foreground">2</div>
              </div>
              
              <div className="flex items-center gap-4 flex-1 justify-end">
                <span className="font-display text-2xl font-bold text-muted-foreground">KSA</span>
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1f8-1f1e6.png" alt="KSA" className="w-8 h-8" />
              </div>
            </div>
            
            {/* Prediction Context Footer */}
            <div className="mt-2 pt-3 border-t border-border/50 flex justify-between items-center bg-secondary/30 -mx-5 px-5 -mb-5 pb-5">
              <span className="text-xs text-muted-foreground font-medium">Prediksimu</span>
              <span className="text-sm font-display font-bold text-muted-foreground tracking-wider">ARG 3 - 0 KSA</span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
