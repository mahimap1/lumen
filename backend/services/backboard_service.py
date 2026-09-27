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
        # Fallback local session ID if Backboard key is not yet configured
        return {
            "thread_id": f"local-{uuid.uuid4()}",
            "title": title,
            "mode": "gemini_direct"
        }

    try:
        from backboard import BackboardClient
        client = BackboardClient(api_key=BACKBOARD_API_KEY)
        assistant_id = await get_or_create_assistant(client)
        if not assistant_id:
            await client.aclose()
            return {
                "thread_id": f"local-{uuid.uuid4()}",
                "title": title,
                "mode": "gemini_direct"
            }

        thread = await client.create_thread(assistant_id=assistant_id)
        await client.aclose()
        return {
            "thread_id": str(thread.thread_id),
            "title": title,
            "assistant_id": assistant_id,
            "mode": "backboard"
        }
    except Exception as e:
        logger.error(f"Error creating Backboard thread: {e}")
        return {
            "thread_id": f"local-{uuid.uuid4()}",
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
    Sends a message to the Backboard thread (or Gemini fallback) and handles
    tool calling for querying campus.db and building interactive widgets.
    """
    if not BACKBOARD_API_KEY:
        return await _send_message_via_gemini_fallback(thread_id, message, course_context)

    from backboard import BackboardClient
    client = BackboardClient(api_key=BACKBOARD_API_KEY)

    tool_executions: List[Dict[str, Any]] = []
    widgets: List[Dict[str, Any]] = []

    try:
        assistant_id = await get_or_create_assistant(client)

        content = message
        if course_context:
            content = f"[Context: Student is studying {course_context}]\n\n{message}"

        # Step 1: Send message to Backboard using Google Gemini
        response = await client.send_message(
            content=content,
            thread_id=thread_id if not thread_id.startswith("local-") else None,
            assistant_id=assistant_id if assistant_id else None,
            system_prompt=LUMEN_SYSTEM_PROMPT,
            llm_provider="google",
            model_name="gemini-3.8-flash",
            tools=ALL_TOOLS
        )

        messages = getattr(response, "messages", [])
        last_msg = messages[-1] if messages and isinstance(messages[-1], dict) else {}
        msg_status = last_msg.get("status")
        msg_content = last_msg.get("content", "")

        if msg_status == "FAILED" or ("credit" in msg_content.lower() and "reserved" in msg_content.lower()):
            logger.info("Backboard LLM credit reserved notice, seamlessly utilizing Gemini direct.")
            await client.aclose()
            return await _send_message_via_gemini_fallback(thread_id, message, course_context)

        current_thread_id = str(last_msg.get("thread_id", getattr(response, "thread_id", thread_id)))

        # Tool execution loop
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
        # Seamlessly fallback to direct Gemini if Backboard fails
        return await _send_message_via_gemini_fallback(thread_id, message, course_context)


async def _send_message_via_gemini_fallback(
    thread_id: str,
    message: str,
    course_context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fallback implementation using Google Gemini directly if BACKBOARD_API_KEY is not configured.
    Maintains the exact same response schema and executes campus.db SQL queries.
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
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build schema context prompt
        prompt = f"""{LUMEN_SYSTEM_PROMPT}

Student Query:
{f'[Course: {course_context}] ' if course_context else ''}{message}

If the question requires campus dataset info (courses, prerequisites, alumni starting salary, employment, GPAs), provide your response and include a JSON SQL query block:
```json_query
{{"query": "SELECT ...", "rationale": "..."}}
```
"""
        response = await asyncio.to_thread(
            client.models.generate_content,
            model='gemini-3.5-flash-lite',
            contents=prompt,
        )

        content = response.text or ""
        tool_executions = []

        # Check if the model suggested a query
        import re
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
                        "success": sql_res.get("success", False)
                    })
                # Clean marker from user content
                content = content.replace(query_match.group(0), "").strip()

                if tool_executions and not content:
                    rows_preview = json.dumps(sql_res.get("rows", [])[:10], indent=2)
                    synthesis_prompt = f"""You are Lumen, academic copilot for UMBC.
The student asked: "{message}"
We ran this database query on campus.db: {sql}
Query results:
{rows_preview}

Provide a concise, well-formatted Markdown answer synthesizing these results."""
                    synth_res = await asyncio.to_thread(
                        client.models.generate_content,
                        model='gemini-3.5-flash-lite',
                        contents=synthesis_prompt,
                    )
                    content = synth_res.text or ""
            except Exception as pe:
                logger.warning(f"Failed to parse fallback json_query: {pe}")

        return {
            "thread_id": thread_id,
            "role": "assistant",
            "content": content,
            "tool_executions": tool_executions,
            "widgets": [],
            "status": "success",
            "engine": "gemini_direct"
        }

    except Exception as e:
        logger.error(f"Gemini fallback error: {e}")
        return {
            "thread_id": thread_id,
            "role": "assistant",
            "content": f"I encountered an error processing your request: {e}",
            "tool_executions": [],
            "widgets": [],
            "status": "error"
        }
