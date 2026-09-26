import React, { useState, useEffect, useRef } from "react";
import { consultLumen, narrateConcept } from "../services/api";

export default function NoteCanvas({
  course,
  note,
  onBack,
  onSaveNote,
  onOpenVisualizer
}) {
  const [content, setContent] = useState(note?.content || "");
  const [title, setTitle] = useState(note?.title || "");
  const [selectedText, setSelectedText] = useState("");
  const [popoverPos, setPopoverPos] = useState(null);
  const [consultResult, setConsultResult] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeEngine, setActiveEngine] = useState("interactive"); // "interactive" or "manim"
  
  // Interactive Tree State for Embedded Widget
  const [treeState, setTreeState] = useState("balanced"); // "balanced", "unbalanced-left", "rotated"

  const noteContentRef = useRef(null);

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setTitle(note.title || "");
      setTreeState("balanced");
    }
  }, [note]);

  // Handle text selection in note body
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString()?.trim();
    if (text && text.length > 2 && text.length < 100) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPopoverPos({
        top: rect.bottom + window.scrollY + 6,
        left: Math.max(10, rect.left + window.scrollX - 40)
      });
    } else {
      // Don't close if clicking inside the popover
      setTimeout(() => {
        if (!consultResult) {
          setPopoverPos(null);
        }
      }, 200);
    }
  };

  const handleConsult = async () => {
    if (!selectedText) return;
    setIsConsulting(true);
    const res = await consultLumen(selectedText, course?.code || "STEM");
    setConsultResult(res);
    setIsConsulting(false);
  };

  const handleNarrate = async (textToSpeak) => {
    setIsSpeaking(true);
    await narrateConcept(textToSpeak || consultResult?.intuition || "Invariant concept");
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const handleSave = () => {
    if (onSaveNote && note) {
      onSaveNote(course.id, {
        ...note,
        title,
        content
      });
    }
  };

  return (
    <div className="notion-screen active" style={{ position: "relative" }}>
      {/* Top Breadcrumbs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div className="breadcrumbs" style={{ fontSize: "13px" }}>
          <span onClick={onBack} style={{ color: "var(--text-secondary)" }}>
            {course.code}
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>Notes</span>
          <span style={{ color: "var(--text-tertiary)" }}>/</span>
          <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{title || "Untitled"}</span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="notion-btn" onClick={handleSave}>
            <span>💾</span>
            <span>Save Note</span>
          </button>
          <button
            className="notion-btn primary"
            onClick={() => onOpenVisualizer(title, course.code)}
          >
            <span>⚡</span>
            <span>Visualize Concept</span>
          </button>
        </div>
      </div>

      {/* Note Header */}
      <div className="page-icon-wrapper">📄</div>
      <input
        type="text"
        className="page-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          width: "100%",
          padding: 0
        }}
        placeholder="Untitled Note"
      />

      {/* Properties row */}
      <div className="notion-properties">
        <div className="property-row">
          <div className="property-label">
            <span>🗓️</span> Date
          </div>
          <div className="property-value">{note?.date || "Today"}</div>
        </div>
        <div className="property-row">
          <div className="property-label">
            <span>🏷️</span> Topic
          </div>
          <div className="property-value">
            <span className={`notion-tag ${course.tagClass || "blue"}`}>
              {note?.topic || "Core Concept"}
            </span>
          </div>
        </div>
      </div>

      {/* Helper hint for inline consult */}
      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>💡</span>
        <span>Highlight any word or mathematical phrase to consult Lumen for an instant definition or invariant visualizer.</span>
      </div>

      {/* Note Body with Selection Detection */}
      <div
        ref={noteContentRef}
        onMouseUp={handleMouseUp}
        style={{
          background: "transparent",
          minHeight: "220px",
          color: "var(--text-main)",
          fontSize: "14.5px",
          lineHeight: "1.7",
          paddingBottom: "20px"
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onMouseUp={handleMouseUp}
          style={{
            width: "100%",
            minHeight: "260px",
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "4px",
            color: "var(--text-main)",
            fontFamily: "inherit",
            fontSize: "14.5px",
            lineHeight: "1.7",
            padding: "8px 0",
            resize: "vertical",
            outline: "none"
          }}
          placeholder="Start typing your lecture notes, equations, and code fragments..."
        />
      </div>

      {/* FLOATING TEXT SELECTION BUBBLE */}
      {popoverPos && (
        <div
          className="consult-popover"
          style={{
            position: "absolute",
            top: `${popoverPos.top - 180}px`,
            left: `${popoverPos.left - 240}px`,
            maxWidth: "340px"
          }}
        >
          {!consultResult ? (
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Selected: <strong>"{selectedText}"</strong>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="notion-btn primary"
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                  onClick={handleConsult}
                  disabled={isConsulting}
                >
                  {isConsulting ? "Consulting..." : "✨ Ask Lumen"}
                </button>
                <button
                  className="notion-btn"
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                  onClick={() => {
                    onOpenVisualizer(selectedText, course.code);
                    setPopoverPos(null);
                  }}
                >
                  🔮 Visualize
                </button>
                <button
                  className="notion-btn"
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                  onClick={() => setPopoverPos(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: "var(--tag-blue-text)", fontSize: "13px" }}>
                  {consultResult.term}
                </span>
                <button
                  onClick={() => {
                    setConsultResult(null);
                    setPopoverPos(null);
                  }}
                  style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "8px" }}>
                {consultResult.definition}
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 8px", borderRadius: "4px", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                <strong>Intuition:</strong> {consultResult.intuition}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="notion-btn primary"
                  style={{ fontSize: "11.5px", padding: "4px 8px" }}
                  onClick={() => {
                    onOpenVisualizer(consultResult.term, course.code);
                    setPopoverPos(null);
                  }}
                >
                  ⚡ Open Visualizer
                </button>
                <button
                  className="notion-btn"
                  style={{ fontSize: "11.5px", padding: "4px 8px" }}
                  onClick={() => handleNarrate(consultResult.intuition)}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? "🔊 Speaking..." : "🔊 Voice"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMBEDDED MINIMALIST CONCEPT INSPECTOR */}
      <div className="notion-widget-embed">
        <div className="widget-header-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4DAB9A" }}></span>
            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
              Interactive Minimalist Inspector: AVL Tree Balancing
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className={`notion-btn ${activeEngine === "interactive" ? "primary" : ""}`}
              style={{ fontSize: "11px", padding: "3px 8px" }}
              onClick={() => setActiveEngine("interactive")}
            >
              Interactive HTML/SVG
            </button>
            <button
              className={`notion-btn ${activeEngine === "manim" ? "primary" : ""}`}
              style={{ fontSize: "11px", padding: "3px 8px" }}
              onClick={() => setActiveEngine("manim")}
            >
              3b1b Manim View
            </button>
          </div>
        </div>

        <div className="widget-canvas-frame">
          {activeEngine === "interactive" ? (
            <div className="minimal-tree" style={{ width: "100%", maxWidth: "520px" }}>
              {/* Controls bar */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", justifyContent: "center" }}>
                <button
                  className="notion-btn"
                  style={{ fontSize: "12px" }}
                  onClick={() => setTreeState("unbalanced-left")}
                >
                  + Insert 10 (Imbalance)
                </button>
                <button
                  className="notion-btn primary"
                  style={{ fontSize: "12px" }}
                  onClick={() => setTreeState("rotated")}
                >
                  ↻ Apply Right Rotation
                </button>
                <button
                  className="notion-btn"
                  style={{ fontSize: "12px" }}
                  onClick={() => setTreeState("balanced")}
                >
                  ↺ Reset
                </button>
              </div>

              {/* Minimal SVG Graphic Representation */}
              <svg width="400" height="180" viewBox="0 0 400 180" style={{ overflow: "visible" }}>
                {treeState === "balanced" && (
                  <g>
                    {/* Balanced Root: 30, Left: 20, Right: 40 */}
                    <line x1="200" y1="40" x2="130" y2="120" stroke="#529CCA" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="200" y1="40" x2="270" y2="120" stroke="#529CCA" strokeWidth="2" strokeDasharray="3 3" />

                    <circle cx="200" cy="40" r="22" fill="#202020" stroke="#529CCA" strokeWidth="2" />
                    <text x="200" y="45" fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle">30</text>
                    <text x="200" y="12" fill="#529CCA" fontSize="11" textAnchor="middle">BF: 0</text>

                    <circle cx="130" cy="120" r="20" fill="#202020" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <text x="130" y="125" fill="#E6E6E5" fontSize="13" textAnchor="middle">20</text>
                    <text x="130" y="152" fill="#999" fontSize="11" textAnchor="middle">BF: 0</text>

                    <circle cx="270" cy="120" r="20" fill="#202020" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <text x="270" y="125" fill="#E6E6E5" fontSize="13" textAnchor="middle">40</text>
                    <text x="270" y="152" fill="#999" fontSize="11" textAnchor="middle">BF: 0</text>
                  </g>
                )}

                {treeState === "unbalanced-left" && (
                  <g>
                    {/* Unbalanced Left-Left: 30 has Left 20, which has Left 10 */}
                    <line x1="220" y1="30" x2="150" y2="90" stroke="#FF7369" strokeWidth="2.5" />
                    <line x1="150" y1="90" x2="80" y2="150" stroke="#FF7369" strokeWidth="2.5" />

                    <circle cx="220" cy="30" r="22" fill="#202020" stroke="#FF7369" strokeWidth="2" />
                    <text x="220" y="35" fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle">30</text>
                    <text x="260" y="35" fill="#FF7369" fontSize="11" textAnchor="start">BF: +2 (Violation!)</text>

                    <circle cx="150" cy="90" r="20" fill="#202020" stroke="#FF9B38" strokeWidth="2" />
                    <text x="150" y="95" fill="#E6E6E5" fontSize="13" textAnchor="middle">20</text>
                    <text x="185" y="95" fill="#FF9B38" fontSize="11" textAnchor="start">BF: +1</text>

                    <circle cx="80" cy="150" r="18" fill="#202020" stroke="#529CCA" strokeWidth="2" />
                    <text x="80" y="155" fill="#E6E6E5" fontSize="12" textAnchor="middle">10</text>
                    <text x="80" y="176" fill="#529CCA" fontSize="10" textAnchor="middle">Inserted</text>
                  </g>
                )}

                {treeState === "rotated" && (
                  <g>
                    {/* Restored after Right Rotation: 20 is new root, Left 10, Right 30 */}
                    <line x1="200" y1="40" x2="130" y2="120" stroke="#4DAB9A" strokeWidth="2" />
                    <line x1="200" y1="40" x2="270" y2="120" stroke="#4DAB9A" strokeWidth="2" />

                    <circle cx="200" cy="40" r="22" fill="#202020" stroke="#4DAB9A" strokeWidth="2.5" />
                    <text x="200" y="45" fill="#4DAB9A" fontSize="13" fontWeight="bold" textAnchor="middle">20</text>
                    <text x="200" y="12" fill="#4DAB9A" fontSize="11" textAnchor="middle">New Root (BF: 0)</text>

                    <circle cx="130" cy="120" r="20" fill="#202020" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <text x="130" y="125" fill="#E6E6E5" fontSize="13" textAnchor="middle">10</text>
                    <text x="130" y="152" fill="#999" fontSize="11" textAnchor="middle">BF: 0</text>

                    <circle cx="270" cy="120" r="20" fill="#202020" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <text x="270" y="125" fill="#E6E6E5" fontSize="13" textAnchor="middle">30</text>
                    <text x="270" y="152" fill="#999" fontSize="11" textAnchor="middle">BF: 0</text>
                  </g>
                )}
              </svg>

              {/* Status explanation */}
              <div style={{ textAlign: "center", fontSize: "12px", color: "var(--text-secondary)", marginTop: "12px" }}>
                {treeState === "balanced" && "Tree is currently height-balanced: Balance factor |h_L - h_R| <= 1."}
                {treeState === "unbalanced-left" && "Left-Left imbalance detected at node 30 (BF: +2). A single right rotation is required."}
                {treeState === "rotated" && "Invariant restored in O(1) time: Node 20 pivots to root, node 30 becomes its right child."}
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: "520px", textAlign: "left", background: "#111", padding: "16px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "11px", color: "var(--tag-blue-text)" }}>
                <span>3Blue1Brown Manim Engine (Python 3.9)</span>
                <span>render_quality: 1080p60</span>
              </div>
              <pre style={{ color: "#8be9fd", fontSize: "11.5px", overflowX: "auto", margin: 0, fontFamily: "monospace" }}>
{`class AVLRightRotation(Scene):
    def construct(self):
        root = Circle(radius=0.5, color=RED).shift(UP*1.5 + RIGHT*0.5)
        pivot = Circle(radius=0.5, color=ORANGE).shift(LEFT*1)
        child = Circle(radius=0.5, color=BLUE).shift(DOWN*1.5 + LEFT*2)
        
        # Animate invariant restoration
        self.play(pivot.animate.move_to(UP*1.5),
                  root.animate.move_to(RIGHT*1.5),
                  child.animate.move_to(LEFT*1.5),
                  run_time=2.0)
        self.wait(1)`}
              </pre>
            </div>
          )}
        </div>

        <div className="widget-footer-bar">
          <span>Engine: {activeEngine === "interactive" ? "HTML5 Canvas / Vector SVG" : "3Blue1Brown Manim Community Edition"}</span>
          <span style={{ cursor: "pointer", color: "var(--tag-blue-text)" }} onClick={() => handleNarrate("AVL trees maintain balance factor within negative one and positive one.")}>
            🔊 Voice Intuition
          </span>
        </div>
      </div>
    </div>
  );
}
