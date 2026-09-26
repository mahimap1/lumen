import React, { useState } from "react";
import { parseSyllabus } from "../services/api";

export default function AddCourseModal({ isOpen, onClose, onAddCourse }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [parsedData, setParsedData] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!selectedFile && !rawText.trim()) return;

    setIsParsing(true);
    setParseStep(1);

    const stepTimer = setInterval(() => {
      setParseStep((s) => (s < 3 ? s + 1 : s));
    }, 900);

    const data = await parseSyllabus(selectedFile, rawText);
    clearInterval(stepTimer);

    setParsedData(data);
    setIsParsing(false);
    setParseStep(0);
  };

  const handleConfirm = () => {
    if (!parsedData) return;

    // Generate random id and color tag
    const id = (parsedData.code || "course").toLowerCase().replace(/[^a-z0-9]/g, "");
    const tags = ["blue", "green", "orange", "purple"];
    const tagClass = tags[Math.floor(Math.random() * tags.length)];

    const newCourse = {
      id: id || "course_" + Date.now(),
      icon: "📚",
      code: parsedData.code || "NEW 101",
      title: `${parsedData.code || "NEW 101"}: ${parsedData.name || "Untitled Course"}`,
      desc: parsedData.desc || "Imported syllabus via Lumen AI parser.",
      tagClass,
      instructor: parsedData.instructor || "Faculty Staff",
      todos: (parsedData.todos || []).map((t, idx) => ({
        id: `t_${id}_${idx}`,
        text: t.text || t,
        meta: t.meta || "Extracted from syllabus",
        done: false
      })),
      deadlines: (parsedData.deadlines || []).map((d, idx) => ({
        id: `d_${id}_${idx}`,
        title: d.title,
        sub: d.sub || "Assignment",
        due: d.due || "Upcoming",
        color: d.urgent ? "var(--tag-red-text)" : "var(--tag-orange-text)",
        date: d.date || "TBD"
      })),
      notes: (parsedData.notes || []).map((n, idx) => ({
        id: n.id || `note_${id}_${idx}`,
        date: n.date || "Sep 2026",
        title: n.title,
        topic: n.topic || "Core Concept",
        visual: n.visual || "1 Visual",
        content: `# ${n.title}\nCourse: ${parsedData.code}\n\nWeekly Lecture Outline extracted from syllabus schedule.`
      }))
    };

    onAddCourse(newCourse);
    onClose();
  };

  return (
    <div className="notion-modal-overlay" onClick={onClose}>
      <div className="notion-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notion-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📄</span>
            <span>Add Course from Syllabus PDF</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="notion-modal-body">
          {!parsedData ? (
            <>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Upload your course syllabus or schedule PDF. Lumen will use Google Gemini to automatically extract course invariants, upcoming deadlines, and pre-populate your weekly lecture notes.
              </div>

              {/* Upload Drop Area */}
              <div
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "24px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer"
                }}
                onClick={() => document.getElementById("syllabus-file-input").click()}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📥</div>
                <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text-main)" }}>
                  {selectedFile ? selectedFile.name : "Click to select or drag & drop Syllabus PDF"}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  Supports PDF or TXT schedules
                </div>
                <input
                  id="syllabus-file-input"
                  type="file"
                  accept=".pdf,.txt"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>

              {/* Or paste text */}
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Or paste syllabus text & schedule:
                </div>
                <textarea
                  className="modal-input-field"
                  style={{ width: "100%", height: "80px", resize: "none" }}
                  placeholder="e.g. CMSC 421 Operating Systems - Mon/Wed 2pm - Project 1 due Oct 12..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>

              {/* Parsing status indicator */}
              {isParsing && (
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--tag-blue-text)" }}>
                    <div style={{ animation: "spin 1s linear infinite" }}>⚙️</div>
                    <div>
                      {parseStep === 1 && "Parsing PDF document structure & metadata..."}
                      {parseStep === 2 && "Extracting assignment deadlines & exam calendar..."}
                      {parseStep >= 3 && "Synthesizing weekly lecture topics into Notion database..."}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button className="notion-btn" onClick={onClose} disabled={isParsing}>
                  Cancel
                </button>
                <button
                  className="notion-btn primary"
                  onClick={handleParse}
                  disabled={isParsing || (!selectedFile && !rawText.trim())}
                >
                  {isParsing ? "Analyzing Syllabus..." : "✨ Parse with Gemini"}
                </button>
              </div>
            </>
          ) : (
            /* Parsed Review State */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--tag-green-text)", fontSize: "13px", fontWeight: 600 }}>
                <span>✓</span>
                <span>Syllabus successfully ingested! Review extracted structure:</span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  {parsedData.code}: {parsedData.name}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  {parsedData.desc} • {parsedData.instructor}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "6px" }}>
                      Extracted Deadlines ({parsedData.deadlines?.length || 0})
                    </div>
                    {(parsedData.deadlines || []).map((d, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "4px" }}>
                        • {d.title} ({d.due || d.date})
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "6px" }}>
                      Weekly Lecture Notes ({parsedData.notes?.length || 0})
                    </div>
                    {(parsedData.notes || []).map((n, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "4px" }}>
                        • {n.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button className="notion-btn" onClick={() => setParsedData(null)}>
                  Re-upload
                </button>
                <button className="notion-btn primary" onClick={handleConfirm}>
                  Confirm & Ingest Course ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
