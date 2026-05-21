"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Swords, Users, LineChart, Settings, LogOut, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { BrandLogo } from '@/components/shared/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
    const isActive = pathname === href;
    
    return (
      <li>
        <Link 
          href={href} 
          className={cn(
            "flex items-center px-4 py-3 transition-all duration-200 rounded font-display font-bold text-sm uppercase tracking-widest",
            isActive 
              ? "bg-primary text-background shadow-[0_0_15px_rgba(0,230,118,0.3)] translate-x-1" 
              : "text-muted-foreground hover:text-primary hover:bg-secondary/40"
          )}
        >
          <Icon className={cn("mr-3 w-5 h-5", isActive ? "text-background" : "text-primary/50")} />
          {children}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* SideNavBar */}
      <nav aria-label="Main Navigation" className="fixed left-0 top-0 h-full flex flex-col p-6 space-y-8 bg-secondary/20 w-64 border-r border-border/50 z-20">
        <div className="mb-4">
          <Link href="/dashboard" aria-label="Kembali ke dashboard user" className="mb-3 block w-44">
            <BrandLogo compact />
          </Link>
          <p className="text-muted-foreground text-xs font-display uppercase tracking-widest">ADMIN CONSOLE</p>
        </div>
        
        <ul className="flex flex-col space-y-2 flex-grow">
          <NavLink href="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink href="/admin/matches" icon={Swords}>Match Management</NavLink>
          <NavLink href="/admin/users" icon={Users}>User Management</NavLink>
          <NavLink href="/admin/groups" icon={UsersRound}>Group Management</NavLink>
          <NavLink href="/admin/insights" icon={LineChart}>User Insights</NavLink>
          <NavLink href="/admin/system-settings" icon={Settings}>System Settings</NavLink>
        </ul>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-destructive text-destructive-foreground font-display font-bold uppercase tracking-wider py-3 px-4 rounded hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex justify-center items-center"
        >
          <LogOut className="mr-2 w-5 h-5" />
          LOGOUT
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col h-full overflow-y-auto relative bg-background">
        {children}
      </main>
    </div>
  );
}
