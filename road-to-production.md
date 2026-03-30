# Road to Production

Comprehensive production readiness audit of the Matoteka codebase.

---

## CRITICAL — Fix Before Launch

### ~~1. Cron endpoint has zero authentication~~ DONE
- **File:** `app/api/cron/recalc-leaderboard/route.ts`
- Added `Authorization: Bearer <CRON_SECRET>` header verification
- Set `CRON_SECRET` env var in Vercel before deploying

### ~~2. Problem answers exposed publicly~~ DONE
- **File:** `app/api/practice/[problemId]/route.ts`
- Added `auth()` session check; returns 401 for unauthenticated requests

### ~~3. No error boundaries~~ DONE
- Added `error.tsx` at: `app/`, `app/simulacija/`, `app/znanje/`, `app/vezba/`
- Serbian copy, themed UI, retry + back navigation

### ~~4. No database transactions for multi-step writes~~ DONE
- Switched `lib/db.ts` from `neon-http` to `neon-serverless` (WebSocket driver with Pool)
- Wrapped exam submission and practice answer writes in `db.transaction()`
- `lib/streak.ts` accepts optional `txDb` parameter for transactional use

### ~~5. Missing `onDelete` on 6 foreign keys~~ N/A
- Users are soft-deleted via `isActive` column (already in schema since day one)
- No user delete endpoint or code path exists anywhere
- Leaderboard already filters by `is_active = true`
- Missing `onDelete` is a non-issue since users are never hard-deleted

---

## HIGH — Security

### ~~7. No `middleware.ts` for centralized route protection~~ DONE
- Added `middleware.ts` protecting authenticated pages and API routes at the edge
- Pages redirect to `/prijava`, API routes return 401

### ~~8. CSP uses `'unsafe-inline'` and `'unsafe-eval'`~~ DONE
- Split CSP into explicit script-src, style-src, font-src, connect-src directives
- Removed `'unsafe-inline'` from script-src (kept for style-src which needs it)

### ~~9. Missing security headers~~ DONE
- Added global headers in `next.config.ts`: HSTS, X-Content-Type-Options,
  Referrer-Policy, X-Frame-Options, Permissions-Policy

### ~~10. Open redirect vulnerability in login~~ DONE
- Validate callbackUrl: only allow relative paths starting with `/`, reject `//`

### ~~11. `as any` casts on session.user (10+ instances)~~ DONE
- Created `types/next-auth.d.ts` with proper User/Session/JWT interfaces
- Replaced ~40 `(session.user as any).X` across 38 files

### ~~12. innerHTML without sanitization~~ DONE
- Strip `<script>` tags and `on*` event handler attributes before setting innerHTML

---

## HIGH — Database

### ~~13. Missing database indexes~~ DONE
- Added indexes: `problem_progress(userId, status)`, `problem_progress(userId, solvedAt)`,
  `problem_progress(problemId)`, `mockExams(status, finishedAt)`
- `users.googleId` and `users.email` already indexed via UNIQUE constraints
- Run `db:push` to apply

### ~~14. No migration history~~ DONE
- Generated initial migration (0000) from current schema
- Added `db:generate` and `db:migrate` scripts to package.json

### ~~15. Race condition in rate limiting~~ DONE
- Replaced check+increment with atomic `checkAndIncrementAiUsage` using
  upsert with RETURNING clause; rolls back increment if limit exceeded

### ~~16. Pagination parameters unbounded~~ DONE
- Leaderboard: limit capped at 100
- Simulation history: page min 1, perPage capped at 50
- Problems list: page min 1, limit capped at 100

---

## HIGH — Frontend

### ~~18. Missing SEO metadata on key pages~~ DONE
- Added metadata via `layout.tsx` wrappers for: `/simulacija`, `/znanje`, `/profil`, `/analitika`
- `/primer`, `/vezba`, `/zadaci`, `/about` already had metadata

### ~~19. Leaderboard has no UI~~ POSTPONED
- Backend fully built, no UI page needed for now
- Rank already surfaces in dashboard

---

## MEDIUM — Performance

### ~~20. No response caching on heavy API routes~~ PARTIALLY DONE
- `/api/lessons` cached at CDN (s-maxage=3600, stale-while-revalidate=86400)
- Other routes return user-specific data — CDN caching would leak data between users
- Monitor in production; add `private, max-age=10` if needed

### ~~21. Synchronous filesystem reads on every request~~ DONE
- Cached `getAllCategories()` and `getCategoryGroups()` in module-level singletons
- Files only read once per process lifetime instead of every request

---

## MEDIUM — Auth & Sessions

### 27. No session maxAge/updateAge configured
- **File:** `lib/auth.ts`
- JWT session strategy with no explicit lifetime settings
- Tokens valid indefinitely until browser cleared
- Add `session: { maxAge: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 }`

