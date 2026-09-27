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

You have access to two powerful tools:
1. `query_campus_database`: Runs SQL SELECT queries against the UMBC campus dataset.
   The database contains:
{get_database_schema_summary()}

   RULES FOR DATABASE QUERIES:
   - ALWAYS query the database when asked about courses, prerequisites, alumni career outcomes, starting salaries, employment rates, student GPAs, or academic standings.
   - Do not make up statistics or salary numbers; verify with the database.
   - Write clean, safe SQLite SELECT queries.

2. `build_interactive_widget`: Constructs self-contained interactive HTML/CSS/JS widgets.
   - Call this tool whenever visualizing an algorithm (e.g. AVL rotation, Dijkstra), computer architecture (e.g. SRAM vs DRAM, Cache hierarchies), or career ROI breakdown.
   - Return clean, modern, dark-themed (#18181b or #111) HTML with embedded <style> and <script>.
   - Make it truly interactive (clickable nodes, toggles, step buttons, or sliders).

Style:
- Be clear, supportive, and precise.
- Format responses in clean Markdown.
- When you execute a query or build a widget, summarize your findings concisely.
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
        "description": "Generate an interactive, self-contained HTML/JS/SVG minimalist widget to help the student visualize an academic concept, algorithm, or career ROI distribution.",
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
                    "description": "Self-contained interactive HTML with embedded <style> and <script>. Dark theme background (#18181b)."
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
    falling back to gemini-3.5-flash or gemini-2.5-flash if 503 or transient errors occur.
    """
    candidate_models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash"]
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

2. If the user asks for a visual, diagram, interactive tool, or animation of a concept (e.g. data structure, memory architecture, pipeline), include a JSON widget block:
```json_widget
{{"title": "...", "concept": "...", "explanation": "...", "html_code": "..."}}
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
                    synthesis_prompt = f"""You are Lumen, academic copilot for UMBC.
The student asked: "{message}"
We ran this database query on campus.db: {sql}
Query results:
{rows_preview}

Provide a concise, well-formatted Markdown answer synthesizing these results clearly with bullet points."""
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
