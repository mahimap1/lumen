import asyncio
import json
import logging
import uuid
from typing import Dict, Any, List, Optional
from config import BACKBOARD_API_KEY, GEMINI_API_KEY
from services.sqlite_service import execute_campus_sql, get_database_schema_summary

logger = logging.getLogger(__name__)

# Cache for assistant ID
_cached_assistant_id: Optional[str] = None

LUMEN_SYSTEM_PROMPT = f"""You are Lumen, an academic copilot and career intelligence mentor for UMBC STEM students.
Your mission is to provide intuitive explanations, data-driven academic advice, and visual learning aids.

STUDENT PROFILE (demo user):
- Name: Mahima
- Career Goal: Machine Learning Engineer
- University: UMBC
- Focus: STEM coursework, CS fundamentals, and ML career readiness

You have access to two powerful tools:
1. `query_campus_database`: Runs SQL SELECT queries against the UMBC campus dataset.
   The database contains:
{get_database_schema_summary()}

   RULES FOR DATABASE QUERIES:
   - ALWAYS query the database when asked about courses, prerequisites, alumni career outcomes, starting salaries, employment rates, student GPAs, or academic standings.
   - Do not make up statistics or salary numbers; verify with the database.
   - Write clean, safe SQLite SELECT queries.

2. `build_interactive_widget`: Generates a self-contained visual HTML/CSS/JS widget rendered in an iframe.

   ═══ WIDGET VISUAL DESIGN MANDATE ═══
   The widget MUST be a REAL VISUAL — not a glorified text box. Think of it as a mini web app.

   REQUIRED visual elements (use at least 2 per widget):
   a) SVG SHAPES & DIAGRAMS: Draw actual circles, rectangles, paths, arrows, and lines using <svg>.
      - For memory hierarchy: draw layered rectangles (CPU → Cache → DRAM → Disk) with SVG rects and labeled arrows.
      - For algorithms: draw animated SVG nodes connected by <line> or <path> elements with arrowheads (<marker>).
      - For pipelines: draw a horizontal flow of SVG shapes connected by flowing arrows.
   b) CSS ANIMATIONS: Use @keyframes for at minimum one animated element.
      - Pulsing glow on active nodes: box-shadow animation.
      - Data flowing along a path: translateX/translateY keyframe.
      - Bar chart growing on load: height/scaleY transition.
      - Particle or dot moving along a wire to show data transfer.
   c) CANVAS API (for numeric/algorithmic visuals): Use <canvas> with requestAnimationFrame for smooth animated simulations.
      - Example: animated gradient descent ball rolling down a loss curve.
      - Example: live bitfield visualization showing charge leaking in DRAM.
   d) ANIMATED TRANSITIONS: When the user clicks a button or slider, elements should MOVE or MORPH — not just change text.
      - Node positions should transition with CSS transition: all 0.4s ease.
      - Colors should fade between states.
      - Numbers should count up with a JS animation loop.

   STRICTLY FORBIDDEN in widgets:
   ✗ Plain <div> boxes that only change their text content on click.
   ✗ Text-only comparison tables with no shapes.
   ✗ ASCII art or monospace diagrams.
   ✗ Static images with no animation or interactivity.
   ✗ Walls of text inside the widget.

   AESTHETIC REQUIREMENTS:
   - Background: #0a0b0f (near-black). No white or light backgrounds.
   - Accent palette: Electric blue #3b82f6, Emerald #10b981, Amber #f59e0b, Violet #8b5cf6, Rose #f43f5e.
   - Typography: system-ui or monospace for labels; keep labels SHORT (2-5 words max per label).
   - Spacing: generous padding; elements should breathe.
   - Size: design for approximately 600px wide × 400px tall viewport.

   REFERENCE PATTERN — memory hierarchy widget:
   Use SVG to draw stacked horizontal bars (each a different color/width representing size).
   Animate a small glowing dot traveling from CPU → L1 → L2 → DRAM on a path using CSS @keyframes.
   Add click buttons to trigger a "cache miss" animation that reroutes the dot.
   Label each layer with its latency in nanoseconds.

   REFERENCE PATTERN — algorithm step-through:
   Draw SVG nodes (circles with text) connected by SVG lines/arrows.
   Highlight the active node with a pulsing glow animation.
   "Next Step" button smoothly transitions node colors and moves a pointer SVG element.

   REFERENCE PATTERN — data flow pipeline:
   Draw SVG rectangles for each stage (Input → Embedding → Attention → MLP → Output).
   Animate flowing particles (small SVG circles) moving along the connection paths between stages.

STYLE RULES (follow these strictly every response):
- NEVER start a response with "I'm Lumen", "As Lumen", "Hi, I'm", or any self-introduction. Just answer directly.
- NEVER repeat who you are. The student already knows.
- NEVER produce ASCII art or text-based diagrams in your markdown. Use build_interactive_widget instead.
- Be clear, supportive, and precise. Keep explanations concise — the widget IS the explanation.
- Format responses in clean Markdown.
- At the END of every substantive explanation, add a short **🎯 ML Engineer Connection** section (2-3 sentences max) tying the topic to Mahima's Machine Learning Engineer goal. Be concrete and specific. Skip only for purely administrative questions.
"""

