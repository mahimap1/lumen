# 01: Chat provider resilience

**What to build:** The chat endpoint returns a real answer using an ordered chain of currently-valid Gemini models, falling back automatically when a model is temporarily unavailable, and surfacing a short friendly message (not a raw provider error) only when the whole chain fails.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The model chain is built from currently-valid ids; retired ids (e.g. a `2.5-flash` model) are absent
- [ ] A transient `503 high demand` on the primary model falls through to a healthy model and still answers
- [ ] When every model fails, the reply is a short, friendly message, never the raw provider error string
- [ ] Verified: a real chat message returns an answer via `curl` against a running backend with a key set
