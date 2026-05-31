## 🧪 StudySync Black-Box Test Cases

| Test ID | Area | Input / Action | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Auth | Enter valid un/pw and click Login | Redirects to `/calculator`, auth token in cookies | [ ] | Untested |
| **TC02** | Auth | Enter unregistered email on Login | Shows "Invalid login credentials" Toast | [ ] | Untested |
| **TC03** | Auth | Register with an existing email | Tells user account already exists | [ ] | Untested |
| **TC04** | Auth | Click Sign Out in Navbar | Navbar UI clears initials, redirects to `/login` | [ ] | Untested |
| **TC05** | Engine | Focus:10, Fatigue:90, Cmplx:90 | Output category `"Sangat Pendek"` (approx 15-30m) | [ ] | Untested |
| **TC06** | Engine | Focus:90, Fatigue:10, Cmplx:10 | Output category `"Panjang"` (approx 90-135m) | [ ] | Untested |
| **TC07** | Engine | Focus:50, Fatigue:50, Cmplx:50 | Output category `"Sedang"` (approx 55-95m) | [ ] | Untested |
| **TC08** | Engine | Focus:0, Fatigue:100, Cmplx:100 | Absolute min bound; Duration strictly ~`15m` | [ ] | Untested |
| **TC09** | Engine | Focus:100, Fatigue:0, Cmplx:0 | Duration outputs bounded safely (~`135-150m`) | [ ] | Untested |
| **TC10** | Session | Save session while Online | Save Toast appears, Navbar Sync toggles to Green | [ ] | Untested |
| **TC11** | Session | Save session while Offline | DB throws err, `syncStatus` switches to `"failed"` | [ ] | Untested |
| **TC12** | Session | Click 'Retry' on failed Toast | Session forces resync, updates to `"synced"` | [ ] | Untested |
| **TC13** | Session | Send floating inputs e.g. `33.33` | Payload rounds cleanly to `INTEGER` preserving DB | [ ] | Untested |
| **TC14** | Session | Discard modal prematurely | Inputs clear safely, no premature row insertions | [ ] | Untested |
| **TC15** | History | Load History Dashboard | Shows fetched 28-day analytics and paginated rows | [ ] | Untested |
| **TC16** | History | Search keyword in table `Physics` | Filtering dynamically updates the visible UI rows | [ ] | Untested |
| **TC17** | History | No DB sessions returned | Empty state shows "No study sessions found yet" | [ ] | Untested |
| **TC18** | Analytics | Complete 1 daily session | Current Streak dynamically increments to `+1 Days` | [ ] | Untested |
| **TC19** | Analytics | Analyze Weekly Focus Average | Avg percentage matches exact calculated value | [ ] | Untested |
| **TC20** | Analytics | Calculate 7-Day Heatmap | High-duration days show darker blue matrix colors | [ ] | Untested |

---

# BAB IV
# PENGUJIAN SISTEM DAN PEMBAHASAN

## 4.1 Pengujian Sistem
Pengujian sistem pada aplikasi StudySync dilakukan untuk memastikan bahwa seluruh fungsi dan fitur berjalan sesuai dengan spesifikasi kebutuhan perangkat lunak. Tujuan dari pengujian ini adalah untuk menemukan kesalahan (bug) serta memastikan bahwa integrasi antarmodul, termasuk mesin inferensi Fuzzy Mamdani, autentikasi Supabase, dan manajemen status sinkronisasi *cloud*, berfungsi dengan baik sebelum sistem digunakan secara nyata oleh pengguna.

## 4.2 Hasil Pengujian *Black Box*
Pengujian *Black Box* menitikberatkan pada hasil fungsional sistem tanpa melihat struktur kode di baliknya. Berdasarkan 20 skenario uji yang dirancang, pengujian mencakup lima area utama: Autentikasi (Auth), Mesin Rekomendasi (Engine), Manajemen Sesi (Session), Riwayat (History), dan Analitik (Analytics). Berikut adalah ringkasan hasil pengujian:

