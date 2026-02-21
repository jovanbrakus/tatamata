# Prijemni — Product & Technical Specification

**Version:** 1.1 (Season 1 — Free)
**Date:** February 20, 2026
**Author:** CTO / Architecture Team

---

## Update Log

| Version | Date & Time | Changes |
|---------|-------------|---------|
| 1.1 | 2026-02-20 UTC | Added LLM-on-demand feature (BrainSpark integration). Standalone solve page + contextual "Pitaj AI" per problem. Reuses BrainSpark LLM config. Added AI solutions table, API routes, UI sections, .env config, dependencies, and acceptance criteria. Updated freemium table for future premium gating. |
| 1.0 | 2026-02-20 UTC | Initial specification. |

---

## 1. Executive Summary

Prijemni is a free learning platform for Serbian high school students preparing for university admission math exams. The platform offers a curated library of 600+ solved problems from Belgrade university entrance exams, presented as rich interactive HTML solutions with theory, step-by-step walkthroughs, visual aids, common mistakes, and final answers.

Beyond passive browsing, Prijemni provides an active learning experience: timed mock exams that simulate real test conditions, progress tracking, bookmarks, a gamified leaderboard to keep students motivated, and an AI-powered on-demand tutor (powered by BrainSpark's LLM engine) for custom explanations and problem solving.

**Season 1** is completely free. Future seasons introduce a freemium model with premium features (including unlimited AI tutor access) for paying users while keeping core content accessible.

**Tech stack:** Next.js (Vercel), PostgreSQL (Neon), NextAuth.js (Google OAuth), pre-generated HTML solutions, configurable LLM backend (Claude / Gemini / ChatGPT) for on-demand AI tutor.

---

## 2. Content Library

### 2.1 Content Overview

| Attribute | Value |
|-----------|-------|
| Total problems | 600+ |
| Source | Belgrade university admission math exams |
| Format | Self-contained HTML files (~15-25KB each) |
| Language | Serbian (Latin script) |
| Answer format | Multiple choice with correct answer marked via CSS class |
| Math rendering | MathJax 3 (CDN-loaded) |

### 2.2 Problem Metadata

Each problem is tagged with:

| Field | Example | Source |
|-------|---------|--------|
| University | Univerzitet u Beogradu | Filename / manual |
| Faculty | Elektrotehnički fakultet (ETF) | Filename / manual |
| Year | 2025 | Filename / manual |
| Problem number | 3 | Filename / manual |
| Math topic(s) | logaritmi, kompleksni brojevi, geometrija | Pre-assigned tags |
| Correct answer | (B) 36π | Extracted from `class="correct-answer"` |
| Difficulty | null (Season 1.5 — derived from user data) | Future |

### 2.3 HTML Solution Structure

Every solution HTML follows a consistent pedagogical structure:

| Section | Serbian Heading | Purpose |
|---------|----------------|---------|
| Problem Statement | Postavka zadatka / Tekst zadatka | Full problem text with highlighted given values |
| Solution Plan | Plan rešavanja | High-level approach before diving into steps |
| Theory Refresher | Osvrt na teoriju | Relevant formulas and concepts (sometimes collapsible) |
| Visual Aid | Vizuelni prikaz / Grafički prikaz | Canvas-based interactive diagrams |
| Step-by-Step Solution | Rešenje korak po korak | Numbered clickable steps with MathJax |
| Key Insight | Ključni uvid | The "aha moment" — why the solution works |
| Final Answer | Konačan odgovor | Highlighted correct option among choices |
| Common Mistakes | Česte greške / Zamke | What students typically get wrong and why |
| Bonus Challenge | Dodatni izazov | Extension problem for advanced students |
| Logic Scratchpad | (hidden) | `<script type="text/info">` with plain-text solution logic |

### 2.4 Content Ingestion

A one-time import script parses all 600+ HTML files and populates the database:

**Extraction from filename:**
```
univerzitet_u_beogradu_elektrotehnicki_fakultet_2025_problem_2_solution.html
→ university: "Univerzitet u Beogradu"
→ faculty: "Elektrotehnički fakultet"
→ faculty_short: "ETF"
→ year: 2025
→ problem_number: 2
```

**Extraction from HTML content:**
- Title: from `<title>` tag
- Correct answer: from element with `class="correct-answer"` or `class="final-option correct-answer"`
- Answer options: from elements with `class="answer-option"` or `class="final-option"`
- Logic scratchpad: from `<script type="text/info" id="logic-scratchpad">`

**Pre-assigned metadata (from separate manifest/CSV):**
- Math topic tags
- Number of answer options per problem

```bash
# Import script usage
npx tsx scripts/import-problems.ts --dir ./problems/ --manifest ./manifest.csv
```

---

## 3. User Roles & Stories

### 3.1 Roles

| Role | Description |
|------|-------------|
| **student** | Registered user. Browse, practice, take mock exams, track progress. |
| **admin** | Platform admin. Manage content, view analytics, manage users. |

### 3.2 Student Stories

**Browsing & Learning:**
- As a student, I can browse all problems organized by faculty, year, and topic.
- As a student, I can view a full interactive solution in-browser (rendered HTML with MathJax, canvas diagrams, clickable steps).
- As a student, I can filter problems by faculty, year, and math topic.
- As a student, I can search problems by keyword.
- As a student, I can bookmark problems to revisit later.

**Mock Exams:**
- As a student, I can start a timed mock exam that simulates a real admission test for a chosen faculty.
- As a student, I see problems one at a time (or all at once — depending on faculty format), with a countdown timer.
- As a student, I select my answer for each problem from multiple choice options.
- As a student, I can flag/skip problems and return to them before time runs out.
- As a student, when the exam ends (or I submit early), I see my score with a breakdown per problem.
- As a student, I can review each problem's full solution after completing the exam.
- As a student, my exam results are saved to my history.

**Progress & Gamification:**
- As a student, I can mark problems as "solved" and see my overall progress (e.g., "142/600 solved, 24%").
- As a student, I can see my progress broken down by faculty and topic.
- As a student, I appear on a leaderboard ranked by a weighted score (combining mock exam performance, problems solved, and streak).
- As a student, I choose a display name during signup that appears on the leaderboard.
- As a student, I can see my exam history with scores and dates.

**Profile:**
- As a student, I sign in with my Google account.
- As a student, I choose a display name and optionally select my target faculty.
- As a student, I can view my stats: problems solved, mock exams taken, average score, current streak.

**AI Tutor (LLM On-Demand):**
- As a student, I can submit any custom math problem (text and/or screenshot) and receive a rich HTML solution — identical to the curated library format.
- As a student, while viewing a curated solution, I can click "Pitaj AI" (Ask AI) to get a contextual explanation — for example, asking the AI to explain a specific step differently, elaborate on the theory, or solve a related problem.
- As a student, I can view and revisit my past AI-generated solutions.
- As a student, I can see how many AI requests I have remaining today.

### 3.3 Admin Stories

- As an admin, I can access an admin dashboard.
- As an admin, I can view platform analytics (total users, daily active users, popular faculties, problem completion rates).
- As an admin, I can manage the problem library (add/edit/remove problems, update metadata).
- As an admin, I can manage exam templates (configure faculty exam formats).
- As an admin, I can manage users (view, deactivate).

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    Vercel                        │
│  ┌───────────────────────────────────────────┐   │
│  │           Next.js Application             │   │
│  │                                           │   │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  │   │
│  │  │  Pages  │  │   API    │  │  Auth   │  │   │
│  │  │ (React) │  │ Routes  │  │(Google) │  │   │
│  │  └─────────┘  └──────────┘  └─────────┘  │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
                ┌────────────┐
                │    Neon     │
                │ PostgreSQL  │
                │             │
                │ - users     │
                │ - problems  │
                │ - exams     │
                │ - progress  │
                │ - bookmarks │
                │ - leaderbd  │
                └────────────┘
```

### 4.1 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Same as BrainSpark, SSR for SEO, Vercel-native |
| Database | PostgreSQL on Neon | Consistent with BrainSpark, serverless, free tier |
| Auth | NextAuth.js (Google provider) | Google-only login, simple for students |
| HTML storage | TEXT column in PostgreSQL | Same pattern as BrainSpark, 15-25KB per solution |
| Solution rendering | Sandboxed iframe | Proven approach from BrainSpark |
| Mock exam engine | Client-side timer + server-side scoring | Timer in browser, answers validated server-side |
| Leaderboard | Materialized view / periodic recalculation | Avoid expensive real-time aggregation |
| SEO | Server-rendered problem pages | Individual problem URLs indexable by Google |
| Language | Serbian (Latin script) UI | Target audience is Serbian students |

---

## 5. Database Schema

### 5.1 Tables

#### `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id       VARCHAR(255) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  display_name    VARCHAR(50) NOT NULL,
  avatar_url      TEXT,
  role            VARCHAR(10) NOT NULL DEFAULT 'student',  -- 'student' or 'admin'
  target_faculty  VARCHAR(20),                              -- preferred faculty shortcode
  streak_current  INTEGER NOT NULL DEFAULT 0,
  streak_best     INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `faculties`
```sql
CREATE TABLE faculties (
  id              VARCHAR(20) PRIMARY KEY,  -- e.g. 'etf', 'matf', 'fon'
  university      VARCHAR(200) NOT NULL,
  name            VARCHAR(200) NOT NULL,     -- full name in Serbian
  short_name      VARCHAR(50) NOT NULL,      -- e.g. 'ETF', 'MATF', 'FON'
  exam_duration   INTEGER NOT NULL,          -- minutes
  exam_num_problems INTEGER NOT NULL,        -- how many problems on the real exam
  exam_num_options INTEGER NOT NULL DEFAULT 5, -- answer choices per problem
  scoring_correct NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  scoring_wrong   NUMERIC(4,2) NOT NULL DEFAULT 0.0,  -- negative scoring if applicable
  scoring_blank   NUMERIC(4,2) NOT NULL DEFAULT 0.0,
  description     TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `topics`
```sql
CREATE TABLE topics (
  id              VARCHAR(50) PRIMARY KEY,  -- e.g. 'algebra', 'trigonometrija'
  name            VARCHAR(100) NOT NULL,     -- display name in Serbian
  icon            VARCHAR(10),               -- emoji or icon code
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `problems`
```sql
CREATE TABLE problems (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id      VARCHAR(20) NOT NULL REFERENCES faculties(id),
  year            INTEGER NOT NULL,
  problem_number  INTEGER NOT NULL,
  title           VARCHAR(255) NOT NULL,         -- from <title> tag
  html_content    TEXT NOT NULL,                  -- full HTML solution
  correct_answer  VARCHAR(10) NOT NULL,           -- e.g. 'B', 'C'
  answer_options  JSONB NOT NULL,                 -- ["(A) 18π", "(B) 36π", "(C) 54π", "(D) 72π", "(E) 108π"]
  num_options     INTEGER NOT NULL DEFAULT 5,
  logic_scratchpad TEXT,                          -- extracted from hidden script tag
  slug            VARCHAR(200) UNIQUE NOT NULL,   -- URL-friendly: etf-2025-zadatak-3
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(faculty_id, year, problem_number)
);

CREATE INDEX idx_problems_faculty ON problems(faculty_id);
CREATE INDEX idx_problems_year ON problems(year);
CREATE INDEX idx_problems_slug ON problems(slug);
```

#### `problem_topics` (many-to-many)
```sql
CREATE TABLE problem_topics (
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  topic_id   VARCHAR(50) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, topic_id)
);

CREATE INDEX idx_problem_topics_topic ON problem_topics(topic_id);
```

#### `bookmarks`
```sql
CREATE TABLE bookmarks (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);
```

#### `problem_progress`
```sql
CREATE TABLE problem_progress (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id  UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'unseen',  -- 'unseen', 'attempted', 'solved'
  attempts    INTEGER NOT NULL DEFAULT 0,
  last_answer VARCHAR(10),                             -- last answer given
  is_correct  BOOLEAN,
  solved_at   TIMESTAMP WITH TIME ZONE,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);
```

#### `mock_exams`
```sql
CREATE TABLE mock_exams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  faculty_id      VARCHAR(20) NOT NULL REFERENCES faculties(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  duration_limit  INTEGER NOT NULL,          -- seconds allowed
  started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at     TIMESTAMP WITH TIME ZONE,
  time_spent      INTEGER,                   -- actual seconds spent
  score           NUMERIC(6,2),              -- calculated total score
  max_score       NUMERIC(6,2),              -- maximum possible score
  score_percent   NUMERIC(5,2),              -- score as percentage
  num_correct     INTEGER DEFAULT 0,
  num_wrong       INTEGER DEFAULT 0,
  num_blank       INTEGER DEFAULT 0
);

CREATE INDEX idx_mock_exams_user ON mock_exams(user_id);
CREATE INDEX idx_mock_exams_faculty ON mock_exams(faculty_id);
CREATE INDEX idx_mock_exams_status ON mock_exams(status);
```

#### `mock_exam_problems`
```sql
CREATE TABLE mock_exam_problems (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id     UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  problem_id  UUID NOT NULL REFERENCES problems(id),
  position    INTEGER NOT NULL,               -- order in the exam (1, 2, 3...)
  answer      VARCHAR(10),                    -- student's answer (null = blank)
  is_correct  BOOLEAN,                        -- null until graded
  is_flagged  BOOLEAN NOT NULL DEFAULT FALSE, -- student flagged for review
  answered_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(exam_id, position)
);

CREATE INDEX idx_exam_problems_exam ON mock_exam_problems(exam_id);
```

#### `leaderboard_scores`
```sql
CREATE TABLE leaderboard_scores (
  user_id          UUID PRIMARY KEY REFERENCES users(id),
  display_name     VARCHAR(50) NOT NULL,
  total_score      NUMERIC(10,2) NOT NULL DEFAULT 0,  -- weighted composite score
  problems_solved  INTEGER NOT NULL DEFAULT 0,
  exams_completed  INTEGER NOT NULL DEFAULT 0,
  avg_exam_percent NUMERIC(5,2) DEFAULT 0,
  best_exam_percent NUMERIC(5,2) DEFAULT 0,
  streak_best      INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_total ON leaderboard_scores(total_score DESC);
```

#### `ai_solutions`
```sql
CREATE TABLE ai_solutions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  context_type    VARCHAR(20) NOT NULL,          -- 'standalone' or 'contextual'
  source_problem_id UUID REFERENCES problems(id), -- if contextual, which problem triggered it
  title           VARCHAR(255) NOT NULL,          -- LLM-generated short title
  prompt_text     TEXT,                           -- user's text input
  had_screenshot  BOOLEAN NOT NULL DEFAULT FALSE,
  context_hint    TEXT,                           -- for contextual: "Explain step 3" or specific question
  html_content    TEXT NOT NULL,                  -- generated HTML solution
  llm_provider    VARCHAR(20) NOT NULL,
  llm_model       VARCHAR(50) NOT NULL,
  input_tokens    INTEGER NOT NULL DEFAULT 0,
  output_tokens   INTEGER NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(10,6) NOT NULL DEFAULT 0,
  latency_ms      INTEGER,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_solutions_user ON ai_solutions(user_id);
CREATE INDEX idx_ai_solutions_created ON ai_solutions(created_at DESC);
CREATE INDEX idx_ai_solutions_source ON ai_solutions(source_problem_id);
```

#### `ai_daily_usage`
```sql
CREATE TABLE ai_daily_usage (
  user_id   UUID NOT NULL REFERENCES users(id),
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
```

### 5.2 Leaderboard Scoring Formula

The weighted composite score combines multiple signals:

```
total_score = (problems_solved × 1)
            + (exams_completed × 10)
            + (avg_exam_percent × 2)
            + (streak_best × 5)
```

This is recalculated periodically (every 15 minutes via a cron job or on-demand when a user completes an action). The `leaderboard_scores` table acts as a materialized cache.

### 5.3 Notes

- **`faculties`** stores exam configuration per faculty — this drives mock exam generation (how many problems, time limit, scoring rules).
- **`scoring_wrong`** supports negative scoring (e.g., -0.25 per wrong answer) if a faculty uses it.
- **`problems.slug`** enables SEO-friendly URLs like `/zadaci/etf-2025-zadatak-3`.
- **`problem_progress`** tracks per-user, per-problem state independently from mock exams (a student can mark a problem "solved" by browsing, not only via exams).
- **`mock_exam_problems.is_flagged`** lets students flag problems to revisit before submitting.

---

## 6. Environment Configuration (.env)

```bash
# ── Database ──
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# ── Authentication ──
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://prijemni.vercel.app
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>

# ── LLM Configuration (same as BrainSpark) ──
LLM_PROVIDER=anthropic                     # 'anthropic' | 'openai' | 'google'
LLM_MODEL=claude-sonnet-4-5-20250929       # exact model string
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...

# ── Rate Limiting ──
AI_DAILY_LIMIT=20                          # AI requests per user per day (Season 1)

# ── App Config ──
LEADERBOARD_RECALC_INTERVAL=900   # seconds (15 min)
```

---

## 7. API Routes

### 7.1 Authentication

| Method | Route | Description |
|--------|-------|-------------|
| * | `/api/auth/[...nextauth]` | NextAuth.js (Google OAuth) |

### 7.2 Problems

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/problems` | List problems (paginated, filterable by faculty, year, topic) |
| GET | `/api/problems/[slug]` | Get problem metadata |
| GET | `/api/problems/[slug]/html` | Raw HTML solution (for iframe) |

### 7.3 Bookmarks

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bookmarks` | List user's bookmarks |
| POST | `/api/bookmarks/[problemId]` | Toggle bookmark |

### 7.4 Progress

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/progress` | Get user's progress summary |
| GET | `/api/progress/by-faculty` | Progress broken down by faculty |
| GET | `/api/progress/by-topic` | Progress broken down by topic |
| POST | `/api/progress/[problemId]` | Mark problem as attempted/solved |

### 7.5 Mock Exams

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/exams` | Start a new mock exam (specify faculty) |
| GET | `/api/exams/[id]` | Get exam state (problems, timer, answers so far) |
| PATCH | `/api/exams/[id]/answer` | Submit/update answer for a problem |
| PATCH | `/api/exams/[id]/flag` | Toggle flag on a problem |
| POST | `/api/exams/[id]/submit` | Submit exam for grading |
| GET | `/api/exams/[id]/results` | Get graded results with solutions |
| GET | `/api/exams/history` | User's past exams |

### 7.6 Leaderboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/leaderboard` | Top N users, overall |
| GET | `/api/leaderboard/me` | Current user's rank and stats |

### 7.7 AI Tutor (LLM On-Demand)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/solve` | Standalone: submit custom problem → get HTML solution |
| POST | `/api/ai/ask` | Contextual: ask about a specific curated problem |
| GET | `/api/ai/solutions` | List user's past AI solutions (paginated) |
| GET | `/api/ai/solutions/[id]` | Get AI solution metadata |
| GET | `/api/ai/solutions/[id]/html` | Raw HTML of AI solution (for iframe) |
| GET | `/api/ai/usage` | Get today's AI usage count + remaining |

### 7.8 Admin

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/analytics` | Platform-wide stats |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/[id]` | Edit user (deactivate, change role) |
| POST | `/api/admin/problems` | Add/update problem |
| PATCH | `/api/admin/problems/[id]` | Edit problem metadata |
| DELETE | `/api/admin/problems/[id]` | Unpublish problem |
| GET | `/api/admin/faculties` | List faculties |
| POST | `/api/admin/faculties` | Add/edit faculty exam config |

---

## 8. Pages & UI

### 8.1 Page Structure

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing / Home | No | Hero + value prop + CTA to sign in |
| `/prijava` | Login | No | Google sign-in page |
| `/onboarding` | Onboarding | Yes | Choose display name + target faculty (first login only) |
| `/zadaci` | Problem Library | Yes | Filterable grid of all problems |
| `/zadaci/[slug]` | Problem View | Yes | Full solution rendered in iframe |
| `/ispit` | Mock Exam Setup | Yes | Choose faculty → start exam |
| `/ispit/[id]` | Mock Exam In Progress | Yes | Timer + problems + answer selection |
| `/ispit/[id]/rezultati` | Exam Results | Yes | Score breakdown + solution review |
| `/rang-lista` | Leaderboard | Yes | Global ranking table |
| `/profil` | Profile & Stats | Yes | User stats, exam history, progress |
| `/sacuvano` | Bookmarks | Yes | Saved problems list |
| `/ai` | AI Tutor | Yes | Standalone: submit custom problem |
| `/ai/istorija` | AI History | Yes | Past AI-generated solutions |
| `/ai/resenje/[id]` | AI Solution View | Yes | View single AI-generated solution |
| `/admin` | Admin Dashboard | Admin | Analytics + management |

### 8.2 Design Language

The platform uses the same dark theme as BrainSpark solutions, ensuring visual consistency when viewing solutions inline:

- **Background:** `#0f172a`
- **Card background:** `#1e293b`
- **Card border:** `#334155`
- **Primary text:** `#e2e8f0`
- **Muted text:** `#94a3b8`
- **Accent (primary):** `#60a5fa` (blue)
- **Accent (secondary):** `#a78bfa` (purple)
- **Success:** `#34d399` / `#4ade80` (green)
- **Warning/highlight:** `#fbbf24` / `#facc15` (yellow)
- **Error/wrong:** `#f87171` (red)
- **Faculty colors:** Each faculty gets a distinct accent color for badges and headers

**Font:** 'Segoe UI', system-ui, -apple-system, sans-serif
**Component library:** Tailwind CSS + shadcn/ui
**Icons:** Lucide React

### 8.3 Page: Landing (`/`)

Public page — visible without login. Optimized for SEO.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🧠 Prijemni                          [Prijavi se]      │
│                                                         │
│         Pripremi se za prijemni ispit                   │
│         sa 600+ rešenih zadataka                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 600+     │  │ 8+       │  │ Besplatno│              │
│  │ zadataka │  │ fakulteta│  │ u prvoj  │              │
│  │          │  │          │  │ sezoni   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │  Featured faculties: ETF · MATF · FON · ... │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│     [ 🚀 Počni besplatno sa Google nalogom ]            │
│                                                         │
│  Rešeni zadaci sadrže:                                  │
│  ✓ Teoriju  ✓ Korak-po-korak  ✓ Vizuelizacije          │
│  ✓ Česte greške  ✓ Probni ispiti  ✓ Rang lista         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.4 Page: Problem Library (`/zadaci`)

The main browsable library.

**Filter Bar:**
```
┌─────────────────────────────────────────────────────────┐
│ Fakultet: [Svi ▾]  Godina: [Sve ▾]  Tema: [Sve ▾]     │
│                                                         │
│ 🔍 Pretraži zadatke...                                  │
│                                                         │
│ Prikazano: 142 zadatka                                  │
└─────────────────────────────────────────────────────────┘
```

**Problem Card Grid (responsive: 1/2/3 columns):**
```
┌─────────────────────────┐
│  ETF 2025               │  ← Faculty badge + year
│                         │
│  Površina i zapremina   │  ← Title (max 2 lines)
│  lopte                  │
│                         │
│  geometrija · sfere     │  ← Topic tags
│                         │
│  Zadatak #2  ·  ✅ Rešen │  ← Problem number + solved status
│  🔖                      │  ← Bookmark indicator (if bookmarked)
└─────────────────────────┘
```

**Card states:**
- Default: neutral border
- Solved (✅): subtle green left border
- Attempted but wrong: subtle orange left border
- Bookmarked: small bookmark icon in corner

### 8.5 Page: Problem View (`/zadaci/[slug]`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Nazad na zadatke                                     │
│                                                         │
│  ETF · 2025 · Zadatak #2                                │
│  geometrija · sfere                                     │
│                                                         │
│  Površina i zapremina lopte                              │
│                                                         │
│  ┌──── Answer First (before revealing solution) ─────┐  │
│  │                                                    │  │
│  │  Probaj da rešiš pre nego što pogledaš rešenje:   │  │
│  │                                                    │  │
│  │  (A) 18π   (B) 36π   (C) 54π   (D) 72π   (E) 108π│  │
│  │                                                    │  │
│  │  [ Proveri odgovor ]    [ Preskoči → Vidi rešenje ]│  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  ┌────── Solution iframe (initially hidden) ──────────┐  │
│  │                                                     │  │
│  │  Full HTML solution rendered in sandboxed iframe    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                         │
│  [🔖 Sačuvaj]  [✅ Označi kao rešen]  [← Prethodni] [Sledeći →]│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**"Pitaj AI" Contextual Panel (below solution iframe):**
```
┌─────────────────────────────────────────────────────────┐
│  🤖 Pitaj AI o ovom zadatku                             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Npr: "Objasni mi korak 3 detaljnije"             │   │
│  │ Npr: "Zašto ne može da se koristi formula za..."  │   │
│  │ Npr: "Daj mi sličan zadatak za vežbu"            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Preostalo danas: 17/20          [ 🚀 Pitaj ]          │
│                                                         │
│  ── Prethodni AI odgovori za ovaj zadatak ──            │
│  • "Objasni korak 3" — pre 2h                [Pogledaj]│
│  • "Sličan zadatak" — pre 1 dan              [Pogledaj]│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

The contextual AI call sends to `POST /api/ai/ask` with:
- `source_problem_id`: the curated problem being viewed
- `context_hint`: the student's question
- The LLM receives the full problem HTML + the student's question as context, producing a targeted response

### 8.11 Page: AI Tutor — Standalone (`/ai`)

Identical UX to BrainSpark's solve page — submit any custom problem:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🤖 AI Tutor — Reši bilo koji zadatak                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Opiši zadatak...                                  │   │
│  │                                                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📷 Prevuci ili klikni da dodaš sliku zadatka    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Preostalo danas: 17/20                                 │
│                                                         │
│             [ 🚀 Reši zadatak ]                         │
│                                                         │
│  ── Tvoja prethodna AI rešenja ──                       │
│  [Card grid of past AI solutions]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Text and/or screenshot input (at least one required)
- Max 1 screenshot per request
- Generated solution renders in iframe (same as curated solutions)
- Solutions saved to `ai_solutions` table and browsable from `/ai/istorija`

**Key UX flow:**
1. Student sees the problem title and answer options FIRST
2. They can attempt to answer before seeing the solution
3. If they click "Proveri odgovor" — their answer is checked, correct/wrong shown
4. Then the full solution iframe is revealed
5. If they click "Preskoči" — solution is revealed immediately
6. Either way, the attempt is recorded in `problem_progress`

### 8.6 Page: Mock Exam Setup (`/ispit`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Probni prijemni ispit                                  │
│                                                         │
│  Izaberi fakultet:                                      │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    ETF     │  │   MATF     │  │    FON     │        │
│  │ 20 zadataka│  │ 15 zadataka│  │ 20 zadataka│        │
│  │ 180 min    │  │ 150 min    │  │ 120 min    │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   GRF      │  │    TMF     │  │    RAF     │        │
│  │  ...       │  │  ...       │  │  ...       │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                         │
│  ⚠️ Zadaci se nasumično biraju iz baze za izabrani      │
│     fakultet. Tajmer počinje odmah!                     │
│                                                         │
│             [ ▶ Započni ispit ]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.7 Page: Mock Exam In Progress (`/ispit/[id]`)

```
┌─────────────────────────────────────────────────────────┐
│  ETF Probni ispit          ⏱ 2:34:15          3/20     │
│                                                         │
│  ┌─ Problem navigation ──────────────────────────────┐  │
│  │ [1✓][2✓][3●][4][5][6🚩][7][8]...[20]             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Zadatak 3                                              │
│                                                         │
│  Ako je log_a(b) = 6, kolika je vrednost               │
│  log_b(a²·b) + log_{√a}(a/∛b)?                        │
│                                                         │
│  ○ (A) −2/3                                             │
│  ○ (B) 2/3                                              │
│  ○ (C) 4/3                                              │
│  ○ (D) −4/3                                             │
│  ○ (E) 2                                                │
│                                                         │
│  [🚩 Obeleži]    [← Prethodni]  [Sledeći →]            │
│                                                         │
│             [ 📝 Predaj ispit ]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key features:**
- **Top bar:** Faculty name, countdown timer (prominently displayed), current/total indicator
- **Problem navigation strip:** Numbered circles showing status (● = current, ✓ = answered, 🚩 = flagged, empty = unanswered)
- **Problem text:** Extracted from the HTML (the problem statement section only, without solution)
- **Answer options:** Radio buttons extracted from the HTML's answer options
- **Flag button:** Mark for review — problem number shows 🚩 in navigation
- **Submit button:** Confirm dialog: "Imate 5 neodgovorenih zadataka. Da li ste sigurni?"
- **Timer expiry:** Auto-submit when timer reaches 0 with whatever answers are filled in

**Important:** During the exam, students see ONLY the problem statement and answer options — NOT the solution. Solutions are revealed only after submission.

### 8.8 Page: Exam Results (`/ispit/[id]/rezultati`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Rezultati — ETF Probni ispit                           │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  Bodovi   │  │  Tačnih   │  │  Vreme    │           │
│  │  68/100   │  │  14/20    │  │  1:52:30  │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
│  Progress bar:  ████████████████░░░░  68%               │
│                                                         │
│  ┌── Per-problem breakdown ─────────────────────────┐   │
│  │ #  │ Status │ Tvoj odgovor │ Tačan │ Pogledaj    │   │
│  │ 1  │  ✅    │    (B)       │  (B)  │  [Rešenje]  │   │
│  │ 2  │  ❌    │    (A)       │  (C)  │  [Rešenje]  │   │
│  │ 3  │  ✅    │    (A)       │  (A)  │  [Rešenje]  │   │
│  │ 4  │  ⬜    │     —        │  (D)  │  [Rešenje]  │   │
│  │ ...│        │              │       │             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [📊 Rang lista]  [🔄 Novi ispit]  [📚 Nazad na zadatke]│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Clicking "Rešenje" expands inline or navigates to the full solution page.

### 8.9 Page: Leaderboard (`/rang-lista`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🏆 Rang lista                                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ #  │ Korisnik        │ Bodovi │ Zadaci │ Ispiti  │   │
│  │ 🥇 │ MatematicarPro  │ 2,450  │ 342    │ 18     │   │
│  │ 🥈 │ ETF_2026        │ 2,180  │ 298    │ 15     │   │
│  │ 🥉 │ AnaMat           │ 1,920  │ 256    │ 12     │   │
│  │ 4  │ LazyGenius       │ 1,850  │ 245    │ 14     │   │
│  │ ...│                 │        │        │        │   │
│  │────│─── Tvoja pozicija ───────│────────│────────│   │
│  │ 47 │ ★ TvojNick       │   680  │ 89     │ 4      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Top 50 displayed by default
- Current user's position always shown (even if not in top 50)
- Columns: rank, display name, total score, problems solved, exams completed
- Top 3 have medal emojis
- Clicking a user shows their public stats (problems solved, avg exam score — no private data)

### 8.10 Page: Profile (`/profil`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  👤 MatematicarPro                                      │
│  📧 marko@gmail.com                                     │
│  🎯 Ciljani fakultet: ETF                               │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │ Zadaci    │  │  Ispiti   │  │  Niz      │           │
│  │ 142/600   │  │  8        │  │  12 dana  │           │
│  │  24%      │  │ avg: 72%  │  │  🔥 best:15│          │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
│  Napredak po fakultetu:                                 │
│  ETF   ████████████░░░░  67% (80/120)                   │
│  MATF  ██████░░░░░░░░░░  32% (28/88)                   │
│  FON   ███░░░░░░░░░░░░░  15% (12/80)                   │
│                                                         │
│  Napredak po temi:                                      │
│  Algebra        ██████████░░  75%                       │
│  Geometrija     ███████░░░░░  55%                       │
│  Trigonometrija ████░░░░░░░░  30%                       │
│  ...                                                    │
│                                                         │
│  Istorija ispita:                                        │
│  ETF  │ 20.02.2026 │ 72% │ 14/20 │ 1:52:30            │
│  MATF │ 18.02.2026 │ 68% │ 10/15 │ 1:24:10            │
│  ...                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Mock Exam Engine

### 9.1 Exam Generation Flow

```
1. User selects faculty
2. Server reads faculty config (num_problems, duration, scoring)
3. Server randomly selects N problems from that faculty's pool
   - Spread across topics (proportional to available problems per topic)
   - Exclude problems the user has already seen in a mock exam (if possible)
   - Fallback: allow repeats if pool is exhausted
4. Create mock_exam record + mock_exam_problems with positions
5. Return exam ID → client redirects to /ispit/[id]
```

### 9.2 During Exam

- **Timer:** Client-side countdown (initialized from `started_at + duration_limit`). Server validates on submission that time hasn't exceeded limit + 30s grace.
- **Answers:** Each answer selection sends `PATCH /api/exams/[id]/answer` to persist immediately (prevent data loss on disconnect).
- **Flag:** Toggle persisted server-side.
- **Navigation:** All problems loaded on initial page — client-side navigation between them (no full page reloads).

### 9.3 Grading

On exam submission (`POST /api/exams/[id]/submit`):

```
for each problem:
  if answer === correct_answer → score += scoring_correct
  elif answer is blank/null   → score += scoring_blank
  else                        → score += scoring_wrong (may be negative)

score_percent = (score / max_score) × 100
```

Also:
- Update `problem_progress` for each problem (attempted/solved)
- Update user streak (if active today for first time)
- Trigger leaderboard recalculation

### 9.4 Problem Text Extraction

During an exam, the student should NOT see the full solution — only the problem statement and answer options. Two approaches:

**Option A (recommended):** Store the problem statement text separately in the `problems` table (extracted during import).

**Option B:** Serve a modified version of the HTML that only shows the problem statement section (strip everything after "Plan rešavanja").

For Season 1, **Option A** is cleaner — add a `problem_text` column to `problems`:

```sql
ALTER TABLE problems ADD COLUMN problem_text TEXT; -- clean problem statement (no solution)
```

This is extracted during import from the first section of each HTML file.

---

## 10. Authentication

### 10.1 NextAuth.js Configuration

- **Provider:** Google OAuth only
- **Session strategy:** JWT
- **Callback flow:**
  1. User clicks "Prijavi se sa Google nalogom"
  2. Google OAuth flow → returns profile (email, name, avatar)
  3. On first login: create user record, redirect to `/onboarding`
  4. On subsequent logins: load existing user, redirect to `/zadaci`

### 10.2 Onboarding (First Login)

After first Google login, the user is redirected to `/onboarding`:
- Choose a display name (3-20 chars, unique, alphanumeric + underscores)
- Select target faculty (optional, can change later)
- Accept terms of use
- Click "Počni" → redirect to problem library

### 10.3 Session Token

```json
{
  "sub": "user-uuid",
  "email": "marko@gmail.com",
  "displayName": "MatematicarPro",
  "role": "student",
  "targetFaculty": "etf"
}
```

---

## 10.5 LLM Integration (AI Tutor)

Reuses BrainSpark's LLM architecture — same provider abstraction, same system prompt (with minor Prijemni-specific adjustments), same HTML output format.

### 10.5.1 Provider Abstraction

Identical to BrainSpark (see BrainSpark spec Section 8.1-8.2):
- `LLMProvider` interface with `generateSolution()` method
- `AnthropicProvider`, `OpenAIProvider`, `GoogleProvider` implementations
- Factory selects provider from `LLM_PROVIDER` env var

Code can be shared as an npm package or copied from BrainSpark.

### 10.5.2 Two Modes

**Standalone mode (`POST /api/ai/solve`):**
- Same as BrainSpark: user provides text and/or screenshot → LLM generates full HTML solution
- System prompt identical to BrainSpark (Serbian language forced)
- Response stored in `ai_solutions` with `context_type = 'standalone'`

**Contextual mode (`POST /api/ai/ask`):**

```typescript
interface ContextualRequest {
  sourceProblemId: string;     // UUID of the curated problem
  contextHint: string;         // student's question, e.g. "Objasni korak 3"
}
```

The system prompt for contextual mode wraps the curated solution as context:

```
Ti si AI tutor na platformi Prijemni. Učenik gleda rešenje zadatka i ima pitanje.

## Originalni zadatak i rešenje

{FULL_HTML_OF_CURATED_SOLUTION}

## Pitanje učenika

{CONTEXT_HINT}

## Instrukcije

Odgovori na pitanje učenika. Tvoj odgovor treba da bude u obliku jednog HTML fajla
koji prati isti vizuelni stil kao originalno rešenje (tamna tema, MathJax, canvas dijagrami).

Fokusiraj se SAMO na ono što učenik pita — ne ponavljaj celo rešenje.
Ako učenik traži sličan zadatak, generiši novi zadatak sa potpunim rešenjem.
Ako učenik traži objašnjenje koraka, daj detaljnije objašnjenje sa vizuelnim prikazom.

{BRAINSPARK_HTML_REQUIREMENTS}
```

Response stored in `ai_solutions` with `context_type = 'contextual'` and `source_problem_id` set.

### 10.5.3 Rate Limiting

- Default: 20 AI requests per user per day (configurable via `AI_DAILY_LIMIT` env var)
- Checked via `ai_daily_usage` table (same pattern as BrainSpark)
- Usage counter displayed on both standalone and contextual UI
- Friendly error on limit: "Iskoristio si sve AI zahteve za danas. Dođi sutra!"

### 10.5.4 Cost Tracking

Same as BrainSpark: each AI solution records `llm_provider`, `llm_model`, `input_tokens`, `output_tokens`, `cost_usd`, `latency_ms`. Visible in admin dashboard.

---

## 11. SEO Strategy

SEO is critical for organic acquisition. Serbian students will search for things like:
- "prijemni ETF 2025 zadatak 3 rešenje"
- "prijemni ispit matematika ETF"
- "rešeni zadaci prijemni Beograd"

### 11.1 Indexable Pages

| Page | URL Pattern | Meta Title |
|------|-------------|------------|
| Landing | `/` | Prijemni — 600+ rešenih zadataka za prijemni ispit |
| Faculty page | `/fakulteti/etf` | ETF prijemni ispit — rešeni zadaci svih godina |
| Year page | `/fakulteti/etf/2025` | ETF prijemni 2025 — svi zadaci sa rešenjima |
| Problem page | `/zadaci/etf-2025-zadatak-3` | Logaritamski izrazi — ETF prijemni 2025, Zadatak 3 |

### 11.2 SEO Requirements

- Server-side rendered (Next.js SSR) — full HTML in initial response
- Proper `<title>`, `<meta description>`, Open Graph tags per page
- Structured data (JSON-LD) for educational content
- `sitemap.xml` auto-generated from all published problems
- `robots.txt` allowing all problem pages
- **Problem pages are publicly crawlable** (meta tags and problem title visible) but full solutions require login — this creates a "teaser" that drives sign-ups from search

---

## 12. Security

### 12.1 Solution Iframe

Same approach as BrainSpark:

```html
<iframe
  src="/api/problems/[slug]/html"
  sandbox="allow-scripts allow-same-origin"
  style="width: 100%; border: none;"
  title="Rešenje"
/>
```

CSP header on the HTML endpoint restricts to trusted CDN domains only.

### 12.2 Exam Integrity

- Timer is validated server-side (not just client-side)
- Answers are submitted individually and persisted immediately
- Exam cannot be re-submitted after completion
- Problems are randomized per exam (not the same order every time)
- No solution content is served during an active exam

### 12.3 Authentication

- Google OAuth only — no password management
- JWT in httpOnly cookies
- Admin routes protected by role check

---

## 13. File & Folder Structure

```
prijemni/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── middleware.ts                    # Auth + role-based route protection
│
├── app/
│   ├── layout.tsx                  # Root layout (Serbian, dark theme)
│   ├── page.tsx                    # Landing page (public)
│   │
│   ├── prijava/
│   │   └── page.tsx                # Login page (Google sign-in)
│   │
│   ├── onboarding/
│   │   └── page.tsx                # First-login setup (display name, faculty)
│   │
│   ├── zadaci/
│   │   ├── page.tsx                # Problem library (filterable grid)
│   │   └── [slug]/
│   │       └── page.tsx            # Problem view (answer-first + solution iframe)
│   │
│   ├── ispit/
│   │   ├── page.tsx                # Exam setup (choose faculty)
│   │   └── [id]/
│   │       ├── page.tsx            # Exam in progress (timer + problems)
│   │       └── rezultati/
│   │           └── page.tsx        # Exam results
│   │
│   ├── rang-lista/
│   │   └── page.tsx                # Leaderboard
│   │
│   ├── profil/
│   │   └── page.tsx                # User profile + stats
│   │
│   ├── sacuvano/
│   │   └── page.tsx                # Bookmarks
│   │
│   ├── ai/                         # AI Tutor
│   │   ├── page.tsx                # Standalone: submit custom problem
│   │   ├── istorija/
│   │   │   └── page.tsx            # Past AI solutions list
│   │   └── resenje/
│   │       └── [id]/
│   │           └── page.tsx        # View single AI solution
│   │
│   ├── fakulteti/                  # SEO pages
│   │   ├── [faculty]/
│   │   │   ├── page.tsx            # Faculty overview
│   │   │   └── [year]/
│   │   │       └── page.tsx        # Faculty + year listing
│   │
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── users/
│   │   │   └── page.tsx            # User management
│   │   ├── problems/
│   │   │   └── page.tsx            # Problem management
│   │   └── faculties/
│   │       └── page.tsx            # Faculty/exam config
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── problems/
│       │   ├── route.ts            # GET list
│       │   └── [slug]/
│       │       ├── route.ts        # GET metadata
│       │       └── html/route.ts   # GET raw HTML
│       ├── bookmarks/
│       │   ├── route.ts            # GET list
│       │   └── [problemId]/route.ts # POST toggle
│       ├── progress/
│       │   ├── route.ts            # GET summary
│       │   ├── by-faculty/route.ts
│       │   ├── by-topic/route.ts
│       │   └── [problemId]/route.ts # POST mark
│       ├── exams/
│       │   ├── route.ts            # POST create
│       │   ├── history/route.ts    # GET history
│       │   └── [id]/
│       │       ├── route.ts        # GET state
│       │       ├── answer/route.ts # PATCH answer
│       │       ├── flag/route.ts   # PATCH flag
│       │       ├── submit/route.ts # POST submit
│       │       └── results/route.ts # GET results
│       ├── leaderboard/
│       │   ├── route.ts            # GET top N
│       │   └── me/route.ts         # GET my rank
│       ├── ai/
│       │   ├── solve/route.ts      # POST standalone solve
│       │   ├── ask/route.ts        # POST contextual ask
│       │   ├── solutions/
│       │   │   ├── route.ts        # GET list past AI solutions
│       │   │   └── [id]/
│       │   │       ├── route.ts    # GET AI solution metadata
│       │   │       └── html/route.ts # GET raw HTML
│       │   └── usage/route.ts      # GET daily usage
│       └── admin/
│           ├── analytics/route.ts
│           ├── users/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── problems/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           └── faculties/route.ts
│
├── lib/
│   ├── db.ts                       # Neon client
│   ├── auth.ts                     # NextAuth config (Google)
│   ├── exam-engine.ts              # Exam generation + grading logic
│   ├── leaderboard.ts              # Score calculation + recalculation
│   │
│   ├── llm/                        # Reused from BrainSpark
│   │   ├── types.ts                # LLMProvider interface
│   │   ├── factory.ts              # Provider factory
│   │   ├── prompt.ts               # System prompt (standalone mode)
│   │   ├── prompt-contextual.ts    # System prompt (contextual mode)
│   │   ├── parser.ts               # HTML + metadata extraction
│   │   ├── pricing.ts              # Cost calculation
│   │   ├── anthropic.ts
│   │   ├── openai.ts
│   │   └── google.ts
│   │
│   └── utils/
│       ├── validation.ts
│       ├── admin-guard.ts
│       └── rate-limit.ts           # AI daily usage check
│
├── components/
│   ├── nav/
│   │   ├── top-nav.tsx
│   │   └── user-menu.tsx
│   ├── problems/
│   │   ├── problem-card.tsx
│   │   ├── problem-grid.tsx
│   │   ├── filter-bar.tsx
│   │   ├── solution-viewer.tsx     # iframe wrapper
│   │   ├── answer-first.tsx        # Answer-before-solution component
│   │   └── topic-badge.tsx
│   ├── exam/
│   │   ├── exam-timer.tsx
│   │   ├── problem-nav-strip.tsx   # Numbered problem circles
│   │   ├── exam-problem.tsx        # Single problem during exam
│   │   ├── exam-results.tsx
│   │   └── faculty-card.tsx
│   ├── leaderboard/
│   │   └── leaderboard-table.tsx
│   ├── profile/
│   │   ├── stats-cards.tsx
│   │   ├── progress-bars.tsx
│   │   └── exam-history.tsx
│   ├── admin/
│   │   ├── analytics-cards.tsx
│   │   ├── users-table.tsx
│   │   ├── problems-table.tsx
│   │   └── faculty-form.tsx
│   ├── ai/
│   │   ├── ai-solve-form.tsx       # Standalone problem submission
│   │   ├── ai-contextual-panel.tsx # "Pitaj AI" panel on problem pages
│   │   ├── ai-solution-card.tsx    # Card for AI solution history
│   │   ├── ai-solution-viewer.tsx  # iframe wrapper for AI solutions
│   │   └── screenshot-upload.tsx   # Drag-and-drop image upload
│   └── ui/                         # shadcn/ui
│       └── ...
│
├── scripts/
│   ├── import-problems.ts          # One-time content import
│   ├── seed-faculties.ts           # Seed faculty configs
│   ├── recalc-leaderboard.ts       # Manual leaderboard recalculation
│   └── create-admin.ts             # Create admin user
│
└── drizzle/
    ├── schema.ts
    └── migrations/
```

---

## 14. Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` (14+) | Framework |
| `react`, `react-dom` | UI |
| `next-auth` | Authentication (Google OAuth) |
| `@neondatabase/serverless` | PostgreSQL driver |
| `drizzle-orm` + `drizzle-kit` | ORM + migrations |
| `@anthropic-ai/sdk` | Claude API (AI Tutor) |
| `openai` | ChatGPT API (AI Tutor) |
| `@google/generative-ai` | Gemini API (AI Tutor) |
| `tailwindcss` | Styling |
| `shadcn/ui` | UI components |
| `zod` | Validation |
| `lucide-react` | Icons |
| `recharts` | Admin analytics charts |
| `cheerio` | HTML parsing for import script |
| `date-fns` | Date formatting |

---

## 15. Content Import Script

### 15.1 Input

- **Directory:** `./problems/` containing 600+ HTML files
- **Manifest:** `./manifest.csv` with pre-assigned metadata:

```csv
filename,faculty,year,problem_number,topics
univerzitet_u_beogradu_elektrotehnicki_fakultet_2025_problem_2_solution.html,etf,2025,2,"geometrija,sfere"
univerzitet_u_beogradu_elektrotehnicki_fakultet_2025_problem_3_solution.html,etf,2025,3,"logaritmi,algebra"
...
```

### 15.2 Processing Per File

```
1. Read HTML file
2. Extract <title> → title
3. Extract correct answer from class="correct-answer" → correct_answer
4. Extract all answer options from class="final-option" → answer_options JSON
5. Extract problem statement section (first card) → problem_text
6. Extract logic-scratchpad content → logic_scratchpad
7. Generate slug: {faculty}-{year}-zadatak-{number}
8. Read topics from manifest CSV
9. Store full HTML as html_content
10. Insert into problems + problem_topics
```

### 15.3 Usage

```bash
# Seed faculties first
npx tsx scripts/seed-faculties.ts

# Import all problems
npx tsx scripts/import-problems.ts --dir ./problems/ --manifest ./manifest.csv

# Verify
npx tsx scripts/import-problems.ts --verify
```

---

## 16. Deployment

### 16.1 Vercel Configuration

- **Framework:** Next.js (auto-detected)
- **Environment:** All `.env` values in Vercel dashboard
- **Cron jobs:** Vercel Cron for leaderboard recalculation (every 15 min)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/recalc-leaderboard",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### 16.2 Database Setup

1. Create Neon project
2. Run migrations: `npx drizzle-kit push`
3. Seed faculties: `npx tsx scripts/seed-faculties.ts`
4. Import problems: `npx tsx scripts/import-problems.ts`
5. Create admin user: `npx tsx scripts/create-admin.ts --email admin@gmail.com`

### 16.3 Google OAuth Setup

1. Create project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add authorized redirect: `https://prijemni.vercel.app/api/auth/callback/google`
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel env

### 16.4 Deployment Checklist

- [ ] Neon database created and migrated
- [ ] Faculties seeded with correct exam configs
- [ ] 600+ problems imported successfully
- [ ] Google OAuth configured and tested
- [ ] Admin account created
- [ ] LLM API key(s) validated (test AI tutor call)
- [ ] AI daily limit configured
- [ ] Leaderboard cron job configured
- [ ] NEXTAUTH_URL matches deployment URL
- [ ] SEO: sitemap.xml generates correctly
- [ ] All environment variables set in Vercel
- [ ] Custom domain configured (prijemni.rs or similar)

---

## 17. Season 1 → Freemium Transition (Future)

For planning purposes, here's how the freemium split could work in Season 2:

| Feature | Free | Premium |
|---------|------|---------|
| Browse all problems + solutions | ✅ | ✅ |
| Answer-first practice | ✅ | ✅ |
| Bookmarks | ✅ | ✅ |
| Mock exams | 2 per month | Unlimited |
| Progress tracking | Basic (solved count) | Full (by faculty, topic, charts) |
| Leaderboard | View only | Full participation |
| AI Tutor — standalone | 3 per day | 50 per day |
| AI Tutor — contextual ("Pitaj AI") | 3 per day (shared with standalone) | 50 per day |
| AI solution history | Last 10 | Unlimited |
| Spaced repetition | ❌ | ✅ |
| Difficulty ratings | ❌ | ✅ |
| New season content (early access) | ❌ | ✅ |
| Ad-free experience | ❌ | ✅ |

**Pricing idea:** ~500-800 RSD/month (~€5-7) or ~4000-5000 RSD/year.

---

## 18. Future Enhancements (Post Season 1)

| Feature | Priority | Notes |
|---------|----------|-------|
| Spaced repetition | High | Resurface wrong answers on a schedule |
| Difficulty rating | High | Derived from user success rates |
| Actual past exams mode | High | Exact problem sets from a given year (not random) |
| Physics problems | Medium | Expand beyond math |
| Novi Sad / Niš universities | Medium | Expand geography |
| Mobile app (PWA) | Medium | Offline support for saved problems |
| Social sharing | Medium | Share exam results on Instagram/TikTok |
| Teacher accounts | Low | View student progress in a class |
| AI tutor (BrainSpark integration) | ~~Low~~ **Done** | Integrated as core feature in Season 1 |
| AI conversation threads | Medium | Multi-turn follow-up questions on a single problem |
| Video explanations | Low | YouTube links per problem |

---

## 19. Acceptance Criteria (Season 1 Launch)

**Authentication & Onboarding:**
1. ✅ User can sign in with Google account
2. ✅ First-time users go through onboarding (display name + target faculty)
3. ✅ Admin role exists with protected dashboard access

**Problem Library:**
4. ✅ 600+ problems browsable in a filterable card grid
5. ✅ Filter by faculty, year, and math topic
6. ✅ Search by keyword
7. ✅ Problem pages are SEO-friendly with proper meta tags
8. ✅ Solutions render correctly in sandboxed iframe (MathJax + canvas)
9. ✅ Answer-first flow: student attempts before seeing solution

**Mock Exams:**
10. ✅ Student can start a timed mock exam for any faculty
11. ✅ Problems are randomly selected from the faculty's pool
12. ✅ Timer counts down and auto-submits on expiry
13. ✅ Students can navigate between problems, flag for review
14. ✅ Answers persist immediately (no data loss on disconnect)
15. ✅ Grading applies correct scoring rules per faculty (including negative scoring)
16. ✅ Results page shows score, breakdown, and links to solutions

**Progress & Gamification:**
17. ✅ Problems track solved/attempted/unseen status per user
18. ✅ Progress visible by faculty and by topic
19. ✅ Leaderboard shows weighted composite score ranking
20. ✅ User can bookmark problems
21. ✅ User streak tracking (consecutive active days)

**Infrastructure:**
22. ✅ Deploys to Vercel with Neon PostgreSQL
23. ✅ Responsive design (mobile, tablet, desktop)
24. ✅ Serbian UI throughout
25. ✅ Content import script successfully processes all 600+ files
26. ✅ Leaderboard recalculates on schedule

**AI Tutor:**
27. ✅ Student can submit a custom problem (text and/or screenshot) and receive an HTML solution
28. ✅ Student can ask contextual questions about any curated problem ("Pitaj AI")
29. ✅ Contextual AI receives the full curated solution as context for targeted responses
30. ✅ AI solutions render in sandboxed iframe matching curated solution style
31. ✅ AI solutions are saved and browsable from history
32. ✅ Daily rate limiting works (20/day default in Season 1)
33. ✅ LLM provider/model configurable via .env (same as BrainSpark)
34. ✅ Cost tracking per AI request (provider, model, tokens, cost) visible in admin