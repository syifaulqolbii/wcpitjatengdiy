"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Target, Trophy, User, Copy, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { BrandLogo } from "@/components/shared/BrandLogo";
import qrisImage from "@/components/img/qris.jpeg";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/predictions", label: "Predictions", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const isAdmin = session?.user?.role === "admin";

  const handleCopyDonationNumber = async () => {
    await navigator.clipboard.writeText("085156085641");
    toast.success("Nomor LinkAja disalin");
  };

  return (
    <>
    <nav className="hidden md:flex sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-8">
        <Link href="/dashboard" className="flex items-center">
          <BrandLogo compact className="w-44" />
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
                prefetch={false}
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

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              prefetch={false}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsDonationOpen(true)}
            className="ml-4 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Heart className="h-4 w-4" />
            Support
          </button>
        </div>
      </div>
    </nav>

    {isDonationOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-md">
        <div className="absolute h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border/50 bg-card shadow-[0px_24px_48px_rgba(0,0,0,0.6)]">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary to-emerald-700"></div>
          <div className="p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">Donasi LinkAja</h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">Support maintenance WCP IT Jateng DIY.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDonationOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg border border-border/50 bg-white p-3">
              <img src={qrisImage.src} alt="QRIS LinkAja untuk donasi" className="w-full rounded-md" />
            </div>

            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Nomor LinkAja</p>
              <p className="mt-2 font-display text-3xl font-black tracking-tight text-primary">085156085641</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDonationOpen(false)}
                className="flex-1 rounded-md border border-border px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary/50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleCopyDonationNumber}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-primary/90"
              >
                <Copy className="h-4 w-4" />
                Salin
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
