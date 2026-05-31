# StudySync

AI-Powered Study Duration Recommendation System using Fuzzy Logic Mamdani

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Fuzzy Logic](https://img.shields.io/badge/Fuzzy-Mamdani-orange)

## 📖 About

StudySync adalah aplikasi rekomendasi durasi belajar berbasis AI yang menggunakan metode Fuzzy Logic Mamdani untuk membantu pelajar menentukan durasi belajar yang optimal berdasarkan kondisi belajar mereka saat ini.

Sistem mempertimbangkan tiga parameter utama:

* Tingkat Fokus
* Tingkat Kelelahan
* Kompleksitas Materi

Kemudian memproses 27 aturan fuzzy untuk menghasilkan rekomendasi durasi belajar yang personal dan adaptif.

---

## 🎯 Features

### 📊 Smart Study Recommendation

Input:

* Tingkat Fokus (0–100)
* Tingkat Kelelahan (0–100)
* Kompleksitas Materi (0–100)

Output:

* Durasi Belajar Optimal
* Kategori Durasi
* Tingkat Kepercayaan AI
* Aturan Fuzzy Aktif
* Derajat Keanggotaan

---

### 🧠 Fuzzy Logic Visualization

* Membership Function Visualization
* Rule Evaluation Display
* Active Rule Inspector
* Centroid Defuzzification
* Mamdani Inference Process

---

### 📈 Analytics Dashboard

* Tren Produktivitas
* Konsistensi Belajar
* Peta Aktivitas Belajar
* Efisiensi Fokus
* Riwayat Sesi

---

### ⏱️ Study Session Timer

* Mulai Sesi Belajar
* Jeda & Lanjutkan
* Reset Timer
* Tracking Sesi

---

### 🔐 Authentication

* Login
* Registrasi
* Session Management
* Protected Routes
* User Profile Synchronization

Powered by Supabase Authentication.

---

## 🏗️ System Architecture

```text
User
 ↓
Next.js Frontend
 ↓
Server Actions
 ↓
Fuzzy Logic Engine
 ↓
Supabase Database
```

### Frontend

* Next.js 15 App Router
* TypeScript
* Tailwind CSS
* Shadcn UI
* Framer Motion
* Recharts

### Backend

* Supabase
* PostgreSQL
* Row Level Security (RLS)
* Server Actions

---

## 🧠 Fuzzy Logic Implementation

### Input Variables

#### Tingkat Fokus

* Rendah
* Sedang
* Tinggi

#### Tingkat Kelelahan

* Rendah
* Sedang
* Tinggi

#### Kompleksitas Materi

* Mudah
* Sedang
* Sulit

---

### Output Variable

Durasi Belajar:

* Sangat Pendek
* Pendek
* Sedang
* Panjang
* Sangat Panjang

Range:

```text
15 - 150 Menit
```

---

### Inference Method

Metode yang digunakan:

```text
Mamdani Fuzzy Inference System
```

Operator:

```text
AND          = MIN
Aggregation  = MAX
Defuzzifikasi = Centroid
```

Jumlah Rule:

```text
27 Rules
```

---

## 🗄️ Database Schema

### profiles

```sql
id UUID
email TEXT
full_name TEXT
created_at TIMESTAMP
```

### study_sessions

```sql
id UUID
user_id UUID
focus_level INTEGER
fatigue_level INTEGER
complexity_level INTEGER
recommended_duration INTEGER
category TEXT
confidence_score FLOAT
created_at TIMESTAMP
```

### analytics

```sql
id UUID
user_id UUID
focus_efficiency FLOAT
productivity_score FLOAT
study_streak INTEGER
weekly_hours FLOAT
```

---

## 🚀 Installation

Clone repository:

```bash
git clone <repository-url>
```

Masuk ke folder project:

```bash
cd studysync
```

Install dependencies:

```bash
npm install
```

---

## ⚙️ Environment Variables

Buat file:

```bash
.env.local
```

Isi dengan konfigurasi Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## ▶️ Running Locally

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

---

## 📂 Project Structure

```text
src/
│
├── app/
├── components/
├── hooks/
├── lib/
│   ├── fuzzy-engine/
│   └── supabase/
├── types/
├── utils/
└── features/
```

---

## 🧪 Testing

Project menggunakan pengujian Black Box untuk:

* Authentication
* Fuzzy Recommendation Engine
* Session Management
* History Tracking
* Analytics Dashboard

Total:

```text
20 Test Cases
```

---

## 📚 Academic Purpose

Project ini dikembangkan sebagai implementasi metode Fuzzy Logic Mamdani pada sistem rekomendasi durasi belajar berbasis web.

Tujuan utama:

* Menerapkan konsep Fuzzy Logic dalam kasus nyata
* Membantu personalisasi durasi belajar
* Menyediakan visualisasi proses inferensi fuzzy
* Menjadi media pembelajaran konsep Mamdani Fuzzy Inference System

---

## 👨‍💻 Technology Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn UI
* Framer Motion

Backend:

* Supabase
* PostgreSQL

Visualization:

* Recharts

Authentication:

* Supabase Auth

Deployment:

* Vercel

---

## 📄 License

This project is developed for educational and academic purposes.
