import json
import os
from typing import Any, Dict

from config import BASE_DIR

# Local, single-user profile store. Not committed (see .gitignore).
PROFILE_PATH = os.path.join(BASE_DIR, "data", "user_profile.json")

DEFAULT_PROFILE: Dict[str, Any] = {
    "name": "Mahima",
    "university": "UMBC",
    "year": "Junior",
    "career_goal": "Machine Learning Engineer",
    "focus": "STEM coursework, CS fundamentals, and ML career readiness",
}


def get_user_profile() -> Dict[str, Any]:
    """Return the stored profile, falling back to defaults for any missing key."""
    profile = dict(DEFAULT_PROFILE)
    if os.path.exists(PROFILE_PATH):
        try:
            with open(PROFILE_PATH, encoding="utf-8") as f:
                stored = json.load(f)
            profile.update({k: v for k, v in stored.items() if k in DEFAULT_PROFILE})
        except Exception as e:
            print(f"[profile] failed to read profile: {e}")
    return profile


def update_user_profile(patch: Dict[str, Any]) -> Dict[str, Any]:
    """Merge a patch into the profile and persist it."""
    profile = get_user_profile()
    profile.update({k: v for k, v in (patch or {}).items() if k in DEFAULT_PROFILE})
    os.makedirs(os.path.dirname(PROFILE_PATH), exist_ok=True)
    with open(PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)
    return profile
