# StudySync System Architecture

## Tech Stack

**Frontend:**
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion

**Backend:**
- Supabase (PostgreSQL, Auth, Edge Functions)

**Deployment:**
- Vercel

---

## The Four Intelligence Engines

StudySync operates on a strict multi-engine architecture. Each engine has a singular, isolated responsibility. They complement each other but never merge.

### 1. Mamdani Fuzzy Engine (`lib/fuzzy-engine`)
**Responsibility**: Generate real-time study duration recommendations.
**Input**: Current focus, fatigue, and complexity.
**Output**: A single baseline recommendation (e.g., 45 minutes) and confidence score.
**Rule**: This is the *only* engine that can generate a base recommendation.

### 2. Adaptive Engine (`lib/adaptive-engine`)
**Responsibility**: Analyze historical study behavior.
**Input**: Past completed study sessions (`StudySyncProvider`).
**Output**: Learning profile, pattern recognition, habit scores, and burnout warnings.
**Rule**: This engine only looks at the *past* and *present*.

### 3. Predictive Engine (`lib/predictive-engine`)
**Responsibility**: Estimate future learning trends.
**Input**: Historical trends and current learning profile.
**Output**: Tomorrow's forecast, weekly forecast, and what-if simulations.
**Rule**: This engine only looks at the *future*.

### 4. Decision Engine (`lib/decision-engine`)
**Responsibility**: Generate alternative study strategies based on the base recommendation.
**Input**: Fuzzy base recommendation, Learning Profile, and Forecasts.
**Output**: Alternative plans (e.g., Deep Work vs Recovery) and trade-off analysis.
**Rule**: This engine must not modify the original Fuzzy Engine calculation.

---

## Page Responsibilities

To maintain a clean user experience, each route serves a specific, unchangeable purpose:

- `/` **(Dashboard)**: Today's overview. Displays the AI Coach, quick stats, and weekly reflection. No deep analytics.
- `/calculator` **(Recommendation)**: The only place where `calculateFuzzy()` executes. Ends with the Decision Dashboard.
- `/intelligence` **(Learning Intelligence)**: The deep analytics center. Contains Adaptive analysis, Predictive forecasting, and historical Decision analysis.
- `/fuzzy-logic` **(Educational AI)**: A technical explanation of the Mamdani logic, membership functions, and active rules.
- `/study-tips` **(Educational Library)**: A static library of scientifically-backed learning methods (Pomodoro, Feynman, etc.).
- `/history` **(Logs)**: A simple list of completed sessions.
- `/settings` **(Preferences)**: Application management.

**Strict Rule**: Never redirect one module into another. Never merge unrelated pages. The Dashboard is not a calculator, and the Calculator is not an analytics center.

---

## Folder Structure

```
src/
├── app/
│   ├── calculator/       # Calculator & Decision Dashboard
│   ├── fuzzy-logic/      # AI Explainability
│   ├── history/          # Logs
│   ├── intelligence/     # Analytics Center (Adaptive, Predictive)
│   ├── settings/         # App Preferences
│   └── study-tips/       # Educational Content
├── components/
│   ├── coach/            # AI Coach components
│   ├── dashboard/        # Analytics UI components
│   ├── decision/         # Decision Matrix & Alternative Plans
│   ├── fuzzy/            # Explainable AI UI
│   ├── providers/        # Context Providers (StudySyncProvider)
│   └── layout/           # Navbar, Footer
├── lib/
│   ├── adaptive-engine/  # Past analysis logic
│   ├── decision-engine/  # Strategy generation logic
│   ├── fuzzy-engine/     # Real-time recommendation logic
│   ├── predictive-engine/# Future forecasting logic
│   └── supabase/         # Backend client
```

---

## Security & State Management

- **Client State**: `StudySyncProvider` maintains the session array in memory using React Context, allowing all intelligence engines to reactively compute insights without constant database polling.
- **Backend State**: Supabase Row Level Security (RLS) ensures users can only read/write their own sessions.
- **Compute Optimization**: All engines rely heavily on `useMemo` to prevent expensive recalculations during UI renders.
