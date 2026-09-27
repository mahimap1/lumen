import React from "react";

export default function Sidebar({
  sessions = [],
  activeView,
  selectedSessionId,
  onNavigate,
  onAddSession,
  onSelectSession
}) {
  return (
    <aside className="notion-sidebar">
      {/* Workspace Header */}
      <div className="workspace-header" onClick={() => onNavigate("home")} title="Lumen Workspace">
        <div className="workspace-title-row">
          <div className="workspace-avatar">L</div>
          <span>Lumen Workspace</span>
        </div>
      </div>

      {/* Main Pages */}
      <div className="sidebar-section">
        <div
          className={`nav-row ${activeView === "home" ? "active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="nav-title">Home</span>
        </div>

        <div
          className={`nav-row ${activeView === "widgets" || activeView === "archive" ? "active" : ""}`}
          onClick={() => onNavigate("widgets")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span className="nav-title">Widgets</span>
          <span className="nav-meta-badge">5</span>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
        <div className="sidebar-heading">
          <span>Sessions</span>
          <span
            style={{ cursor: "pointer", fontSize: "16px", padding: "0 4px", fontWeight: "bold", lineHeight: 1 }}
            title="Add New Session"
            onClick={(e) => {
              e.stopPropagation();
              onAddSession();
            }}
          >
            +
          </span>
        </div>

        {sessions.map((session) => {
          const isSelected =
            (activeView === "session" || activeView === "note") &&
            selectedSessionId === session.id;

          return (
            <div
              key={session.id}
              className={`nav-row ${isSelected ? "active" : ""}`}
              onClick={() => onSelectSession(session.id)}
            >
              <span style={{ fontSize: "13px", marginRight: "4px" }}>
                {session.icon || "📝"}
              </span>
              <span
                className="nav-title"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {session.title || "Untitled Session"}
              </span>
            </div>
          );
        })}

        {/* Career Section under Sessions */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
          <div className="sidebar-heading" style={{ marginBottom: "6px" }}>
            <span>CAREER COACH</span>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 5px",
                borderRadius: "4px",
                background: "rgba(59, 130, 246, 0.15)",
                color: "#3b82f6",
                fontWeight: 600
              }}
            >
              DoIT
            </span>
          </div>

          <div
            className={`nav-row ${activeView === "career" ? "active" : ""}`}
            onClick={() => onNavigate("career")}
          >
            <div className="nav-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
            <span className="nav-title" style={{ fontWeight: activeView === "career" ? 600 : 400 }}>
              Pathways & ROI
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
