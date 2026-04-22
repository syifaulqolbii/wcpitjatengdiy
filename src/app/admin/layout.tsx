import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Swords, Users, LineChart, Settings, Plus } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* SideNavBar */}
      <nav aria-label="Main Navigation" className="fixed left-0 top-0 h-full flex flex-col p-6 space-y-8 bg-secondary/20 w-64 border-r border-border/50 z-20">
        <div className="mb-4">
          <h1 className="text-primary font-black text-xl tracking-tight leading-none mb-1 font-display">STADIUM PULSE</h1>
          <p className="text-muted-foreground text-xs font-display uppercase tracking-widest">ADMIN CONSOLE</p>
        </div>
        
        <ul className="flex flex-col space-y-2 flex-grow">
          <li>
            <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all duration-200 rounded font-display font-bold text-sm uppercase tracking-widest">
              <LayoutDashboard className="mr-3 w-5 h-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/matches" className="flex items-center px-4 py-3 bg-primary text-background font-bold rounded shadow-[0_0_15px_rgba(0,230,118,0.3)] font-display text-sm uppercase tracking-widest translate-x-1">
              <Swords className="mr-3 w-5 h-5" />
              Match Management
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="flex items-center px-4 py-3 text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all duration-200 rounded font-display font-bold text-sm uppercase tracking-widest">
              <Users className="mr-3 w-5 h-5" />
              User Management
            </Link>
          </li>
          <li>
            <Link href="/admin/insights" className="flex items-center px-4 py-3 text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all duration-200 rounded font-display font-bold text-sm uppercase tracking-widest">
              <LineChart className="mr-3 w-5 h-5" />
              User Insights
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="flex items-center px-4 py-3 text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all duration-200 rounded font-display font-bold text-sm uppercase tracking-widest">
              <Settings className="mr-3 w-5 h-5" />
              System Settings
            </Link>
          </li>
        </ul>
        
        <button className="w-full bg-primary text-background font-display font-bold uppercase tracking-wider py-3 px-4 rounded hover:shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all flex justify-center items-center">
          <Plus className="mr-2 w-5 h-5" />
          NEW MATCH
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col h-full overflow-y-auto relative bg-background">
        {children}
      </main>
    </div>
  );
}