CAMPUS_DB_TOOL = {
    "type": "function",
    "function": {
        "name": "query_campus_database",
        "description": "Execute a read-only SQLite SELECT query against the UMBC campus database (tables: course_catalog, students_current, alumni, employment_history, student_experience, transcripts). Use this for salary data, prerequisite chains, course catalog searches, and alumni career paths.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "A valid SQLite SELECT statement."
                },
                "rationale": {
                    "type": "string",
                    "description": "Brief explanation of why this query answers the student's question."
                }
            },
            "required": ["query"]
        }
    }
}

BUILD_WIDGET_TOOL = {
    "type": "function",
    "function": {
        "name": "build_interactive_widget",
        "description": """Generate a visually rich, self-contained HTML/CSS/JS widget rendered in an iframe.

The widget MUST be a REAL VISUAL EXPERIENCE — not a text box. Requirements:
- Use SVG shapes (circles, rects, lines, paths, arrows with <marker>) to draw actual diagrams.
- Use CSS @keyframes animations: glowing nodes, flowing data particles, bar chart growth, element transitions.
- Use Canvas API with requestAnimationFrame for numeric simulations (e.g. gradient descent, waveforms).
- When user clicks/steps: elements must MOVE or MORPH with smooth CSS transitions, not just text-swap.
- Background: #0a0b0f. Accents: blue #3b82f6, green #10b981, amber #f59e0b, violet #8b5cf6.
- Design for 600px wide × 400px tall. Keep text labels SHORT (≤5 words). Heavy on visuals, light on text.
- FORBIDDEN: ASCII art, plain text-only cards, static layouts with no animation.""",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Short descriptive title of the widget."
                },
                "concept": {
                    "type": "string",
                    "description": "The concept or course topic being visualized."
                },
                "html_code": {
                    "type": "string",
                    "description": "Complete <!DOCTYPE html> document. Must contain SVG shapes AND CSS @keyframes animations AND JavaScript interactivity. Dark theme #0a0b0f background."
                },
                "explanation": {
                    "type": "string",
                    "description": "One sentence explaining how to interact with the visual."
                }
            },
            "required": ["title", "concept", "html_code"]
        }
    }
}

ALL_TOOLS = [CAMPUS_DB_TOOL, BUILD_WIDGET_TOOL]


# Mapping from local/client session keys to real Backboard UUIDs
_session_thread_map: Dict[str, str] = {}


def _is_valid_uuid(val: Any) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


async def get_or_create_assistant(client) -> str:
    """
    Retrieves an existing Lumen assistant or creates one via Backboard.
    """
    global _cached_assistant_id
    if _cached_assistant_id:
        return _cached_assistant_id

    try:
        assistants = await client.list_assistants(limit=20)
        for a in assistants:
            if getattr(a, "name", "") == "Lumen Copilot":
                _cached_assistant_id = str(a.assistant_id)
                return _cached_assistant_id

        # Create new assistant
        assistant = await client.create_assistant(
            name="Lumen Copilot",
            description="Academic & Career Copilot for UMBC Students",
            system_prompt=LUMEN_SYSTEM_PROMPT,
            tools=ALL_TOOLS
        )
        _cached_assistant_id = str(assistant.assistant_id)
        return _cached_assistant_id
    except Exception as e:
        logger.warning(f"Could not list/create assistant on Backboard: {e}")
        return ""


async def create_backboard_session(title: str = "New Study Session") -> Dict[str, Any]:
    """
    Initializes a new conversational session / thread via Backboard.
    """
    if not BACKBOARD_API_KEY:
        local_id = str(uuid.uuid4())
        return {
            "thread_id": local_id,
            "title": title,
            "mode": "gemini_direct"
        }

    try:
        from backboard import BackboardClient
        client = BackboardClient(api_key=BACKBOARD_API_KEY)
        assistant_id = await get_or_create_assistant(client)
        if not assistant_id:
            await client.aclose()
            local_id = str(uuid.uuid4())
            return {
                "thread_id": local_id,
                "title": title,
                "mode": "gemini_direct"
            }

        thread = await client.create_thread(assistant_id=assistant_id)
        thread_id_str = str(thread.thread_id)
        await client.aclose()
        return {
            "thread_id": thread_id_str,
            "title": title,
            "assistant_id": assistant_id,
            "mode": "backboard"
        }
    except Exception as e:
        logger.error(f"Error creating Backboard thread: {e}")
        local_id = str(uuid.uuid4())
        return {
            "thread_id": local_id,
            "title": title,
            "mode": "gemini_direct",
            "error": str(e)
        }