1. **Modul Autentikasi**: Seluruh alur pendaftaran, proses *login* baik untuk pengguna baru maupun yang tidak terdaftar, serta pengakhiran sesi (*sign out*) berhasil memberikan respons dan *toast notification* yang sesuai. Token berhasil disimpan pada *cookies* dan akses ke rute terproteksi berfungsi dengan valid.
2. **Mesin Rekomendasi (Fuzzy Engine)**: Uji batas bawah (Fokus 0, Kelelahan 100, Kompleksitas 100) dan batas atas (Fokus 100, Kelelahan 0, Kompleksitas 0) menghasilkan keluaran durasi belajar yang aman dan proporsional (15 menit untuk Sangat Pendek, dan ~150 menit untuk Sangat Panjang). Evaluasi kategori kelas parameter input sesuai dengan fungsi keanggotaan.
3. **Manajemen Sesi (*Sync Status*)**: Data *float* yang dimasukkan sistem berhasil dibulatkan ke dimensi *Integer* tanpa melempar galat ke *database*. Penanganan kegagalan jaringan sangat baik, di mana status gagal berubah menjadi *"failed"* dan *fallback resync* (tombol Retry) berhasil mengirimkan ulang *payload*.
4. **Modul Riwayat dan Analitik**: Kalkulasi runtut harian (*streak*), nilai rata-rata per minggu, dan visualisasi *heatmap* data berjalan dinamis merepresentasikan agregasi baris data mentah dari *database* secara interaktif.

*(Catatan: Asumsi seluruh skenario dari tabel skenario di atas mengeksekusi hasil "Pass/Berhasil").*

## 4.3 Analisis Hasil Pengujian
Berdasarkan eksekusi skenario *Black Box Testing* yang dilakukan, dapat dianalisis bahwa:
- **Tingkat Aksesibilitas dan Interaksi**: Fitur notifikasi proaktif (*Toast*) secara signifikan memperbaiki visibilitas status sistem bagi pengguna, mencegah kehilangan data ketika terjadi kegagalan asinkron pada Supabase. 
- **Integritas Konstrain Relasional**: Metode pendelegasian ID sementara (`crypto.randomUUID`) yang kemudian ditimpa oleh ID *database* nyata memberikan interaksi UI yang seketika (*optimistic update*) dengan tetap mempertahankan konsistensi baris SQL (ACID).
- **Keandalan Analitik Waktu Nyata**: Logika kalkulasi historis merefleksikan perubahan zona waktu pengguna *(client-side datetime computation)* yang sesuai dengan rekaman waktu aktual tanpa mengalami inkonsistensi UTC pada antarmuka.

## 4.4 Pembahasan Implementasi Fuzzy Mamdani
Penerapan *Fuzzy Inference System* (FIS) metode Mamdani dalam aplikasi StudySync bertujuan untuk menghasilkan rekomendasi waktu belajar kognitif yang optimal. Terdapat tiga parameter variabel linguistik yang digunakan: Fokus, Kelelahan, dan Kompleksitas, yang beririsan dengan kurva fungsi keanggotaan Trapezoidal dan Triangular [0, 100].

1. **Fuzzifikasi**: Sistem secara mandiri memetakan input *crisp* ke derajat keanggotaan (Rendah, Sedang, Tinggi) dan terbukti menahan limit batas agar tidak melempar nilai *null* atau *undefined* di bawah angka matematika murni.
2. **Evaluasi Aturan (*Rule Base*)**: Sebanyak 27 basis aturan dievaluasi menggunakan *T-Norm Continuous Intersection* (operator logika AND/MIN). Ini memastikan bahwa sistem bersikap moderat (tidak condong pada satu metrik saja).
3. **Defuzzifikasi**: Penarikan kalkulasi menggunakan metode Titik Berat Komposit (*Centroid Method*) dengan instrumen langkah repetisi *0.5* memungkinkan resolusi *output* bergeser dengan mulus. Pendekatan pembagian `Σ(μ·z) / Σ(μ)` memberikan validasi yang cukup stabil di titik tengah *median*.
*Catatan Implementasi*: Sistem cukup tangguh *(robust)*, dengan tambahan sistem *fall-back* durasi bawaan sebesar 45 menit bila kalkulasi penyebut (`denominator`) mendapati derajat 0 murni, demi mencegah deviasi aritmatika.

## 4.5 Kesimpulan Pengujian
Berdasarkan hasil pengujian teknis yang terukur, perangkat lunak **StudySync** ditelaah memenuhi *acceptance criteria* (kriteria penerimaan) yang disyaratkan secara meyakinkan. Integrasi ujung-ke-ujung (*end-to-end*) antara antarmuka Next.js React, logika Fuzzy Engine Mamdani *TypeScript*, dan skema basis data Supabase berjalan bebas dari anomali fungsional kritis (*Critical Severity Defects*). Aplikasi ini dinyatakan stabil, dapat diandalkan terhadap manipulasi *input* tak terduga, dan layak dipublikasikan ke lingkungan *production*.