# 09: Security and correctness pass

**What to build:** Close the avoidable security smells and the confirmed correctness bugs left after the surface is pruned.

**Blocked by:** 03 (prune the API surface)

**Status:** ready-for-agent

- [ ] CORS is restricted to local development origin(s); no wildcard-origin-with-credentials
- [ ] The widget sandbox iframe no longer uses `allow-same-origin`
- [ ] The chat message-state desync is fixed
- [ ] The malformed fallback object key is corrected
- [ ] Session-id semantics are unified across creation paths
