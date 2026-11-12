import asyncio
import json
import logging
import re
import uuid
from typing import Any, Dict, List, Optional

from config import GEMINI_API_KEY, GEMINI_MODEL
from services.memory_service import get_user_profile
from services.sqlite_service import execute_campus_sql, get_database_schema_summary

logger = logging.getLogger(__name__)

# Ordered fallback chain, used only when a model is transiently unavailable.
# Kept to currently-valid, generally-available ids (no retired models).
_FALLBACK_MODELS = [GEMINI_MODEL, "gemini-3.6-flash", "gemini-flash-lite-latest"]

_NO_KEY_MESSAGE = (
    "Lumen needs a Gemini API key to respond. Add GEMINI_API_KEY to backend/.env "
    "and restart the backend."
)

_schema_summary_cache: Optional[str] = None


def _schema_summary() -> str:
    global _schema_summary_cache
    if _schema_summary_cache is None:
        _schema_summary_cache = get_database_schema_summary()
    return _schema_summary_cache


def _profile_lines(profile: Optional[Dict[str, Any]]) -> str:
    data = profile if profile is not None else get_user_profile()
    return "\n".join(
        f"- {key.replace('_', ' ').title()}: {value}"
        for key, value in data.items()
        if value
    )


def _build_system_prompt(profile: Optional[Dict[str, Any]] = None) -> str:
    return f"""You are Lumen, an academic copilot and career mentor for UMBC STEM students.
Your mission is to provide intuitive explanations, data-driven academic advice, and visual learning aids.

STUDENT PROFILE:
{_profile_lines(profile)}

You have two capabilities:

1. Query the UMBC campus dataset (read-only SQLite). Tables and columns:
{_schema_summary()}
   - ALWAYS query the database for questions about courses, prerequisites, alumni career
     outcomes, starting salaries, employment, GPAs, or academic standing.
   - Never invent statistics or salary numbers; verify them with the database.
   - Write clean, safe SQLite SELECT statements.

2. Build a self-contained interactive HTML/CSS/JS widget (rendered in an iframe).

   === WIDGET VISUAL DESIGN MANDATE ===
   The widget MUST be a REAL VISUAL, not a glorified text box. Use at least two of:
   - SVG shapes (rects, circles, paths, lines, arrows with <marker>) to draw real diagrams.
   - CSS @keyframes animations (pulsing nodes, flowing data dots, bars growing on load).
   - Canvas API with requestAnimationFrame for numeric simulations.
   - Smooth transitions when the user clicks a button or moves a slider (elements MOVE/MORPH).
   FORBIDDEN: text-only boxes that swap text on click, ASCII art, static layouts, walls of text.
   AESTHETIC: background #0a0b0f; accents blue #3b82f6, green #10b981, amber #f59e0b, violet #8b5cf6.
   Keep labels to 1-5 words. Design for roughly 600px wide x 400px tall.

STYLE RULES (follow strictly):
- NEVER start a response with "I'm Lumen", "As Lumen", "Hi, I'm", or any self-introduction.
- NEVER produce ASCII art or text-based diagrams; use a widget instead.
- Be clear, supportive, and precise. Format responses in clean Markdown.
- End every substantive explanation with a short **🎯 Career Connection** section (2-3 sentences)
  tying the topic to the student's stated career goal. Skip only for purely administrative questions.
"""


def _build_user_prompt(
    message: str,
    history: Optional[List[Dict[str, str]]],
    course_context: Optional[str],
) -> str:
    conversation = ""
    if history:
        turns = []
        for turn in history[-12:]:
            role = turn.get("role", "user")
            label = "Student" if role == "user" else "Lumen"
            turns.append(f"{label}: {turn.get('content', '')}")
        if turns:
            conversation = "Conversation so far:\n" + "\n".join(turns) + "\n\n"

    context = f"[Course: {course_context}] " if course_context else ""
    return f"""{conversation}Student: {context}{message}

INSTRUCTIONS:
1. If the question needs campus dataset info, include exactly one SQL block:
```json_query
{{"query": "SELECT ...", "rationale": "..."}}
```

2. For any conceptual or technical question, produce exactly one widget block. The html_code must
   be a REAL VISUAL (SVG shapes + CSS @keyframes animations + JavaScript interactivity):
```json_widget
{{"title": "...", "concept": "...", "explanation": "...", "html_code": "<!DOCTYPE html>..."}}
```
"""


