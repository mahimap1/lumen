import sqlite3
import os
import re
from typing import Dict, Any, List
from config import BASE_DIR

DATABASE_PATH = os.path.join(BASE_DIR, "data", "campus.db")

def get_database_schema_summary() -> str:
    """
    Returns a human-readable and LLM-friendly schema summary of campus.db tables and columns.
    """
    if not os.path.exists(DATABASE_PATH):
        return "Database file campus.db not found."

    schema_lines = []
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = cursor.fetchall()

        for (table_name,) in tables:
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            col_desc = ", ".join([f"{c[1]} ({c[2]})" for c in columns])
            schema_lines.append(f"Table '{table_name}': {col_desc}")

        conn.close()
        return "\n".join(schema_lines)
    except Exception as e:
        return f"Error retrieving schema: {e}"


def execute_campus_sql(query: str, max_rows: int = 50) -> Dict[str, Any]:
    """
    Safely executes a read-only SQL SELECT query against campus.db.
    Guards against mutating statements (INSERT, UPDATE, DELETE, DROP, etc.).
    """
    if not os.path.exists(DATABASE_PATH):
        return {"error": "Database file not found at " + DATABASE_PATH, "rows": []}

    cleaned = query.strip().rstrip(";")

    # Guard: only allow SELECT or WITH CTE queries
    first_word = cleaned.split()[0].upper() if cleaned else ""
    if first_word not in ("SELECT", "WITH", "EXPLAIN", "PRAGMA"):
        return {
            "error": "Security restriction: Only read-only SELECT queries are permitted on the campus dataset.",
            "query": query,
            "rows": []
        }

    # Guard: block destructive keywords
    destructive_keywords = [r"\bDROP\b", r"\bDELETE\b", r"\bINSERT\b", r"\bUPDATE\b", r"\bALTER\b", r"\bTRUNCATE\b", r"\bEXEC\b"]
    for pattern in destructive_keywords:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return {
                "error": "Forbidden keyword detected. Only read-only queries are supported.",
                "query": query,
                "rows": []
            }

    # Auto-append LIMIT if not provided
    if "LIMIT" not in cleaned.upper():
        cleaned += f" LIMIT {max_rows}"

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(cleaned)
        results = cursor.fetchall()

        columns = [col[0] for col in cursor.description] if cursor.description else []
        rows = [dict(row) for row in results[:max_rows]]
        conn.close()

        return {
            "success": True,
            "query": cleaned,
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "query": cleaned,
            "rows": []
        }
