# 🚀 StudySync Project Audit

## 1. Project Overview

*   **Project Purpose:** StudySync is a web application designed to help users optimize their study sessions. By gathering cognitive inputs like focus, fatigue, and topic complexity, the application generates a personalized and optimized study duration via a Fuzzy Logic (Mamdani) engine.
*   **Main Features:** Fuzzy logic duration calculator, session history, analytics dashboards (heatmaps, productivity trends, study streaks), Study Session Timer, and cloud synchronization of user data.
*   **Technology Stack:** 
    *   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Recharts, Lucide React.
    *   **Backend / BaaS:** Supabase (Auth, PostgreSQL Database, Row-Level Security).
    *   **Language:** TypeScript.

## 2. Current Application Features

*   **Authentication:** Unregistered and registered user handling, login, registration, and sign out utilizing Supabase Auth.
*   **Recommendation Engine (Fuzzy Logic):** Computes cognitive parameters to yield an optimal study length in minutes along with AI-driven study tips (e.g., advising "Pomodoro" or "Spaced Repetition").
*   **Analytics:** Visualizing week-over-week productivity, focus efficiency, 7-day heatmaps, and maintaining a dynamically updating streak of continuous study days.
*   **History:** A searchable and paginated history dashboard showing past study sessions, categories, input configurations, and durations.
*   **Study Session Timer:** Allows users to execute the recommended study session directly via a `TimerModal` component.
*   **Localization:** The application's interface uses standard Indonesian (Bahasa Indonesia) text natively, suitable for the target locale.
*   **Error Handling:** Utilizes a custom `Toaster` component. Failed cloud syncs optimistic updates trigger an error toast with a native `Retry` button to handle unreliable networks gracefully.

## 3. System Architecture

*   **Frontend Architecture:** Developed under Next.js 16 App Router architecture (`app/` directory). Uses Client Components (`"use client"`) heavily for interactive screens (Calculator, History, Timer) and Server Actions for data mutations.
*   **Backend Architecture:** Relies on Next.js Server Actions connecting confidentially to Supabase via `@supabase/ssr`. 
*   **Supabase Integration:** Manages identities via `auth.users`, maintains `profiles`, and persists `study_sessions`. Ensures separation of concerns using Row-Level Security (RLS) directly in Postgres.
*   **State Management:** Governed via React Context (`StudySyncProvider`), employing optimistic UI updates directly for study sessions.

## 4. Database Design

*   **Tables:**
    1.  `profiles`: Contains `id`, `full_name`, `avatar_url`, mapped 1:1 with `auth.users`.
    2.  `study_sessions`: Core table saving `focus`, `fatigue`, `complexity`, `duration`, `category`, and `confidence`. Linked via `user_id`.
    3.  `saved_study_methods`: Secondary table to persist method-specific setups. 
*   **Relationships:** `user_id` acts as a Foreign Key from the `auth.users(id)` schema in all application tables.
*   **RLS Policies:** Active on all tables. 
    *   `Users can view/insert/update/delete their own study sessions/methods`.
    *   Profiles have public select but scoped insert/update to `auth.uid() = id`.

## 5. Fuzzy Logic Implementation

StudySync natively applies the **Mamdani Fuzzy Inference System (FIS)**.
*   **Input Variables:**
    *   *Focus:* 0-100% (Low, Medium, High)
    *   *Fatigue:* 0-100% (Low, Medium, High)
    *   *Complexity:* 0-100% (Low, Medium, High)
*   **Output Variables:**
    *   *Duration Category:* Sangat Pendek, Pendek, Sedang, Panjang, Sangat Panjang
    *   *Resulting Range:* Output duration evaluates bounds strictly between ~15 mins and ~150 mins.
*   **Membership Functions:** Uses a mix of Triangular and Trapezoidal curves to compute the intersection degree accurately.
*   **Rule Base:** Total 27 rules ($3^3$) processed sequentially using `T-Norm` Continuous Intersection (`AND` / `MIN` operations).
*   **Defuzzification:** Operates using the Composite Centroid Method ($\Sigma(\mu \cdot z) / \Sigma(\mu)$) spanning discrete increments of `0.5` points to accurately find the geometric center of gravity.

## 6. Analytics Implementation

