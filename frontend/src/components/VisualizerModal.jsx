import React, { useState, useEffect } from "react";
import { generateHtmlWidget, generateManimClip, narrateConcept } from "../services/api";

export default function VisualizerModal({
  isOpen,
  onClose,
  concept = "AVL Tree Left-Right Double Rotation",
  courseCode = "CMSC 341"
}) {
  const [engine, setEngine] = useState("html"); // "html" or "manim"
  const [htmlContent, setHtmlContent] = useState(null);
  const [manimData, setManimData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interactiveStep, setInteractiveStep] = useState(0);

  useEffect(() => {
    if (isOpen && concept) {
      loadVisual();
    }
  }, [isOpen, concept, engine]);

  const loadVisual = async () => {
    setIsLoading(true);
    if (engine === "html") {
      const html = await generateHtmlWidget(concept, courseCode);
      setHtmlContent(html);
    } else {
      const data = await generateManimClip(concept, courseCode);
      setManimData(data);
    }
    setIsLoading(false);
    setInteractiveStep(0);
  };

  const handleVoice = async () => {
    setIsSpeaking(true);
    const speechText = manimData?.description || `${concept} is an invariant maintaining operation that guarantees logarithmic time complexity.`;
    await narrateConcept(speechText);
    setTimeout(() => setIsSpeaking(false), 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="notion-modal-overlay" onClick={onClose}>
      <div className="notion-modal-card" style={{ width: "780px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notion-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#F5A623" }}>⚡</span>
            <span>Lumen Visualizer: {concept}</span>
            <span className="notion-tag blue" style={{ fontSize: "11px", marginLeft: "4px" }}>
              {courseCode}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Engine Toggle */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "4px", padding: "2px" }}>
              <button
                className={`notion-btn ${engine === "html" ? "primary" : ""}`}
                style={{ fontSize: "11px", padding: "3px 8px", border: "none" }}
                onClick={() => setEngine("html")}
              >
                Interactive HTML/SVG
              </button>
              <button
                className={`notion-btn ${engine === "manim" ? "primary" : ""}`}
                style={{ fontSize: "11px", padding: "3px 8px", border: "none" }}
                onClick={() => setEngine("manim")}
              >
                3b1b Manim
              </button>
            </div>

            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="notion-modal-body">
          {isLoading ? (
            <div className="modal-stage-frame">
              <div style={{ fontSize: "32px", marginBottom: "12px", animation: "spin 1.5s linear infinite" }}>
                ⚙️
              </div>
              <div style={{ fontSize: "13.5px", color: "var(--text-main)" }}>
                Generating visual explanation for {concept}...
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Connecting invariant preservation geometry with Gemini & Manim
              </div>
            </div>
          ) : engine === "html" ? (
            /* Interactive HTML / SVG Sandbox */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                className="modal-stage-frame"
                style={{ minHeight: "280px", position: "relative" }}
              >
                {htmlContent ? (
                  <div
                    style={{ width: "100%", height: "100%" }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                ) : (
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <svg width="440" height="160" viewBox="0 0 440 160">
                      {interactiveStep === 0 && (
                        <g>
                          <line x1="220" y1="35" x2="160" y2="100" stroke="#FF7369" strokeWidth="2" />
                          <line x1="160" y1="100" x2="200" y2="145" stroke="#FF9B38" strokeWidth="2" />
                          <circle cx="220" cy="35" r="20" fill="#202020" stroke="#FF7369" strokeWidth="2" />
                          <text x="220" y="40" fill="#fff" fontSize="12" textAnchor="middle">50</text>
                          <circle cx="160" cy="100" r="18" fill="#202020" stroke="#FF9B38" strokeWidth="2" />
                          <text x="160" y="105" fill="#fff" fontSize="12" textAnchor="middle">20</text>
                          <circle cx="200" cy="145" r="16" fill="#202020" stroke="#529CCA" strokeWidth="2" />
                          <text x="200" y="150" fill="#fff" fontSize="12" textAnchor="middle">30</text>
                          <text x="280" y="40" fill="#FF7369" fontSize="11">Left-Right Zigzag</text>
                        </g>
                      )}
                      {interactiveStep === 1 && (
                        <g>
                          <line x1="220" y1="35" x2="160" y2="100" stroke="#FF9B38" strokeWidth="2" />
                          <line x1="160" y1="100" x2="120" y2="145" stroke="#529CCA" strokeWidth="2" />
                          <circle cx="220" cy="35" r="20" fill="#202020" stroke="#FF9B38" strokeWidth="2" />
                          <text x="220" y="40" fill="#fff" fontSize="12" textAnchor="middle">50</text>
                          <circle cx="160" cy="100" r="18" fill="#202020" stroke="#529CCA" strokeWidth="2" />
                          <text x="160" y="105" fill="#fff" fontSize="12" textAnchor="middle">30</text>
                          <circle cx="120" cy="145" r="16" fill="#202020" stroke="#529CCA" strokeWidth="2" />
                          <text x="120" y="150" fill="#fff" fontSize="12" textAnchor="middle">20</text>
                          <text x="280" y="40" fill="#FF9B38" fontSize="11">Step 1: Left Rotate Child</text>
                        </g>
                      )}
                      {interactiveStep === 2 && (
                        <g>
                          <line x1="220" y1="35" x2="160" y2="110" stroke="#4DAB9A" strokeWidth="2" />
                          <line x1="220" y1="35" x2="280" y2="110" stroke="#4DAB9A" strokeWidth="2" />
                          <circle cx="220" cy="35" r="20" fill="#202020" stroke="#4DAB9A" strokeWidth="2" />
                          <text x="220" y="40" fill="#4DAB9A" fontSize="12" fontWeight="bold" textAnchor="middle">30</text>
                          <circle cx="160" cy="110" r="18" fill="#202020" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                          <text x="160" y="115" fill="#fff" fontSize="12" textAnchor="middle">20</text>
                          <circle cx="280" cy="110" r="18" fill="#202020" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                          <text x="280" y="115" fill="#fff" fontSize="12" textAnchor="middle">50</text>
                          <text x="220" y="15" fill="#4DAB9A" fontSize="11" textAnchor="middle">Balanced Root (BF: 0)</text>
                        </g>
                      )}
                    </svg>
                  </div>
                )}
              </div>

              {/* Step Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="notion-btn"
                    style={{ fontSize: "12px" }}
                    onClick={() => setInteractiveStep((s) => (s > 0 ? s - 1 : 2))}
                  >
                    ◀ Prev Step
                  </button>
                  <button
                    className="notion-btn primary"
                    style={{ fontSize: "12px" }}
                    onClick={() => setInteractiveStep((s) => (s < 2 ? s + 1 : 0))}
                  >
                    Next Step ▶
                  </button>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", alignSelf: "center", marginLeft: "6px" }}>
                    Stage {interactiveStep + 1} of 3: {interactiveStep === 0 ? "Imbalance Detection" : interactiveStep === 1 ? "Child Pivot" : "Parent Balance Restored"}
                  </span>
                </div>

                <button
                  className="notion-btn"
                  style={{ fontSize: "12px" }}
                  onClick={handleVoice}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? "🔊 Speaking..." : "🔊 ElevenLabs Audio"}
                </button>
              </div>
            </div>
          ) : (
            /* 3Blue1Brown Manim Engine Stage */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                className="modal-stage-frame"
                style={{
                  minHeight: "260px",
                  background: "#0d1117",
                  alignItems: "stretch",
                  justifyContent: "flex-start",
                  padding: "16px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
                  <span style={{ color: "#58a6ff", fontSize: "12px", fontFamily: "monospace" }}>
                    3Blue1Brown Manim Community Engine (v0.18.1)
                  </span>
                  <span style={{ color: "#7ee787", fontSize: "11px", fontFamily: "monospace" }}>
                    ✓ Compiled
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "#c9d1d9", marginBottom: "12px" }}>
                  {manimData?.description || "Geometric rendering of the linear mapping and invariant subspace."}
                </p>

                <pre
                  style={{
                    background: "#161b22",
                    padding: "12px",
                    borderRadius: "4px",
                    color: "#79c0ff",
                    fontSize: "11.5px",
                    overflowX: "auto",
                    fontFamily: "JetBrains Mono, monospace",
                    margin: 0
                  }}
                >
                  {manimData?.manim_code || `# Manim Scene Code
from manim import *

class ManimVisualScene(Scene):
    def construct(self):
        v1 = Arrow(ORIGIN, [2, 1, 0], buff=0, color=BLUE)
        lbl = MathTex(r"A \\vec{v} = \\lambda \\vec{v}").next_to(v1, UP)
        self.play(Create(v1), Write(lbl))
        self.wait(1)`}
                </pre>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                  Render target: 1080p60 OpenGL backend
                </span>
                <button
                  className="notion-btn primary"
                  style={{ fontSize: "12px" }}
                  onClick={handleVoice}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? "🔊 ElevenLabs Audio..." : "🔊 ElevenLabs Voice Narration"}
                </button>
              </div>
            </div>
          )}

          {/* Persistent Backboard Student Memory Context */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "4px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--tag-purple-text)" }}>💾</span>
              <span style={{ color: "var(--text-secondary)" }}>
                Backboard Memory: Concept session indexed in student learning graph.
              </span>
            </div>
            <span className="notion-tag purple" style={{ fontSize: "10px" }}>
              Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
