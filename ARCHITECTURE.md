# StudySync System Architecture

## Tech Stack

Frontend:

* Next.js 15 App Router
* TypeScript
* Tailwind CSS
* Shadcn UI
* Framer Motion
* Recharts

Backend:

* Supabase

Authentication:

* Supabase Auth

Database:

* Supabase PostgreSQL

Deployment:

* Vercel

---

## Architecture

User
↓
Next.js Frontend
↓
Server Actions / API Routes
↓
Fuzzy Engine Service
↓
Supabase Database

---

## Modules

### Recommendation Module

Responsibilities:

* Process user input
* Execute fuzzy logic
* Generate recommendation

### Fuzzy Engine

Pipeline:

Input
↓
Fuzzification
↓
Rule Evaluation
↓
Aggregation
↓
Defuzzification
↓
Recommendation

---

### Analytics Module

Responsibilities:

* Calculate streaks
* Calculate productivity score
* Generate charts

---

### Session Module

Responsibilities:

* Start session
* Complete session
* Store duration

---

## Database Tables

profiles
study_sessions
analytics
saved_study_methods

---

## Folder Structure

src/
├── app/
├── components/
├── features/
│   ├── recommendation/
│   ├── fuzzy/
│   ├── analytics/
│   └── sessions/
├── lib/
│   ├── supabase/
│   └── fuzzy-engine/
├── hooks/
├── types/
└── utils/

---

## Security

Use:

* Supabase Row Level Security
* Authenticated routes
* Server Actions for writes

Never expose service role key.
