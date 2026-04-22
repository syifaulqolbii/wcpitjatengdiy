import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Texture & Gradient */}
      <div className="absolute inset-0 bg-diagonal-grid pointer-events-none"></div>
      <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-4 left-4 text-border/40 font-display text-[10rem] font-black leading-none pointer-events-none select-none z-0 -rotate-12 translate-y-1/4 -translate-x-1/4">
        W
      </div>
      <div className="absolute top-4 right-4 text-border/40 font-display text-[8rem] font-black leading-none pointer-events-none select-none z-0 rotate-12 -translate-y-1/4 translate-x-1/4">
        26
      </div>

      <main className="w-full max-w-md px-6 py-4 relative z-10 flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
