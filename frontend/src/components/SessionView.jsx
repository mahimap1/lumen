import React from "react";

export default function SessionView({ session, track, widgets = [], onOpenVisualizer }) {
  if (!session) {
    return (
      <div className="notion-screen active">
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-tertiary)" }}>
          No session selected. Choose a session from the sidebar or click "+" to start one.
        </div>
      </div>
    );
  }

  // Find any widgets related to this session or its track
  const sessionWidgets = widgets.filter(
    (w) =>
      (session.widgetIds && session.widgetIds.includes(w.id)) ||
      w.trackId === session.trackId ||
      w.sessionId === session.id
  );

  return (
    <div className="notion-screen active" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Track & Meta Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span className={`notion-tag ${track?.tagColor || "blue"}`} style={{ fontSize: "12px" }}>
          {track ? `${track.icon || "📌"} ${track.code} • ${track.type === "credential" ? "Micro-Credential" : track.type === "skill" ? "Skill" : "Course"}` : "Study Session"}
        </span>
        <span className="notion-tag gray" style={{ fontSize: "11px" }}>
          ⚡ Active Session
        </span>
      </div>

      {/* Main Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontSize: "32px" }}>{session.icon || "📝"}</span>
        <h1 className="page-title" style={{ margin: 0 }}>
          {session.title}
        </h1>
      </div>

      {session.description && (
        <p className="page-description" style={{ marginBottom: "24px" }}>
          {session.description}
        </p>
      )}

      {/* Interactive Widgets Attached to this Session */}
      {sessionWidgets.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-secondary)",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span>Interactive Widgets ({sessionWidgets.length})</span>
            <span style={{ fontSize: "11.5px", color: "var(--tag-blue-text)", fontWeight: 400 }}>
              Auto-synced to Widgets gallery
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {sessionWidgets.map((widget) => (
              <div
                key={widget.id}
                className="gallery-card"
                onClick={() => onOpenVisualizer(widget.title, widget.trackCode || track?.code)}
                style={{ padding: "14px", background: "var(--bg-callout)", cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span className={`notion-tag ${widget.trackTag || "blue"}`} style={{ fontSize: "10.5px" }}>
                    {widget.engine || "Interactive HTML"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--tag-blue-text)" }}>Launch ➔</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)", marginBottom: "4px" }}>
                  {widget.title}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  {widget.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Notes & Invariants */}
      <div
        style={{
          background: "var(--bg-callout)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          padding: "24px",
          lineHeight: "1.7",
          color: "var(--text-main)",
          fontSize: "14px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            📖 Study Notes & Invariants
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
            Saved to local state
          </span>
        </div>

        {session.notes ? (
          <div style={{ whiteSpace: "pre-line", fontFamily: "inherit" }}>
            {session.notes}
          </div>
        ) : (
          <div style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>
            No study notes written for this session yet. Ask Lumen on the right to summarize or formulate key invariants!
          </div>
        )}
      </div>

      {/* Quick Lumen Prompt Actions */}
      <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className="notion-btn"
          onClick={() => onOpenVisualizer(`${session.title} Invariant Model`, track?.code)}
          style={{ fontSize: "12px", padding: "6px 12px" }}
        >
          ✨ Generate New Visualizer Widget
        </button>
      </div>
    </div>
  );
}
