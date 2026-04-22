"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Trophy, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/predictions", label: "Predictions", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display font-bold text-2xl text-primary tracking-wider uppercase">
            WC 2026
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Logout Button (Placeholder for now) */}
          <button className="ml-4 flex items-center gap-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
