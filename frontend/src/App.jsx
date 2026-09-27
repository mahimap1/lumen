import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import FourYearPlanView from "./components/FourYearPlanView";
import AlumniPathwaysView from "./components/AlumniPathwaysView";
import VisualArchive from "./components/VisualArchive";
import VisualizerModal from "./components/VisualizerModal";
import CareerDashboard from "./components/CareerDashboard";
import NewSessionModal from "./components/NewSessionModal";
import LumenOrb from "./components/LumenOrb";
import ChatSessionView from "./components/chat/ChatSessionView";
import { createSession as createBackboardSession } from "./services/api";
import { INITIAL_TRACKS, INITIAL_SESSIONS, INITIAL_WIDGETS } from "./data/initialData";

export default function App() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS);

  // Active views: "four-year-plan" | "alumni-pathways" | "widgets" | "session" | "career"
  const [activeView, setActiveView] = useState("session");
  const [selectedSessionId, setSelectedSessionId] = useState(INITIAL_SESSIONS[0]?.id || "cmsc313-ram");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

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
  };

  const handleOpenNewSessionModal = (prefillTrackId = null) => {
    setIsNewSessionModalOpen(true);
  };

  const handleCreateSession = async ({
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

    const tempSessionId = `sess-${Date.now()}`;
    const newSession = {
      id: tempSessionId,
      trackId: finalTrackId,
      title: title,
      icon: trackType === "credential" ? "☁️" : trackType === "skill" ? "🛠️" : "⚡",
      description: `Active study session focusing on ${title} (${trackCode}).`,
      messages: [],
      widgetIds: []
    };

    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(tempSessionId);
    setActiveView("session");

    // Asynchronously create Backboard thread and attach thread_id
    try {
      const bbSession = await createBackboardSession(title);
      if (bbSession?.thread_id) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === tempSessionId ? { ...s, thread_id: bbSession.thread_id } : s
          )
        );
      }
    } catch (e) {
      console.warn("Backboard thread creation deferred to first message:", e);
    }
  };

  const handleStartLumenSession = async (suggestedTitle = "Lumen Study Session") => {
    setIsCreatingSession(true);
    try {
      const sessionData = await createBackboardSession(suggestedTitle);
      const newSessionId = sessionData.thread_id || `sess-${Date.now()}`;
      const newSession = {
        id: newSessionId,
        thread_id: sessionData.thread_id,
        trackId: tracks[0]?.id || "cmsc-core",
        title: suggestedTitle,
        icon: "⚡",
        description: "Active conversational study thread with Backboard persistent memory",
        messages: [],
        widgetIds: []
      };
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSessionId(newSessionId);
      setActiveView("session");
    } catch (err) {
      console.error("Error creating Lumen session:", err);
    } finally {
      setIsCreatingSession(false);
    }
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
    handleStartLumenSession(`Study Session: ${courseCode}`);
  };

  const handleOpenVisualizer = (concept, courseCode = "STEM") => {
    setVisualizerModal({
      isOpen: true,
      concept: concept || "Concept Invariant",
      courseCode: courseCode || "STEM"
    });
  };

  return (
    <div className="app-shell relative">
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
      <main className="notion-main">
        {/* Sticky Topbar with Breadcrumbs (hidden in session view for clean full-height chat) */}
        {activeView !== "session" && (
          <div className="notion-topbar">
            <div className="breadcrumbs">
              <span
                onClick={() => handleNavigate("four-year-plan")}
                style={{ fontWeight: 600, color: "var(--text-main)", cursor: "pointer" }}
              >
                Lumen Workspace
              </span>
              <span>/</span>
              {activeView === "four-year-plan" && <span>Four Year Plan</span>}
              {activeView === "alumni-pathways" && <span>Alumni Pathways</span>}
              {activeView === "widgets" && <span>Widgets</span>}
              {activeView === "career" && <span>Career Pathways & ROI</span>}
            </div>
          </div>
        )}

        {/* Content Container */}
        <div
          className="notion-content-container"
          style={{
            height: activeView === "session" ? "100vh" : "auto",
            padding: activeView === "session" ? 0 : undefined,
          }}
        >
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
            <ChatSessionView
              session={currentSession}
              track={currentTrack}
              onOpenVisualizer={handleOpenVisualizer}
              onAddWidget={(newWidget) => setWidgets((prev) => [newWidget, ...prev])}
            />
          )}

          {activeView === "career" && <CareerDashboard />}
        </div>
      </main>

      {/* Floating Yellow Orb: Fades out in session view and anchors to the left of messages */}
      <LumenOrb
        onClick={() => handleStartLumenSession()}
        isCreating={isCreatingSession}
        isHidden={activeView === "session"}
      />

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
