import React from "react";

export default function HomeDashboard({ courses, onToggleTodo, onSelectCourse, onOpenVisualizer }) {
  // Aggregate all todos across all courses
  const allTodos = Object.values(courses).flatMap((c) =>
    (c.todos || []).map((t) => ({ ...t, courseCode: c.code, courseTag: c.tagClass, courseId: c.id }))
  );

  // Aggregate all deadlines across all courses
  const allDeadlines = Object.values(courses).flatMap((c) =>
    (c.deadlines || []).map((d) => ({ ...d, courseCode: c.code, courseTag: c.tagClass, courseId: c.id }))
  );

  const pendingCount = allTodos.filter((t) => !t.done).length;

  return (
    <div className="notion-screen active">
      <div className="page-icon-wrapper">🎓</div>
      <h1 className="page-title">Home Dashboard</h1>
      <p className="page-description">Overview of upcoming deadlines, active action items, and concept mastery.</p>

      {/* Notion Callout Box */}
      <div className="notion-callout">
        <div className="notion-callout-icon">💡</div>
        <div>
          <strong>Visual Learning Checkpoint:</strong> You have {pendingCount} pending action items and 1 high-priority deliverable due in 18 hours. Click any concept or the lightbulb in the bottom-right corner to generate an interactive visual explanation.
        </div>
      </div>

      {/* TWO COLUMN DATABASE VIEW: Todos and Deadlines Side-by-Side */}
      <div className="notion-two-col">
        {/* COLUMN 1: ALL TODOS */}
        <div className="notion-table-view">
          <div className="table-view-header">
            <div className="table-view-title">
              <span>☑️</span>
              <span>All Action Items</span>
            </div>
            <span className="table-count">{pendingCount} pending</span>
          </div>

          <div className="table-items-list">
            {allTodos.map((todo) => (
              <div
                key={todo.id}
                className={`notion-todo-row ${todo.done ? "completed" : ""}`}
                onClick={() => onToggleTodo(todo.courseId, todo.id)}
              >
                <div className="notion-checkbox">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="todo-content-block">
                  <div className="todo-title">{todo.text}</div>
                  <div className="todo-meta">
                    <span
                      className={`notion-tag ${todo.courseTag || "blue"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(todo.courseId);
                      }}
                    >
                      {todo.courseCode}
                    </span>
                    <span>{todo.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: ALL DEADLINES */}
        <div className="notion-table-view">
          <div className="table-view-header">
            <div className="table-view-title">
              <span>🗓️</span>
              <span>Upcoming Deadlines</span>
            </div>
            <span className="table-count">Chronological</span>
          </div>

          <div className="table-items-list">
            {allDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="notion-deadline-row"
                onClick={() => onSelectCourse(deadline.courseId)}
              >
                <div className="deadline-left">
                  <div className="deadline-title">{deadline.title}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    <span className={`notion-tag ${deadline.courseTag || "blue"}`} style={{ marginRight: "6px" }}>
                      {deadline.courseCode}
                    </span>
                    <span>{deadline.sub}</span>
                  </div>
                </div>
                <div className="deadline-right">
                  <span className="deadline-badge" style={{ color: deadline.color || "var(--tag-orange-text)" }}>
                    {deadline.due}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{deadline.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
