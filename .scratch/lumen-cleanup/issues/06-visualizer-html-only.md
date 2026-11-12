# 06: Visualizer — Gemini HTML only, reachable

**What to build:** The visualizer keeps only the Gemini-generated HTML engine, drops the Manim and voice affordances, and becomes reachable (opened from a generated widget) instead of dead-ended.

**Blocked by:** 03 (prune the API surface)

**Status:** ready-for-agent

- [ ] Manim and voice UI (and their API wrappers) are removed; the HTML engine remains
- [ ] The visualizer opens from a widget action, so it is reachable
- [ ] The dead step-control UI is removed
