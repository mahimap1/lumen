# Lumen Cleanup — MVP Hardening

**Status:** ready-for-agent

## Problem Statement

Lumen is a working hackathon prototype (React/Vite frontend + FastAPI backend) with a real
distinctive idea — an academic copilot that answers from a synthetic UMBC campus dataset and
generates interactive HTML widgets — but it carries a lot of 24-hour-build debt. A technical
audit found: backend endpoints that no UI path reaches; a whole feature (the Career dashboard)
that is built but unreachable from the navigation; the same alumni data modelled twice (a large
static JSON snapshot in the frontend and live SQLite endpoints in the backend); two competing
CSS systems; god-components with heavy inline styles; dead files and dependencies; and several
correctness/robustness gaps. The app is meant to stay a **simple, local, demo-quality MVP** —
not production-grade — so the goal is to remove the unnecessary parts and make what remains
reachable and coherent, not to re-architect.

## Solution

Trim Lumen back to its four load-bearing surfaces — Four Year Plan, Alumni Pathways, Widgets,
and Career ROI — with the Gemini chat as the connective assistant, and make every one of them
reachable and internally consistent. Remove the third-party integration that carries the most
ceremony for the least value (Backboard), keep AI on Gemini only, unify the duplicated data
paths, converge the styling, delete dead code, and fix the confirmed bugs. Keep the provider
surface small: only the endpoints the UI actually calls. Sessions become stateless and
client-owned; user "memory" becomes a small structured profile injected into prompts rather
than a hosted thread service.

## User Stories

1. As a student, I want to open the Career Pathways & ROI dashboard from the sidebar, so that
   I can explore alumni salaries, skill gaps, and ROI without the feature being hidden.
2. As a student, I want the Career dashboard to show a clear error with a retry when the
   backend is unreachable, instead of a permanent loading spinner.
3. As a student, I want the Career dashboard cards to be visually correct (backgrounds and
   borders actually render), so that the page looks intentional.
4. As a student, I want the Alumni Pathways view to read from the same backend data as the rest
   of the app, so that the numbers I see are consistent and current.
5. As a student, I want the alumni metrics (median salary, time to first job) to be derived from
   the dataset rather than hardcoded, so that I can trust them.
6. As a student, I want to send a chat message and receive a real answer, with the model chosen
   for the situation (a fast/cheap model for everyday use, a stronger one for the demo).
7. As a student, I want chat to degrade gracefully when a model is temporarily unavailable
   (provider `503 high demand`), so that a transient spike does not surface as a raw error.
8. As a student, I want Lumen to remember a few things about me — my year, my aspirations, my
   target career — and use them to tailor explanations and visualizations, so that answers feel
   personal rather than generic.
9. As a student, I want my saved widgets to persist across reloads and to be listed somewhere I
   can retrieve and delete them, so that the gallery does not become cluttered.
10. As a student, I want to open a settings pane from the bottom of the sidebar and choose the
    model, so that I can switch between a cheap model and a stronger one without editing code.
11. As a student, I want generated visualizations to be interactive Gemini-produced HTML, and I
    do not want Manim animation or voice narration that never actually renders audio/video.
12. As a student, I want to be able to open the visualizer for a widget, so that the visual
    tool is reachable rather than dead-ended.
13. As a student, I want chat sessions to start empty and be private to my browser, so that I
    begin from a clean slate and nothing is pre-seeded.
14. As a student, I want my sessions to survive a reload (persisted locally) but to never
    depend on a server-side thread, so that the app is simpler and stateless.
15. As a maintainer, I want the backend to expose only the endpoints the frontend calls, so that
    the API surface is honest and small.
16. As a maintainer, I want the retired Manim and ElevenLabs integrations removed, so that I am
    not carrying keys and services for features no one can reach.
17. As a maintainer, I want one styling approach (Tailwind/shadcn) rather than two, so that I
    stop inventing new styles in a legacy stylesheet.
18. As a maintainer, I want the confirmed bug of undefined CSS variables fixed, so that styling
    does not silently no-op.
19. As a maintainer, I want dead files, unused dependencies, unused exported functions, and
    unused components deleted, so that the codebase reads as intentional.
20. As a maintainer, I want the two session-creation code paths unified, so that there is a
    single, obvious way sessions are created.
21. As a maintainer, I want the localStorage key mismatch fixed and legacy chat state cleared
    once, so that users are not stuck with stale data.
22. As a maintainer, I want CORS tightened and the widget sandbox hardened, so that the local
    demo does not ship avoidable insecurity.
23. As a maintainer, I want the README to describe the pruned surface and current setup, so that
    a fresh clone can run the app.
24. As a maintainer, I want the app to stay simple — no auth, no CI, no test infrastructure —
    so that the MVP identity is preserved.

## Implementation Decisions

**Scope and shape**
- Local-only demo. **No authentication.** Keep it an MVP, explicitly not production-grade.
- Four load-bearing surfaces: Four Year Plan, Alumni Pathways, Widgets, Career ROI. The Gemini
  chat is the connective assistant; Widgets is both a surface and a chat output.
- No new tests, CI, or type-checking. Verification is via the existing loops (see Testing).

