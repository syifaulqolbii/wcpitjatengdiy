import React from 'react';
import { Star, Check, X, ChevronRight, LogOut } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="relative z-10 max-w-lg mx-auto px-4 md:px-0 pb-10 overflow-x-hidden md:overflow-x-visible">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0, 230, 118, 0.05) 0%, transparent 60%)' }}></div>

      {/* Header */}
      <header className="flex items-center justify-between py-6 relative z-10">
        <h1 className="font-display font-black tracking-tighter uppercase text-foreground text-3xl md:text-4xl">PROFIL</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* Player Card Profile */}
        <section className="relative">
          <div className="bg-card rounded-xl p-6 shadow-[0px_24px_48px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col items-center border border-border/50">
            {/* Diagonal Grid Background Accent */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #00E676 25%, transparent 25%, transparent 50%, #00E676 50%, #00E676 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }}></div>
            
            <div className="relative z-10 mb-4">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                <span className="font-display font-black text-4xl text-primary tracking-tighter">JD</span>
              </div>
            </div>
            
            <h2 className="font-display font-black text-3xl tracking-tight uppercase text-foreground mb-1 z-10 relative">Joko D.</h2>
            <p className="text-muted-foreground text-sm font-medium mb-6 z-10 relative">joko.d@email.com</p>
            
            {/* Stats Row */}
            <div className="flex w-full justify-between items-center bg-secondary/80 backdrop-blur-md rounded-lg p-4 z-10 relative border border-border/50">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-1">Poin</span>
                <span className="font-display font-bold text-2xl text-primary">24</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-1">Peringkat</span>
                <span className="font-display font-bold text-2xl text-foreground">#3</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-1">Sempurna</span>
                <span className="font-display font-bold text-xl text-yellow-400 flex items-center gap-1">
                  5 <Star className="w-4 h-4 fill-yellow-400" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Prediction History */}
        <section>
          <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-sm"></span>
            RIWAYAT PREDIKSI
          </h3>
          
          <div className="flex flex-col gap-6">
            
            {/* Group 1 */}
            <div>
              <div className="sticky top-16 md:top-20 z-20 bg-background/90 backdrop-blur-md py-2 mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">12 JUN 2026</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Match 1 */}
                <div className="bg-card rounded-lg p-4 border border-border/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 w-1/3">
                      <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e7-1f1f7.png" alt="BRA" className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="font-display font-bold text-foreground uppercase truncate">BRA</span>
                    </div>
                    <div className="font-display font-black text-xl md:text-2xl tracking-tighter text-foreground bg-secondary/50 px-3 py-1 rounded border border-border/30">
                      2 - 1
                    </div>
                    <div className="flex items-center gap-2 w-1/3 justify-end">
                      <span className="font-display font-bold text-foreground uppercase truncate">FRA</span>
                      <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1eb-1f1f7.png" alt="FRA" className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-background py-2 px-3 rounded border border-border/50">
                    <span className="text-xs text-muted-foreground font-medium">Hasil: 2-1</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-sm flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> +3 PTS
                    </span>
                  </div>
                </div>

                {/* Match 2 */}
                <div className="bg-card rounded-lg p-4 border border-border/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 w-1/3">
                      <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e6-1f1f7.png" alt="ARG" className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="font-display font-bold text-foreground uppercase truncate">ARG</span>
                    </div>
                    <div className="font-display font-black text-xl md:text-2xl tracking-tighter text-foreground bg-secondary/50 px-3 py-1 rounded border border-border/30">
                      1 - 1
                    </div>
                    <div className="flex items-center gap-2 w-1/3 justify-end">
                      <span className="font-display font-bold text-foreground uppercase truncate">ESP</span>
                      <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1ea-1f1f8.png" alt="ESP" className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-background py-2 px-3 rounded border border-border/50">
                    <span className="text-xs text-muted-foreground font-medium">Hasil: 1-0</span>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-sm flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> +1 PT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2 */}
            <div>
              <div className="sticky top-16 md:top-20 z-20 bg-background/90 backdrop-blur-md py-2 mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">10 JUN 2026</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Match 3 */}
                <div className="bg-card rounded-lg p-4 border border-border/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center opacity-70">
                    <div className="flex items-center gap-2 w-1/3">
                      <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f1e9-1f1ea.png" alt="GER" className="w-6 h-6 md:w-8 md:h-8" />
                      <span className="font-display font-bold text-foreground uppercase truncate">GER</span>
                    </div>
                    <div className="font-display font-black text-xl md:text-2xl tracking-tighter text-foreground bg-secondary/50 px-3 py-1 rounded border border-border/30">
                      3 - 0
                    </div>
                    <div className="flex items-center gap-2 w-1/3 justify-end">
                      <span className="font-display font-bold text-foreground uppercase truncate">ENG</span>
                      <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.png" alt="ENG" className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-background py-2 px-3 rounded border border-border/50">
                    <span className="text-xs text-muted-foreground font-medium">Hasil: 0-1</span>
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-sm flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> 0 PTS
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-border rounded-sm"></span>
            PENGATURAN AKUN
          </h3>
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left active:scale-[0.98]">
              <span className="font-medium text-foreground text-sm">Ganti Password</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <div className="mt-4 pb-8">
          <button className="w-full py-4 rounded border border-destructive text-destructive font-display font-bold uppercase tracking-widest text-sm hover:bg-destructive/10 transition-colors active:scale-[0.98] flex justify-center items-center gap-2">
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
        
      </div>
    </div>
  );
}
