# StudySync Development Prompt

## AI-Powered Study Duration Recommendation System

### Fuzzy Logic Mamdani Web Application

---

# PROJECT OVERVIEW

Build a complete modern fullstack web application called **StudySync** — an AI-powered study duration recommendation platform using **Fuzzy Logic Mamdani Method**.

The application helps students determine optimal study duration based on:

* Tingkat Fokus
* Tingkat Kelelahan
* Kompleksitas Materi

The system processes 27 fuzzy IF-THEN rules and generates:

* recommended study duration
* category classification
* AI study tips
* analytics
* fuzzy visualization
* study history

The final application should feel like:

* premium AI SaaS
* modern educational startup
* intelligent productivity dashboard
* university capstone-quality project

---

# MAIN TECHNOLOGY STACK

## Frontend

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion
* Shadcn UI
* Recharts
* Lucide React Icons

## Backend

* Next.js API Routes
* Node.js

## Database

* Supabase PostgreSQL

## Authentication

* Supabase Auth

## Deployment

* Vercel

---

# SYSTEM ARCHITECTURE

```txt
+--------------------------------------------------+
|                     USER                         |
+--------------------------------------------------+
                        ↓
+--------------------------------------------------+
|               FRONTEND LAYER                     |
|--------------------------------------------------|
| Next.js + Tailwind + Framer Motion              |
| - Calculator UI                                  |
| - Analytics Dashboard                            |
| - Fuzzy Visualization                            |
| - Study Tips                                     |
| - History Tracking                               |
| - Session Timer                                  |
+--------------------------------------------------+
                        ↓ API Request
+--------------------------------------------------+
|              APPLICATION LAYER                   |
|--------------------------------------------------|
| Next.js API Routes                               |
| - Recommendation Service                         |
| - Analytics Service                              |
| - Session Management                             |
| - Fuzzy Logic Controller                         |
+--------------------------------------------------+
                        ↓
+--------------------------------------------------+
|               FUZZY ENGINE LAYER                 |
|--------------------------------------------------|
| Mamdani Fuzzy Logic Engine                       |
| - Fuzzification                                  |
| - Rule Evaluation                                |
| - Aggregation                                    |
| - Defuzzification (Centroid)                     |
| - Recommendation Generator                       |
+--------------------------------------------------+
                        ↓
+--------------------------------------------------+
|                  DATABASE LAYER                  |
|--------------------------------------------------|
| Supabase PostgreSQL                              |
| - Users                                           |
| - Study Sessions                                  |
| - Analytics                                       |
| - History                                         |
| - Preferences                                     |
+--------------------------------------------------+
```

---

# APPLICATION FEATURES

## 1. CALCULATOR DASHBOARD

### Input Parameters

Create 3 animated sliders:

* Tingkat Fokus (0–100)
* Tingkat Kelelahan (0–100)
* Kompleksitas Materi (0–100)

Features:

* gradient tracks
* floating labels
* animated thumbs
* realtime updates
* smooth transitions

---

## Recommendation Panel

Display:

* study duration result
* category badges
* AI confidence ring
* active fuzzy rule
* membership degree
* fuzzy visualization graph
* AI-generated study tips

---

## AI Processing Simulation

When clicking “Hitung Durasi”:
show animated loading sequence:

1. Analyzing focus intensity...
2. Evaluating fuzzy membership...
3. Applying Mamdani inference...
4. Calculating optimal duration...
5. Generating AI recommendation...

Duration:
2–3 seconds.

---

## Study Session Timer

Create focus session modal:

* countdown timer
* play/pause/reset
* animated progress ring
* ambient productivity UI
* completion animation

---

# 2. FUZZY LOGIC PAGE

Create educational interactive page explaining:

* Fuzzy Logic
* Mamdani Method
* Fuzzification
* Rule Base
* Aggregation
* Defuzzification

Include:

* animated membership graphs
* rule matrix
* centroid visualization
* realtime graph interaction
* educational cards
* AI pipeline diagram

---

# 3. STUDY TIPS PAGE

Create modern learning methods dashboard.

Include:

* Pomodoro
* Deep Work
* Active Recall
* Spaced Repetition
* Blurting
* Leitner System

