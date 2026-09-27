import React from "react";

export default function HomeDashboard({ onStartSession, onOpenWidgets }) {
  return (
    <div className="notion-screen active">
      <div className="page-icon-wrapper">🎓</div>
      <h1 className="page-title">Home</h1>
      <p className="page-description">Welcome to Lumen Workspace.</p>

      {/* Notion Callout Box */}
      <div className="notion-callout" style={{ marginBottom: "28px" }}>
        <div className="notion-callout-icon">💡</div>
        <div>
          <strong>Lumen AI Workspace:</strong> Start an interactive learning session or browse through your visual concept widgets.
        </div>
      </div>

      {/* Quick Access Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        <div
          className="notion-gallery-card"
          onClick={onStartSession}
          style={{ cursor: "pointer", padding: "20px" }}
        >
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
          <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-main)", marginBottom: "4px" }}>
            Sessions
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            Launch a session to start asking questions and analyzing concepts.
          </div>
        </div>

        <div
          className="notion-gallery-card"
          onClick={onOpenWidgets}
          style={{ cursor: "pointer", padding: "20px" }}
        >
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🖼️</div>
          <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-main)", marginBottom: "4px" }}>
            Widgets
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            Browse interactive mathematical widgets and concept visualizations.
          </div>
        </div>
      </div>
    </div>
  );
}
