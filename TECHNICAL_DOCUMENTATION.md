# Dokumentasi Teknis Lengkap - StudySync

## 1. Struktur Folder Project Lengkap
```
d:\StudySyncAI
├── app/
│   ├── actions/               # Server actions (React Server Actions)
│   │   ├── auth.ts            # Logika Authentication (Login, Register, Signout)
│   │   └── session.ts         # Logika Database (Menyimpan sesi hitungan)
│   ├── calculator/            # (Route) Halaman Kalkulator Durasi Belajar
│   ├── fuzzy-logic/           # (Route) Demo/Debug Fuzzy Logic Visual
│   ├── history/               # (Route) Riwayat Belajar & Analytics
│   ├── login/                 # (Route) Halaman Login User
│   ├── register/              # (Route) Halaman Registrasi User
│   ├── study-tips/            # (Route) Halaman Edukasi Tips Belajar
│   ├── globals.css            # Styling Global Tailwind v4
│   ├── layout.tsx             # Root Layout (Navigasi, Auth Provider, Toaster)
│   └── page.tsx               # (Route) Landing Page
├── components/                # Reusable UI Components
│   ├── layout/                # Komponen Struktur (Navbar, Footer)
│   ├── providers/             # React Context Providers (Theme, StudySync)
│   ├── timer/                 # Komponen Modal Timer Hitung Mundur
│   └── ui/                    # Komponen Micro UI (Toaster, ConfidenceRing)
├── lib/                       # Utama / Core Logic Project
│   ├── fuzzy-engine/          # Logika Fuzzy Mamdani (Derajat Keanggotaan & Rule Base)
│   └── supabase/              # Inisialisasi Supabase (SSR & Client-side)
├── prompt/                    # Berkas Dokumentasi & Prompts AI
├── public/                    # Aset Publik (Gambar, Ikon, dll)
├── tests/                     # Playwright End-to-End Tests
│   ├── e2e/                   # Skenario Spesifikasi Tes E2E (auth, calculator, dll)
│   └── fixtures/              # Konfigurasi Fixture (Session Injection untuk tes)
├── middleware.ts              # Next.js Middleware (Proteksi Route Autentikasi)
├── supabase_schema.sql        # Skema Database PostgreSQL
├── next.config.ts             # Konfigurasi Next.js 16
├── tailwind.config.js / postcss.config.mjs  # Konfigurasi Styling
├── package.json               # Dependensi Proyek
└── tsconfig.json              # Konfigurasi TypeScript
```

## 2. Teknologi yang Digunakan

* **Frontend:** Next.js 16 (App Router), React 19 (Server Components & Server Actions)
* **Backend:** Next.js Server Actions (Node.js runtime)
* **Database:** PostgreSQL (Di-host oleh Supabase)
* **Authentication:** Supabase Auth (Email & Password)
* **State Management:** React Context API (Providers), URL State, dan Local State (`useState`)
* **UI Framework:** Tailwind CSS v4, Framer Motion (Animasi), Lucide React (Ikon), Recharts (Grafik Analytics)
* **Deployment:** Tersedia untuk Vercel / Vercel Edge Runtime (Direkomendasikan Next.js)

## 3. Fitur Utama
1. **Sistem Login dan Registrasi Berbasis RLS:** Keamanan akses data dengan pembatasan Row Level Security.
2. **Kalkulator Fuzzy Mamdani:** Menentukan durasi ideal berdasarkan tiga parameter: Fokus, Kelelahan (Fatigue), Tingkat Kesulitan (Complexity).
3. **Pengelolaan Riwayat (History):** Menyimpan, melacak, dan melihat data sesi belajar sebelumnya.
4. **Dashboard Analitik (Analytics):** Visualisasi konsistensi belajar, rata-rata fokus mingguan, dan Heatmap intensitas belajar.
5. **Study Timer (Pomodoro/Durasi Khusus):** Pop-up modal _countdown timer_ yang langsung diambil dari hasil perhitungan Fuzzy.
6. **Sistem Sinkronisasi Offline/Online (Optimistic UI):** Menghandle peringatan (toast validation) untuk keluhan koneksi.

## 4. Halaman yang Tersedia

* **`/` (Root):** _Landing page_ berisikan call-to-action (CTA) utama.
* **`/login`:** Halaman masuk akun menggunakan kredensial email.
* **`/register`:** Pendaftaran pengguna baru.
* **`/calculator`:** (Protected) Halaman inti untuk input _slider_ dan perhitungan metode Fuzzy Mamdani. 
* **`/history`:** (Protected) Dasbor ringkasan profil, laporan sesi lalu, grafik mingguan (Analytics Layer), serta _heatmap_ intensitas.
* **`/fuzzy-logic`:** (Protected) Laporan teknis atau audit implementasi mesin Fuzzy (Internal debugging/Demo).
* **`/study-tips`:** Halaman publik statis yang berisi artikel atau daftar praktik terbaik belajar efisien.