**AI / provider**
- Gemini-only. Remove Backboard entirely (hosted threads, assistant creation, thread mapping,
  credit detection) and emulate "memory" locally.
- Model availability is account- and time-dependent and can return `503 high demand` or `404`
  for retired ids. The chat must try an ordered chain of currently-valid models and fall back
  on transient failures, converting an exhausted chain into a friendly, actionable message
  rather than a raw provider error.
- Model selection is configuration-driven (an environment default) and also user-selectable
  from a settings pane, so a cheap model is used day to day and a stronger one for the demo.

**Chat / sessions**
- Sessions are **stateless**: the client holds the message history and sends it with each turn;
  the backend derives a single reply. No server-side session or thread store.
- Sessions are client-only, persisted in the browser. There is exactly **one** session-creation
  path. Sessions start empty (no pre-seeded demo chats).

**Memory**
- Memory is a small **structured profile** (e.g. name, university, year, career goal, focus)
  stored locally and injected into the system prompt each turn. It replaces the hosted
  thread-memory and the hardcoded demo persona.

**Backend surface**
- Expose only endpoints the UI calls. Remove routes that no UI path reaches, plus their
  frontend wrappers. Remove the Manim and ElevenLabs services and their routes.
- Keep the campus SQLite read-only query path (used by the chat tool-call loop).

**Frontend surfaces**
- Make the Career dashboard reachable from the sidebar; fix its undefined CSS variables and add
  a proper error/retry state.
- Alumni Pathways reads from the backend API; the large static alumni JSON is deleted and its
  hardcoded metrics are derived from the API response.
- The Visualizer keeps the Gemini-HTML engine only, and becomes reachable (opened from a
  widget), removing the dead step controls.
- Saved widgets persist in the browser, are retrievable from the gallery, and can be deleted.
- A settings affordance sits at the bottom of the sidebar and opens a pane; the first setting is
  the model choice, with room for later settings.

**Styling**
- Converge on Tailwind/shadcn for new and touched components; stop adding to the legacy
  stylesheet. Fix the undefined CSS custom properties that currently break card styling.

**Security / hygiene**
- Restrict CORS to the local development origin(s) and stop combining a wildcard origin with
  credentials.
- Remove `allow-same-origin` from the widget sandbox iframe.
- Keep provider keys server-side only, in the backend environment.
- Delete dead code and dependencies (unused widget library file, unused components, unused
  exported functions, unused dependency, unused assets, unused imports).

## Testing Decisions

- **No new test framework, runner, or CI.** This is deliberate: the product is a prototype and
  the earlier plan explicitly placed tests/CI out of scope. The spec therefore defines
  **verification seams**, not an automated suite.
- **Seam 1 — Backend HTTP surface** (the highest seam; covers chat, sessions, and the career
  endpoints in one place). Verified by: the import smoke check
  (`.venv/bin/python -c "import main"`) and by `curl` against a running server for each retained
  endpoint. Good verification asserts external behaviour only (status + response shape), not
  internals.
- **Seam 2 — Frontend build + lint** (`npm run build`, `npm run lint`). These are the only
  automated frontend signals; they must stay clean (no new errors).
- Because chat depends on a live provider, provider-dependent behaviour is verified manually
  (send a message, observe a real answer or the friendly degradation message) rather than
  asserted in a test.

## Out of Scope

- Authentication, authorization, multi-user support.
- Production deployment, hosting, TLS, or a shared URL.
- Automated tests, a test runner, CI pipelines, type checking, TypeScript migration.
- Manim animation rendering and ElevenLabs voice narration (removed).
- Backboard and any hosted thread/memory service (removed).
- Database schema changes to the synthetic campus dataset itself.
- A redesign of the visual language; only convergence and bug fixes.

## Further Notes

**Already landed (context for the implementer)**
- Repo hygiene: a stray `lib/` ignore rule was un-anchored so the frontend `cn()` helper is
  tracked; the backend env-template file is now tracked.
- Backend refactor: Backboard removed and replaced with a Gemini-only chat service; chat is
  stateless (client sends history); the session-create route was removed; the `backboard-sdk`
  dependency and its key were dropped; a `GEMINI_MODEL` environment default was added
  (defaulting to a cheap `*-flash-lite` model).
- Frontend: sessions are client-only with a single creation path; frontend API calls go through
  a shared base URL (relative `/api`) served by the Vite proxy.
- Fresh start: seeded demo sessions removed; session/widget storage keys bumped and older keys
  cleared once.

**Known live issue to fold in**
- The chat endpoint currently fails on the default cheap model for the full widget-generating
  prompt with a provider `503 high demand`, and the fallback chain then lands on another
  unavailable model, so the user sees an error. The audit confirmed the key and model ids are
  valid; the fix is an ordered chain of currently-valid models plus graceful degradation, and
  using a healthy model for the demo. A retired id (e.g. a 2.5-flash model) must not be in the
  chain.

**Domain vocabulary**
- No `GLOSSARY.md` exists yet. Terms used above in their plain sense: *surface* (a top-level
  view), *widget* (a Gemini-generated interactive HTML artifact), *session* (a client-owned
  chat thread), *memory* (the structured user profile), *seam* (a place we exercise behaviour
  for verification).
