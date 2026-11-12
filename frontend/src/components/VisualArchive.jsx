import React, { useState } from "react";
import { INITIAL_WIDGETS } from "../data/initialData";
import WidgetSandboxModal from "./WidgetSandboxModal";

export default function VisualArchive({ widgets = INITIAL_WIDGETS, onOpenVisualizer }) {
  const [selectedType, setSelectedType] = useState("all"); // "all" | "course" | "credential" | "skill"
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sandboxWidget, setSandboxWidget] = useState(null); // widget object to show in sandbox

  // Extract unique track codes from available widgets
  const trackCodes = Array.from(new Set(widgets.map((w) => w.trackCode))).filter(Boolean);

  const filteredWidgets = widgets.filter((item) => {
    // Type filter
    if (selectedType !== "all" && item.trackType !== selectedType) {
      return false;
    }
    // Track code filter
    if (selectedTrack !== "all" && item.trackCode !== selectedTrack) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchTopic = item.topic?.toLowerCase().includes(q);
      const matchCode = item.trackCode?.toLowerCase().includes(q);
      const matchDesc = item.desc?.toLowerCase().includes(q);
      return matchTitle || matchTopic || matchCode || matchDesc;
    }
    return true;
  });

  return (
    <div className="notion-screen active">
      <div className="page-icon-wrapper">🧩</div>
      <h1 className="page-title">Widgets</h1>
      <p className="page-description">
        Interactive HTML sandbox models, mathematical animations, and conceptual visualizations generated across your study sessions.
      </p>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "24px",
          background: "var(--bg-callout)",
          padding: "14px 16px",
          borderRadius: "6px",
          border: "1px solid var(--border-subtle)"
        }}
      >
        {/* Search Input & Type Tabs */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Type Filter Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className={`notion-btn ${selectedType === "all" ? "primary" : ""}`}
              style={{ fontSize: "12px", padding: "4px 10px" }}
              onClick={() => {
                setSelectedType("all");
                setSelectedTrack("all");
              }}
            >
              All Types ({widgets.length})
            </button>
            <button
              className={`notion-btn ${selectedType === "course" ? "primary" : ""}`}
              style={{ fontSize: "12px", padding: "4px 10px" }}
              onClick={() => setSelectedType("course")}
            >
              🎓 Courses
            </button>
            <button
              className={`notion-btn ${selectedType === "credential" ? "primary" : ""}`}
              style={{ fontSize: "12px", padding: "4px 10px" }}
              onClick={() => setSelectedType("credential")}
            >
              📜 Micro-Credentials
            </button>
            <button
              className={`notion-btn ${selectedType === "skill" ? "primary" : ""}`}
              style={{ fontSize: "12px", padding: "4px 10px" }}
              onClick={() => setSelectedType("skill")}
            >
              🛠️ Skills
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: "220px", flex: "1 1 200px", maxWidth: "340px" }}>
            <input
              type="text"
              placeholder="Search widgets by concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "6px 10px",
                color: "var(--text-main)",
                fontSize: "12.5px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Specific Track Filter Pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginRight: "4px" }}>
            Subject:
          </span>
          <button
            className={`notion-btn ${selectedTrack === "all" ? "primary" : ""}`}
            style={{ fontSize: "11.5px", padding: "2px 8px" }}
            onClick={() => setSelectedTrack("all")}
          >
            All Subjects
          </button>
          {trackCodes.map((code) => (
            <button
              key={code}
              className={`notion-btn ${selectedTrack === code ? "primary" : ""}`}
              style={{ fontSize: "11.5px", padding: "2px 8px" }}
              onClick={() => setSelectedTrack(code)}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="notion-gallery-grid">
        {filteredWidgets.map((item) => (
          <div
            key={item.id}
            className="gallery-card"
            onClick={() => setSandboxWidget(item)}
          >
            {/* Visual Thumbnail */}
            <div className="gallery-preview">
              {item.previewType === "ram" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ color: "#60a5fa", fontFamily: "monospace", fontSize: "12px" }}>
                    [ 6T SRAM Cell ⇄ DRAM 1T1C ]
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                    Row Buffer: tCAS 14ns
                  </div>
                </div>
              )}
              {item.previewType === "list" && (
                <div style={{ color: "#34d399", fontFamily: "monospace", fontSize: "12px" }}>
                  [Head] ➔ [Node 1] ⇄ [Node 2] ➔ [Null]
                </div>
              )}
              {item.previewType === "tree" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ padding: "4px 8px", borderRadius: "50%", border: "1px solid #529CCA", color: "#529CCA" }}>30</span>
                  <span style={{ color: "var(--text-tertiary)" }}>➔</span>
                  <span style={{ padding: "4px 8px", borderRadius: "50%", border: "1px solid #4DAB9A", color: "#4DAB9A" }}>20</span>
                </div>
              )}
              {item.previewType === "matrix" && (
                <div style={{ color: "#fb923c", fontFamily: "monospace", fontSize: "12px" }}>
                  [ A · v = λ · v ] (Basis Warp)
                </div>
              )}
              {item.previewType === "cloud" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c084fc" }}>
                  <span>☁️ ALB</span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>══ RoundRobin ══➔</span>
                  <span style={{ fontSize: "11px" }}>[EC2 AZ-1]</span>
                </div>
              )}
              {item.previewType === "chart" && (
                <div style={{ color: "#fb923c", fontSize: "12px" }}>
                  Equilibrium: P* = $24.50 • Elasticity ε = 1.42
                </div>
              )}
              {item.previewType === "graph" && (
                <div style={{ color: "#34d399", fontSize: "12px" }}>
                  Harmonic Oscillator: E = K + U = Const
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="gallery-info">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span className={`notion-tag ${item.trackTag || "blue"}`}>
                  {item.trackCode || item.course}
                </span>
                <span className="notion-tag gray" style={{ fontSize: "11px" }}>
                  {item.engine}
                </span>
              </div>

              <div className="gallery-title">{item.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                {item.desc}
              </div>

              <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--tag-blue-text)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  Open Sandbox ➔
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "64px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "40px" }}>🧩</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>No widgets yet</div>
          <div style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "340px", lineHeight: "1.6" }}>
            Widgets are generated by Lumen during your study sessions. Start a session and ask Lumen to
            visualize a concept — it will appear here automatically.
          </div>
          <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--tag-blue-text)", background: "var(--tag-blue-bg)", border: "1px solid var(--tag-blue-border, rgba(96,165,250,0.3))", borderRadius: "6px", padding: "6px 14px" }}>
            💬 Try: "Visualize how AVL tree rotations work" in a session
          </div>
        </div>
      )}
      {widgets.length > 0 && filteredWidgets.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
          No widgets match your filter criteria.
        </div>
      )}

      {/* Clean sandbox modal — renders the widget's HTML/CSS/JS directly */}
      <WidgetSandboxModal
        isOpen={!!sandboxWidget}
        widget={sandboxWidget}
        onClose={() => setSandboxWidget(null)}
      />
    </div>
  );
}
