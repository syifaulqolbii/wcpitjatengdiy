import React from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  type: '404' | 'locked';
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export default function ErrorState({ type, title, description, actionLabel, actionHref }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 relative min-h-[70vh] w-full max-w-md mx-auto">
      {type === '404' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      )}
      
      <div className="relative z-10 flex flex-col items-center text-center w-full bg-background p-8 rounded-[2rem] border border-border/50 shadow-2xl">
        {type === '404' ? (
          <h1 className="font-display font-black text-9xl tracking-tighter text-primary mb-4 leading-none drop-shadow-[0_0_40px_rgba(0,230,118,0.2)]">
            404
          </h1>
        ) : (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl w-32 h-32 -m-4"></div>
            <Lock className="w-24 h-24 text-primary relative z-10 stroke-[1]" />
          </div>
        )}
        
        <h2 className="font-display font-bold text-3xl mb-3">{title}</h2>
        <p className="font-sans text-muted-foreground text-sm mb-10 max-w-[280px]">
          {description}
        </p>
        
        <Link href={actionHref} className="w-full">
          <button className="w-full bg-primary text-background font-display font-bold uppercase tracking-widest py-4 rounded hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_rgba(0,230,118,0.2)]">
            {actionLabel}
          </button>
        </Link>
      </div>
    </div>
  );
}
