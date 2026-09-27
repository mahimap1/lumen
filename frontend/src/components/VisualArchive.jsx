import React, { useState } from "react";

export const ARCHIVE_ITEMS = [
  {
    id: "avl-rot",
    title: "AVL Tree: Single Right & Left-Right Rotations",
    course: "CMSC 341",
    courseTag: "blue",
    engine: "Interactive HTML/SVG",
    topic: "Tree Balancing Invariants",
    desc: "Restores height-balance factor |h_L - h_R| <= 1 in O(1) pointer updates upon insertion.",
    previewType: "tree"
  },
  {
    id: "eigen-transform",
    title: "Eigenvalues & Invariant Subspace Transformation",
    course: "MATH 221",
    courseTag: "green",
    engine: "3Blue1Brown Manim",
    topic: "Linear Algebra & Coordinate Systems",
    desc: "Visualizes the coordinate stretch where A·v = λ·v, maintaining directional collinearity.",
    previewType: "matrix"
  },
  {
    id: "bfs-dfs",
    title: "Graph Traversal Frontiers: FIFO Queue vs LIFO Stack",
    course: "CMSC 341",
    courseTag: "blue",
    engine: "Interactive HTML/SVG",
    topic: "Graph Traversal Frontiers",
    desc: "Demonstrates wave-front expansion versus deep branch diving with visited-set tracking.",
    previewType: "graph"
  },
  {
    id: "astar-heuristic",
    title: "A* Informed Search: Admissibility & Consistency",
    course: "CMSC 471",
    courseTag: "purple",
    engine: "Interactive HTML/SVG",
    topic: "AI Heuristic Search",
    desc: "Verifies the triangle inequality invariant h(n) <= c(n, a, n') + h(n') guaranteeing optimal paths.",
    previewType: "search"
  },
  {
    id: "saas-cac-ltv",
    title: "SaaS Unit Economics: LTV/CAC Ratio & Payback Horizon",
    course: "ENTR 201",
    courseTag: "orange",
    engine: "Interactive HTML/SVG",
    topic: "Venture Finance Metrics",
    desc: "Simulates customer churn rate, gross margin, and organic acquisition multiplier curve.",
    previewType: "chart"
  }
];

export default function VisualArchive({ onOpenVisualizer }) {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredItems = ARCHIVE_ITEMS.filter((item) => {
    if (selectedFilter === "All") return true;
    return item.course === selectedFilter;
  });

  return (
    <div className="notion-screen active">
      <div className="page-icon-wrapper">🖼️</div>
      <h1 className="page-title">Widgets</h1>
      <p className="page-description">
        Interactive minimalist widgets and mathematical animations for your concepts.
      </p>

      {/* Filter Chips Bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["All", "CMSC 341", "MATH 221", "ENTR 201", "CMSC 471"].map((chip) => (
          <button
            key={chip}
            className={`notion-btn ${selectedFilter === chip ? "primary" : ""}`}
            style={{ fontSize: "12px", padding: "4px 12px" }}
            onClick={() => setSelectedFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="notion-gallery-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="gallery-card"
            onClick={() => onOpenVisualizer(item.title, item.course)}
          >
            {/* Visual Thumbnail */}
            <div className="gallery-preview">
              {item.previewType === "tree" && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ padding: "4px 8px", borderRadius: "50%", border: "1px solid #529CCA", color: "#529CCA" }}>30</span>
                  <span style={{ color: "var(--text-tertiary)" }}>➔</span>
                  <span style={{ padding: "4px 8px", borderRadius: "50%", border: "1px solid #4DAB9A", color: "#4DAB9A" }}>20</span>
                </div>
              )}
              {item.previewType === "matrix" && (
                <div style={{ color: "#FF9B38" }}>
                  [ A · v = λ · v ]
                </div>
              )}
              {item.previewType === "graph" && (
                <div style={{ color: "#529CCA" }}>
                  (S) ═══ 큐 [BFS Queue] ═══➔ (G)
                </div>
              )}
              {item.previewType === "search" && (
                <div style={{ color: "#C399F2" }}>
                  f(n) = g(n) + h(n) [A* Monotonic]
                </div>
              )}
              {item.previewType === "chart" && (
                <div style={{ color: "#FF9B38" }}>
                  LTV / CAC ≥ 3.0x [Venture Frontier]
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="gallery-info">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span className={`notion-tag ${item.courseTag || "blue"}`}>{item.course}</span>
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
    </div>
  );
}
