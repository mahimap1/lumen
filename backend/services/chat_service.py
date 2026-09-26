import json
import re
from config import GEMINI_API_KEY

def process_chat_message(user_message: str, courses_context: list, history: list = None) -> dict:
    """
    Processes chat requests using Gemini 3.5 Flash Lite to answer queries
    and execute structured student workspace actions (add deadline, add task,
    start study session, visualize concept, create note).
    Includes resilient rule-based fallback.
    """
    if GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)

            courses_summary = []
            for c in (courses_context or []):
                courses_summary.append(f"- ID: {c.get('id')}, Code: {c.get('code')}, Title: {c.get('title')}")
            courses_str = "\n".join(courses_summary) if courses_summary else "No courses enrolled yet."

            prompt = f"""You are Lumen, the AI academic co-pilot and concept visualizer for university STEM students.
The student has the following enrolled courses:
{courses_str}

Conversation history:
{json.dumps((history or [])[-4:])}

Student's message:
"{user_message}"

You can answer student questions (especially explaining complex STEM invariants with intuitive mental models) AND execute workspace actions.

If the student is requesting an action, return a structured action object.
Supported action types:
1. ADD_DEADLINE:
   {{"type": "ADD_DEADLINE", "course_id": "<id>", "title": "<title>", "date": "<date string>", "due": "<relative due string>", "sub": "<submission type>"}}
2. ADD_TODO:
   {{"type": "ADD_TODO", "course_id": "<id>", "text": "<task description>", "meta": "<meta info>"}}
3. START_STUDY:
   {{"type": "START_STUDY", "course_id": "<id>"}}
4. VISUALIZE:
   {{"type": "VISUALIZE", "concept": "<concept to visualize>", "course_id": "<id>"}}
5. CREATE_NOTE:
   {{"type": "CREATE_NOTE", "course_id": "<id>", "title": "<note title>", "topic": "<topic>"}}
6. NAVIGATE:
   {{"type": "NAVIGATE", "view": "home" | "study" | "archive" | "course", "course_id": "<id or null>"}}

If no action is needed (e.g. concept clarification), set "action": null.

Return STRICTLY valid JSON with this exact structure:
{{
  "reply": "A concise, supportive response confirming the action or providing a clear conceptual explanation.",
  "action": {{ ... }} or null
}}
"""

            response = client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=prompt,
            )

            text = response.text
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                if "reply" in data:
                    return data
        except Exception as e:
            print(f"Gemini chat service error, falling back to local heuristic: {e}")

    # Fallback heuristic engine
    return _local_rule_fallback(user_message, courses_context)


def _local_rule_fallback(message: str, courses_context: list) -> dict:
    msg = message.lower()
    
    # Identify target course
    target_course_id = "cmsc341"
    for c in (courses_context or []):
        cid = c.get("id", "").lower()
        code = c.get("code", "").lower().replace(" ", "")
        msg_clean = msg.replace(" ", "")
        if cid in msg or code in msg_clean:
            target_course_id = c.get("id")
            break

    # 1. Action: Add Deadline
    if any(k in msg for k in ["add deadline", "new deadline", "due date", "deadline:"]):
        # Extract title
        clean_title = re.sub(r'^(please\s+)?add(\s+a)?\s+deadline(\s+to|\s+for)?\s+[a-z0-9\s]+:?', '', message, flags=re.I).strip()
        if not clean_title:
            clean_title = "Assignment Deliverable"
        return {
            "reply": f"Added deadline: '{clean_title}' to your schedule.",
            "action": {
                "type": "ADD_DEADLINE",
                "course_id": target_course_id,
                "title": clean_title,
                "date": "Upcoming",
                "due": "In 7 days",
                "sub": "Online Portal"
            }
        }

    # 2. Action: Add Todo / Task
    if any(k in msg for k in ["add todo", "add task", "new todo", "new task", "remind me to"]):
        clean_task = re.sub(r'^(please\s+)?(add(\s+a)?\s+(todo|task)|remind me to)(\s+to|\s+for)?\s+[a-z0-9\s]*:?', '', message, flags=re.I).strip()
        if not clean_task:
            clean_task = "Review lecture invariants"
        return {
            "reply": f"Added action item: '{clean_task}'.",
            "action": {
                "type": "ADD_TODO",
                "course_id": target_course_id,
                "text": clean_task,
                "meta": "Added via Lumen Assistant"
            }
        }

    # 3. Action: Start Study Session
    if any(k in msg for k in ["start study", "study session", "focus session", "deep work"]):
        return {
            "reply": f"Starting deep focus study session for {target_course_id.upper()}. 25-minute Pomodoro timer initialized.",
            "action": {
                "type": "START_STUDY",
                "course_id": target_course_id
            }
        }

    # 4. Action: Visualize
    if any(k in msg for k in ["visualize", "show visual", "draw", "animation"]):
        concept = re.sub(r'^(please\s+)?(visualize|show visual for|draw|show animation for)\s*', '', message, flags=re.I).strip()
        if not concept:
            concept = "AVL Tree Left-Right Rotation"
        return {
            "reply": f"Generating interactive minimalist visual for '{concept}'.",
            "action": {
                "type": "VISUALIZE",
                "concept": concept,
                "course_id": target_course_id
            }
        }

    # 5. Conceptual question answering
    return {
        "reply": f"In {target_course_id.upper()}, core concepts revolve around preserving balance and invariant guarantees under state transitions. Would you like me to generate an interactive visualizer or add a study note for this topic?",
        "action": None
    }
