"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/predictions", label: "Predict", icon: Target },
  { href: "/leaderboard", label: "Rank", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background pb-2 pt-2">
      <div className="flex h-16 w-full items-center justify-around px-2">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
