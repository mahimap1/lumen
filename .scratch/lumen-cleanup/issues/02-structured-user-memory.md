# 02: Structured user memory

**What to build:** A small structured user profile (name, university, year, career goal, focus) is stored, read with sane defaults, and injected into the system prompt, so answers reference who the user is and where they are headed.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Profile is read from a store with sensible defaults and is injectable per request
- [ ] The hardcoded demo persona in the prompt is replaced by the profile
- [ ] Verified: a chat reply references the profile's career goal (the Career Connection section)
