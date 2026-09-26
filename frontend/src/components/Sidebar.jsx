import React, { useState } from "react";

export default function Sidebar({
  courses,
  activeView,
  selectedCourseId,
  onNavigate,
  onOpenAddModal,
  onSelectCourseSubview
}) {
  const [expandedCourses, setExpandedCourses] = useState({ [selectedCourseId]: true });

  const toggleCourseExpand = (e, courseId) => {
    e.stopPropagation();
    setExpandedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  return (
    <aside className="notion-sidebar">
      {/* Workspace Header */}
      <div className="workspace-header" onClick={() => onNavigate("home")}>
        <div className="workspace-title-row">
          <div className="workspace-avatar">L</div>
          <span>Lumen Workspace</span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>▾</span>
      </div>

      {/* Main Pages */}
      <div className="sidebar-section">
        <div
          className={`nav-row ${activeView === "home" ? "active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="nav-title">Home Dashboard</span>
        </div>

        <div
          className={`nav-row ${activeView === "study" ? "active" : ""}`}
          onClick={() => onNavigate("study")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span className="nav-title">Study Room</span>
        </div>

        <div
          className={`nav-row ${activeView === "archive" ? "active" : ""}`}
          onClick={() => onNavigate("archive")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span className="nav-title">Visual Archive</span>
          <span className="nav-meta-badge">4</span>
        </div>
      </div>

      {/* Enrolled Courses with Sub-Tree */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
        <div className="sidebar-heading">
          <span>Enrolled Courses</span>
          <span
            style={{ cursor: "pointer", fontSize: "14px", padding: "0 4px" }}
            title="Add Course from Syllabus"
            onClick={onOpenAddModal}
          >
            +
          </span>
        </div>

        {Object.values(courses).map((course) => {
          const isSelected = selectedCourseId === course.id;
          const isExpanded = expandedCourses[course.id];

          return (
            <div key={course.id} className="course-group">
              <div
                className={`nav-row ${isSelected && activeView === "course" ? "active" : ""}`}
                onClick={() => onNavigate("course", course.id)}
              >
                <span
                  style={{ fontSize: "10px", color: "var(--text-tertiary)", cursor: "pointer", width: "12px" }}
                  onClick={(e) => toggleCourseExpand(e, course.id)}
                >
                  {isExpanded ? "▾" : "▸"}
                </span>
                <span style={{ fontSize: "13px", marginRight: "4px" }}>{course.icon}</span>
                <span className="nav-title">{course.code}</span>
              </div>

              {/* Subfolder Hierarchy */}
              {isExpanded && (
                <div style={{ paddingLeft: "16px", marginTop: "2px" }}>
                  <div
                    className={`course-tree-item ${isSelected && activeView === "course" ? "active" : ""}`}
                    onClick={() => onNavigate("course", course.id)}
                  >
                    <span>📋</span>
                    <span>Dashboard</span>
                  </div>
                  <div
                    className={`course-tree-item ${isSelected && activeView === "notes-list" ? "active" : ""}`}
                    onClick={() => onSelectCourseSubview(course.id, "notes-list")}
                  >
                    <span>📁</span>
                    <span>Notes ({course.notes?.length || 0})</span>
                  </div>
                  <div
                    className={`course-tree-item ${isSelected && activeView === "study" ? "active" : ""}`}
                    onClick={() => onSelectCourseSubview(course.id, "study")}
                  >
                    <span>⏱️</span>
                    <span>Study Session</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with DoIT Degree ROI highlight */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontWeight: 600, color: "var(--text-main)" }}>hackUMBC 2026</span>
          <span className="notion-tag green" style={{ fontSize: "10px" }}>DoIT Track</span>
        </div>
        <div>Concept Mastery ➔ $128k+ Salary ROI</div>
      </div>
    </aside>
  );
}
