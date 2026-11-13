import asyncio
import logging
import uuid
from typing import Any, AsyncIterator, Dict, List, Optional

from config import GEMINI_API_KEY, GEMINI_MODEL
from services.memory_service import get_user_profile
from services.sqlite_service import execute_campus_sql, get_database_schema_summary

logger = logging.getLogger(__name__)

# Ordered fallback chain, used when a model is unavailable or stalls without answering.
# Kept to currently-valid ids (no retired models). The environment default leads.
_FALLBACK_MODELS = [GEMINI_MODEL, "gemini-3.5-flash-lite", "gemini-3.8-flash"]

# How many model turns may call tools before we force a plain-text answer.
MAX_TOOL_ROUNDS = 3

_no_key_message = (
    "Lumen needs a Gemini API key to respond. Add GEMINI_API_KEY to backend/.env "
    "and restart the backend."
)
_error_message = (
    "Lumen couldn't reach the AI model just now — the provider is busy. "
    "Please try again in a moment."
)

# Injected after a database query to stop the model re-querying and make it answer.
_QUERY_DONE_NUDGE = (
    "You have the data you need. Answer the student directly in clean Markdown, and call "
    "render_widget if an interactive visual would help. Do not run further database queries."
)
# Injected when the tool budget is spent; tools are removed so this guarantees prose.
_FINAL_NUDGE = "Now answer the student's question directly in clean Markdown."

_schema_summary_cache: Optional[str] = None
_client = None


def _model_chain(model: Optional[str] = None) -> List[str]:
    """Ordered models to try: an optional per-request override first, then the default chain."""
    chain = [model, *_FALLBACK_MODELS]
    return list(dict.fromkeys(m for m in chain if m))


def _schema_summary() -> str:
    global _schema_summary_cache
    if _schema_summary_cache is None:
        _schema_summary_cache = get_database_schema_summary()
    return _schema_summary_cache


def _get_client():
    """Lazily build one shared Gemini client for the process."""
    global _client
    if _client is None:
        from google import genai
        from google.genai import types as genai_types

        _client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=genai_types.HttpOptions(timeout=60_000),
        )
    return _client


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

You have two tools:

1. `query_campus_database` — run a read-only SELECT against the UMBC campus dataset.
   Tables and columns:
{_schema_summary()}
   Call it for any question about courses, prerequisites, alumni outcomes, salaries,
   employment, GPAs, or academic standing. Never invent statistics or salary numbers.
   Prefer one well-formed query; after you have results, ANSWER THE STUDENT in prose rather
   than querying again unless the first result was genuinely insufficient.

2. `render_widget` — build a self-contained interactive HTML/CSS/JS visual for a concept.

WIDGET VISUAL DESIGN MANDATE:
Every `render_widget` call must produce a single self-contained HTML document (embedded CSS + JS,
VANILLA only) that behaves like a polished interactive explainer — not a diagram on a page. It
must make ONE concept click. No React, no Tailwind, no Lucide, no CDNs or external fonts: achieve
the same result with vanilla HTML/CSS/JS and inline SVG.

AESTHETIC (editorial, high-contrast, cohesive):
- Generous whitespace, clear hierarchy, subtle 1px borders (rgba(255,255,255,0.08)), soft rounded
  corners. Pick ONE primary accent color and stay on it: blue #3b82f6, green #10b981, amber #f59e0b,
  or violet #8b5cf6. Deep slate background (#0b0d12).
- No walls of text; every element earns its place. Responsive from ~360px to ~900px wide.

REQUIRED STRUCTURE (all five):
1. HERO VISUALIZATION — a dynamic, real-time SVG or Canvas diagram/chart that shows the core
   mechanics of the concept itself (not decoration). It re-renders as inputs change.
2. INTERACTIVE CONTROLS — identify the 2–3 key variables of the concept and give each an intuitive
   control (slider, toggle, or drag). Add preset scenario buttons ("Baseline", "Worst case", …)
   that jump the controls to meaningful states.
3. LIVE FEEDBACK — real-time calculated metrics/readouts that update as the user manipulates the
   controls (numbers, deltas, or a small secondary chart).
4. WHY-CALLOUTS — short plain-English annotations attached to the visual explaining *why* it changed
   when the user adjusts a control; update or highlight them in response to interaction.
5. GUIDED WALKTHROUGH — a "Step-by-step" toggle or tabs that break the concept into 3–4 progressive
   stages for a beginner, each with its own focused visual state and one-sentence narration.

MOTION: animate the mechanism with @keyframes or requestAnimationFrame so flows, growth, or
transitions are visible. Show the process, not just the result.

THEMING (make it feel like THEIR field):
Frame the scenario, objects, and labels in the student's stated career goal from the profile above.
If the goal is Machine Learning Engineer, model concepts as inference requests, model servers,
feature vectors, training loops, and GPU clusters. If Cybersecurity, use packets, firewalls, and
attack paths; if Data Science, use datasets, pipelines, and dashboards. The concept stays correct —
the scenery comes from the career they're building toward.

