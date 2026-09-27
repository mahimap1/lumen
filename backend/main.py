import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

from config import STATIC_DIR
from services.gemini_service import parse_syllabus_text, generate_interactive_widget_html, consult_lumen_inline
from services.manim_service import render_or_get_manim_clip
from services.voice_service import generate_voice_narration
from services.career_service import get_course_career_roi
from services.memory_service import get_student_session_context, record_student_interaction
from services.backboard_service import create_backboard_session, send_chat_message
from services.sqlite_service import execute_campus_sql, get_database_schema_summary

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


class NoteConsultRequest(BaseModel):
    selected_text: str
    course_context: Optional[str] = "CMSC 341 Data Structures"


class VoiceNarrateRequest(BaseModel):
    text: str


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Lumen AI Tutor Engine", "hackathon": "hackUMBC 2026"}


@app.post("/api/syllabus/parse")
async def parse_syllabus(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Parses a syllabus PDF or raw text into structured deadlines, todos, and weekly notes.
    """
    text_content = ""
    if file:
        try:
            import pypdf
            reader = pypdf.PdfReader(file.file)
            for page in reader.pages:
                text_content += page.extract_text() or ""
        except Exception as e:
            print(f"PDF extract error, using filename/fallback: {e}")
            text_content = file.filename or "Syllabus File"

    if not text_content and raw_text:
        text_content = raw_text

    if not text_content:
        text_content = "CMSC 341 Data Structures Syllabus Fall 2026"

    parsed_course = parse_syllabus_text(text_content)
    return {
        "status": "success",
        "data": parsed_course
    }


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


@app.post("/api/visualize/manim")
def generate_manim_clip(req: ConceptVisualRequest):
    """
    Generates or fetches a 3b1b Manim mathematical animation clip.
    """
    manim_data = render_or_get_manim_clip(req.concept)
    return {
        "status": "success",
        "concept": req.concept,
        "engine": "manim",
        "data": manim_data
    }


@app.post("/api/voice/narrate")
def narrate_concept(req: VoiceNarrateRequest):
    """
    Synthesizes natural ElevenLabs voice audio narration for a concept.
    """
    narration_result = generate_voice_narration(req.text)
    return narration_result


@app.post("/api/notes/consult")
def consult_lumen(req: NoteConsultRequest):
    """
    Inline Lumen consultation for selected note text (definition, intuition, example).
    """
    consult_result = consult_lumen_inline(req.selected_text, req.course_context)
    return {
        "status": "success",
        "data": consult_result
    }


from services.career_db import query_db, query_db_one, init_campus_db

# Ensure campus database is loaded
try:
    init_campus_db()
except Exception as e:
    print(f"[CareerDB] Auto-init error: {e}")


@app.get("/api/career/dashboard")
def get_career_dashboard():
    """
    Returns aggregated metrics from the 6 synthetic campus & alumni tables.
    """
    try:
        summary = {
            "total_alumni": query_db_one("SELECT count(*) as count FROM alumni")["count"],
            "total_students": query_db_one("SELECT count(*) as count FROM students_current")["count"],
            "total_records": query_db_one("SELECT count(*) as count FROM employment_history")["count"],
            "avg_first_salary": query_db_one("SELECT round(avg(cast(annual_salary_usd as int)), 0) as avg FROM employment_history WHERE change_type = 'First Job'")["avg"],
            "avg_clearance_salary": query_db_one("SELECT round(avg(cast(annual_salary_usd as int)), 0) as avg FROM employment_history WHERE requires_clearance = 'TRUE'")["avg"],
        }

        # Major breakdown
        majors = query_db("""
            SELECT 
                a.major, 
                count(distinct a.campus_id) as alumni_count,
                round(avg(cast(e.annual_salary_usd as int)), 0) as avg_first_salary,
                round(avg(cast(a.net_cost_usd as int)), 0) as avg_net_cost,
                round(avg(cast(a.months_to_first_job as float)), 1) as avg_months_to_job
            FROM alumni a
            LEFT JOIN employment_history e ON a.campus_id = e.campus_id AND e.change_type = 'First Job'
            GROUP BY a.major
        """)

        # Internship impact on starting salary & job search speed
        internship_impact = query_db("""
            SELECT 
                CASE 
                    WHEN cast(a.internship_count as int) >= 2 THEN '2+ Internships' 
                    WHEN cast(a.internship_count as int) = 1 THEN '1 Internship' 
                    ELSE '0 Internships' 
                END as intern_tier,
                count(distinct a.campus_id) as alumni_count,
                round(avg(cast(e.annual_salary_usd as int)), 0) as avg_starting_salary,
                round(avg(cast(a.months_to_first_job as float)), 1) as avg_months_to_job
            FROM alumni a 
            JOIN employment_history e ON a.campus_id = e.campus_id 
            WHERE e.change_type = 'First Job'
            GROUP BY intern_tier
            ORDER BY avg_starting_salary ASC
        """)

        # Top 6 employers hiring UMBC graduates
        top_employers = query_db("""
            SELECT 
                employer, 
                employer_industry,
                count(*) as hires,
                round(avg(cast(annual_salary_usd as int)), 0) as avg_salary
            FROM employment_history
            WHERE change_type = 'First Job'
            GROUP BY employer
            ORDER BY hires DESC
            LIMIT 6
        """)

        # Top job titles and their median salaries
        top_roles = query_db("""
            SELECT 
                job_title, 
                count(*) as count,
                round(avg(cast(annual_salary_usd as int)), 0) as avg_salary
            FROM employment_history
            WHERE change_type = 'First Job'
            GROUP BY job_title
            ORDER BY count DESC
            LIMIT 6
        """)

        return {
            "status": "success",
            "summary": summary,
            "majors": majors,
            "internship_impact": internship_impact,
            "top_employers": top_employers,
            "top_roles": top_roles
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/career/pathways")
def get_career_pathways():
    """
    Returns career progression stages (Entry -> Mid -> Senior -> Lead/Manager)
    and Track-to-Role salary benchmarks.
    """
    try:
        seniority_ladder = query_db("""
            SELECT 
                seniority_level, 
                count(*) as total_spells, 
                round(avg(cast(annual_salary_usd as int)), 0) as avg_salary,
                round(avg(cast(tenure_months as int)), 0) as avg_tenure_months
            FROM employment_history 
            GROUP BY seniority_level 
            ORDER BY avg_salary ASC
        """)

        track_stats = query_db("""
            SELECT 
                a.major, 
                a.track, 
                count(distinct a.campus_id) as alumni_count, 
                round(avg(cast(e.annual_salary_usd as int)), 0) as avg_starting_salary,
                round(avg(cast(a.final_gpa as float)), 2) as avg_gpa
            FROM alumni a 
            JOIN employment_history e ON a.campus_id = e.campus_id 
            WHERE e.change_type = 'First Job' 
            GROUP BY a.major, a.track
            ORDER BY avg_starting_salary DESC
        """)

        clearance_advantage = query_db("""
            SELECT 
                requires_clearance, 
                count(*) as count, 
                round(avg(cast(annual_salary_usd as int)), 0) as avg_salary 
            FROM employment_history 
            WHERE change_type = 'First Job' 
            GROUP BY requires_clearance
        """)

        return {
            "status": "success",
            "seniority_ladder": seniority_ladder,
            "track_stats": track_stats,
            "clearance_advantage": clearance_advantage
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/career/course-catalog-skills")
def get_course_catalog_skills():
    """
    Returns courses with their associated skill tags, credits, and difficulty index.
    """
    try:
        courses = query_db("""
            SELECT course_id, subject, catalog_number, course_title, credits, course_level, course_type, skill_tags, difficulty_index
            FROM course_catalog
            ORDER BY subject, catalog_number
        """)
        return {"status": "success", "courses": courses}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/career/alumni-twins")
def get_alumni_twins(major: str = "Computer Science", track: str = "General", min_internships: int = 1):
    """
    Finds real alumni digital twins with similar starting backgrounds and shows their full journey.
    """
    try:
        alumni_records = query_db("""
            SELECT 
                a.campus_id, a.major, a.track, a.degree_level, a.final_gpa, a.internship_count, 
                a.net_cost_usd, a.months_to_first_job,
                e.job_title, e.employer, e.annual_salary_usd, e.seniority_level, e.is_remote, e.requires_clearance
            FROM alumni a
            JOIN employment_history e ON a.campus_id = e.campus_id
            WHERE a.major = ? AND a.track = ? AND cast(a.internship_count as int) >= ? AND e.change_type = 'First Job'
            ORDER BY cast(e.annual_salary_usd as int) DESC
            LIMIT 6
        """, (major, track, min_internships))

        return {"status": "success", "twins": alumni_records}
    except Exception as e:
        return {"status": "error", "message": str(e)}


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




@app.get("/api/career/roi/{course_id}")
def get_career_roi(course_id: str):
    """
    DoIT Track: Career Pathways & Degree ROI data.
    """
    roi_data = get_course_career_roi(course_id)
    return {
        "status": "success",
        "course_id": course_id,
        "data": roi_data
    }



@app.get("/api/memory/context")
def get_memory_context(student_id: str = "alex_umbc"):
    """
    Backboard Track: Persistent student learning context across sessions.
    """
    context = get_student_session_context(student_id)
    return {
        "status": "success",
        "student_id": student_id,
        "context": context
    }


class SessionCreateRequest(BaseModel):
    title: Optional[str] = "New Study Session"
    course_context: Optional[str] = None


class SessionMessageRequest(BaseModel):
    thread_id: str
    message: str
    course_context: Optional[str] = None


class DatabaseQueryRequest(BaseModel):
    query: str


@app.post("/api/sessions/create")
async def create_session(req: SessionCreateRequest):
    """
    Creates a new conversational thread in Backboard (or Gemini local thread).
    """
    session_data = await create_backboard_session(title=req.title or "New Study Session")
    return {
        "status": "success",
        "session": session_data
    }


@app.post("/api/sessions/message")
async def send_message_to_session(req: SessionMessageRequest):
    """
    Sends a message to a session thread via Backboard.
    Executes tool calling (querying campus.db and generating interactive widgets)
    using Gemini under the hood.
    """
    result = await send_chat_message(
        thread_id=req.thread_id,
        message=req.message,
        course_context=req.course_context
    )
    return result


@app.get("/api/database/schema")
def get_database_schema():
    """
    Returns schema summary of campus.db tables and columns.
    """
    schema = get_database_schema_summary()
    return {
        "status": "success",
        "schema": schema
    }


@app.post("/api/database/query")
def run_campus_query(req: DatabaseQueryRequest):
    """
    Safely executes a read-only SELECT query against the campus dataset.
    """
    res = execute_campus_sql(req.query)
    return res


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
