# 08: Settings pane and model chooser

**What to build:** A settings affordance at the bottom of the sidebar opens a pane whose first setting is the model choice (persisted, overridable per request), with room for later settings.

**Blocked by:** 01 (chat provider resilience), 02 (structured user memory)

**Status:** ready-for-agent

- [ ] A settings button at the bottom of the sidebar opens a pane
- [ ] The chosen model persists locally and is sent with each chat request
- [ ] The backend accepts a per-request model override and falls back to the environment default