async def send_chat_message(
    thread_id: str,
    message: str,
    course_context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends a message to the Backboard thread and handles tool calling for querying
    campus.db and building interactive widgets. Integrates Backboard thread memory
    and seamlessly utilizes Google Gemini 3.8 Flash for completions.
    """
    if not BACKBOARD_API_KEY:
        return await _send_message_via_gemini_fallback(thread_id, message, course_context)

    from backboard import BackboardClient
    client = BackboardClient(api_key=BACKBOARD_API_KEY)

    tool_executions: List[Dict[str, Any]] = []
    widgets: List[Dict[str, Any]] = []

    try:
        assistant_id = await get_or_create_assistant(client)

        # Ensure we have a valid Backboard UUID thread
        valid_thread_id = None
        if _is_valid_uuid(thread_id):
            valid_thread_id = str(thread_id)
        elif thread_id in _session_thread_map:
            valid_thread_id = _session_thread_map[thread_id]
        else:
            # Create a dedicated Backboard thread for this session
            try:
                new_thread = await client.create_thread(assistant_id=assistant_id if assistant_id else None)
                valid_thread_id = str(new_thread.thread_id)
                _session_thread_map[thread_id] = valid_thread_id
                logger.info(f"Created Backboard thread {valid_thread_id} for session key {thread_id}")
            except Exception as te:
                logger.warning(f"Could not create thread on Backboard: {te}")
                valid_thread_id = None

        content = message
        if course_context:
            content = f"[Context: Student is studying {course_context}]\n\n{message}"

        # Send message to Backboard to record turn and invoke assistant
        response = None
        if valid_thread_id:
            try:
                response = await client.send_message(
                    content=content,
                    thread_id=valid_thread_id,
                    assistant_id=assistant_id if assistant_id else None,
                    system_prompt=LUMEN_SYSTEM_PROMPT,
                    llm_provider="google",
                    model_name="gemini-3.8-flash",
                    tools=ALL_TOOLS
                )
            except Exception as se:
                logger.warning(f"Backboard send_message error: {se}")

        messages = getattr(response, "messages", []) if response else []
        last_msg = messages[-1] if messages and isinstance(messages[-1], dict) else {}
        msg_status = last_msg.get("status")
        msg_content = last_msg.get("content", "")

        # Check if Backboard has LLM credits or returned credit reservation notice
        use_gemini_completion = (
            not response
            or msg_status == "FAILED"
            or ("credit" in msg_content.lower() and "reserved" in msg_content.lower())
        )

        if use_gemini_completion:
            logger.info("Executing Gemini 3.8 Flash completion and syncing to Backboard thread.")
            res = await _send_message_via_gemini_fallback(
                valid_thread_id or thread_id,
                message,
                course_context
            )
            # Sync assistant response to Backboard thread so memory is maintained
            if valid_thread_id and res.get("content"):
                try:
                    await client.add_message(
                        thread_id=valid_thread_id,
                        content=res["content"][:2000],
                        send_to_llm="false"
                    )
                    # Also record a learning memory on Backboard for RAG & context tracking
                    if assistant_id:
                        summary_topic = course_context or "STEM study"
                        await client.add_memory(
                            assistant_id=assistant_id,
                            content=f"Student studied {summary_topic}: {message[:100]}"
                        )
                except Exception as sync_err:
                    logger.debug(f"Could not sync message to Backboard: {sync_err}")

            await client.aclose()
            # Ensure returning thread_id is the Backboard UUID if available
            res["thread_id"] = valid_thread_id or thread_id
            return res

        current_thread_id = str(last_msg.get("thread_id", getattr(response, "thread_id", valid_thread_id or thread_id)))

        # Tool execution loop for native Backboard runs
        rounds = 0
        while getattr(response, "status", "") == "REQUIRES_ACTION" and getattr(response, "tool_calls", None) and rounds < 4:
            rounds += 1
            tool_outputs = []

            for tc in response.tool_calls:
                tc_id = getattr(tc, "id", str(uuid.uuid4()))
                fn = getattr(tc, "function", None)
                fn_name = getattr(fn, "name", "")
                args = getattr(fn, "parsed_arguments", None)
                if not args and hasattr(fn, "arguments"):
                    try:
                        args = json.loads(fn.arguments)
                    except Exception:
                        args = {}

                if fn_name == "query_campus_database":
                    sql_query = args.get("query", "")
                    rationale = args.get("rationale", "Querying campus dataset")
                    sql_res = execute_campus_sql(sql_query)
                    
                    tool_executions.append({
                        "tool": "query_campus_database",
                        "query": sql_query,
                        "rationale": rationale,
                        "columns": sql_res.get("columns", []),
                        "rows": sql_res.get("rows", []),
                        "row_count": sql_res.get("row_count", 0),
                        "success": sql_res.get("success", False),
                        "error": sql_res.get("error")
                    })

                    tool_outputs.append({
                        "tool_call_id": tc_id,
                        "output": json.dumps(sql_res)
                    })

                elif fn_name == "build_interactive_widget":
                    widget_data = {
                        "id": f"w-{uuid.uuid4().hex[:8]}",
                        "title": args.get("title", "Interactive Visual"),
                        "concept": args.get("concept", "Concept Invariant"),
                        "html_code": args.get("html_code", ""),
                        "explanation": args.get("explanation", ""),
                        "thread_id": current_thread_id
                    }
                    widgets.append(widget_data)
                    tool_executions.append({
                        "tool": "build_interactive_widget",
                        "title": widget_data["title"],
                        "concept": widget_data["concept"],
                        "explanation": widget_data["explanation"]
                    })

                    tool_outputs.append({
                        "tool_call_id": tc_id,
                        "output": json.dumps({"status": "widget_rendered", "widget_id": widget_data["id"]})
                    })

            # Submit tool outputs back to Backboard
            if tool_outputs:
                response = await client.submit_tool_outputs_simple(
                    thread_id=current_thread_id,
                    tool_outputs=tool_outputs
                )

        final_content = getattr(response, "content", "")
        await client.aclose()

        return {
            "thread_id": current_thread_id,
            "role": "assistant",
            "content": final_content,
            "tool_executions": tool_executions,
            "widgets": widgets,
            "status": "success",
            "engine": "backboard"
        }

    except Exception as e:
        logger.error(f"Backboard error: {e}", exc_info=True)
        await client.aclose()
        return await _send_message_via_gemini_fallback(thread_id, message, course_context)


async def _generate_with_gemini_models(client, prompt: str) -> str:
    """
    Attempts generation with primary model gemini-3.8-flash,
    falling back to gemini-3.5-flash or gemini-3.5-flash-lite if rate limits or transient errors occur.
    """
    candidate_models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]
    last_err = None
    for model_name in candidate_models:
        for attempt in range(2):
            try:
                res = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name,
                    contents=prompt
                )
                if res and res.text:
                    return res.text
            except Exception as e:
                last_err = e
                err_str = str(e).lower()
                if "503" in err_str or "unavailable" in err_str or "demand" in err_str:
                    await asyncio.sleep(1)
                    continue
                # If rate-limited or model unavailable/not found, immediately try next candidate model
                if "429" in err_str or "quota" in err_str or "404" in err_str:
                    break
                break
    if last_err:
        raise last_err
    return ""


async def _send_message_via_gemini_fallback(
    thread_id: str,
    message: str,
    course_context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fallback implementation using Google Gemini directly.
    Maintains the exact same response schema and executes campus.db SQL queries and interactive widgets.
    """
    if not GEMINI_API_KEY:
        return {
            "thread_id": thread_id,
            "role": "assistant",
            "content": "Please configure your GEMINI_API_KEY or BACKBOARD_API_KEY in backend/.env to start chatting.",
            "tool_executions": [],
            "widgets": [],
            "status": "error"
        }

    try:
        from google import genai

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build prompt with instructions for SQL tool and widget generation
        prompt = f"""{LUMEN_SYSTEM_PROMPT}

Student Query:
{f'[Course: {course_context}] ' if course_context else ''}{message}

INSTRUCTIONS:
1. If the question requires campus dataset info (courses, prerequisites, alumni starting salary, employment, GPAs), include a JSON SQL query block:
```json_query
{{"query": "SELECT ...", "rationale": "..."}}
```

2. *** WIDGET RULE — MANDATORY FOR ALL CONCEPT/TOPIC QUESTIONS ***
   You MUST produce a ```json_widget``` block for any conceptual or technical question.
   The html_code must be a REAL VISUAL — build with SVG + CSS animations + JavaScript:

   REQUIRED (pick all that apply):
   - SVG SHAPES: Draw actual geometry. Memory layers = SVG <rect> bars. Nodes = SVG <circle>. Arrows = SVG <line>/<path> with <marker> arrowheads. Data flow = SVG <path> with animated stroke-dashoffset.
   - CSS @keyframes ANIMATIONS: At least one continuously running animation:
     * Glowing/pulsing nodes: box-shadow or filter:drop-shadow keyframe.
     * Flowing data: small SVG circle/dot animating along a path with CSS animation.
     * Bar chart: bars grow from 0 height on load with CSS transition.
     * Active element: translateX/translateY keyframe to show movement.
   - JS INTERACTIVITY that causes VISUAL MOVEMENT:
     * Step buttons: SVG elements change position/color WITH CSS transition (not just text swap).
     * Slider: continuously updates SVG geometry (e.g. node spacing, bar height, wave frequency).
     * Click to animate: trigger a CSS class that causes a shape to travel across the canvas.

   FORBIDDEN:
   ✗ Text-only boxes that swap text on click.
   ✗ ASCII art or monospace diagrams.
   ✗ Static layouts with zero animation.
   ✗ Walls of text inside the widget — keep labels to 1-5 words max.

   Visual spec: background #0a0b0f, accent colors blue #3b82f6 / green #10b981 / amber #f59e0b / violet #8b5cf6. Design for 600px × 400px.

```json_widget
{{"title": "...", "concept": "...", "explanation": "...", "html_code": "<!DOCTYPE html>..."}}
```
"""
        content = await _generate_with_gemini_models(client, prompt)
        tool_executions = []
        widgets = []

        import re
        # Check if the model suggested a widget
        widget_match = re.search(r'```json_widget\s*(\{.*?\})\s*```', content, re.DOTALL)
        if widget_match:
            try:
                w_data = json.loads(widget_match.group(1))
                widgets.append({
                    "id": f"w-{uuid.uuid4().hex[:8]}",
                    "title": w_data.get("title", "Interactive Visual"),
                    "concept": w_data.get("concept", course_context or "Concept"),
                    "html_code": w_data.get("html_code", "<p>Interactive widget</p>"),
                    "explanation": w_data.get("explanation", ""),
                    "thread_id": thread_id
                })
                content = content.replace(widget_match.group(0), "").strip()
            except Exception as we:
                logger.warning(f"Failed to parse widget json: {we}")

        # Check if the model suggested a query
        query_match = re.search(r'```json_query\s*(\{.*?\})\s*```', content, re.DOTALL)
        if query_match:
            try:
                q_data = json.loads(query_match.group(1))
                sql = q_data.get("query", "")
                if sql:
                    sql_res = execute_campus_sql(sql)
                    tool_executions.append({
                        "tool": "query_campus_database",
                        "query": sql,
                        "rationale": q_data.get("rationale", ""),
                        "columns": sql_res.get("columns", []),
                        "rows": sql_res.get("rows", []),
                        "row_count": sql_res.get("row_count", 0),
                        "success": sql_res.get("success", False),
                        "error": sql_res.get("error")
                    })
                # Clean marker from user content
                content = content.replace(query_match.group(0), "").strip()

                if tool_executions and (not content or len(content) < 30):
                    rows_preview = json.dumps(sql_res.get("rows", [])[:12], indent=2)
                    synthesis_prompt = f"""You are Lumen, academic copilot for UMBC. The student's career goal is Machine Learning Engineer.
NEVER start with "I'm Lumen" or any self-introduction — just answer directly.
The student asked: "{message}"
We ran this database query on campus.db: {sql}
Query results:
{rows_preview}

Provide a concise, well-formatted Markdown answer synthesizing these results clearly with bullet points.
At the end, add a short **🎯 ML Engineer Connection** section (2-3 sentences) tying the topic to their Machine Learning Engineer career goal."""
                    content = await _generate_with_gemini_models(client, synthesis_prompt)
            except Exception as pe:
                logger.warning(f"Failed to parse fallback json_query: {pe}")

        return {
            "thread_id": thread_id,
            "role": "assistant",
            "content": content,
            "tool_executions": tool_executions,
            "widgets": widgets,
            "status": "success",
            "engine": "backboard" if BACKBOARD_API_KEY else "gemini_direct"
        }

    except Exception as e:
        logger.error(f"Gemini fallback error: {e}", exc_info=True)
        return {
            "thread_id": thread_id,
            "role": "assistant",
            "content": f"I encountered an error processing your request: {e}",
            "tool_executions": [],
            "widgets": [],
            "status": "error"
        }