def _pop_block(content: str, tag: str):
    """Remove a fenced ```tag {...}``` JSON block and return (content, parsed | None)."""
    match = re.search(rf"```{tag}\s*(\{{.*?\}})\s*```", content, re.DOTALL)
    if not match:
        return content, None
    try:
        data = json.loads(match.group(1))
    except Exception as e:
        logger.warning(f"Failed to parse {tag} block: {e}")
        return content.replace(match.group(0), "").strip(), None
    return content.replace(match.group(0), "").strip(), data


async def _generate(prompt: str) -> str:
    """Generate text with Gemini, falling back across models on transient errors."""
    from google import genai
    from google.genai import types as genai_types

    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=genai_types.HttpOptions(timeout=45_000),
    )
    last_err: Optional[Exception] = None

    for model_name in dict.fromkeys(_FALLBACK_MODELS):
        try:
            res = await asyncio.to_thread(
                client.models.generate_content, model=model_name, contents=prompt
            )
            if res and res.text:
                return res.text
        except Exception as e:
            last_err = e
            logger.warning("Model %s failed: %s", model_name, str(e)[:160])

    if last_err:
        raise last_err
    return ""


async def _synthesize(message: str, sql: str, rows: List[Dict[str, Any]]) -> str:
    rows_preview = json.dumps(rows[:12], indent=2)
    prompt = f"""You are Lumen, academic copilot for UMBC.
NEVER start with a self-introduction. Answer the student's question directly.
The student asked: "{message}"
We ran this SQL on the campus database: {sql}
Query results:
{rows_preview}

Provide a concise, well-formatted Markdown answer that synthesizes these results with bullet points.
End with a short **🎯 Career Connection** section tying the topic to the student's career goal."""
    return await _generate(prompt)


async def send_chat_message(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    course_context: Optional[str] = None,
    profile: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Stateless single-turn chat: the client sends prior history, the backend derives the
    reply with Gemini, executing campus SQL and/or generating an interactive widget when
    the model asks for them.
    """
    if not GEMINI_API_KEY:
        return {
            "role": "assistant",
            "content": _NO_KEY_MESSAGE,
            "tool_executions": [],
            "widgets": [],
            "status": "error",
            "engine": "gemini",
        }

    try:
        prompt = f"{_build_system_prompt(profile)}\n\n{_build_user_prompt(message, history, course_context)}"
        content = await _generate(prompt)

        tool_executions: List[Dict[str, Any]] = []
        widgets: List[Dict[str, Any]] = []

        content, query_block = _pop_block(content, "json_query")
        if query_block and query_block.get("query"):
            sql = query_block["query"]
            sql_res = execute_campus_sql(sql)
            tool_executions.append({
                "tool": "query_campus_database",
                "query": sql,
                "rationale": query_block.get("rationale", ""),
                "columns": sql_res.get("columns", []),
                "rows": sql_res.get("rows", []),
                "row_count": sql_res.get("row_count", 0),
                "success": sql_res.get("success", False),
                "error": sql_res.get("error"),
            })
            if not content or len(content) < 30:
                content = await _synthesize(message, sql, sql_res.get("rows", []))

        content, widget_block = _pop_block(content, "json_widget")
        if widget_block:
            widgets.append({
                "id": f"w-{uuid.uuid4().hex[:8]}",
                "title": widget_block.get("title", "Interactive Visual"),
                "concept": widget_block.get("concept", course_context or "Concept"),
                "html_code": widget_block.get("html_code", "<p>Interactive widget</p>"),
                "explanation": widget_block.get("explanation", ""),
            })

        return {
            "role": "assistant",
            "content": content,
            "tool_executions": tool_executions,
            "widgets": widgets,
            "status": "success",
            "engine": "gemini",
        }

    except Exception as e:
        logger.error(f"Gemini chat error: {e}", exc_info=True)
        return {
            "role": "assistant",
            "content": "Lumen couldn't reach the AI model just now — the provider is busy. Please try again in a moment.",
            "tool_executions": [],
            "widgets": [],
            "status": "error",
            "engine": "gemini",
        }
