import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Crown,
  CircleDot,
  LockKeyhole,
  Medal,
  Trophy,
} from "lucide-react";
import { CountdownTimer } from "@/components/landing/CountdownTimer";
import logo from "@/components/img/it_jaya_putih.png";
import operaLogo from "@/components/img/opera.png";
import aocLogo from "@/components/img/aoc.png";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

const leaderboard = [
  { rank: "04", name: "JODY MULYADI", points: 42 },
  { rank: "05", name: "POSISI KAMU", points: 39, current: true, title: "PREVIEW RANK" },
  { rank: "06", name: "RAFI IGUN", points: 37 },
  { rank: "07", name: "PAKDE DIVANDA", points: 35 },
];

const podium = [
  { rank: 2, initials: "HB", name: "HABIB", points: 48, className: "order-2 h-44 md:order-1 md:w-1/4 md:h-48" },
  { rank: 1, initials: "MR", name: "MARIO", points: 52, className: "order-1 h-60 border-t-8 border-primary md:order-2 md:w-1/3 md:h-64" },
  { rank: 3, initials: "HD", name: "HENDRITIM", points: 45, className: "order-3 h-40 md:w-1/4" },
];

const rules = [
  {
    number: "01",
    title: "DAFTAR & MASUK",
    description: "Masuk dengan kode komunitas IT Jateng DIY, lalu siapkan profil prediktor Anda.",
    icon: LockKeyhole,
    accent: "text-primary",
    border: "group-hover:border-primary/30",
    glow: "from-primary/10",
  },
  {
    number: "02",
    title: "BUAT PREDIKSI",
    description: "Pilih skor sebelum kick-off. Keputusan cepat, poinnya bisa besar.",
    icon: CircleDot,
    accent: "text-cyan-300",
    border: "group-hover:border-cyan-300/30",
    glow: "from-cyan-300/10",
  },
  {
    number: "03",
    title: "KUMPULKAN POIN",
    description: "Akurasi skor, hasil, dan tebakan juara akan menentukan posisi klasemen.",
    icon: Trophy,
    accent: "text-amber-300",
    border: "group-hover:border-amber-300/30",
    glow: "from-amber-300/10",
  },
];