*   **Productivity Trend:** Checks current week's computed focus averages against last week's via standard offset arithmetic using normalized Midnight timestamps.
*   **Heatmap:** Evaluates a grid covering four weeks (7 days/week), mapping intensity visually against daily submission counts.
*   **Study Streak:** Crawls back contiguously resolving standard offset subtraction (-86,400,000 ms per step).
*   **Focus Efficiency:** Computed via a composite confidence scalar derived from the aggregate strength of fired FIS rules.

## 7. Authentication Flow

*   **Register:** Prompts parameters matching `signUp()` in `app/actions/auth.ts`, creates an identity asynchronously, then synchronously triggers an `.upsert()` insertion into `profiles`.
*   **Login:** Evaluates `signInWithPassword()` against Supabase constraints, generating authentication cookies tracked via the SSR adapter, redirecting to `/calculator`.
*   **Session Management:** `createClient()` uses the browser cookies resolving user scope.
*   **Protected Routes:** Supabase policies handle deep request denial while standard page routers implicitly govern visual navigation limits.

## 8. Folder Structure

```text
StudySyncAI/
├── app/
│   ├── actions/ (Server Actions: auth.ts, session.ts)
│   ├── calculator/ (Page: Fuzzy calculator & results)
│   ├── fuzzy-logic/ (Page container)
│   ├── history/ (Page: Charts, heatmaps & logs)
│   ├── login/ (Auth screen)
│   ├── register/ (Auth screen)
│   ├── study-tips/ (Page container)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/ (Navbar.tsx, Footer.tsx)
│   ├── providers/ (StudySyncProvider.tsx, ThemeProvider.tsx)
│   ├── timer/ (TimerModal.tsx)
│   └── ui/ (ConfidenceRing.tsx, Toaster.tsx)
├── lib/
│   ├── fuzzy-engine/ (index.ts - Contains FIS algorithms)
│   └── supabase/ (client.ts, server.ts)
├── prompt/ (Audit & specifications files)
└── public/
```

## 9. Major Components

*   **`StudySyncProvider`**: Maintains the global list of study sessions. Manages optimistic DOM updates mapping UUIDs seamlessly against database records once resolved.
*   **`Fuzzy Engine (lib/fuzzy-engine)`**: Pure functional math logic ensuring exact parameter derivation independent of any UI state layers.
*   **`HistoryPage`**: Deeply encapsulates analytical memoization (`useMemo` bounds for Streak and Heatmap logic) feeding natively to Recharts and DOM elements.

## 10. API / Server Actions

Located heavily in `app/actions/`.
*   **`login(prevState, formData)`:** Direct Supabase Auth invocation.
*   **`signup(prevState, formData)`:** Supabase Auth and subsequent `profiles` schema cascading registration.
*   **`signout()`:** Terminates active user session securely.
*   **`saveStudySession(params)`:** Translates the client-side calculated FIS properties straight to Postgres. 
*   **`getStudySessions()`:** Native Select returning scoped records mapped by `created_at` descending.

## 11. Security Features

*   **Authentication:** JWT handling offloaded fully to `@supabase/ssr` bridging strict unguessable access keys.
*   **Middleware:** Though `middleware.ts` exists, heavy security lies under Row Level Security.
*   **RLS (Row Level Security):** Completely shuts off foreign data scraping globally. `auth.uid() = user_id` enforces 100% horizontal strictness.
*   **Validation:** Fuzzy calculator strictly rounds all boundary params `Math.round()` prior to saving to enforce Postgres `INTEGER` data constraint standards.

## 12. Known Limitations

*   Requires an uninterrupted connection initially to acquire the active JWT layout, offline caching runs into `syncStatus = "failed"` without an active `ServiceWorker`/PWA manifestation mapping the request holding layer.
*   Heatmap layout depends heavily on local device timing offset standards vs UTC timestamps.  

## 13. Future Improvements

*   **Service Worker / PWA:** Transform the application into a Progressive Web App so sessions can be generated entirely offline and synchronized when the network is restored (`IndexedDB` queue implementation).
*   **Social & Ladder Ranks:** Allow users to "publish" non-identifiable streaks to a public ladder.
*   **Dynamic Variable Training:** Adjust FIS Membership nodes over time using Machine Learning depending on consecutive completed session failures/success rates.
