# 03: Prune the API surface

**What to build:** The backend exposes only the endpoints the UI actually calls; unconsumed routes and their frontend wrappers are removed; the Manim and ElevenLabs services and their key are deleted.

**Blocked by:** 02 (structured user memory)

**Status:** ready-for-agent

- [ ] Remove unconsumed routes: syllabus parse, notes consult, career ROI, memory context, database schema/query, visualize/manim, voice/narrate (keep: health, visualize/html, career reads, sessions/message)
- [ ] Remove the matching frontend API wrappers
- [ ] Delete the Manim and voice services; drop the ElevenLabs dependency and its key from config/env template
- [ ] Backend imports cleanly (`.venv/bin/python -c "import main"`)
