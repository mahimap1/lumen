import React, { useState } from "react";

export default function LightbulbFab({ onOpenVisualizer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conceptInput, setConceptInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!conceptInput.trim()) return;
    onOpenVisualizer(conceptInput.trim(), "STEM");
    setConceptInput("");
    setIsOpen(false);
  };

  const handleSelectQuick = (concept, course) => {
    onOpenVisualizer(concept, course);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Prompt Popover when open */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "82px",
            right: "32px",
            width: "360px",
            background: "#222",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6)",
            zIndex: 110,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "var(--text-main)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#F5A623" }}>💡</span>
              <span>Lumen Instant Concept Visualizer</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "14px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              <input
                type="text"
                className="modal-input-field"
                placeholder="e.g. Eigenvector stretch, AVL rotation..."
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                autoFocus
                style={{ fontSize: "13px", padding: "6px 10px" }}
              />
              <button type="submit" className="notion-btn primary" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                Generate
              </button>
            </form>

            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Quick Presets:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div
                className="nav-row"
                style={{ padding: "5px 8px", fontSize: "12px", borderRadius: "4px" }}
                onClick={() => handleSelectQuick("AVL Tree Left-Right Double Rotation", "CMSC 341")}
              >
                <span>📘</span>
                <span style={{ flex: 1 }}>AVL Tree Double Rotation</span>
                <span className="notion-tag blue" style={{ fontSize: "10px" }}>CMSC 341</span>
              </div>

              <div
                className="nav-row"
                style={{ padding: "5px 8px", fontSize: "12px", borderRadius: "4px" }}
                onClick={() => handleSelectQuick("Eigenvector Coordinate Invariance", "MATH 221")}
              >
                <span>📐</span>
                <span style={{ flex: 1 }}>Eigenvalues & Invariant Subspaces</span>
                <span className="notion-tag green" style={{ fontSize: "10px" }}>MATH 221</span>
              </div>

              <div
                className="nav-row"
                style={{ padding: "5px 8px", fontSize: "12px", borderRadius: "4px" }}
                onClick={() => handleSelectQuick("BFS vs DFS Search Frontiers", "CMSC 341")}
              >
                <span>⚡</span>
                <span style={{ flex: 1 }}>BFS vs DFS Search Wavefronts</span>
                <span className="notion-tag blue" style={{ fontSize: "10px" }}>CMSC 341</span>
              </div>

              <div
                className="nav-row"
                style={{ padding: "5px 8px", fontSize: "12px", borderRadius: "4px" }}
                onClick={() => handleSelectQuick("A* Heuristic Admissibility & Monotonicity", "CMSC 471")}
              >
                <span>🤖</span>
                <span style={{ flex: 1 }}>A* Heuristic Admissibility</span>
                <span className="notion-tag purple" style={{ fontSize: "10px" }}>CMSC 471</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="notion-lightbulb-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Ask Lumen to visualize..."
        id="btn-lumen-lightbulb-fab"
      >
        <svg viewBox="0 0 24 24">
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-1.3l-.85-.6A5.002 5.002 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
        </svg>
        <span className="fab-tooltip">Ask Lumen to visualize...</span>
      </button>
    </>
  );
}