const scoring = [
  {
    title: "PERFECT SCORE",
    value: "5",
    label: "POINTS",
    example: '"Tebak 2-1 -> Hasil 2-1"',
    className: "border-primary/30 from-primary/20",
    textClassName: "text-primary",
  },
  {
    title: "CORRECT RESULT",
    value: "2",
    label: "POINTS",
    example: '"Tebak 1-0 -> Hasil 2-1"',
    className: "border-cyan-300/30 from-cyan-300/20",
    textClassName: "text-cyan-300",
  },
  {
    title: "TEBAK JUARA",
    value: "+30",
    label: "BONUS POINTS",
    example: "Prediksi Juara Turnamen",
    className: "border-amber-300/35 from-amber-300/20",
    textClassName: "text-amber-300",
  },
];

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html {
          scroll-behavior: smooth;
        }

        .leaderboard-row-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 40%;
          transform: translateX(-120%) skewX(-14deg);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          pointer-events: none;
        }

        @media (prefers-reduced-motion: no-preference) {
          .landing-fade-up {
            animation: landingFadeUp 700ms ease both;
          }

          .landing-fade-up-delay {
            animation: landingFadeUp 900ms 120ms ease both;
          }

          .stadium-spotlight-left {
            animation: stadiumSweepLeft 9s ease-in-out infinite alternate;
          }

          .stadium-spotlight-right {
            animation: stadiumSweepRight 10s ease-in-out infinite alternate;
          }

          .stadium-crowd-shimmer {
            animation: crowdShimmer 4s ease-in-out infinite;
          }

          .stadium-ball-trail {
            animation: ballArc 8s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          }

          .leaderboard-podium-rise {
            animation: podiumRise 700ms ease both;
          }

          .leaderboard-crown-pulse {
            animation: crownPulse 2.6s ease-in-out infinite;
          }

          .leaderboard-row-shine::after {
            animation: rowShine 3.8s ease-in-out infinite;
          }

          .leaderboard-current-glow {
            animation: currentGlow 2.8s ease-in-out infinite;
          }
        }

        @keyframes landingFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes stadiumSweepLeft {
          from {
            transform: translateX(-12%) rotate(10deg);
            opacity: 0.28;
          }
          to {
            transform: translateX(18%) rotate(16deg);
            opacity: 0.46;
          }
        }

        @keyframes stadiumSweepRight {
          from {
            transform: translateX(12%) rotate(-10deg);
            opacity: 0.24;
          }
          to {
            transform: translateX(-18%) rotate(-16deg);
            opacity: 0.42;
          }
        }

        @keyframes crowdShimmer {
          0%, 100% {
            opacity: 0.18;
            filter: brightness(0.8);
          }
          50% {
            opacity: 0.34;
            filter: brightness(1.35);
          }
        }

        @keyframes ballArc {
          0% {
            transform: translate3d(-42vw, 18px, 0) scale(0.7);
            opacity: 0;
          }
          12% {
            opacity: 0.9;
          }
          48% {
            transform: translate3d(0, -74px, 0) scale(1);
            opacity: 0.9;
          }
          88% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(42vw, 18px, 0) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes podiumRise {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes crownPulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.82;
          }
          50% {
            transform: translateY(-4px) scale(1.07);
            opacity: 1;
          }
        }

        @keyframes rowShine {
          0%, 72% {
            transform: translateX(-120%);
            opacity: 0;
          }
          82% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }

        @keyframes currentGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(34, 211, 238, 0);
          }
          50% {
            box-shadow: 0 0 34px rgba(34, 211, 238, 0.22);
          }
        }
      `}} />
      <main className="min-h-screen overflow-hidden bg-[#0e0e0e] text-foreground">
        <LandingNavbar />

        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6">
          <div className="absolute inset-0 -rotate-12 scale-150 bg-[radial-gradient(circle_at_center,rgba(0,230,118,0.36)_1px,transparent_1px)] bg-[length:24px_24px] opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-cyan-300/10 via-primary/5 to-transparent" />
          <div className="absolute left-0 top-1/4 h-80 w-80 rounded-full bg-amber-300/5 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="stadium-crowd-shimmer absolute left-0 right-0 top-20 h-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28)_1px,transparent_1.8px)] bg-[length:18px_10px] opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black_35%,transparent)] md:top-24 md:h-32" />
            <div className="stadium-spotlight-left absolute -left-1/4 top-0 h-[72vh] w-2/3 origin-top bg-[linear-gradient(110deg,transparent_8%,rgba(255,255,255,0.18)_45%,transparent_78%)] blur-sm" />
            <div className="stadium-spotlight-right absolute -right-1/4 top-0 h-[72vh] w-2/3 origin-top bg-[linear-gradient(250deg,transparent_8%,rgba(63,255,139,0.14)_45%,transparent_78%)] blur-sm" />
            <div className="absolute bottom-0 left-1/2 h-48 w-[120vw] -translate-x-1/2 rounded-[50%_50%_0_0] border-t border-primary/25 bg-[radial-gradient(ellipse_at_center,rgba(0,230,118,0.18),rgba(14,14,14,0)_62%)] md:h-64" />
            <div className="absolute bottom-4 left-1/2 h-36 w-[92vw] -translate-x-1/2 skew-y-[-2deg] rounded-t-full border border-primary/20 [mask-image:linear-gradient(to_top,black,transparent_82%)] md:h-48 md:w-[72vw]" />
            <div className="absolute bottom-8 left-1/2 h-px w-[76vw] -translate-x-1/2 bg-primary/30 shadow-[0_0_22px_rgba(0,230,118,0.5)] md:w-[54vw]" />
            <div className="stadium-ball-trail absolute bottom-32 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9),0_0_28px_rgba(0,230,118,0.55)] md:bottom-40 md:h-4 md:w-4" />
          </div>
          <div className="landing-fade-up relative z-10 mx-auto flex max-w-6xl flex-col items-center">
            <span className="mb-8 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 sm:text-xs">
              PRIVATE WORLD CUP 2026 GAME
            </span>
            <h1 className="mb-6 max-w-6xl font-display text-4xl font-black uppercase leading-[0.92] tracking-tighter text-white drop-shadow-2xl sm:text-6xl md:text-[104px]">
              IT OPERA
              <br />
              <span className="text-primary">WORLD CUP PREDICTION</span>
            </h1>
            <p className="mb-10 max-w-2xl text-base font-medium leading-7 text-muted-foreground sm:text-lg md:mb-12 md:text-xl">
              Tebak skor, adu insting sepak bola dengan rekan komunitas, dan pantau posisi Anda sepanjang World Cup 2026.
            </p>
            <div className="mb-12 md:mb-16">
              <CountdownTimer />
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-5">
              <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto md:max-w-none">
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-primary px-8 text-center font-display text-sm font-black uppercase leading-tight text-primary-foreground transition-transform hover:scale-105 sm:text-base md:min-h-14 md:px-10"
                  href="/login"
                >
                  MASUK
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border-2 border-primary px-8 text-center font-display text-sm font-black uppercase leading-tight text-primary transition-colors hover:bg-primary/10 sm:text-base md:min-h-14 md:px-10"
                  href="/register"
                >
                  DAFTAR DENGAN KODE
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center text-muted-foreground opacity-60 md:flex">
            <span className="mb-2 text-[10px] font-black uppercase tracking-[0.3em]">SCROLL</span>
            <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden="true" />
          </div>
        </section>

        <section className="landing-fade-up-delay bg-[linear-gradient(180deg,#121818_0%,#101010_100%)] px-4 py-24 sm:px-6 md:py-32" id="rules">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 font-display text-4xl font-black uppercase tracking-tighter sm:text-5xl md:mb-20 md:text-8xl">
              CARA <span className="text-primary">MAIN</span>
            </h2>
            <div className="grid gap-5 md:grid-cols-3 md:gap-8">
              {rules.map((rule) => {
                const Icon = rule.icon;
                return (
                  <article
                    className={`group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-md border border-white/5 bg-[#201f1f] bg-gradient-to-br ${rule.glow} to-transparent p-8 transition-colors md:h-80 md:p-10 ${rule.border}`}
                    key={rule.number}
                  >
                    <span className="absolute -right-3 -top-10 select-none font-display text-[150px] font-black leading-none text-white/5 transition-opacity group-hover:text-white/10 md:text-[200px]">
                      {rule.number}
                    </span>
                    <Icon className={`mb-6 h-11 w-11 md:h-12 md:w-12 ${rule.accent}`} aria-hidden="true" />
                    <h3 className="font-display text-xl font-black uppercase md:text-2xl">{rule.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{rule.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_30%),linear-gradient(180deg,#0e0e0e_0%,#11130f_100%)] px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-left font-display text-4xl font-black uppercase tracking-tighter sm:text-5xl md:mb-20 md:text-right md:text-8xl">
              SISTEM <span className="text-primary">POIN</span>
            </h2>
            <div className="grid gap-5 md:grid-cols-3 md:gap-8">
              {scoring.map((item) => (
                <article
                  className={`flex min-h-[300px] flex-col items-center justify-center rounded-md border bg-gradient-to-br to-[#201f1f] p-8 text-center shadow-[0_0_50px_rgba(0,230,118,0.08)] md:min-h-[360px] md:p-12 ${item.className}`}
                  key={item.title}
                >
                  <h3 className="mb-4 font-display text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {item.title}
                  </h3>
                  <div className={`mb-6 font-display text-7xl font-black md:text-8xl ${item.textClassName}`}>
                    {item.value}
                  </div>
                  <p className="mb-4 text-sm font-black uppercase tracking-[0.2em]">{item.label}</p>
                  <p className="inline-block rounded-md bg-black px-4 py-3 text-sm italic text-muted-foreground">
                    {item.example}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_70%_10%,rgba(251,191,36,0.08),transparent_32%),linear-gradient(180deg,#050707_0%,#0f1414_100%)] px-4 py-24 sm:px-6 md:py-32" id="leaderboard">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase text-cyan-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  PREVIEW DATA
                </span>
                <h2 className="font-display text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-8xl">
                  LEADER<span className="text-primary">BOARD</span>
                </h2>
              </div>
              <p className="max-w-sm text-left font-medium leading-7 text-muted-foreground md:text-right">
                Contoh tampilan klasemen. Data lengkap dan posisi asli tersedia setelah Anda masuk.
              </p>
            </div>

            <div className="mb-12 flex flex-col items-stretch justify-center gap-4 md:mb-16 md:flex-row md:items-end">
              {podium.map((player) => (
                <article
                  className={`leaderboard-podium-rise relative flex w-full flex-col items-center justify-center overflow-hidden rounded-t-lg border border-white/5 bg-[#1a1919] p-6 text-center transition-transform duration-300 hover:-translate-y-2 ${player.rank === 1 ? "bg-gradient-to-b from-amber-300/10 to-[#1a1919]" : "bg-gradient-to-b from-cyan-300/5 to-[#1a1919]"} ${player.className}`}
                  style={{ animationDelay: `${player.rank * 90}ms` }}
                  key={player.rank}
                >
                  {player.rank === 1 ? (
                    <>
                      <Crown className="leaderboard-crown-pulse absolute -top-1 h-16 w-16 text-amber-300/35" aria-hidden="true" />
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-300/15 shadow-[0_0_28px_rgba(251,191,36,0.16)]">
                        <Medal className="h-10 w-10 text-amber-300" aria-hidden="true" />
                      </div>
                      <p className="font-display text-3xl font-black uppercase tracking-tighter">{player.name}</p>
                      <p className="font-display text-4xl font-black text-amber-300">{player.points} PTS</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#262626] font-display font-bold">
                        {player.initials}
                      </div>
                      <p className="font-display text-xl font-black uppercase">{player.name}</p>
                      <p className="font-display text-2xl font-black text-cyan-200">{player.points} PTS</p>
                    </>
                  )}
                </article>
              ))}
            </div>

            <div className="space-y-2">
              {leaderboard.map((player) => (
                <div
                  className={
                    player.current
                      ? "leaderboard-current-glow relative flex items-center justify-between gap-4 overflow-hidden rounded-md bg-cyan-300 p-5 text-slate-950 shadow-lg md:p-6"
                      : "leaderboard-row-shine relative flex items-center justify-between gap-4 overflow-hidden rounded-md bg-[#1a1919] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-[#201f1f] md:p-6"
                  }
                  key={player.rank}
                >
                  <div className="flex min-w-0 items-center gap-4 md:gap-6">
                    <span className="w-8 shrink-0 font-display font-black text-current opacity-70">{player.rank}</span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-black uppercase sm:text-base md:text-xl">
                        {player.name}
                      </p>
                      {player.current ? (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{player.title}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 font-display text-xl font-black md:text-3xl">{player.points} PTS</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-md border border-white/10 bg-[#131313] p-5 text-center md:flex-row md:text-left">
              <p className="text-sm font-medium leading-6 text-muted-foreground">
                Preview ini hanya contoh. Masuk untuk melihat klasemen real-time komunitas IT Jateng DIY.
              </p>
              <Link
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-cyan-300 px-6 text-center font-display text-sm font-black uppercase leading-tight text-slate-950 transition-transform hover:scale-105"
                href="/leaderboard"
              >
                Lihat Klasemen Lengkap
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#3fff8b_0%,#22d3ee_100%)] px-4 py-20 text-slate-950 sm:px-6 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25)_1px,transparent_1px)] bg-[length:24px_24px] opacity-30 mix-blend-overlay" />
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-4 font-display text-5xl font-black uppercase leading-[0.85] tracking-tighter md:text-8xl">
                SIAP
                <br />
                BERSAING?
              </h2>
              <p className="font-display text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
                Kick-off pertama: 11 Juni 2026.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:min-w-[560px]">
              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-sm bg-slate-950 px-6 text-center font-display text-sm font-black uppercase leading-tight text-white shadow-2xl transition-transform hover:scale-105 sm:text-base md:min-h-16 md:px-8"
                href="/register"
              >
                DAFTAR SEKARANG
              </Link>
              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-sm border-4 border-slate-950 px-6 text-center font-display text-sm font-black uppercase leading-tight text-slate-950 transition-colors hover:bg-slate-950/10 sm:text-base md:min-h-16 md:px-8"
                href="/login"
              >
                SUDAH PUNYA AKUN? MASUK
              </Link>
            </div>
          </div>
        </section>

        <footer className="bg-black px-4 py-16 sm:px-6 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 md:flex-row">
            <div className="text-center md:text-left">
              <span className="mb-2 block font-display text-2xl font-black uppercase text-white">
                IT JATENG DIY WORLD CUP PREDICTION
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                © 2026 IT JATENG DIY · PRIVATE COMMUNITY GAME
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <a className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary" href="#rules">
                RULES
              </a>
              <a className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary" href="#leaderboard">
                LEADERBOARD
              </a>
              <Link className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary" href="/login">
                LOGIN
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
