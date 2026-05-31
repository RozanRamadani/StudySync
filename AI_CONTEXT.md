# StudySync AI Development Context

You are developing StudySync.

Always follow these rules.

---

## Product Identity

StudySync is an AI-powered educational productivity platform.

It is NOT a generic calculator.

The UI should feel like:

* Modern SaaS
* Educational Platform
* Premium Dashboard
* AI Productivity Tool

---

## Design System

Colors:

Background:
#F7F5F2

Primary:
#2563EB

Accent:
Soft Blue
Soft Purple

Typography:

Headings:
Playfair Display

Body:
Inter

---

## Coding Standards

Use:

* TypeScript
* Strict Mode
* Functional Components
* Server Components by default
* Client Components only when needed

---

## State Management

Prefer:

1. Server Components
2. React Context
3. Zustand

Avoid unnecessary global state.

---

## Database

Use Supabase.

Never create local JSON storage for production data.

All user activity should be stored in Supabase.

---

## Fuzzy Logic Rules

Inputs:

Focus:

* Low
* Medium
* High

Fatigue:

* Low
* Medium
* High

Complexity:

* Easy
* Medium
* Hard

Output:

Duration:

* Very Short
* Short
* Medium
* Long
* Very Long

Range:
15-150 Minutes

---

## Inference Rules

Method:
Mamdani

AND:
MIN

Aggregation:
MAX

Defuzzification:
Centroid

Rule Count:
27

---

## UI Expectations

Every page should include:

* Loading State
* Empty State
* Error State
* Responsive Layout

Use:

* Framer Motion
* Accessible Components
* Semantic HTML

---

## Code Quality

Always:

* Separate business logic from UI
* Use reusable components
* Create types
* Use hooks where appropriate
* Avoid duplicated logic

---

## Goal

Generate production-ready code.

Prioritize:

* maintainability
* scalability
* readability
* performance
* accessibility
