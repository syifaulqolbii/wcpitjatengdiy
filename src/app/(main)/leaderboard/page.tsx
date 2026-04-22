import React from 'react';
import { Star, Minus } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      {/* Hero Title & Description */}
      <section className="pt-4 md:pt-8 pb-4 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 -translate-x-1/4"></div>
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none shadow-sm text-foreground">
                KLASEMEN
            </h1>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border/50 flex items-center justify-center overflow-hidden">
                <span className="font-display font-bold text-lg text-primary">B</span>
            </div>
        </div>
        <p className="font-sans text-muted-foreground text-xs md:text-sm tracking-wide">Update otomatis setelah setiap match</p>
      </section>

      {/* Podium Section */}
      <section className="relative pt-8 pb-8 mt-4 md:mt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-end justify-center gap-2 h-56 md:h-64">
          
          {/* Rank 2 */}
          <div className="flex flex-col items-center w-[30%] translate-y-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border-2 border-slate-300 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(203,213,225,0.2)] relative z-20">
              <span className="font-display font-bold text-lg md:text-xl text-slate-300">AS</span>
            </div>
            <div className="bg-secondary/40 w-full rounded-t-lg border-t border-slate-400/20 flex flex-col items-center pt-3 pb-4 h-32 md:h-40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-400/5 to-transparent"></div>
              <span className="font-display font-bold text-3xl md:text-4xl text-slate-300 relative z-10 opacity-40">2</span>
              <span className="font-display font-bold text-sm md:text-base text-foreground mt-auto relative z-10 truncate w-full text-center px-1">Agus S.</span>
              <span className="font-sans text-xs md:text-sm text-primary font-semibold relative z-10">38 pts</span>
            </div>
          </div>
          
          {/* Rank 1 */}
          <div className="flex flex-col items-center w-[35%] z-20">
            <div className="relative">
              <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] z-20">
                <Star className="w-6 h-6 md:w-8 md:h-8 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border-2 border-yellow-400 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(250,204,21,0.3)] relative z-10 bg-background">
                <span className="font-display font-bold text-xl md:text-2xl text-yellow-400">JD</span>
              </div>
            </div>
            <div className="bg-secondary/60 w-full rounded-t-lg border-t border-yellow-400/30 flex flex-col items-center pt-2 pb-6 h-40 md:h-48 relative overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent"></div>
              <span className="font-display font-black text-5xl md:text-6xl text-yellow-400 relative z-10 opacity-30 drop-shadow-md">1</span>
              <span className="font-display font-bold text-base md:text-lg text-foreground mt-auto relative z-10 truncate w-full text-center px-1">Joko D.</span>
              <span className="font-sans text-sm md:text-base text-primary font-bold relative z-10 bg-primary/10 px-2 py-0.5 rounded mt-1">42 pts</span>
            </div>
          </div>
          
          {/* Rank 3 */}
          <div className="flex flex-col items-center w-[30%] translate-y-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-card border-2 border-amber-600 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(217,119,6,0.2)] relative z-20">
              <span className="font-display font-bold text-base md:text-lg text-amber-600">RK</span>
            </div>
            <div className="bg-secondary/20 w-full rounded-t-lg border-t border-amber-600/20 flex flex-col items-center pt-3 pb-3 h-28 md:h-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 to-transparent"></div>
              <span className="font-display font-bold text-2xl md:text-3xl text-amber-600 relative z-10 opacity-40">3</span>
              <span className="font-display font-bold text-sm md:text-base text-foreground mt-auto relative z-10 truncate w-full text-center px-1">Rizky K.</span>
              <span className="font-sans text-xs md:text-sm text-primary font-semibold relative z-10">35 pts</span>
            </div>
          </div>

        </div>
      </section>

      {/* Leaderboard List */}
      <section className="flex flex-col gap-2 mt-4 md:mt-8">
        
        {/* Normal Row */}
        <div className="bg-card rounded-lg p-3 md:p-4 flex items-center gap-4 relative overflow-hidden group border border-border/50">
          <div className="w-8 md:w-12 text-center flex-shrink-0">
            <span className="font-display font-black text-xl md:text-2xl text-muted-foreground opacity-50">4</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base md:text-lg text-foreground truncate">Siti A.</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-sans text-xs md:text-sm text-muted-foreground">32 pts</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="font-sans text-[10px] md:text-xs text-yellow-400 flex items-center gap-0.5 font-bold">
                2 <Star className="w-3 h-3 fill-yellow-400" />
              </span>
            </div>
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-primary opacity-90 pr-2">32</div>
        </div>

        {/* Tied Row */}
        <div className="bg-card rounded-lg p-3 md:p-4 flex items-center gap-4 relative overflow-hidden border border-border/50">
          <div className="w-8 md:w-12 text-center flex-shrink-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1">
            <span className="font-display font-black text-xl md:text-2xl text-muted-foreground opacity-50">5</span>
            <Minus className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base md:text-lg text-foreground truncate">Eko S.</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-sans text-xs md:text-sm text-muted-foreground">30 pts</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="font-sans text-[10px] md:text-xs text-yellow-400 flex items-center gap-0.5 font-bold">
                1 <Star className="w-3 h-3 fill-yellow-400" />
              </span>
            </div>
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-primary opacity-90 pr-2">30</div>
        </div>

        {/* Tied Row 2 */}
        <div className="bg-card rounded-lg p-3 md:p-4 flex items-center gap-4 relative overflow-hidden border border-border/50">
          <div className="w-8 md:w-12 text-center flex-shrink-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1">
            <span className="font-display font-black text-xl md:text-2xl text-muted-foreground opacity-50">5</span>
            <Minus className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base md:text-lg text-foreground truncate">Dewi P.</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-sans text-xs md:text-sm text-muted-foreground">30 pts</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="font-sans text-[10px] md:text-xs text-yellow-400 flex items-center gap-0.5 font-bold">
                1 <Star className="w-3 h-3 fill-yellow-400" />
              </span>
            </div>
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-primary opacity-90 pr-2">30</div>
        </div>

        {/* Highlighted Current User Row */}
        <div className="bg-card/80 rounded-lg p-3 md:p-4 flex items-center gap-4 relative overflow-hidden border border-primary border-l-4 shadow-[0_4px_20px_rgba(0,230,118,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
          <div className="w-8 md:w-12 text-center flex-shrink-0 relative z-10">
            <span className="font-display font-black text-xl md:text-2xl text-primary drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]">7</span>
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base md:text-lg text-foreground truncate">Budi</h3>
              <span className="bg-primary/20 text-primary text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-sans text-xs md:text-sm text-foreground">28 pts</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="font-sans text-[10px] md:text-xs text-yellow-400 flex items-center gap-0.5 font-bold">
                5 <Star className="w-3 h-3 fill-yellow-400" />
              </span>
            </div>
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-primary pr-2 relative z-10 drop-shadow-[0_0_8px_rgba(0,230,118,0.3)]">28</div>
        </div>

        {/* Normal Row */}
        <div className="bg-card rounded-lg p-3 md:p-4 flex items-center gap-4 relative overflow-hidden border border-border/50">
          <div className="w-8 md:w-12 text-center flex-shrink-0">
            <span className="font-display font-black text-xl md:text-2xl text-muted-foreground opacity-50">8</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base md:text-lg text-foreground truncate">Lina M.</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-sans text-xs md:text-sm text-muted-foreground">25 pts</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="font-sans text-[10px] md:text-xs text-muted-foreground/50 flex items-center gap-0.5 font-bold">
                0 <Star className="w-3 h-3" />
              </span>
            </div>
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-muted-foreground opacity-80 pr-2">25</div>
        </div>

        {/* Load More Hint */}
        <div className="flex justify-center mt-6">
          <button className="bg-secondary text-foreground font-sans font-bold text-xs md:text-sm py-3 px-8 rounded-full hover:bg-secondary/80 transition-colors border border-border/50">
            Muat Lebih Banyak
          </button>
        </div>

      </section>
    </div>
  );
}