### 28. Cookie security settings not explicit
- **File:** `lib/auth.ts`
- No explicit `Secure`, `HttpOnly`, `SameSite` cookie configuration
- NextAuth v5 defaults are reasonable, but production should be explicit

### 29. next-auth is still beta
- **Version:** `5.0.0-beta.30`
- Beta software in production carries stability and security risks
- Evaluate pinning to stable v4 or accepting the risk with thorough testing

---

## MEDIUM — Code Quality

### 30. Fire-and-forget DB writes silently lose data
- **File:** `lib/utils/solution-rate-limit.ts:52-54`
- Solution view logging uses `.catch(() => {})` — audit records silently lost on failure
- Also: `recalculateAnalytics(userId).catch(() => {})` in multiple routes
- At minimum log errors; ideally await and handle

### 31. console.error for production logging
- **Files:** `app/analitika/page.tsx:160,173`, `app/simulacija/page.tsx:79`, `app/api/analytics/recalculate/route.ts:17`
- Should use structured error tracking (Sentry, LogRocket, etc.) for production

### 32. Duplicated inactivity penalty logic
- Same calculation exists in both `app/api/user/dashboard/route.ts:182-190` and `app/api/analytics/route.ts:76-104`
- Extract to shared utility function

### 33. Input validation inconsistencies
- Zod is installed but not used for API input validation
- String lengths not validated: display name (`app/api/profile/name/route.ts`), answer format
- UUID formats not validated for user/problem IDs
- Consider Zod schemas for all API request bodies

### 34. Inconsistent error response formats
- Some routes return `{ error: "message" }`
- Some return `{ error: "message", used, limit }` (rate limit routes)
- Some return plain text (HTML routes)
- Inconsistent status codes (400 vs 409 for similar validation errors)
- Standardize error response shape

---

## LOW — Nice to Have

### 35. Missing `not-found.tsx` custom 404 page
- Default Next.js 404 shown when navigating to non-existent routes
- Add branded 404 page for better UX

### 36. No build-time type checking in scripts
- **File:** `package.json`
- `build` script is just `next build` — no `tsc --noEmit` or lint step
- Add: `"build": "tsc --noEmit && next build"`

### 37. next.config.ts is minimal (11 lines)
- No compression config
- No security headers config
- No redirects/rewrites
- No bundle analyzer
- No output config

### 38. TypeScript target ES2017
- **File:** `tsconfig.json`
- Should be ES2020+ for modern browser features (optional chaining, nullish coalescing in output)

### 39. Lucide React major version gap
- **Current:** `0.575.0`, **Latest:** `1.7.0`
- Major version jump likely has breaking changes
- Audit icon usage before upgrading

### 40. No robots.txt or sitemap
- If the site is public-facing, add for SEO
- If authenticated-only, add robots.txt to block crawlers

### 41. MathJax loading strategy
- **Files:** `components/problems/AnswerOptions.tsx:47-68`, `app/simulacija/[id]/page.tsx:120-138`
- Script appended to DOM on every component mount
- Deduplication exists (checks `window.MathJax`) but should use `next/script` with `strategy="afterInteractive"`

### 42. .env.local credential management
- Contains hardcoded DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY
- Use Vercel Secrets for production deployment
- Create `.env.example` template for documentation

### 43. No test coverage metrics
- `vitest` configured but unclear test coverage
- Add coverage thresholds for critical paths (auth, exam submission, rate limiting)

### 22. 1.8MB problems-index.json loaded as singleton
- Already uses singleton pattern, only parsed once in production
- Not an issue — monitor memory usage only

### 23. Zero memoization across 134+ components
- Premature optimization — fix individual components if jank is observed

### 24. No code splitting for lessons or charts
- Lessons already use `next/dynamic` (fine)
- `recharts` (~200KB) loaded directly in `/app/analitika/page.tsx`
- Minor impact: analytics is an intentional navigation, browser caches after first load

### 25. No Suspense boundaries
- Would require restructuring pages from client-side useEffect to server components
- Major architectural change, current approach works fine

### 26. Font loading not optimized
- `&display=swap` already in URL, handling FOIT
- Switching to `next/font` risks touching every component's styling pre-launch

### 17. No `<Image>` from next/image anywhere
- Mostly logo SVGs, small avatars, and category icons
- Limited real-world impact

---

## What's Already Good

- Drizzle ORM with parameterized queries (no SQL injection)
- Proper bcrypt password hashing
- Admin routes consistently use `requireAdmin()`
- Rate limiting on AI and solution views
- Cascade deletes on bookmarks, progress, solution views
- `Promise.all()` for parallel DB queries in dashboard
- Proper cleanup of timers, event listeners, MutationObservers
- Responsive design with Tailwind
- Dark/light theme support
- TypeScript strict mode enabled
- Content protection on solutions (anti-copy, watermark, iframe sandboxing)
