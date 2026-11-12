import React, { useState } from "react";

// Helper to remove any emojis from session titles
function cleanTitle(title = "") {
  return title
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/^[\s•\-\/]+/, "")
    .trim();
}

export default function Sidebar({
  tracks = [],
  sessions = [],
  widgetsCount = 0,
  activeView,
  selectedSessionId,
  onNavigate,
  onOpenNewSessionModal,
  onSelectSession,
  onResetDemo
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

      {/* Render helper for a categorized track tree */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {[
          { key: "classes", title: "CLASSES", types: ["course"], defaultIcon: "📘", newType: "course" },
          { key: "career", title: "CAREER", types: ["career"], defaultIcon: "💼", newType: "career" },
          { key: "skills", title: "SKILLS", types: ["skill", "credential"], defaultIcon: "🛠️", newType: "skill" }
        ].map((section) => {
          const sectionTracks = tracks.filter((t) =>
            section.types.includes(t.type || "course")
          );

          return (
            <div key={section.key} className="sidebar-section" style={{ marginBottom: 0 }}>
              <div className="sidebar-heading" style={{ marginBottom: "6px" }}>
                <span>{section.title}</span>
                <button
                  type="button"
                  onClick={() => onOpenNewSessionModal(null, section.newType)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    lineHeight: 1,
                    padding: "2px 4px",
                    borderRadius: "3px"
                  }}
                  title={`Start new session in ${section.title.toLowerCase()}`}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                >
                  +
                </button>
              </div>

              {section.key === "career" ? (
                // Career has NO session groups—just direct sessions
                (() => {
                  const careerSessions = sessions.filter((s) => {
                    const parentTrack = tracks.find((t) => t.id === s.trackId);
                    return s.type === "career" || (parentTrack && parentTrack.type === "career");
                  });

                  if (careerSessions.length === 0) {
                    return (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-tertiary)",
                          padding: "4px 8px",
                          fontStyle: "italic"
                        }}
                      >
                        No career sessions yet
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {careerSessions.map((session) => {
                        const isSelected =
                          activeView === "session" && selectedSessionId === session.id;

                        return (
                          <div
                            key={session.id}
                            className={`course-tree-item ${isSelected ? "active" : ""}`}
                            onClick={() => onSelectSession(session.id)}
                            style={{
                              padding: "6px 8px",
                              fontSize: "12.5px"
                            }}
                          >
                            <span
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {cleanTitle(session.title)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : sectionTracks.length === 0 ? (
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    padding: "4px 8px",
                    fontStyle: "italic"
                  }}
                >
                  No {section.title.toLowerCase()} yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {sectionTracks.map((track) => {
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
                              onOpenNewSessionModal(track.id, section.newType);
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
                            <span style={{ fontSize: "13px" }}>{track.icon || section.defaultIcon}</span>
                            <span
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {track.code || track.name}
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
                                  <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis"
                                    }}
                                  >
                                    {cleanTitle(session.title)}
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
              )}
            </div>
          );
        })}
      </div>

    </aside>
  );
}
