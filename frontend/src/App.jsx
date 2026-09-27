import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import HomeDashboard from "./components/HomeDashboard";
import CourseView from "./components/CourseView";
import NoteCanvas from "./components/NoteCanvas";
import StudyRoom from "./components/StudyRoom";
import VisualArchive from "./components/VisualArchive";
import AddCourseModal from "./components/AddCourseModal";
import VisualizerModal from "./components/VisualizerModal";
import LightbulbFab from "./components/LightbulbFab";
import ChatSidebar from "./components/ChatSidebar";
import { INITIAL_COURSES } from "./data/initialData";

export default function App() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [activeView, setActiveView] = useState("home"); // "home" | "course" | "note" | "study" | "archive"
  const [selectedCourseId, setSelectedCourseId] = useState("cmsc341");
  const [selectedNoteId, setSelectedNoteId] = useState("avl-rotation");

  // Modals & Panels state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [visualizerModal, setVisualizerModal] = useState({
    isOpen: false,
    concept: "AVL Tree Left-Right Double Rotation",
    courseCode: "CMSC 341"
  });

  // Navigation handlers
  const handleNavigate = (view, courseId = null) => {
    setActiveView(view);
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  };

  const handleSelectCourseSubview = (courseId, subview) => {
    setSelectedCourseId(courseId);
    if (subview === "dashboard" || subview === "notes-list") {
      setActiveView("course");
    } else if (subview === "study") {
      setActiveView("study");
    }
  };

  // Todo handlers
  const handleToggleTodo = (courseId, todoId) => {
    setCourses((prev) => {
      const course = prev[courseId];
      if (!course) return prev;
      const updatedTodos = (course.todos || []).map((t) =>
        t.id === todoId ? { ...t, done: !t.done } : t
      );
      return {
        ...prev,
        [courseId]: { ...course, todos: updatedTodos }
      };
    });
  };

  const handleAddTodo = (courseId, newTodo) => {
    setCourses((prev) => {
      const course = prev[courseId];
      if (!course) return prev;
      return {
        ...prev,
        [courseId]: {
          ...course,
          todos: [...(course.todos || []), newTodo]
        }
      };
    });
  };

  // Note handlers
  const handleSelectNote = (courseId, noteId) => {
    setSelectedCourseId(courseId);
    setSelectedNoteId(noteId);
    setActiveView("note");
  };

  const handleSaveNote = (courseId, updatedNote) => {
    setCourses((prev) => {
      const course = prev[courseId];
      if (!course) return prev;
      const updatedNotes = (course.notes || []).map((n) =>
        n.id === updatedNote.id ? updatedNote : n
      );
      return {
        ...prev,
        [courseId]: { ...course, notes: updatedNotes }
      };
    });
  };

  const handleAddNote = (courseId, initialTitle, initialTopic) => {
    const course = courses[courseId] || courses[selectedCourseId];
    if (!course) return;

    const newNoteId = "note_" + Date.now();
    const newNote = {
      id: newNoteId,
      date: "Today",
      title: initialTitle || "New Concept Synthesis",
      topic: initialTopic || "Core Invariant",
      visual: "1 Visual",
      content: `# ${initialTitle || "New Concept Synthesis"}\nCourse: ${course.code}\nDate: ${new Date().toLocaleDateString()}\n\nStart capturing definitions, formulas, and questions for Lumen...`
    };

    setCourses((prev) => ({
      ...prev,
      [course.id]: {
        ...course,
        notes: [newNote, ...(course.notes || [])]
      }
    }));

    setSelectedCourseId(course.id);
    setSelectedNoteId(newNoteId);
    setActiveView("note");
  };

  // Add course from syllabus handler
  const handleAddCourse = (newCourse) => {
    setCourses((prev) => ({
      ...prev,
      [newCourse.id]: newCourse
    }));
    setSelectedCourseId(newCourse.id);
    setActiveView("course");
  };

  // Visualizer modal handler
  const handleOpenVisualizer = (concept, courseCode = "STEM") => {
    setVisualizerModal({
      isOpen: true,
      concept: concept || "Concept Invariant",
      courseCode: courseCode || "STEM"
    });
  };

  // AI Assistant Action Dispatcher
  const handleExecuteAction = (action) => {
    if (!action) return;

    if (action.type === "ADD_DEADLINE") {
      const courseId = action.course_id && courses[action.course_id] ? action.course_id : selectedCourseId;
      const newDeadline = {
        id: "d_" + Date.now(),
        title: action.title || "New Assignment",
        date: action.date || "Upcoming",
        due: action.due || "In 7 days",
        sub: action.sub || "Online Submission",
        color: "var(--tag-orange-text)"
      };

      setCourses((prev) => {
        const c = prev[courseId];
        if (!c) return prev;
        return {
          ...prev,
          [courseId]: {
            ...c,
            deadlines: [newDeadline, ...(c.deadlines || [])]
          }
        };
      });

      setSelectedCourseId(courseId);
      setActiveView("course");
    } else if (action.type === "ADD_TODO") {
      const courseId = action.course_id && courses[action.course_id] ? action.course_id : selectedCourseId;
      handleAddTodo(courseId, {
        id: "t_" + Date.now(),
        text: action.text || "New action item",
        meta: action.meta || "Added by Lumen Assistant",
        done: false
      });
      setSelectedCourseId(courseId);
      setActiveView("course");
    } else if (action.type === "START_STUDY") {
      if (action.course_id && courses[action.course_id]) {
        setSelectedCourseId(action.course_id);
      }
      setActiveView("study");
    } else if (action.type === "VISUALIZE") {
      const courseCode = action.course_id && courses[action.course_id] ? courses[action.course_id].code : "STEM";
      handleOpenVisualizer(action.concept, courseCode);
    } else if (action.type === "CREATE_NOTE") {
      const courseId = action.course_id && courses[action.course_id] ? action.course_id : selectedCourseId;
      handleAddNote(courseId, action.title, action.topic);
    } else if (action.type === "NAVIGATE") {
      if (action.course_id && courses[action.course_id]) {
        setSelectedCourseId(action.course_id);
      }
      setActiveView(action.view || "home");
    }
  };

  // Current selections
  const currentCourse = courses[selectedCourseId] || Object.values(courses)[0];
  const currentNote = (currentCourse?.notes || []).find((n) => n.id === selectedNoteId) || currentCourse?.notes?.[0];

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar
        courses={courses}
        activeView={activeView}
        selectedCourseId={selectedCourseId}
        onNavigate={handleNavigate}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onSelectCourseSubview={handleSelectCourseSubview}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Content Area */}
      <main className="notion-main">
        {/* Sticky Topbar */}
        <div className="notion-topbar">
          <div className="breadcrumbs">
            <span
              onClick={() => setIsChatOpen(true)}
              style={{ fontWeight: 600, color: "var(--text-main)", cursor: "pointer" }}
              title="Click to chat with Lumen"
            >
              ✨ Lumen
            </span>
            <span>/</span>
            {activeView === "home" && <span>Home</span>}
            {activeView === "course" && <span>{currentCourse?.code}</span>}
            {activeView === "note" && (
              <>
                <span onClick={() => handleNavigate("course", currentCourse?.id)}>
                  {currentCourse?.code}
                </span>
                <span>/</span>
                <span>{currentNote?.title || "Note"}</span>
              </>
            )}
            {activeView === "study" && <span>Study Room ({currentCourse?.code})</span>}
            {activeView === "archive" && <span>Visual Archive</span>}
          </div>

        </div>

        {/* Content Container */}
        <div className="notion-content-container">
          {activeView === "home" && (
            <HomeDashboard
              courses={courses}
              onToggleTodo={handleToggleTodo}
              onSelectCourse={(courseId) => handleNavigate("course", courseId)}
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}

          {activeView === "course" && (
            <CourseView
              course={currentCourse}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onSelectNote={handleSelectNote}
              onStartStudy={(courseId) => {
                setSelectedCourseId(courseId);
                setActiveView("study");
              }}
              onOpenVisualizer={handleOpenVisualizer}
              onAddNote={handleAddNote}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {activeView === "note" && (
            <NoteCanvas
              course={currentCourse}
              note={currentNote}
              onBack={() => handleNavigate("course", currentCourse?.id)}
              onSaveNote={handleSaveNote}
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}

          {activeView === "study" && (
            <StudyRoom
              courses={courses}
              initialCourseId={selectedCourseId}
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}

          {activeView === "archive" && (
            <VisualArchive
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}
        </div>
      </main>

      {/* Floating Bottom-Right Amber Lightbulb (Opens Lumen Chat) */}
      <LightbulbFab
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
      />

      {/* Slide-out AI Assistant Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        courses={courses}
        onExecuteAction={handleExecuteAction}
      />

      {/* Modal: Add Course from Syllabus PDF */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

      {/* Modal: Dual-Engine Visualizer & Voice Player */}
      <VisualizerModal
        isOpen={visualizerModal.isOpen}
        concept={visualizerModal.concept}
        courseCode={visualizerModal.courseCode}
        onClose={() => setVisualizerModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
