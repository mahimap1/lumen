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

  const noteContentRef = useRef(null);

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
      setTitle(note.title || "");
    }
  }, [note?.id]);

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
      onSaveNote(course?.id || "general", {
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
          <span onClick={onBack} style={{ color: "var(--text-secondary)", cursor: "pointer" }}>
            Sessions
          </span>
          <span style={{ color: "var(--text-tertiary)" }}>/</span>
          <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{title || "Untitled Session"}</span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="notion-btn" onClick={handleSave}>
            <span>💾</span>
            <span>Save Session</span>
          </button>
          <button
            className="notion-btn primary"
            onClick={() => onOpenVisualizer(title || "Session Concept", course?.code || "STEM")}
          >
            <span>⚡</span>
            <span>Visualize Concept</span>
          </button>
        </div>
      </div>

      {/* Note Header */}
      <div className="page-icon-wrapper">📝</div>
      <input
        type="text"
        className="page-title"
        value={title}
        onChange={(e) => {
          const newTitle = e.target.value;
          setTitle(newTitle);
          if (onSaveNote && note) {
            onSaveNote(course?.id || "general", {
              ...note,
              title: newTitle,
              content
            });
          }
        }}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          width: "100%",
          padding: 0
        }}
        placeholder="Session Title"
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
            <span className={`notion-tag ${course?.tagClass || "blue"}`}>
              {note?.topic || "General"}
            </span>
          </div>
        </div>
      </div>

      {/* Helper hint for inline consult */}
      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>💡</span>
        <span>Highlight any word or phrase to consult Lumen for an instant definition or concept visualization.</span>
      </div>

      {/* Note Body with Selection Detection */}
      <div
        ref={noteContentRef}
        onMouseUp={handleMouseUp}
        style={{
          background: "transparent",
          minHeight: "450px",
          color: "var(--text-main)",
          fontSize: "14.5px",
          lineHeight: "1.7",
          paddingBottom: "40px"
        }}
      >
        <textarea
          value={content}
          onChange={(e) => {
            const newContent = e.target.value;
            setContent(newContent);
            if (onSaveNote && note) {
              onSaveNote(course?.id || "general", {
                ...note,
                title,
                content: newContent
              });
            }
          }}
          onMouseUp={handleMouseUp}
          style={{
            width: "100%",
            minHeight: "450px",
            background: "transparent",
            border: "none",
            borderRadius: "4px",
            color: "var(--text-main)",
            fontFamily: "inherit",
            fontSize: "15px",
            lineHeight: "1.8",
            padding: "8px 0",
            resize: "vertical",
            outline: "none"
          }}
          placeholder="Start typing your notes, equations, and thoughts, or highlight text to ask Lumen..."
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
                    onOpenVisualizer(selectedText, course?.code || "STEM");
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
                    onOpenVisualizer(consultResult.term, course?.code || "STEM");
                    setPopoverPos(null);
                  }}
                >
                  🔮 Visualize
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
    </div>
  );
}
