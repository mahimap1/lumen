import React, { useState, useEffect } from "react";
import { generateHtmlWidget, generateManimClip, narrateConcept } from "../services/api";

export default function StudyRoom({
  courses,
  initialCourseId = "cmsc341",
  onOpenVisualizer
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [rightTab, setRightTab] = useState("visualizer"); // "visualizer" or "reference"
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState(null);
  const [activeEngine, setActiveEngine] = useState("html"); // "html" or "manim"
  const [manimData, setManimData] = useState(null);

  // Focus Timer state (25 minutes)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Scratchpad content
  const [scratchpad, setScratchpad] = useState(
    `# Deep Work Session Notes\nCourse: ${courses[selectedCourseId]?.code || "CMSC 341"}\n\nKey Concepts to Master:\n1. Self-balancing invariants\n2. Time complexity guarantees O(log N)\n3. Double rotation edge cases (LR, RL)\n\nQuestions for Lumen:\n- Why does double rotation take two single rotations instead of one specialized pivot?\n- How does cache locality compare between AVL and Red-Black trees?`
  );

  useEffect(() => {
    let interval = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    setIsGenerating(true);
    const courseCode = courses[selectedCourseId]?.code || "STEM";

    if (activeEngine === "html") {
      const html = await generateHtmlWidget(promptText.trim(), courseCode);
      setGeneratedHtml(html);
      setManimData(null);
    } else {
      const data = await generateManimClip(promptText.trim(), courseCode);
      setManimData(data);
      setGeneratedHtml(null);
    }

    setIsGenerating(false);
  };

  const activeCourse = courses[selectedCourseId] || Object.values(courses)[0];

  return (
    <div className="notion-screen active" style={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      {/* Session Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "14px",
          marginBottom: "16px",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="page-icon-wrapper" style={{ fontSize: "28px", margin: 0 }}>⏱️</div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-main)" }}>
              Deep Focus Study Room
            </h2>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Split-screen active recall workspace with inline concept visualizer.
            </div>
          </div>
        </div>

        {/* Course dropdown & Pomodoro Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setScratchpad(
                `# Study Notes: ${courses[e.target.value]?.code}\n\nGoal: Synthesize lecture invariants and test with interactive sandbox.`
              );
            }}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              color: "var(--text-main)",
              padding: "5px 10px",
              fontSize: "12.5px",
              outline: "none"
            }}
          >
            {Object.values(courses).map((c) => (
              <option key={c.id} value={c.id} style={{ background: "#202020" }}>
                {c.code}: {c.title.split(":")[1] || c.title}
              </option>
            ))}
          </select>

          {/* Pomodoro Timer Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-subtle)",
              padding: "4px 10px",
              borderRadius: "4px"
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace", color: timerRunning ? "var(--tag-green-text)" : "var(--text-main)" }}>
              {formatTimer(secondsLeft)}
            </span>
            <button
              className="notion-btn"
              style={{ fontSize: "11px", padding: "2px 6px" }}
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button
              className="notion-btn"
              style={{ fontSize: "11px", padding: "2px 6px" }}
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(25 * 60);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Split Focus Container */}
      <div className="study-split-container">
        {/* Left Pane: Active Editor / Scratchpad */}
        <div className="study-pane-card">
          <div className="pane-tab-header">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>✍️</span>
              <span>Active Study Scratchpad</span>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
              {scratchpad.split(/\s+/).filter(Boolean).length} words • Auto-saved
            </span>
          </div>

          <textarea
            className="study-editor-textarea"
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            placeholder="Type notes, summarize lecture concepts, or formulate questions..."
          />
        </div>

        {/* Right Pane: AI Visualizer or Reference Material */}
        <div className="study-pane-card">
          <div className="pane-tab-header">
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="notion-btn"
                style={{
                  fontSize: "12px",
                  padding: "2px 8px",
                  background: rightTab === "visualizer" ? "rgba(255,255,255,0.1)" : "transparent"
                }}
                onClick={() => setRightTab("visualizer")}
              >
                <span>⚡</span>
                <span>Lumen Visual Sandbox</span>
              </button>
              <button
                className="notion-btn"
                style={{
                  fontSize: "12px",
                  padding: "2px 8px",
                  background: rightTab === "reference" ? "rgba(255,255,255,0.1)" : "transparent"
                }}
                onClick={() => setRightTab("reference")}
              >
                <span>📄</span>
                <span>Course Reference</span>
              </button>
            </div>

            {rightTab === "visualizer" && (
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  className={`notion-btn ${activeEngine === "html" ? "primary" : ""}`}
                  style={{ fontSize: "10.5px", padding: "2px 6px" }}
                  onClick={() => setActiveEngine("html")}
                >
                  HTML/SVG
                </button>
                <button
                  className={`notion-btn ${activeEngine === "manim" ? "primary" : ""}`}
                  style={{ fontSize: "10.5px", padding: "2px 6px" }}
                  onClick={() => setActiveEngine("manim")}
                >
                  3b1b Manim
                </button>
              </div>
            )}
          </div>

          {rightTab === "visualizer" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Visual Canvas Area */}
              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-main)"
                }}
              >
                {isGenerating ? (
                  <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                    <div style={{ fontSize: "28px", marginBottom: "10px", animation: "spin 1.5s linear infinite" }}>
                      ⚙️
                    </div>
                    <div>Synthesizing {activeEngine === "manim" ? "3Blue1Brown Manim script" : "minimalist interactive visual"}...</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                      Enforcing invariant balance equations & geometric clarity
                    </div>
                  </div>
                ) : generatedHtml ? (
                  <div
                    style={{ width: "100%", height: "100%" }}
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  />
                ) : manimData ? (
                  <div style={{ width: "100%", maxWidth: "540px", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                      <span style={{ color: "var(--tag-purple-text)", fontWeight: 600 }}>
                        {manimData.concept}
                      </span>
                      <button
                        className="notion-btn"
                        style={{ fontSize: "11px", padding: "2px 6px" }}
                        onClick={() => narrateConcept(manimData.description)}
                      >
                        🔊 Narrate
                      </button>
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      {manimData.description}
                    </div>
                    <pre
                      style={{
                        background: "#111",
                        padding: "14px",
                        borderRadius: "6px",
                        color: "#50fa7b",
                        fontSize: "11px",
                        overflowX: "auto",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      {manimData.manim_code}
                    </pre>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-tertiary)", maxWidth: "340px" }}>
                    <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.8 }}>🔮</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-main)", marginBottom: "6px" }}>
                      Interactive Concept Sandbox
                    </div>
                    <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
                      Enter any STEM concept or equation below to generate an interactive minimalist widget or 3Blue1Brown mathematical animation.
                    </div>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "14px", flexWrap: "wrap" }}>
                      <span
                        className="notion-tag blue"
                        style={{ cursor: "pointer", fontSize: "11px" }}
                        onClick={() => {
                          setPromptText("Eigenvector Coordinate Transformation");
                        }}
                      >
                        Eigenvectors
                      </span>
                      <span
                        className="notion-tag green"
                        style={{ cursor: "pointer", fontSize: "11px" }}
                        onClick={() => {
                          setPromptText("BFS vs DFS Frontiers");
                        }}
                      >
                        BFS vs DFS
                      </span>
                      <span
                        className="notion-tag orange"
                        style={{ cursor: "pointer", fontSize: "11px" }}
                        onClick={() => {
                          setPromptText("AVL Left-Right Rotation");
                        }}
                      >
                        AVL Trees
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt Input Bottom Bar */}
              <form onSubmit={handleGenerate} className="study-prompt-bottom">
                <input
                  type="text"
                  className="study-prompt-input"
                  placeholder="Ask Lumen to visualize concept (e.g., AVL tree rotation, Eigenvalues)..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                />
                <button
                  type="submit"
                  className="notion-btn primary"
                  disabled={isGenerating || !promptText.trim()}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {isGenerating ? "Rendering..." : "Visualize"}
                </button>
              </form>
            </div>
          ) : (
            <div className="study-doc-content">
              <h3 style={{ fontSize: "15px", color: "var(--text-main)", marginBottom: "8px" }}>
                {activeCourse.title}
              </h3>
              <p style={{ marginBottom: "16px", fontSize: "13px" }}>{activeCourse.desc}</p>

              <h4 style={{ fontSize: "13px", color: "var(--text-main)", margin: "16px 0 8px" }}>
                Upcoming Deliverables
              </h4>
              {(activeCourse.deadlines || []).map((d) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-main)" }}>{d.title}</span>
                  <span style={{ color: d.color || "var(--tag-orange-text)" }}>{d.due}</span>
                </div>
              ))}

              <h4 style={{ fontSize: "13px", color: "var(--text-main)", margin: "20px 0 8px" }}>
                Course Invariants & Core Topics
              </h4>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {(activeCourse.notes || []).map((n) => (
                  <li key={n.id}>
                    <strong>{n.title}:</strong> {n.topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
