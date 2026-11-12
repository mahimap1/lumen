from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List

from config import STATIC_DIR
from services.gemini_service import generate_interactive_widget_html
from services.chat_service import send_chat_message

app = FastAPI(
    title="Lumen API",
    description="Backend engine for Lumen AI Visual Tutor (hackUMBC 2026)",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder for videos and audio
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ConceptVisualRequest(BaseModel):
    concept: str
    course_context: Optional[str] = "General STEM"
    engine: Optional[str] = "html"  # "html" or "manim"


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Lumen AI Tutor Engine", "hackathon": "hackUMBC 2026"}


@app.post("/api/visualize/html")
def generate_html_widget(req: ConceptVisualRequest):
    """
    Generates standalone interactive minimalist HTML/SVG widget code.
    """
    widget_html = generate_interactive_widget_html(req.concept)
    return {
        "status": "success",
        "concept": req.concept,
        "engine": "html_svg",
        "html": widget_html
    }


from services.career_db import query_db, query_db_one, init_campus_db

# Ensure campus database is loaded
try:
    init_campus_db()
except Exception as e:
    print(f"[CareerDB] Auto-init error: {e}")


@app.get("/api/career/candidate-list")
def get_candidate_list():
    """
    Returns a curated set of alumni candidates across different tracks, GPAs, and job roles
    for interactive profile graphing.
    """
    try:
        candidates = query_db("""
            SELECT 
                a.campus_id, a.major, a.track, a.degree_level, a.final_gpa, 
                a.graduation_term, a.months_to_first_job,
                a.internship_count, a.credential_count,
                emp.job_title, emp.employer, emp.annual_salary_usd
            FROM alumni a
            JOIN employment_history emp ON a.campus_id = emp.campus_id AND emp.change_type = 'First Job'
            WHERE cast(a.internship_count as int) >= 1
            ORDER BY cast(emp.annual_salary_usd as int) DESC
            LIMIT 15
        """)
        return {"status": "success", "candidates": candidates}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/career/candidate-profile/{campus_id}")
def get_candidate_profile(campus_id: str):
    """
    Fetches the complete chronological profile (courses with prerequisite graph,
    internships, hackathons, certifications/microcredentials, and post-grad jobs)
    for a specific alumnus.
    """
    try:
        # 1. Alumnus details
        alumnus = query_db_one("SELECT * FROM alumni WHERE campus_id = ?", (campus_id,))
        if not alumnus:
            return {"status": "error", "message": f"Candidate {campus_id} not found"}

        # 2. Employment history (spells)
        employment = query_db("""
            SELECT * FROM employment_history 
            WHERE campus_id = ? 
            ORDER BY start_date ASC
        """, (campus_id,))

        # 3. Experiences & Micro-credentials (internships, research, certs, hackathons)
        experiences = query_db("""
            SELECT * FROM student_experience 
            WHERE campus_id = ? 
            ORDER BY term ASC
        """, (campus_id,))

        # 4. Transcripts with course catalog metadata and prerequisites
        transcripts = query_db("""
            SELECT 
                t.term, t.course_id, t.course_title, t.grade, t.requirement_category,
                c.prerequisite_ids, c.skill_tags, c.course_level, c.course_type, c.difficulty_index
            FROM transcripts t
            LEFT JOIN course_catalog c ON t.course_id = c.course_id
            WHERE t.campus_id = ?
            ORDER BY t.term ASC, t.course_id ASC
        """, (campus_id,))

        # Chronological term ordering helper
        def term_sort_key(term_str):
            parts = term_str.split()
            if len(parts) == 2:
                season, year = parts[0], parts[1]
                season_order = {"Winter": 0, "Spring": 1, "Summer": 2, "Fall": 3}
                try:
                    return int(year) * 10 + season_order.get(season, 0)
                except ValueError:
                    return 0
            return 0

        # Group items by semester term
        terms_dict = {}
        for row in transcripts:
            t = row["term"]
            if t not in terms_dict:
                terms_dict[t] = {"term": t, "courses": [], "experiences": []}
            terms_dict[t]["courses"].append(row)

        for row in experiences:
            t = row["term"]
            if t not in terms_dict:
                terms_dict[t] = {"term": t, "courses": [], "experiences": []}
            terms_dict[t]["experiences"].append(row)

        sorted_timeline = sorted(terms_dict.values(), key=lambda x: term_sort_key(x["term"]))

        # Build prerequisite edges
        candidate_courses = {row["course_id"]: row for row in transcripts}
        prereq_edges = []
        for c_id, c_data in candidate_courses.items():
            prereqs = c_data.get("prerequisite_ids")
            if prereqs and prereqs != "Not Applicable":
                for p in prereqs.split("|"):
                    p_clean = p.strip()
                    if p_clean in candidate_courses:
                        prereq_edges.append({
                            "from": p_clean,
                            "to": c_id,
                            "from_term": candidate_courses[p_clean]["term"],
                            "to_term": c_data["term"]
                        })

        return {
            "status": "success",
            "alumnus": alumnus,
            "employment": employment,
            "timeline": sorted_timeline,
            "prereq_edges": prereq_edges
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}




class ChatTurn(BaseModel):
    role: str
    content: str


class SessionMessageRequest(BaseModel):
    message: str
    history: Optional[List[ChatTurn]] = None
    course_context: Optional[str] = None
    model: Optional[str] = None


@app.post("/api/sessions/message")
async def send_message_to_session(req: SessionMessageRequest):
    """
    Stateless chat turn: the client sends prior history; Gemini answers, executing campus
    SQL and/or generating an interactive widget when required. An optional per-request
    ``model`` overrides the environment default.
    """
    history = [turn.model_dump() for turn in req.history] if req.history else None
    return await send_chat_message(
        message=req.message,
        history=history,
        course_context=req.course_context,
        model=req.model
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
