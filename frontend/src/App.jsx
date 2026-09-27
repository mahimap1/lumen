import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import HomeDashboard from "./components/HomeDashboard";
import SessionView from "./components/SessionView";
import VisualArchive from "./components/VisualArchive";
import VisualizerModal from "./components/VisualizerModal";
import LumenPanel from "./components/LumenPanel";
import CareerDashboard from "./components/CareerDashboard";
import { INITIAL_COURSES, INITIAL_SESSIONS } from "./data/initialData";

const LUMEN_PANEL_WIDTH = 300;

export default function App() {
  const [courses] = useState(INITIAL_COURSES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [activeView, setActiveView] = useState("session"); // "session" | "home" | "widgets"
  const [selectedSessionId, setSelectedSessionId] = useState(INITIAL_SESSIONS[0]?.id || "session-1");

  // Lumen panel — open by default in session view
  const [isLumenOpen, setIsLumenOpen] = useState(true);

  const [visualizerModal, setVisualizerModal] = useState({
    isOpen: false,
    concept: "AVL Tree Left-Right Double Rotation",
    courseCode: "CMSC 341"
  });

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setActiveView("session");
    setIsLumenOpen(true);
  };

  const handleAddSession = () => {
    const nextNum = sessions.length + 1;
    const newId = "session-" + Date.now();
    setSessions((prev) => [{ id: newId, icon: "📝", title: `Session #${nextNum}` }, ...prev]);
    setSelectedSessionId(newId);
    setActiveView("session");
    setIsLumenOpen(true);
  };

  const handleOpenVisualizer = (concept, courseCode = "STEM") => {
    setVisualizerModal({
      isOpen: true,
      concept: concept || "Concept Invariant",
      courseCode: courseCode || "STEM"
    });
  };

  const panelOffset = isLumenOpen ? LUMEN_PANEL_WIDTH : 0;

  return (
    <div className="app-shell">
      {/* Left Navigation Sidebar */}
      <Sidebar
        sessions={sessions}
        activeView={activeView}
        selectedSessionId={selectedSessionId}
        onNavigate={handleNavigate}
        onAddSession={handleAddSession}
        onSelectSession={handleSelectSession}
      />

      {/* Main Content Area — shrinks to make room for Lumen panel */}
      <main
        className="notion-main"
        style={{ marginRight: panelOffset, transition: "margin-right 0.2s ease" }}
      >
        {/* Sticky Topbar */}
        <div className="notion-topbar">
          <div className="breadcrumbs">
            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>✨ Lumen</span>
            <span>/</span>
            {activeView === "home" && <span>Home</span>}
            {activeView === "career" && <span>Career Pathways & Degree ROI</span>}
            {activeView === "session" && (
              <>
                <span onClick={() => handleNavigate("home")} style={{ cursor: "pointer" }}>
                  Sessions
                </span>
                <span>/</span>
                <span>{currentSession?.title || "Session #1"}</span>
              </>
            )}
            {(activeView === "widgets" || activeView === "archive") && <span>Widgets</span>}
          </div>

          {/* Toggle Lumen panel from topbar */}
          <button
            onClick={() => setIsLumenOpen((prev) => !prev)}
            title={isLumenOpen ? "Close Lumen" : "Open Lumen"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12.5px",
              color: isLumenOpen ? "var(--text-main)" : "var(--text-secondary)",
              background: isLumenOpen ? "var(--bg-active)" : "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "4px 10px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: "14px" }}>✨</span>
            <span>Lumen</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="notion-content-container">
          {activeView === "home" && (
            <HomeDashboard
              onStartSession={() => handleSelectSession(sessions[0]?.id || "session-1")}
              onOpenWidgets={() => setActiveView("widgets")}
            />
          )}

          {activeView === "career" && (
            <CareerDashboard />
          )}

          {activeView === "session" && (
            <SessionView
              session={currentSession}
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}

          {(activeView === "widgets" || activeView === "archive") && (
            <VisualArchive
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}
        </div>
      </main>

      {/* Lumen Right Panel */}
      <LumenPanel
        isOpen={isLumenOpen}
        onClose={() => setIsLumenOpen(false)}
      />

      {/* Modal: Visualizer */}
      <VisualizerModal
        isOpen={visualizerModal.isOpen}
        concept={visualizerModal.concept}
        courseCode={visualizerModal.courseCode}
        onClose={() => setVisualizerModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