FORBIDDEN: text-only boxes, ASCII art, static layouts, walls of text, unstyled default browser look,
external resources, and any framework (React/Tailwind/Lucide/etc.).
Keep labels to 1-5 words. Target roughly 720px wide x 480px tall; keep everything in one file.

STYLE RULES:
- NEVER start a response with "I'm Lumen", "As Lumen", "Hi, I'm", or any self-introduction.
- Answer the question that was asked. Lead with the substance, not with meta-commentary about
  the platform ("It looks like you're exploring…") or about what UMBC does or doesn't offer.
- Do NOT map every topic onto a UMBC course. Mention a course only when the student asks about
  courses, prerequisites, or requirements, or when a specific course is genuinely the answer.
  If nothing matches, say so in a few words — never invent a course or stretch an unrelated one.
- To show ANY visual, you MUST call the `render_widget` tool. NEVER paste raw HTML, <style>,
  or <script> blocks into your Markdown prose, and NEVER produce ASCII art.
- Be clear, supportive, and precise. Format responses in clean Markdown.
- End with a short **🎯 Career Connection** section (2-3 sentences) ONLY when the student's
  stated goal makes the tie-in genuinely useful. Skip it for conceptual, factual, or
  administrative questions where it would feel forced. Avoid buzzwords and filler.
