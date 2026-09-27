import React, { useState } from "react";

export default function NewSessionModal({ isOpen, onClose, tracks = [], onCreateSession }) {
  const [selectedType, setSelectedType] = useState("course"); // "course" | "credential" | "skill"
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [isCustomTrack, setIsCustomTrack] = useState(false);
  const [customTrackCode, setCustomTrackCode] = useState("");
  const [customTrackName, setCustomTrackName] = useState("");
  const [sessionTopic, setSessionTopic] = useState("");

  if (!isOpen) return null;

  const filteredTracks = tracks.filter((t) => t.type === selectedType);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sessionTopic.trim()) return;

    let trackId = selectedTrackId;
    let trackCode = "";
    let trackName = "";
    let trackIcon = "📝";
    let tagColor = "blue";

    if (isCustomTrack || !selectedTrackId) {
      trackCode = customTrackCode.trim() || (selectedType === "skill" ? "Skill" : "Course");
      trackName = customTrackName.trim() || trackCode;
      trackId = "track-" + Date.now();
      if (selectedType === "credential") {
        trackIcon = "☁️";
        tagColor = "purple";
      } else if (selectedType === "skill") {
        trackIcon = "🛠️";
        tagColor = "orange";
      } else {
        trackIcon = "📘";
        tagColor = "blue";
      }
    } else {
      const existing = tracks.find((t) => t.id === selectedTrackId);
      if (existing) {
        trackCode = existing.code;
        trackName = existing.name;
        trackIcon = existing.icon;
        tagColor = existing.tagColor || "blue";
      }
    }

    onCreateSession({
      trackId,
      trackCode,
      trackName,
      trackType: selectedType,
      trackIcon,
      tagColor,
      title: sessionTopic.trim(),
      isNewTrack: isCustomTrack || !tracks.some((t) => t.id === trackId)
    });

    // Reset form
    setSessionTopic("");
    setCustomTrackCode("");
    setCustomTrackName("");
    setIsCustomTrack(false);
    onClose();
  };

  return (
    <div className="notion-modal-overlay" onClick={onClose}>
      <div
        className="notion-modal-card"
        style={{ width: "540px", maxWidth: "90vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="notion-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Start New Study Session</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Type Selector Tabs */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              1. What are you studying today?
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                className={`notion-btn ${selectedType === "course" ? "primary" : ""}`}
                style={{ justifyContent: "center", padding: "8px", fontSize: "12.5px" }}
                onClick={() => {
                  setSelectedType("course");
                  setSelectedTrackId(filteredTracks[0]?.id || "");
                  setIsCustomTrack(false);
                }}
              >
                🎓 Course / Class
              </button>
              <button
                type="button"
                className={`notion-btn ${selectedType === "credential" ? "primary" : ""}`}
                style={{ justifyContent: "center", padding: "8px", fontSize: "12.5px" }}
                onClick={() => {
                  setSelectedType("credential");
                  setSelectedTrackId("");
                  setIsCustomTrack(false);
                }}
              >
                📜 Micro-Credential
              </button>
              <button
                type="button"
                className={`notion-btn ${selectedType === "skill" ? "primary" : ""}`}
                style={{ justifyContent: "center", padding: "8px", fontSize: "12.5px" }}
                onClick={() => {
                  setSelectedType("skill");
                  setSelectedTrackId("");
                  setIsCustomTrack(false);
                }}
              >
                🛠️ Skill
              </button>
            </div>
          </div>

          {/* Track Selection */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                2. Select {selectedType === "course" ? "Course" : selectedType === "credential" ? "Credential" : "Skill"}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTrack(!isCustomTrack)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--tag-blue-text)",
                  fontSize: "11.5px",
                  cursor: "pointer"
                }}
              >
                {isCustomTrack ? "← Choose existing" : "+ Add new"}
              </button>
            </div>

            {!isCustomTrack ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {filteredTracks.map((t) => {
                  const isSelected = selectedTrackId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTrackId(t.id)}
                      className="notion-btn"
                      style={{
                        padding: "6px 12px",
                        fontSize: "12.5px",
                        background: isSelected ? "var(--bg-active)" : "var(--bg-callout)",
                        borderColor: isSelected ? "var(--tag-blue-text)" : "var(--border-subtle)",
                        color: isSelected ? "#fff" : "var(--text-secondary)",
                        fontWeight: isSelected ? 600 : 400
                      }}
                    >
                      <span style={{ marginRight: "4px" }}>{t.icon || "📌"}</span>
                      {t.code}
                    </button>
                  );
                })}
                {filteredTracks.length === 0 && (
                  <div style={{ fontSize: "12.5px", color: "var(--text-tertiary)" }}>
                    No {selectedType}s added yet. Click "+ Add new" to create one.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  placeholder={
                    selectedType === "course"
                      ? "e.g. CMSC 421"
                      : selectedType === "credential"
                      ? "e.g. CompTIA Security+"
                      : "e.g. Docker & Kubernetes"
                  }
                  value={customTrackCode}
                  onChange={(e) => setCustomTrackCode(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    color: "var(--text-main)",
                    fontSize: "13px",
                    outline: "none"
                  }}
                  required
                />
              </div>
            )}
          </div>

          {/* Session Topic Name */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              3. Topic or Concept to Master
            </label>
            <input
              type="text"
              placeholder="e.g. RAM, Linked Lists, Matrix Multiplication, Load Balancing..."
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "8px 12px",
                color: "var(--text-main)",
                fontSize: "13.5px",
                outline: "none"
              }}
              autoFocus
              required
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <button
              type="button"
              className="notion-btn"
              onClick={onClose}
              style={{ padding: "6px 14px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="notion-btn primary"
              disabled={!sessionTopic.trim()}
              style={{
                padding: "6px 16px",
                fontSize: "13px",
                opacity: sessionTopic.trim() ? 1 : 0.6
              }}
            >
              Start Session ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
