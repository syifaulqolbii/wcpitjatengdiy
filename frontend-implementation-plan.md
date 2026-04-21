# Frontend Implementation Plan
## World Cup 2026 Predictor App

---

## 1. Tech Stack & Tooling

| Kategori | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR/SSG hybrid, routing bawaan, API routes |
| Styling | **Tailwind CSS v3** | Mobile-first utility classes, breakpoint handling mudah |
| State Management | **Zustand** | Ringan, cukup untuk 30 user tanpa Redux overhead |
| Auth | **NextAuth.js v5** | Integrasi seamless dengan Next.js, support email+password & OAuth |
| Data Fetching | **TanStack Query (React Query)** | Cache otomatis, refetch interval untuk live match |
| Form | **React Hook Form + Zod** | Validasi tipe aman, performa form optimal |
| Component Library | **shadcn/ui** | Unstyled, customizable, aksesibel |
| Icons | **Lucide React** | Konsisten dengan shadcn/ui |
| Date & Time | **date-fns** | Ringan, tree-shakeable, mudah handle timezone |

---

## 2. Struktur Proyek

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── predictions/
│   │   │   ├── page.tsx          # Daftar semua pertandingan
│   │   │   └── [matchId]/
│   │   │       └── page.tsx      # Form prediksi per match
│   │   ├── leaderboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Layout dengan Navbar
│   ├── admin/
│   │   ├── matches/
│   │   │   ├── page.tsx          # CRUD pertandingan
│   │   │   └── [matchId]/
│   │   │       └── page.tsx      # Edit & input hasil
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Admin layout dengan sidebar
│   ├── api/
│   │   └── auth/[...nextauth]/
│   │       └── route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── LiveMatchBanner.tsx
│   │   └── RecentResultCard.tsx
│   ├── predictions/
│   │   ├── MatchCard.tsx
│   │   ├── ScoreInput.tsx
│   │   ├── PredictionForm.tsx
│   │   └── LockCountdown.tsx
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx
│   │   └── RankBadge.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── BottomNav.tsx         # Mobile bottom navigation
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── hooks/
│   ├── useMatches.ts
│   ├── usePredictions.ts
│   ├── useLeaderboard.ts
│   └── useCountdown.ts
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── api.ts                    # API client (fetch wrapper)
│   ├── utils.ts                  # cn(), format helpers
│   └── validators.ts             # Zod schemas
├── stores/
│   └── userStore.ts              # Zustand: user session state
└── types/
    └── index.ts                  # TypeScript interfaces global
```

---

## 3. Halaman & Komponen Detail

### 3.1 Auth — `/login`

**Komponen:** `LoginForm.tsx`

- Input: Email/Username + Password
- Validasi client-side via Zod (`min(6)`, format email)
- Error state: shake animation + pesan merah inline
- Loading state: tombol disabled + spinner
- Redirect otomatis ke `/dashboard` jika sudah login (middleware Next.js)

```
[ Logo / Brand ]
[ Email Input   ]
[ Password Input]
[ Login Button  ]
[ Lupa Password? ]  ← Opsional: magic link via email
```

---

### 3.2 Dashboard — `/dashboard`

**Komponen:**
- `StatsCard` — Menampilkan: Poin Total, Rank, Tebakan Sempurna
- `LiveMatchBanner` — Pertandingan sedang berlangsung (polling setiap 30 detik via React Query)
- `RecentResultCard` — 3 hasil match terakhir + poin yang didapat user

**Layout Mobile:** Stack vertikal, 1 kolom
**Layout Desktop:** Grid 3 kolom untuk StatsCard, lebar penuh untuk banner

---

### 3.3 Halaman Prediksi — `/predictions`

**Tampilan:** Daftar `MatchCard` dikelompokkan per Group/Round (Group Stage, Round of 32, dst.)

**`MatchCard` states:**
| State | Tampilan |
|---|---|
| Upcoming (terbuka) | Form aktif, countdown lock-in |
| Locked (< 15 menit) | Input disabled, badge "LOCKED" |
| Live | Badge merah animasi "LIVE" |
| Finished | Skor asli ditampilkan + poin yang diraih |

**`ScoreInput`:** Dua input angka besar (min:0, max:99) yang mudah diklik di touchscreen, dipisahkan tanda "-"

**`LockCountdown`:** Timer hitung mundur yang update setiap detik menggunakan `useCountdown` hook

**Anti double-submit:** Tombol disabled + optimistic update via React Query `mutate`

---

### 3.4 Leaderboard — `/leaderboard`

**`LeaderboardTable`:**
- Sticky header saat scroll
- Row milik user sendiri di-highlight berbeda
- Kolom: Rank | Nama | Total Poin | ⭐ Perfect Score
- Tie-breaker visual: jika poin sama, badge "=" di kolom rank
- Mobile: tabel horizontal-scroll tipis dengan kolom utama terkunci (sticky kolom pertama)

**`RankBadge`:** Icon khusus untuk Top 3 (🥇🥈🥉), angka biasa untuk rank 4–30

---

### 3.5 Admin Panel — `/admin`

**Layout:** Sidebar kiri (desktop) / Drawer menu (mobile)

**`/admin/matches`:**
- Tabel daftar semua pertandingan + tombol Tambah / Edit / Hapus
- Modal form: Nama tim A & B, tanggal, waktu, grup/babak
- Tombol "Input Hasil" → membuka modal entry skor asli
- Tombol "Trigger Kalkulasi" → memanggil API endpoint scoring engine, dengan konfirmasi modal agar tidak tidak sengaja diklik

**`/admin/users`:**
- Tabel 30 user: nama, email, status (aktif/belum login)
- Tombol "Generate Invite Link" dengan kuota max 30

---

## 4. Responsive Design Strategy

### Breakpoint Plan (Tailwind)

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| Default (mobile) | < 640px | 1 kolom, bottom nav bar |
| `sm` | ≥ 640px | Padding lebih lebar |
| `md` | ≥ 768px | 2 kolom grid mulai aktif |
| `lg` | ≥ 1024px | Sidebar muncul, 3 kolom |

### Navigasi

- **Mobile:** `BottomNav` fixed di bawah layar (4 item: Dashboard, Prediksi, Leaderboard, Profil)
- **Desktop:** `Navbar` horizontal di atas dengan link dan avatar dropdown

---

## 5. State & Data Fetching

### React Query Setup

```ts
// Polling untuk live match setiap 30 detik
useQuery({
  queryKey: ['matches', 'live'],
  queryFn: fetchLiveMatches,
  refetchInterval: 30_000,
})

