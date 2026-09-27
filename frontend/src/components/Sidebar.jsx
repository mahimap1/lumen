import React, { useState } from "react";

export default function Sidebar({
  tracks = [],
  sessions = [],
  widgetsCount = 0,
  activeView,
  selectedSessionId,
  onNavigate,
  onOpenNewSessionModal,
  onSelectSession
}) {
  // Keep track of collapsed/expanded tracks (default all expanded)
  const [collapsedTracks, setCollapsedTracks] = useState({});

  const toggleTrack = (trackId) => {
    setCollapsedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  return (
    <aside className="notion-sidebar">
      {/* Workspace Header */}
      <div
        className="workspace-header"
        onClick={() => onNavigate("four-year-plan")}
        title="Lumen Workspace"
      >
        <div className="workspace-title-row">
          <div className="workspace-avatar">L</div>
          <span>Lumen Workspace</span>
        </div>
      </div>

      {/* Main Pages */}
      <div className="sidebar-section">
        {/* Four Year Plan */}
        <div
          className={`nav-row ${activeView === "four-year-plan" ? "active" : ""}`}
          onClick={() => onNavigate("four-year-plan")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className="nav-title">Four Year Plan</span>
        </div>

        {/* Alumni Pathways */}
        <div
          className={`nav-row ${activeView === "alumni-pathways" ? "active" : ""}`}
          onClick={() => onNavigate("alumni-pathways")}
        >
          <div className="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <span className="nav-title">Alumni Pathways</span>
        </div>

        {/* Widgets */}
        <div
          className={`nav-row ${activeView === "widgets" ? "active" : ""}`}
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
          <span className="nav-meta-badge">{widgetsCount}</span>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div className="sidebar-heading" style={{ marginBottom: "6px" }}>
          <span>SESSIONS</span>
        </div>

        {/* Track Tree with Nested Sessions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {tracks.map((track) => {
            const trackSessions = sessions.filter((s) => s.trackId === track.id);
            const hasSessions = trackSessions.length > 0;
            const isCollapsed = !!collapsedTracks[track.id];

            return (
              <div key={track.id} className="course-group">
                {/* Track Row */}
                <div
                  className="nav-row"
                  style={{
                    padding: "4px 8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-main)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onClick={() => {
                    if (hasSessions) {
                      toggleTrack(track.id);
                    } else {
                      // Prompt to start session in this track
                      onOpenNewSessionModal(track.id);
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    {hasSessions ? (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "var(--text-tertiary)",
                          display: "inline-block",
                          width: "12px",
                          textAlign: "center",
                          transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                          transition: "transform 0.15s ease"
                        }}
                      >
                        ▼
                      </span>
                    ) : (
                      <span style={{ width: "12px", display: "inline-block" }}></span>
                    )}
                    <span style={{ fontSize: "13px" }}>{track.icon || "📘"}</span>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {track.code}
                    </span>
                  </div>
                </div>

                {/* Sub-sessions under this track */}
                {hasSessions && !isCollapsed && (
                  <div
                    style={{
                      marginLeft: "18px",
                      paddingLeft: "8px",
                      borderLeft: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      marginTop: "2px",
                      marginBottom: "4px"
                    }}
                  >
                    {trackSessions.map((session) => {
                      const isSelected =
                        activeView === "session" && selectedSessionId === session.id;

                      return (
                        <div
                          key={session.id}
                          className={`course-tree-item ${isSelected ? "active" : ""}`}
                          onClick={() => onSelectSession(session.id)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12.5px"
                          }}
                        >
                          <span style={{ fontSize: "12px", opacity: 0.85 }}>
                            {session.icon || "•"}
                          </span>
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {session.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Career Coach Section (Kept intact per request) */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
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
