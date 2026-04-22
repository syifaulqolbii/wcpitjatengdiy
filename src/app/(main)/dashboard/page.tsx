import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-8 relative z-10">
      {/* Welcome & Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome greeting only shown on desktop/tablet since mobile navbar handles identity differently */}
        <div className="col-span-1 flex-col justify-center px-4 py-2 hidden md:flex">
          <h1 className="font-display text-3xl font-black tracking-tight text-foreground">Halo, Alex</h1>
          <p className="text-muted-foreground text-sm mt-1">Ready for today's matches?</p>
        </div>
        
        <div className="md:col-span-2 grid grid-cols-3 gap-3 md:gap-6">
          {/* Stat Card 1 */}
          <div className="bg-card rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group border border-border/50">
            <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,230,118,0.15)_inset]"></div>
            <span className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Total Poin</span>
            <span className="font-display text-2xl md:text-4xl font-black text-primary">24</span>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-card rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group border border-border/50">
            <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,230,118,0.15)_inset]"></div>
            <span className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Rank</span>
            <span className="font-display text-2xl md:text-4xl font-black text-foreground">#3</span>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-card rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group border border-border/50">
            <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,230,118,0.15)_inset]"></div>
            <span className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider mb-1">Perfect</span>
            <span className="font-display text-2xl md:text-4xl font-black text-primary">5<span className="text-lg md:text-2xl align-top ml-1">⭐</span></span>
          </div>
        </div>
      </section>

      {/* LIVE NOW Hero Section */}
      <section className="relative rounded-xl overflow-hidden bg-card/50 shadow-[0px_24px_48px_rgba(0,0,0,0.4)] group border border-border/50">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/30 to-background pointer-events-none"></div>
        {/* Using a generic Unsplash image for the stadium background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1e1e1147a274?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"></div>
        
        <div className="relative p-6 md:p-10 flex flex-col items-center">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-destructive/30">
            <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse"></div>
            <span className="text-destructive text-xs font-bold uppercase tracking-widest">Live Now</span>
            <span className="text-muted-foreground text-xs font-bold ml-2 pl-2 border-l border-border/50">67'</span>
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-center w-full max-w-2xl gap-4 md:gap-12">
            <div className="flex flex-col items-center flex-1">
              <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e7-1f1f7.png" alt="Brazil" className="w-12 h-12 md:w-16 md:h-16 mb-2 drop-shadow-lg" />
              <span className="font-display font-bold text-lg md:text-2xl text-foreground uppercase tracking-tight">Brazil</span>
            </div>

            <div className="flex items-center gap-4 px-4 py-2 bg-card/80 backdrop-blur-md rounded-xl border border-border/50 shadow-xl">
              <span className="font-display font-black text-5xl md:text-7xl text-primary tracking-tighter">2</span>
              <span className="font-display font-bold text-2xl text-muted-foreground">-</span>
              <span className="font-display font-black text-5xl md:text-7xl text-foreground tracking-tighter">1</span>
            </div>

            <div className="flex flex-col items-center flex-1">
              <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e9-1f1ea.png" alt="Germany" className="w-12 h-12 md:w-16 md:h-16 mb-2 drop-shadow-lg opacity-80" />
              <span className="font-display font-bold text-lg md:text-2xl text-muted-foreground uppercase tracking-tight">Germany</span>
            </div>
          </div>

          {/* Predictor Action */}
          <div className="mt-8 w-full max-w-md bg-background/60 backdrop-blur-md rounded-lg p-4 border border-border/50 flex flex-col items-center">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Your Prediction</span>
            <div className="flex gap-4 items-center">
              <span className="font-display font-black text-xl text-foreground">3</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-display font-black text-xl text-foreground">1</span>
            </div>
            <div className="mt-2 text-xs text-primary font-bold">On track for +3 pts</div>
          </div>
        </div>
      </section>

      {/* Hasil Terakhir (Recent Results) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-xl md:text-2xl tracking-tight text-foreground uppercase">Hasil Terakhir</h2>
          <a className="text-primary text-sm font-bold uppercase tracking-wider hover:text-primary/80 transition-colors" href="#">Lihat Semua</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Result Card 1 */}
          <div className="bg-card rounded-xl p-5 border border-border/50 flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center w-16">
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e6-1f1f7.png" alt="Argentina" className="w-8 h-8 mb-1" />
                <span className="font-display text-sm font-bold text-foreground uppercase">ARG</span>
              </div>
              <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-lg font-display font-black text-2xl tracking-tighter">
                <span className="text-foreground">1</span>
                <span className="text-muted-foreground text-lg">-</span>
                <span className="text-muted-foreground">0</span>
              </div>
              <div className="flex flex-col items-center w-16">
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1eb-1f1f7.png" alt="France" className="w-8 h-8 mb-1 opacity-70" />
                <span className="font-display text-sm font-bold text-muted-foreground uppercase">FRA</span>
              </div>
            </div>
            <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-bold text-sm shadow-[0_0_10px_rgba(0,230,118,0.2)]">
              +3 pts
            </div>
          </div>

          {/* Result Card 2 */}
          <div className="bg-card rounded-xl p-5 border border-border/50 flex items-center justify-between relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted"></div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center w-16">
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ea-1f1f8.png" alt="Spain" className="w-8 h-8 mb-1 opacity-80" />
                <span className="font-display text-sm font-bold text-foreground uppercase">ESP</span>
              </div>
              <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-lg font-display font-black text-2xl tracking-tighter">
                <span className="text-muted-foreground">2</span>
                <span className="text-muted-foreground text-lg">-</span>
                <span className="text-muted-foreground">2</span>
              </div>
              <div className="flex flex-col items-center w-16">
                <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ee-1f1f9.png" alt="Italy" className="w-8 h-8 mb-1 opacity-80" />
                <span className="font-display text-sm font-bold text-foreground uppercase">ITA</span>
              </div>
            </div>
            <div className="bg-secondary text-muted-foreground border border-border/50 px-3 py-1 rounded-full font-bold text-sm">
              +1 pt
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