## 5. Struktur Database (Supabase)

### Tabel `profiles`
* `id` (UUID, Primary Key, berelasi dengan auth.users)
* `full_name` (Text)
* `avatar_url` (Text, opsional)
* `updated_at` (Timestamp dengan timezone)

### Tabel `study_sessions`
* `id` (UUID, PK)
* `user_id` (UUID, berelasi dengan auth.users)
* `focus` (Int, 0-100)
* `fatigue` (Int, 0-100)
* `complexity` (Int, 0-100)
* `duration` (Int, output Fuzzy)
* `category` (Text, ex: "sedang", "panjang")
* `confidence` (Int, 0-100 derajat keyakinan akurasi rule)
* `created_at` (Timestamp)

### Tabel `saved_study_methods`
* `id` (UUID, PK)
* `user_id` (UUID, FK auth.users)
* `method_name` (Text)
* `description` (Text)
* `created_at` (Timestamp)

_Catatan:_ Relasi didasarkan pada `user_id` merujuk ke tabel inti bawaan Supabase `auth.users`, diikat dengan aturan keamanan `Row Level Security` (RLS).

## 6. Diagram Arsitektur Sistem

```mermaid
graph TD
    Client[Browser/Client App] -->|HTTPS| Frontend[Next.js Server / App Router]
    Frontend -->|Server Actions| BackendLogic[Business Logic: Fuzzy Engine]
    Frontend -->|@supabase/ssr| Supabase[Supabase API / GoTrue Auth]
    BackendLogic -->|Return Duration| Client
    Client -->|Save Session| ServerActions[app/actions/session.ts]
    ServerActions -->|Insert/Query| SupabaseDB[(PostgreSQL Database)]
    Supabase --> SupabaseDB
```

## 7. Alur Login

1. Pengguna membuka route `/login`.
2. Input Form (Email & Sandi) dikirimkan menggunakan FormData ke `login` (Server Action) di `actions/auth.ts`.
3. Fungsi mengeksekusi `supabase.auth.signInWithPassword()`.
4. Jika gagal, mengembalikan *object* error. Jika sukses, memicu cookies session SSR dan me-redirect pengguna ke route `/calculator`.

## 8. Alur Registrasi

1. Pengguna membuka `/register` dan menginput (Nama, Email, Sandi).
2. Form dikirimkan ke `signup` (Server Action).
3. Mengeksekusi `supabase.auth.signUp()` dan meneruskan meta-data `full_name`.
4. Saat akun terbentuk di tabel `auth.users`, sebuah trigger RLS manual/upsert via `profiles` dijalankan untuk menyimpan profil.
5. Sesi *cookie* otomatis dipasang, dan pengguna di-redirect ke `/calculator`.

## 9. Alur Perhitungan Fuzzy Mamdani

1. Parameter `Focus`, `Fatigue`, `Complexity` didapatkan melalui Form Range Sliders (0 - 100) di `/calculator`.
2. Nilai dimasukkan ke `lib/fuzzy-engine/index.ts`.
3. **Fuzzifikasi (Fuzzification):** Nilai diubah menjadi Derajat Keanggotaan (Low/Medium/High) menggunakan fungsi Trapezoidal dan Segitiga (_Trapezoid / Triangle_).
4. **Inferensi (Rule Evaluation):** Penerapan kombinasi aturan Mamdani (contoh: IF Low Focus AND High Fatigue THEN Sangat Pendek). Mesin menghitung kekuatan aturan (MIN nilai agregat).
5. **Defuzzifikasi (Defuzzification):** Mengagregasi centroid (*Center of Gravity*) untuk menyimpulkan durasi akhir (`duration` dalam hitungan menit). Rentang output 15 - 150 menit.

## 10. Alur Penyimpanan Sesi Belajar

1. Setelah hasil Fuzzy ditampilkan, pengguna menekan tombol "Simpan Sesi" / "Mulai Timer".
2. Aplikasi memanggil Server Action `saveSession` yang ada di `actions/session.ts`.
3. Validasi angka desimal dilakukan (Pembulatan `Math.round()` menjadi angka integritas utuh atau _integer type check_).
4. `user_id` diambil dari sesi otentikasi saat ini, lalu _payload_ di-_INSERT_ ke tabel Supabase `study_sessions`.
5. Apabila offline, UI menampilkan *toast* "Gagal Menyimpan" dan _Retries_ bisa dipicu. Bila berhasil, menampilkan "Sesi Tersimpan".