// Submit prediksi dengan optimistic update
useMutation({
  mutationFn: submitPrediction,
  onMutate: async (newPrediction) => {
    // Cancel outgoing refetch + snapshot sebelumnya
    // Update cache optimistically
  },
  onError: (err, newPrediction, context) => {
    // Rollback jika error
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['predictions'] })
  }
})
```

### Zustand Store

```ts
// stores/userStore.ts
interface UserStore {
  user: User | null
  rank: number | null
  totalPoints: number
  setUser: (user: User) => void
}
```

---

## 6. Lock-in Mechanism (Frontend)

```ts
// hooks/useCountdown.ts
// Hitung selisih waktu kick-off - 15 menit dari sekarang
// Return: { isLocked, minutesLeft, secondsLeft }

// Di PredictionForm:
const { isLocked } = useCountdown(match.kickoffTime)

<ScoreInput disabled={isLocked} />
<Button disabled={isLocked || isSubmitting}>
  {isLocked ? "Prediksi Terkunci" : "Simpan Prediksi"}
</Button>
```

> ⚠️ Lock-in di frontend hanya untuk UX. Validasi sesungguhnya **wajib** dilakukan di backend/API.

---

## 7. Milestone Frontend

### Tahap 1 — Setup & Foundation (Minggu 1)
- [ ] Init Next.js 14 project + konfigurasi Tailwind, shadcn/ui
- [ ] Setup NextAuth.js (credential provider)
- [ ] Definisi TypeScript types (`User`, `Match`, `Prediction`, `LeaderboardEntry`)
- [ ] Buat layout utama: Navbar (desktop) + BottomNav (mobile)
- [ ] Halaman Login fungsional

### Tahap 2 — Core User Pages (Minggu 2)
- [ ] Dashboard: StatsCard + placeholder data
- [ ] Halaman Predictions: MatchCard list + ScoreInput + form submit
- [ ] Hook `useCountdown` + lock logic
- [ ] Halaman Leaderboard: tabel responsif + highlight row user

### Tahap 3 — Admin Panel (Minggu 3)
- [ ] Route guard admin (middleware role check)
- [ ] CRUD Matches: form modal + tabel
- [ ] Input Hasil + Trigger Kalkulasi
- [ ] Manajemen User + Generate Invite Link

### Tahap 4 — Polish & QA (Minggu 4)
- [ ] Implementasi React Query polling untuk live match
- [ ] Optimistic update pada submit prediksi
- [ ] Loading skeleton & empty states semua halaman
- [ ] Cross-device testing: iPhone SE, Pixel, iPad, desktop 1440px
- [ ] Lighthouse audit: target Performance > 90, Accessibility > 90
- [ ] Error boundary & toast notification system

---

## 8. Catatan Penting

- **Timezone:** Semua waktu pertandingan disimpan dalam UTC di database. Frontend mengkonversi ke timezone lokal user menggunakan `date-fns/formatInTimeZone` agar tidak ada kebingungan jadwal kick-off.
- **Accessibility:** Semua input form harus memiliki `label`, `aria-label`, dan dukungan navigasi keyboard penuh.
- **SEO:** Halaman bersifat private (hanya 30 user), jadi tidak perlu optimasi SEO. Cukup set `robots: noindex`.
- **Environment Variables:** Buat file `.env.local` untuk `NEXTAUTH_SECRET`, `DATABASE_URL`, dan `NEXTAUTH_URL` dari awal.
