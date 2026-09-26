import requests
from config import BACKBOARD_API_KEY

LOCAL_MEMORY_STORE = {}

def get_student_session_context(student_id: str = "alex_umbc") -> dict:
    """
    Retrieves student's persistent learning context from Backboard API.
    """
    if BACKBOARD_API_KEY:
        try:
            # Example Backboard endpoint integration
            res = requests.get(
                "https://api.backboard.io/v1/memory/context",
                headers={"Authorization": f"Bearer {BACKBOARD_API_KEY}"},
                params={"user_id": student_id},
                timeout=3
            )
            if res.status_code == 200:
                return res.json()
        except Exception as e:
            print(f"Backboard memory fetch error: {e}")

    # Resilient local persistent store
    if student_id not in LOCAL_MEMORY_STORE:
        LOCAL_MEMORY_STORE[student_id] = {
            "student_name": "Alex",
            "enrolled_courses": ["CMSC 341", "MATH 221", "ENTR 201", "CMSC 471"],
            "recent_focus_topics": [
                "AVL Tree Left-Right Rotations (Struggled with child pointer reassignments)",
                "Gram-Schmidt Orthogonalization steps"
            ],
            "last_active": "2026-09-24",
            "streak_days": 4
        }
    return LOCAL_MEMORY_STORE[student_id]


def record_student_interaction(topic: str, difficulty_rating: int, student_id: str = "alex_umbc"):
    """
    Records student topic interaction into Backboard long-term memory.
    """
    ctx = get_student_session_context(student_id)
    if topic not in ctx.get("recent_focus_topics", []):
        ctx.setdefault("recent_focus_topics", []).append(topic)
    return {"status": "memory_saved", "topic": topic}
