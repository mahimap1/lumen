LOCAL_MEMORY_STORE = {}


def get_student_session_context(student_id: str = "alex_umbc") -> dict:
    """
    Returns the local (in-memory) student learning context for a session.
    """
    if student_id not in LOCAL_MEMORY_STORE:
        LOCAL_MEMORY_STORE[student_id] = {
            "student_name": "Mahima",
            "year": "Junior",
            "career_goal": "Machine Learning Engineer",
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
    Records a student topic interaction into local memory.
    """
    ctx = get_student_session_context(student_id)
    if topic not in ctx.get("recent_focus_topics", []):
        ctx.setdefault("recent_focus_topics", []).append(topic)
    return {"status": "memory_saved", "topic": topic}