## 11. Alur Analytics

1. Pengguna memuat route `/history`.
2. Server merender pemanggilan `getStudySessions()` mengambil _array_ sesi bulan ini dan bulan lalu milik *user*.
3. Data disuplai ke utilitas logika analitik berbasis tanggal (misal `Recharts`). 
4. Menampilkan perhitungan: Konsistensi belajar mingguan berupa rata-rata persentase fokus, maupun komparasi produktivitas.

## 12. Alur History

1. Sama seperti Analytics, berpusat di `/history`.
2. Menarik data yang dibatasi dari basis data (misal spesifik minggu/hari ini) agar tidak _overhead_.
3. Menampilkan elemen `Heatmap Intensity Grid` (Matriks 7 hari / 4 Minggu) didasarkan pada keberadaan dan panjang durasi hari itu.
4. Menampilkan _Current Streak_ yang akan ter-*increment* bila ada sesi tersimpan dari hari berurutan.

## 13. Daftar Komponen React Utama

* **`StudySyncProvider`**: Manajemen State Global dan penyedia Theme.
* **`Navbar` / `Footer`**: Header adaptif dengan menu navigasi dinamis (Jika sudah / belum login).
* **`TimerModal`**: _Pop-up Modal_ sistem hitung mundur (Pomodoro).
* **`ConfidenceRing`**: Lingkaran persentase derajat akurasi rule evaluasi fuzzy.
* **`Toaster`**: Penyedia pop-up _alerts/notifications_.

## 14. Daftar API/Service yang Digunakan

* **Supabase GoTrue (Auth API):** Mengelola sesi, JWT, otentikasi.
* **Supabase PostgREST:** Berinteraksi transaksional (_CRUD_) dengan database langsung via metode RPC atau ORM *client-side*.

## 15. Daftar Library npm Utama

* **`next`**: v16.2.6 (Kerangka kerja Frontend).
* **`react` / `react-dom`**: v19.2.4 (Perender antarmuka).
* **`@supabase/ssr` / `@supabase/supabase-js`**: Komunikasi Backend & Database.
* **`tailwindcss`**: v4 (Sistem penulisan _stylesheet_ utilitas).
* **`framer-motion`**: (Modul animasi mikro UI/UX yang mulus).
* **`recharts`**: (Visualisasi *chart* History dan Analytics).
* **`@playwright/test`**: (Alat pengetesan aplikasi _End-to-End_).

## 16. Ringkasan Implementasi (Untuk Laporan Akademik - BAB III/IV)

**Ringkasan untuk Implementasi Sistem (Bab III/IV):**  
Sistem _StudySync_ direkayasa di atas arsitektur perenderan modern dengan memanfaatkan **Next.js 16** dan **React 19** sebagai platform kerangka _Frontend_ secara responsif, didukung integrasi _Backend Client_ lewat platfrom ekosistem **Supabase**. Hal substansial dalam rekayasa perangkat lunak ini adalah implementasi pustaka fungsi logis yang di-kustomisasi dalam `lib/fuzzy-engine/index.ts`. Engine tersebut bertanggung jawab mengekstrapolasi metode kalkulasi logika prediktif _Mamdani Fuzzy Inference System_ (FIS) yang memproses representasi tingkat kefokusan, keletihan, dan kerumitan materi dari basis kriteria _numeric slider_ untuk diubah menjadi durasi rekomendasi dengan nilai rentang linier pasti. 

Desain penyimpanan data menerapkan sistem arsitektur relasional `PostgreSQL` dari Supabase, di mana tabel `study_sessions` dilindungi protokol _Row Level Security_ (RLS) guna menjamin validitas dan rahasia log pengguna dari entitas luar. Keunggulan dari metode ini dipadukan bersama *Server Actions* Next.js memungkinkan transaksi manipulasi data (`INSERT`, `SELECT`, `UPDATE`) tidak mendelegasikan API layer klasik namun dieksekusi secara instan dari level *Server Component*. Hal ini menekan latensi serta menjamin integritas data (Contoh pengkategorian proteksi _integer constraint_ dalam database) sehingga sistem analitik dan rekam jejak di dalam _Dashboard_ mampu merender informasi statistik seperti rata-rata dan komparasi secara lebih akurat, cepat, dan konsisten.
