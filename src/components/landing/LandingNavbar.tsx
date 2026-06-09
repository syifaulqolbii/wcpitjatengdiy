"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import logo from "@/components/img/it_jaya_putih.png";
import operaLogo from "@/components/img/opera.png";
import aocLogo from "@/components/img/aoc.png";

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0a1010]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-5">
        <Link href="/" className="flex items-center gap-2 md:gap-4">
          <Image
            src={logo}
            alt="IT-JAYA"
            className="h-7 w-auto object-contain sm:h-9 md:h-14"
            priority
          />
          <Image
            src={operaLogo}
            alt="IT Opera"
            className="h-7 w-auto object-contain sm:h-9 md:h-14"
            priority
          />
          <Image
            src={aocLogo}
            alt="AOC"
            className="h-7 w-auto object-contain sm:h-9 md:h-14"
            priority
          />
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <a className="border-b-2 border-primary pb-1 font-bold text-primary" href="#">
            HOME
          </a>
          <a className="font-medium text-muted-foreground transition-colors hover:text-primary" href="#rules">
            RULES
          </a>
          <a className="font-medium text-muted-foreground transition-colors hover:text-primary" href="#leaderboard">
            LEADERBOARD
          </a>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-5 text-sm font-black uppercase leading-none text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(0,230,118,0.35)]"
            href="/register"
          >
            IKUT PREDIKSI
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="ml-auto flex items-center justify-center p-2 text-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-white/5 bg-[#0a1010] px-4 py-4 md:hidden shadow-2xl">
          <nav className="flex flex-col gap-4">
            <a 
              className="font-bold text-primary" 
              href="#"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HOME
            </a>
            <a 
              className="font-medium text-muted-foreground transition-colors hover:text-primary" 
              href="#rules"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              RULES
            </a>
            <a 
              className="font-medium text-muted-foreground transition-colors hover:text-primary" 
              href="#leaderboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              LEADERBOARD
            </a>
            <Link
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary px-5 text-sm font-black uppercase leading-none text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(0,230,118,0.35)]"
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              IKUT PREDIKSI
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
