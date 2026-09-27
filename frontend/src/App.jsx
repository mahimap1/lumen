import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import FourYearPlanView from "./components/FourYearPlanView";
import AlumniPathwaysView from "./components/AlumniPathwaysView";
import VisualArchive from "./components/VisualArchive";
import SessionView from "./components/SessionView";
import VisualizerModal from "./components/VisualizerModal";
import LumenPanel from "./components/LumenPanel";
import CareerDashboard from "./components/CareerDashboard";
import NewSessionModal from "./components/NewSessionModal";
import { INITIAL_TRACKS, INITIAL_SESSIONS, INITIAL_WIDGETS } from "./data/initialData";

const LUMEN_PANEL_WIDTH = 300;

export default function App() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS);

  // Active views: "four-year-plan" | "alumni-pathways" | "widgets" | "session" | "career"
  const [activeView, setActiveView] = useState("session");
  const [selectedSessionId, setSelectedSessionId] = useState(INITIAL_SESSIONS[0]?.id || "cmsc313-ram");

  // Lumen assistant panel
  const [isLumenOpen, setIsLumenOpen] = useState(true);

  // Modal states
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [visualizerModal, setVisualizerModal] = useState({
    isOpen: false,
    concept: "RAM Architecture: SRAM vs DRAM Cell",
    courseCode: "CMSC313"
  });

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentTrack = tracks.find((t) => t.id === currentSession?.trackId);

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setActiveView("session");
    setIsLumenOpen(true);
  };

  const handleOpenNewSessionModal = (prefillTrackId = null) => {
    setIsNewSessionModalOpen(true);
  };

  const handleCreateSession = ({
    trackId,
    trackCode,
    trackName,
    trackType,
    trackIcon,
    tagColor,
    title,
    isNewTrack
  }) => {
    let finalTrackId = trackId;

    if (isNewTrack) {
      const newTrackObj = {
        id: trackId,
        code: trackCode,
        name: trackName,
        type: trackType,
        icon: trackIcon || "📌",
        tagColor: tagColor || "blue"
      };
      setTracks((prev) => [...prev, newTrackObj]);
    }

    const newSessionId = `sess-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      trackId: finalTrackId,
      title: title,
      icon: trackType === "credential" ? "☁️" : trackType === "skill" ? "🛠️" : "⚡",
      description: `Active study session focusing on ${title} (${trackCode}).`,
      notes: `## Study Session: ${title} (${trackCode})
- Initialized on ${new Date().toLocaleDateString()}.
- Focus: Concept mechanics, key invariants, and problem analysis.`,
      widgetIds: []
    };

    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSessionId);
    setActiveView("session");
    setIsLumenOpen(true);
  };

  const handleStartSessionFromCourse = (courseCode) => {
    // Check if course exists in tracks
    const existing = tracks.find(
      (t) => t.code.toLowerCase().replace(/\s+/g, "") === courseCode.toLowerCase().replace(/\s+/g, "")
    );
    if (existing) {
      const existingSession = sessions.find((s) => s.trackId === existing.id);
      if (existingSession) {
        handleSelectSession(existingSession.id);
        return;
      }
    }
    setIsNewSessionModalOpen(true);
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
        tracks={tracks}
        sessions={sessions}
        widgetsCount={widgets.length}
        activeView={activeView}
        selectedSessionId={selectedSessionId}
        onNavigate={handleNavigate}
        onOpenNewSessionModal={handleOpenNewSessionModal}
        onSelectSession={handleSelectSession}
      />

      {/* Main Content Area */}
      <main
        className="notion-main"
        style={{ marginRight: panelOffset, transition: "margin-right 0.2s ease" }}
      >
        {/* Sticky Topbar with Breadcrumbs */}
        <div className="notion-topbar">
          <div className="breadcrumbs">
            <span
              onClick={() => handleNavigate("four-year-plan")}
              style={{ fontWeight: 600, color: "var(--text-main)" }}
            >
              ✨ Lumen
            </span>
            <span>/</span>
            {activeView === "four-year-plan" && <span>Four Year Plan</span>}
            {activeView === "alumni-pathways" && <span>Alumni Pathways</span>}
            {activeView === "widgets" && <span>Widgets</span>}
            {activeView === "career" && <span>Career Pathways & ROI</span>}
            {activeView === "session" && (
              <>
                <span onClick={() => handleNavigate("four-year-plan")} style={{ cursor: "pointer" }}>
                  Sessions
                </span>
                <span>/</span>
                {currentTrack && (
                  <>
                    <span style={{ color: "var(--text-secondary)" }}>{currentTrack.code}</span>
                    <span>/</span>
                  </>
                )}
                <span>{currentSession?.title || "Study Session"}</span>
              </>
            )}
          </div>

          {/* Toggle Lumen panel button */}
          <button
            onClick={() => setIsLumenOpen((prev) => !prev)}
            title={isLumenOpen ? "Close Lumen AI" : "Open Lumen AI"}
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
              transition: "all 0.15s ease"
            }}
          >
            <span style={{ fontSize: "14px" }}>✨</span>
            <span>Lumen</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="notion-content-container">
          {activeView === "four-year-plan" && (
            <FourYearPlanView onStartSessionFromCourse={handleStartSessionFromCourse} />
          )}

          {activeView === "alumni-pathways" && (
            <AlumniPathwaysView onSelectCredentialOrSkill={handleStartSessionFromCourse} />
          )}

          {activeView === "widgets" && (
            <VisualArchive widgets={widgets} onOpenVisualizer={handleOpenVisualizer} />
          )}

          {activeView === "session" && (
            <SessionView
              session={currentSession}
              track={currentTrack}
              widgets={widgets}
              onOpenVisualizer={handleOpenVisualizer}
            />
          )}

          {activeView === "career" && <CareerDashboard />}
        </div>
      </main>

      {/* Right AI Assistant Panel */}
      <LumenPanel isOpen={isLumenOpen} onClose={() => setIsLumenOpen(false)} />

      {/* Modal: Interactive Concept Visualizer */}
      <VisualizerModal
        isOpen={visualizerModal.isOpen}
        concept={visualizerModal.concept}
        courseCode={visualizerModal.courseCode}
        onClose={() => setVisualizerModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modal: Start New Study Session */}
      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        tracks={tracks}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}
