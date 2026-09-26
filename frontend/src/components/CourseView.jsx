import React, { useState, useEffect } from "react";
import { getCareerRoi } from "../services/api";

export default function CourseView({
  course,
  onToggleTodo,
  onAddTodo,
  onSelectNote,
  onStartStudy,
  onOpenVisualizer,
  onAddNote,
  onOpenAddModal
}) {
  const [newTodoText, setNewTodoText] = useState("");
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [careerInfo, setCareerInfo] = useState(null);

  useEffect(() => {
    if (course?.id) {
      getCareerRoi(course.id).then((info) => setCareerInfo(info));
    }
  }, [course?.id]);

  if (!course) {
    return (
      <div className="notion-screen active">
        <p style={{ color: "var(--text-secondary)" }}>Course not found.</p>
      </div>
    );
  }

  const handleCreateTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    onAddTodo(course.id, {
      id: "t_" + Date.now(),
      text: newTodoText.trim(),
      meta: "Added today",
      done: false
    });
    setNewTodoText("");
    setShowAddTodo(false);
  };

  const pendingTodos = (course.todos || []).filter((t) => !t.done).length;

  return (
    <div className="notion-screen active">
      {/* Icon & Title */}
      <div className="page-icon-wrapper">{course.icon || "📘"}</div>
      <h1 className="page-title">{course.title}</h1>
      <p className="page-description">{course.desc}</p>

      {/* Notion Properties Block */}
      <div className="notion-properties">
        <div className="property-row">
          <div className="property-label">
            <span>👤</span> Instructor
          </div>
          <div className="property-value">{course.instructor || "Faculty Staff"}</div>
        </div>
        <div className="property-row">
          <div className="property-label">
            <span>🏷️</span> Subject Tag
          </div>
          <div className="property-value">
            <span className={`notion-tag ${course.tagClass || "blue"}`}>{course.code}</span>
          </div>
        </div>
        {careerInfo && (
          <div className="property-row">
            <div className="property-label">
              <span>💼</span> Career ROI
            </div>
            <div className="property-value" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="notion-tag green" style={{ fontWeight: 600 }}>
                Median Salary: {careerInfo.median_starting_salary}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                ({careerInfo.metro_area})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
        <button
          className="notion-btn primary"
          onClick={() => onStartStudy(course.id)}
          id="btn-start-study-session"
        >
          <span>⏱️</span>
          <span>Start Study Session</span>
        </button>
        <button
          className="notion-btn"
          onClick={onOpenAddModal}
          id="btn-update-syllabus"
        >
          <span>📄</span>
          <span>Update from Syllabus PDF</span>
        </button>
        <button
          className="notion-btn"
          onClick={() => onAddNote(course.id)}
          id="btn-add-quick-note"
        >
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>

      {/* Two-Column Database View: Course Todos & Deadlines */}
      <div className="notion-two-col">
        {/* Left: Action Items */}
        <div className="notion-table-view">
          <div className="table-view-header">
            <div className="table-view-title">
              <span>☑️</span>
              <span>Action Items</span>
            </div>
            <span className="table-count">{pendingTodos} pending</span>
          </div>

          <div className="table-items-list">
            {(course.todos || []).map((todo) => (
              <div
                key={todo.id}
                className={`notion-todo-row ${todo.done ? "completed" : ""}`}
                onClick={() => onToggleTodo(course.id, todo.id)}
              >
                <div className="notion-checkbox">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="todo-content-block">
                  <div className="todo-title">{todo.text}</div>
                  <div className="todo-meta">
                    <span style={{ color: "var(--text-tertiary)" }}>{todo.meta}</span>
                  </div>
                </div>
              </div>
            ))}

            {showAddTodo ? (
              <form onSubmit={handleCreateTodo} style={{ marginTop: "6px" }}>
                <input
                  type="text"
                  className="modal-input-field"
                  placeholder="Type task description & press enter..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  autoFocus
                  onBlur={() => !newTodoText && setShowAddTodo(false)}
                  style={{ width: "100%", fontSize: "13px", padding: "6px 10px" }}
                />
              </form>
            ) : (
              <div
                className="notion-todo-row"
                style={{ color: "var(--text-tertiary)", cursor: "pointer", fontSize: "13px" }}
                onClick={() => setShowAddTodo(true)}
              >
                <span>+</span>
                <span>Add action item...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Deadlines */}
        <div className="notion-table-view">
          <div className="table-view-header">
            <div className="table-view-title">
              <span>🗓️</span>
              <span>Course Deadlines</span>
            </div>
            <span className="table-count">Chronological</span>
          </div>

          <div className="table-items-list">
            {(course.deadlines || []).length > 0 ? (
              course.deadlines.map((dl) => (
                <div key={dl.id} className="notion-deadline-row">
                  <div className="deadline-left">
                    <div className="deadline-title">{dl.title}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      <span>{dl.sub || "Assignment"}</span>
                      {dl.date && <span style={{ marginLeft: "8px", color: "var(--text-tertiary)" }}>• {dl.date}</span>}
                    </div>
                  </div>
                  <div className="deadline-right">
                    <span className="deadline-badge" style={{ color: dl.color || "var(--tag-orange-text)" }}>
                      {dl.due}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "12px", color: "var(--text-tertiary)", fontSize: "13px" }}>
                No immediate deadlines posted.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Subfolder / Database View */}
      <div className="notes-section-title">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📁</span>
          <span>Notes & Lecture Syntheses</span>
        </div>
        <button
          className="notion-btn"
          style={{ fontSize: "12px" }}
          onClick={() => onAddNote(course.id)}
        >
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>

      <div className="notion-notes-table">
        <div className="notion-table-head">
          <span>Note Title</span>
          <span>Date</span>
          <span>Core Topic & Invariant</span>
          <span style={{ textAlign: "right" }}>Visualizer</span>
        </div>

        {(course.notes || []).map((note) => (
          <div
            key={note.id}
            className="notion-note-row"
            onClick={() => onSelectNote(course.id, note.id)}
          >
            <div className="note-name-col">
              <span>📄</span>
              <span>{note.title}</span>
            </div>
            <div className="note-date-col">{note.date}</div>
            <div className="note-topic-col">{note.topic}</div>
            <div style={{ textAlign: "right" }}>
              <span
                className="notion-tag blue"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVisualizer(note.title, course.code);
                }}
                title="Open Interactive Visual"
              >
                {note.visual || "Interactive"}
              </span>
            </div>
          </div>
        ))}

        {(!course.notes || course.notes.length === 0) && (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)" }}>
            No notes taken yet. Click "+ New Note" to start synthesizing concepts.
          </div>
        )}
      </div>
    </div>
  );
}
