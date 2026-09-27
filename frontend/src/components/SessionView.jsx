import React from "react";

export default function SessionView({ session }) {
  return (
    <div className="notion-screen active" style={{ minHeight: "80vh" }}>
      {/* Page placeholder — notes/content will go here */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "55vh",
          textAlign: "center",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "28px" }}>{session?.icon || "📝"}</div>
        <p style={{ color: "var(--text-main)", fontSize: "20px", fontWeight: 600 }}>
          {session?.title || "Session #1"}
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "13.5px", maxWidth: "340px", lineHeight: 1.6 }}>
          This is your session workspace. Notes, highlights, and content will appear here.
        </p>
      </div>
    </div>
  );
}