"""


def _build_contents(
    history: Optional[List[Dict[str, str]]],
    message: str,
    course_context: Optional[str],
):
    """Turn prior turns plus the new message into Gemini conversation contents."""
    from google.genai import types as genai_types

    contents = []
    for turn in (history or [])[-12:]:
        role = "model" if turn.get("role") == "assistant" else "user"
        text = turn.get("content") or ""
        if text:
            contents.append(genai_types.Content(role=role, parts=[genai_types.Part(text=text)]))

    # The focus topic is the student's current study area — a course, skill, or
    # career path — not necessarily a course. Phrase it neutrally so the model
    # does not treat every question as a course question.
    context = f"[Focus topic: {course_context}] " if course_context else ""
    contents.append(
        genai_types.Content(role="user", parts=[genai_types.Part(text=f"{context}{message}")])
    )
    return contents


def _tool_declaration():
    from google.genai import types as t

    string = t.Type.STRING
    return t.Tool(
        function_declarations=[
            t.FunctionDeclaration(
                name="query_campus_database",
                description="Run a read-only SQLite SELECT against the UMBC campus dataset.",
                parameters=t.Schema(
                    type=t.Type.OBJECT,
                    properties={
                        "query": t.Schema(type=string, description="A single SQLite SELECT statement."),
                        "rationale": t.Schema(type=string, description="Why this query answers the question."),
                    },
                    required=["query"],
                ),
            ),
            t.FunctionDeclaration(
                name="render_widget",
                description=(
                    "Render a single self-contained HTML/CSS/JS interactive explainer that makes one "
                    "concept click. It must include a real-time hero SVG/Canvas visualization, controls "
                    "for the concept's 2-3 key variables, live-updating metrics, plain-English "
                    "why-callouts, and a 3-4 stage step-by-step walkthrough. Vanilla JS only (no "
                    "React/Tailwind/Lucide/CDNs). Theme the scenario and labels around the student's "
                    "career goal. Call this for conceptual or technical questions that benefit from a "
                    "diagram, simulation, or step-through."
                ),
                parameters=t.Schema(
                    type=t.Type.OBJECT,
                    properties={
                        "title": t.Schema(type=string, description="Short widget title (1-5 words)."),
                        "concept": t.Schema(type=string, description="The concept the widget teaches."),
                        "explanation": t.Schema(type=string, description="One or two sentences shown under the widget."),
                        "html_code": t.Schema(
                            type=string,
                            description=(
                                "A complete standalone HTML document with embedded CSS and JS. Must be "
                                "vanilla (no frameworks) and self-contained — no external scripts, "
                                "fonts, or CDNs."
                            ),
                        ),
                    },
                    required=["title", "html_code"],
                ),
            ),
        ]
    )


def _config(system_instruction: str, tools_enabled: bool):
    from google.genai import types as t

    config = t.GenerateContentConfig(system_instruction=system_instruction, temperature=0.5)
    if tools_enabled:
        config.tools = [_tool_declaration()]
    return config


def _chunk_parts(chunk) -> List[Any]:
    if not chunk.candidates:
        return []
    content = chunk.candidates[0].content
    if not content or not content.parts:
        return []
    return content.parts


def _tool_payload(result: Dict[str, Any]) -> Dict[str, Any]:
    # Rows and row_count must agree: a mismatch makes models distrust the data and re-query.
    rows = result.get("rows") or []
    return {
        "success": bool(result.get("success")),
        "columns": result.get("columns", []),
        "rows": rows,
        "row_count": len(rows),
        "error": result.get("error"),
    }


class _NoAnswerError(RuntimeError):
    """A model finished its tool rounds without ever producing prose."""


async def _run_conversation(
    model_name: str,
    base_contents: List[Any],
    system_instruction: str,
) -> AsyncIterator[Dict[str, Any]]:
    """Drive one model through its tool calls, streaming text as it arrives.

    Text deltas stream immediately; tool and widget events are buffered and released
    only after the turn has produced prose, so a model that stalls in a tool loop can
    fail over to the next model without leaking partial events. Raises
    :class:`_NoAnswerError` when no prose is produced, and any provider error otherwise.
    """
    from google.genai import types as t

    client = _get_client()
    contents = list(base_contents)
    tools_config = _config(system_instruction, tools_enabled=True)
    answer_config = _config(system_instruction, tools_enabled=False)
    buffered: List[Dict[str, Any]] = []
    answered = False

    for _ in range(MAX_TOOL_ROUNDS):
        model_parts: List[Any] = []
        calls: List[Any] = []
        stream = await client.aio.models.generate_content_stream(
            model=model_name, contents=contents, config=tools_config
        )
        async for chunk in stream:
            for part in _chunk_parts(chunk):
                model_parts.append(part)
                if part.function_call is not None:
                    calls.append(part.function_call)
                elif part.text and not getattr(part, "thought", False):
                    answered = True
                    yield {"type": "delta", "text": part.text}

        if not calls:
            break

        response_parts: List[Any] = []
        queried = False
        for call in calls:
            args = dict(call.args or {})
            if call.name == "query_campus_database":
                queried = True
                sql = args.get("query", "")
                result = await asyncio.to_thread(execute_campus_sql, sql)
                buffered.append({
                    "type": "tool",
                    "tool": "query_campus_database",
                    "query": sql,
                    "rationale": args.get("rationale", ""),
                    "columns": result.get("columns", []),
                    "rows": result.get("rows", []),
                    "row_count": result.get("row_count", 0),
                    "success": bool(result.get("success")),
                    "error": result.get("error"),
                })
                response_parts.append(
                    t.Part(function_response=t.FunctionResponse(name=call.name, response=_tool_payload(result)))
                )
            elif call.name == "render_widget":
                widget = {
                    "id": f"w-{uuid.uuid4().hex[:8]}",
                    "title": args.get("title", "Interactive Visual"),
                    "concept": args.get("concept", ""),
                    "explanation": args.get("explanation", ""),
                    "html_code": args.get("html_code", "<p>Interactive widget</p>"),
                }
                buffered.append({"type": "widget", "widget": widget})
                response_parts.append(
                    t.Part(function_response=t.FunctionResponse(name=call.name, response={"status": "rendered"}))
                )
            else:
                response_parts.append(
                    t.Part(
                        function_response=t.FunctionResponse(
                            name=call.name, response={"error": f"Unknown tool: {call.name}"}
                        )
                    )
                )

        contents.append(t.Content(role="model", parts=model_parts))
        contents.append(t.Content(role="user", parts=response_parts))
        if queried:
            # With data in hand, steer the model to answer (and optionally visualize)
            # instead of issuing more queries.
            contents.append(t.Content(role="user", parts=[t.Part(text=_QUERY_DONE_NUDGE)]))
    else:
        # Tool budget spent without prose: force one answer with tools removed.
        contents.append(t.Content(role="user", parts=[t.Part(text=_FINAL_NUDGE)]))
        stream = await client.aio.models.generate_content_stream(
            model=model_name, contents=contents, config=answer_config
        )
        async for chunk in stream:
            for part in _chunk_parts(chunk):
                if part.text and not getattr(part, "thought", False):
                    answered = True
                    yield {"type": "delta", "text": part.text}

    if not answered:
        raise _NoAnswerError(f"{model_name} produced no prose after {MAX_TOOL_ROUNDS} tool rounds")

    for event in buffered:
        yield event


async def stream_chat_message(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    course_context: Optional[str] = None,
    profile: Optional[Dict[str, Any]] = None,
    model: Optional[str] = None,
) -> AsyncIterator[Dict[str, Any]]:
    """Stateless streaming chat turn.

    Yields events: ``delta`` (text), ``tool`` (a campus query result), ``widget``
    (a rendered visual), ``error`` (a friendly message), then ``done``.
    """
    if not GEMINI_API_KEY:
        yield {"type": "error", "message": _no_key_message}
        yield {"type": "done"}
        return

    system_instruction = _build_system_prompt(profile)
    base_contents = _build_contents(history, message, course_context)
    last_err: Optional[Exception] = None

    for model_name in _model_chain(model):
        streamed_text = False
        try:
            async for event in _run_conversation(model_name, base_contents, system_instruction):
                if event["type"] == "delta":
                    streamed_text = True
                yield event
            yield {"type": "done"}
            return
        except _NoAnswerError as e:
            # Model stalled in a tool loop; try the next model (nothing leaked yet).
            last_err = e
            logger.warning("Model %s returned no answer; trying next model", model_name)
            continue
        except Exception as e:  # noqa: BLE001 - any provider failure falls through the chain
            last_err = e
            logger.warning("Model %s failed: %s", model_name, str(e)[:200])
            if streamed_text:
                # Already streamed partial output; retrying would duplicate it.
                break

    logger.error("All chat models failed: %s", last_err, exc_info=True)
    yield {"type": "error", "message": _error_message}
    yield {"type": "done"}
