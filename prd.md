Product Requirements Document (PRD)
Nama Produk: World Cup 2026 Predictor App
Platform: Web-based (Responsive: Mobile & Desktop)
Target Pengguna: 30 Orang (Grup privat/komunitas)

1. Ringkasan Eksekutif (Overview)
Aplikasi berbasis web untuk memfasilitasi permainan tebak skor Piala Dunia 2026 secara privat. Platform ini memungkinkan hingga 30 pemain untuk memasukkan prediksi skor setiap pertandingan dan bersaing di papan klasemen (leaderboard) yang diperbarui secara otomatis berdasarkan hasil pertandingan nyata.

2. Objektif Produk
Menyediakan antarmuka yang cepat, ringan, dan 100% responsif (nyaman diakses via layar smartphone maupun monitor desktop).

Mengotomatisasi perhitungan poin dan perankingan leaderboard tanpa perlu rekap manual menggunakan spreadsheet.

Memastikan sistem otentikasi yang sederhana namun aman untuk menjaga privasi 30 anggota grup.

3. Aturan Main & Sistem Poin (Business Logic)
Untuk menjaga agar permainan tetap kompetitif, sistem poin diatur sebagai berikut (bisa disesuaikan):

Tebakan Sempurna (Perfect Score) - 3 Poin: Pemain menebak skor akhir dengan tepat. (Contoh: Tebak 2-1, Hasil 2-1).

Tebakan Hasil Benar (Correct Result) - 1 Poin: Pemain menebak pemenang atau hasil seri dengan benar, namun skornya tidak tepat. (Contoh: Tebak 2-0, Hasil 3-1).

Tebakan Salah - 0 Poin: Pemenang dan skor salah.

Batas Waktu (Lock-in Time): Input prediksi otomatis dikunci (disabled) 15 menit sebelum kick-off setiap pertandingan.

4. Kebutuhan Fungsional (Functional Requirements)
A. Sisi Pengguna (User/Player)
Autentikasi (Auth):

Login menggunakan Username/Email dan Password.

(Opsional) Fitur magic link atau OAuth sederhana (Google) agar pengguna tidak lupa password.

Dashboard Utama:

Menampilkan ringkasan poin saat ini dan posisi ranking pengguna.

Menampilkan pertandingan yang sedang berlangsung (Live) atau hasil pertandingan terakhir.

Halaman Prediksi (Match List):

Daftar pertandingan mendatang yang diurutkan berdasarkan tanggal & waktu.

Form input angka (skor tim A vs skor tim B) yang mudah diklik di layar touchscreen.

Tombol "Simpan Prediksi" yang memberikan feedback visual jika berhasil disimpan.

Halaman Leaderboard:

Tabel peringkat 1 hingga 30.

Menampilkan Kolom: Peringkat, Nama Pemain, Total Poin, Jumlah Tebakan Sempurna (sebagai tie-breaker jika poin sama).

B. Sisi Admin (Administrator)
Manajemen Pertandingan:

Fungsi CRUD (Create, Read, Update, Delete) untuk jadwal pertandingan.

Update Hasil Pertandingan:

Input skor akhir pertandingan nyata (real result).

Tombol "Trigger Kalkulasi" untuk menjalankan algoritma distribusi poin ke 30 pemain dan memperbarui leaderboard.

Manajemen Pengguna:

Pendaftaran 30 pengguna secara manual (oleh admin) atau melalui invite link khusus untuk membatasi kuota pendaftar.

5. Kebutuhan Non-Fungsional (Non-Functional Requirements)
Responsivitas (UI/UX): Menggunakan Mobile-First Design. Komponen input form, navbar, dan tabel leaderboard harus menyesuaikan viewport secara dinamis tanpa horizontal scrolling yang mengganggu di smartphone.

Performa: Waktu muat halaman pertama di bawah 2 detik. Mengingat hanya 30 pengguna, beban database akan sangat ringan.

Keandalan (Reliability): Sistem harus mencegah double submission (submit skor berkali-kali akibat koneksi lambat).

6. Rekomendasi Tech Stack (Untuk Fullstack Development)
Mengingat spesifikasi yang dibutuhkan, arsitektur yang modern namun ringan akan sangat cocok:

Frontend: Next.js (React) atau Nuxt.js (Vue). Sangat optimal untuk routing yang cepat dan state management sederhana.

Styling: Tailwind CSS. Sangat efisien untuk memastikan tata letak responsif (grid, flexbox, breakpoint handling untuk mobile dan desktop).

Backend / API:

Jika menggunakan Next.js/Nuxt, manfaatkan API Routes bawaan agar tidak perlu memisahkan repository backend.

Bisa juga menggunakan Node.js (Express) jika ingin membuat microservice terpisah.

Database: PostgreSQL (menggunakan Prisma ORM atau Drizzle) atau opsi BaaS seperti Supabase / Firebase agar manajemen Auth dan sinkronisasi data lebih instan.

Deployment: Akses hosting yang fleksibel, misalnya menggunakan layanan cloud Vercel untuk frontend, dan database di cloud tier gratis, atau men-deploy keseluruhan sistem (Dockerized) di dalam VPS Linux Ubuntu (self-hosted).

7. Fase Pelaksanaan (Milestones)
Tahap 1 (Design & Setup): Inisiasi repository, setup database schema (Tabel: Users, Matches, Predictions), dan wireframing UI.

Tahap 2 (Core Development): Pembuatan sistem Auth, halaman jadwal pertandingan, logika input prediksi skor, dan batas waktu lock-in.

Tahap 3 (Scoring Engine): Pengembangan algoritma di backend untuk mencocokkan skor asli dengan tebakan pengguna, lalu menghitung poin ke leaderboard.

Tahap 4 (Testing & Deployment): Uji coba UI di beberapa resolusi perangkat (tes di layar desktop dan browser smartphone), pengujian beban sederhana, dan peluncuran final ke production.