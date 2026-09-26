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
from services.chat_service import process_chat_message

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


class ChatRequest(BaseModel):
    message: str
    courses: Optional[list] = []
    history: Optional[list] = []


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


@app.post("/api/chat")
def chat_with_lumen(req: ChatRequest):
    """
    Interactive AI assistant endpoint using Gemini 3.5 Flash Lite to answer queries
    and execute student actions (deadlines, todos, study sessions, visualizers).
    """
    result = process_chat_message(req.message, req.courses, req.history)
    return {
        "status": "success",
        "reply": result.get("reply", ""),
        "action": result.get("action")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