Features:

* searchable cards
* filters
* progress indicators
* hover animations
* detail modal
* AI recommendations

---

# 4. HISTORY & ANALYTICS PAGE

Create premium analytics dashboard.

Include:

* weekly productivity chart
* focus efficiency
* study streak
* heatmap calendar
* session history table
* AI recommendations
* export report feature

---

# UI/UX STYLE GUIDE

## Style

* clean academic aesthetic
* minimal modern dashboard
* premium AI startup feeling
* elegant educational interface

## Colors

Background:

* #F7F5F2

Primary:

* #2563EB

Accent:

* soft purple gradient
* navy tones

## Typography

Heading:

* Playfair Display

Body:

* Inter

## Design

* rounded cards
* subtle shadows
* glassmorphism touches
* soft gradients
* micro interactions
* premium spacing

---

# DARK MODE

Create elegant dark mode.

Dark Theme:

* navy background
* glowing blue accents
* glass cards
* luminous charts
* readable typography

---

# DATABASE SCHEMA

## users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## study_sessions

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  focus_level INTEGER,
  fatigue_level INTEGER,
  complexity_level INTEGER,
  recommended_duration INTEGER,
  category TEXT,
  confidence_score FLOAT,
  active_rule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## analytics

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  focus_efficiency FLOAT,
  weekly_hours FLOAT,
  study_streak INTEGER,
  productivity_score FLOAT
);
```

---

# FUZZY LOGIC IMPLEMENTATION

## INPUT VARIABLES

### Focus

* Low
* Medium
* High

### Fatigue

* Low
* Medium
* High

### Complexity

* Easy
* Medium
* Hard

---

# OUTPUT VARIABLE

Study Duration:

* Sangat Pendek
* Pendek
* Sedang
* Panjang
* Sangat Panjang

Range:
15–150 minutes

---

# FUZZIFICATION

Use triangular/trapezoidal membership functions.

Example:

```js
focusHigh(x) {
  if (x <= 50) return 0;
  if (x >= 100) return 1;
  return (x - 50) / 50;
}
```

---

# RULE BASE

Generate 27 fuzzy rules.

Example:

```txt
IF Focus High
AND Fatigue Low
AND Complexity Hard
THEN Duration Long
```

---

# INFERENCE

Use:

* AND = MIN
* Aggregation = MAX

---

# DEFUZZIFICATION

Use Centroid Method.

Formula:

```txt
z* = ∫ μ(z)z dz / ∫ μ(z) dz
```

---

# FOLDER STRUCTURE

```txt
studysync/
│
├── app/
│   ├── calculator/
│   ├── fuzzy-logic/
│   ├── history/
│   ├── study-tips/
│   ├── api/
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── charts/
│   ├── fuzzy/
│   ├── analytics/
│   ├── timer/
│   └── layout/
│
├── lib/
│   ├── fuzzy-engine/
│   ├── supabase/
│   ├── utils/
│   └── analytics/
│
├── hooks/
│
├── types/
│
├── public/
│
└── styles/
```

---

# REQUIRED COMPONENTS

Create reusable components:

* Navbar
* Footer
* SliderInput
* RecommendationCard
* ConfidenceRing
* MembershipGraph
* AnalyticsCard
* RuleCard
* TimerModal
* HeatmapChart
* ProductivityChart
* StudyMethodCard

---

# ANIMATIONS

Use Framer Motion for:

* page transitions
* fade-ins
* hover lift
* count-up numbers
* glowing effects
* loading states
* graph transitions

---

# RESPONSIVENESS

Support:

* desktop
* tablet
* mobile

Use:

* responsive grids
* adaptive layouts
* collapsible navbar

---

# FINAL DEVELOPMENT GOALS

The final web application should:

* look production-ready
* feel interactive and intelligent
* demonstrate proper AI explainability
* showcase Fuzzy Logic Mamdani clearly
* be suitable for portfolio projects
* be suitable for university presentation
* feel like a real educational AI startup

Focus heavily on:

* clean architecture
* reusable components
* maintainable code
* polished UI/UX
* smooth animations
* proper state management
* scalability
