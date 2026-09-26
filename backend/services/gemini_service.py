import json
import re
from config import GEMINI_API_KEY

def parse_syllabus_text(raw_text: str) -> dict:
    """
    Uses Gemini 2.0 Flash to extract structured course data from syllabus text.
    Includes smart local fallback for resilient hackathon demoing.
    """
    if not GEMINI_API_KEY:
        return _fallback_syllabus_data(raw_text)

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
You are an expert academic curriculum parser. Given the syllabus text below, extract:
1. Course Code & Course Name
2. Instructor Name
3. List of major upcoming assignments and project deadlines with due dates.
4. List of weekly lecture topics as structured notes (Date, Title, Topic summary).
5. Initial todo action items.

Return strictly valid JSON matching this schema:
{{
  "code": "CMSC 341",
  "name": "Data Structures",
  "desc": "Summary of course description",
  "instructor": "Professor Name",
  "deadlines": [
    {{"title": "Project 1", "date": "Oct 05", "due": "In 5 days", "urgent": false}}
  ],
  "todos": [
    {{"text": "Read Chapter 1", "meta": "Due next week"}}
  ],
  "notes": [
    {{"id": "week-1", "date": "Sep 25", "title": "Lecture 1: Foundations", "topic": "Complexity & Analysis", "visual": "1 Visual"}}
  ]
}}

Syllabus Text:
{raw_text[:8000]}
"""
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return _fallback_syllabus_data(raw_text)
    except Exception as e:
        print(f"Gemini API error, using resilient demo parser: {e}")
        return _fallback_syllabus_data(raw_text)


def generate_interactive_widget_html(concept: str) -> str:
    """
    Generates standalone minimalist interactive HTML/SVG widget code for a concept.
    """
    if not GEMINI_API_KEY:
        return _fallback_widget_html(concept)

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
You are a master minimalist visualization engineer (like 3Blue1Brown).
Generate a self-contained, interactive HTML/CSS/JS snippet that visualizes this concept: "{concept}".
Requirements:
1. Use clean minimalist dark design (#191919 background, white/cyan/orange geometric lines, crisp typography).
2. Make it truly interactive (clickable nodes, sliders, or step buttons).
3. Do not include external dependencies or Markdown fences. Return ONLY the raw HTML string with embedded <style> and <script>.
"""
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        text = response.text
        text = re.sub(r'^```html\s*', '', text)
        text = re.sub(r'```$', '', text)
        return text.strip()
    except Exception as e:
        print(f"Gemini visualizer error: {e}")
        return _fallback_widget_html(concept)


def consult_lumen_inline(selected_text: str, course_context: str) -> dict:
    """
    Consults Lumen for definitions, counter-examples, and intuitive explanations of highlighted text.
    """
    if not GEMINI_API_KEY:
        return {
            "term": selected_text,
            "definition": f"A fundamental property in {course_context} ensuring invariant preservation across operations.",
            "intuition": "Think of this as maintaining equilibrium: whenever an operation shifts the balance threshold beyond 1, an atomic O(1) adjustment restores the global guarantee.",
            "quick_example": "For example, in a tree with left height 2 and right height 0, the balance factor is +2, requiring a right rotation.",
            "visual_recommendation": "Interactive AVL Balance Simulator"
        }

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
A student highlighted the following term/sentence in their {course_context} notes:
"{selected_text}"

Provide a crisp, intuitive breakdown in valid JSON:
{{
  "term": "{selected_text}",
  "definition": "1-sentence rigorous academic definition",
  "intuition": "1-2 sentence high-intuition physical or visual analogy",
  "quick_example": "A concrete minimal example",
  "visual_recommendation": "Suggested interactive visual"
}}
"""
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"Consultation error: {e}")
    
    return {
        "term": selected_text,
        "definition": f"Core invariant in {course_context}.",
        "intuition": "Ensures deterministic computational efficiency under edge case inputs.",
        "quick_example": "Applied directly during dynamic rebalancing.",
        "visual_recommendation": "Step-by-step Transformation Simulator"
    }


def _fallback_syllabus_data(raw_text: str) -> dict:
    return {
        "code": "CMSC 341",
        "name": "Data Structures & Algorithms",
        "desc": "Tree balancing, asymptotic complexity, graph traversal, and memory hierarchies.",
        "instructor": "Prof. Dixon (UMBC Computer Science)",
        "deadlines": [
            {"title": "Project 2: Self-Balancing AVL Trees", "date": "Sep 27, 11:45 AM", "due": "In 18 hrs", "urgent": True},
            {"title": "Homework 4: Graph BFS/DFS Complexity", "date": "Oct 04, 11:59 PM", "due": "In 7 days", "urgent": False},
            {"title": "Midterm Examination", "date": "Oct 18, 1:00 PM", "due": "In 3 weeks", "urgent": False}
        ],
        "todos": [
            {"text": "Implement Left-Right Double Rotation in C++", "meta": "Due Sep 27 • High Priority"},
            {"text": "Memory leak check with Valgrind on Red-Black deletion", "meta": "Verification step"}
        ],
        "notes": [
            {"id": "avl-rotation", "date": "Sep 24, 2026", "title": "AVL Tree Balancing & Rotations", "topic": "Self-Balancing Invariants // O(log N)", "visual": "1 Visual"},
            {"id": "graph-traversal", "date": "Sep 21, 2026", "title": "Graph Traversal: BFS vs DFS", "topic: ": "Queue vs Recursion Stack Invariants", "visual": "2 Visuals"},
            {"id": "hash-collision", "date": "Sep 15, 2026", "title": "Hash Tables & Quadratic Probing", "topic": "Load Factor α < 0.5 & Clustering", "visual": "1 Visual"}
        ]
    }


def _fallback_widget_html(concept: str) -> str:
    return f"""
<div style="font-family: -apple-system, sans-serif; background: #151515; color: #E6E6E5; padding: 20px; border-radius: 6px; border: 1px solid #333; text-align: center;">
  <div style="font-size: 14px; font-weight: 600; color: #529CCA; margin-bottom: 12px;">Interactive Visualizer: {concept}</div>
  <div style="display: flex; justify-content: center; gap: 20px; align-items: center; margin: 24px 0;">
    <div style="width: 44px; height: 44px; border-radius: 50%; background: #222; border: 2px solid #529CCA; display: flex; align-items: center; justify-content: center; font-weight: 700;">A</div>
    <div style="color: #888;">➔ O(1) ➔</div>
    <div style="width: 44px; height: 44px; border-radius: 50%; background: #222; border: 2px solid #4DAB9A; display: flex; align-items: center; justify-content: center; font-weight: 700;">B</div>
  </div>
  <div style="font-size: 12px; color: #888;">State transition preserving invariant properties. Click to test edge cases.</div>
</div>
"""
