import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import FourYearPlanView from "./components/FourYearPlanView";
import AlumniPathwaysView from "./components/AlumniPathwaysView";
import VisualArchive from "./components/VisualArchive";
import VisualizerModal from "./components/VisualizerModal";
import NewSessionModal from "./components/NewSessionModal";
import SettingsPane from "./components/SettingsPane";
import LumenOrb from "./components/LumenOrb";
import ChatSessionView from "./components/chat/ChatSessionView";
import { INITIAL_TRACKS, INITIAL_SESSIONS, INITIAL_WIDGETS } from "./data/initialData";
import { MODEL_STORAGE_KEY, readStoredModel } from "./lib/models";

export default function App() {
  const [tracks, setTracks] = useState(() => {
    try {
      const saved = localStorage.getItem("lumen_tracks_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TRACKS;
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("lumen_sessions_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_SESSIONS;
  });

  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem("lumen_widgets_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return []; // Start empty — only Lumen-generated widgets are saved here
  });

  // One-time cleanup: drop chat state saved by older app versions so we start fresh.
  useEffect(() => {
    try {
      if (!localStorage.getItem("lumen_fresh_start_v1")) {
        ["lumen_sessions_v2", "lumen_widgets_v2", "lumen_widgets_v3"].forEach((key) =>
          localStorage.removeItem(key)
        );
        localStorage.setItem("lumen_fresh_start_v1", "1");
      }
    } catch (e) {}
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lumen_sessions_v3", JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem("lumen_tracks_v2", JSON.stringify(tracks));
    } catch (e) {}
  }, [tracks]);

  useEffect(() => {
    try {
      localStorage.setItem("lumen_widgets_v4", JSON.stringify(widgets));
    } catch (e) {}
  }, [widgets]);

  // Model chooser (settings pane): a cheap testing model or a stronger demo model.
  const [model, setModel] = useState(readStoredModel);

  useEffect(() => {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch (e) {}
  }, [model]);

  // Active views: "four-year-plan" | "alumni-pathways" | "widgets" | "session"
  const [activeView, setActiveView] = useState(() => {
    try {
      const saved = localStorage.getItem("lumen_active_view_v1");
      if (saved && saved !== "career") return saved;
    } catch (e) {}
    return "four-year-plan";
  });
  const [selectedSessionId, setSelectedSessionId] = useState(INITIAL_SESSIONS[0]?.id ?? null);

  useEffect(() => {
    try {
      localStorage.setItem("lumen_active_view_v1", activeView);
    } catch (e) {}
  }, [activeView]);

  // Modal states
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newSessionModalConfig, setNewSessionModalConfig] = useState({
    initialType: "course",
    initialTrackId: ""
  });
  const [visualizerModal, setVisualizerModal] = useState({
    isOpen: false,
    concept: "RAM Architecture: SRAM vs DRAM Cell",
    courseCode: "CMSC313"
  });

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentTrack = tracks.find((t) => t.id === currentSession?.trackId);

  const handleUpdateSession = (sessionId, updates) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return { ...s, ...updates };
        }
        return s;
      })
    );
  };

  const handleResetDemo = () => {
    try {
      localStorage.removeItem("lumen_sessions_v3");
      localStorage.removeItem("lumen_tracks_v2");
      localStorage.removeItem("lumen_widgets_v4");
    } catch (e) {}
    setSessions(INITIAL_SESSIONS);
    setTracks(INITIAL_TRACKS);
    setWidgets(INITIAL_WIDGETS);
    setSelectedSessionId(null);
    setActiveView("four-year-plan");
  };

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setActiveView("session");
  };

  const handleOpenNewSessionModal = (prefillTrackId = null, prefillType = "course") => {
    setNewSessionModalConfig({
      initialType: prefillType || "course",
      initialTrackId: prefillTrackId || ""
    });
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
    if (isNewTrack) {
      const newTrackObj = {
        id: trackId,
        code: trackCode,
        name: trackName,
        type: trackType,
        icon: trackIcon || (trackType === "career" ? "💼" : trackType === "skill" ? "🛠️" : "📘"),
        tagColor: tagColor || (trackType === "career" ? "blue" : trackType === "skill" ? "orange" : "blue")
      };
      setTracks((prev) => [...prev, newTrackObj]);
    }

    const newSession = {
      id: `sess-${Date.now()}`,
      trackId,
      title,
      icon: trackType === "career" ? "💼" : trackType === "credential" ? "☁️" : trackType === "skill" ? "🛠️" : "⚡",
      description: `Active study session focusing on ${title} (${trackCode}).`,
      messages: [],
      widgetIds: []
    };

    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setActiveView("session");
  };

  const handleStartLumenSession = (defaultTrackId = null, suggestedTitle = null) => {
    const selectedTrack = tracks.find((t) => t.id === defaultTrackId) || tracks[0];
    const title = suggestedTitle || (selectedTrack ? `${selectedTrack.code} · ${selectedTrack.name}` : "Lumen Study Session");
    const newSession = {
      id: `sess-${Date.now()}`,
      trackId: selectedTrack?.id || tracks[0]?.id || "cmsc313",
      title,
      icon: selectedTrack?.type === "career" ? "💼" : selectedTrack?.type === "skill" ? "🛠️" : "⚡",
      description: `Active study session focusing on ${title}`,
      messages: [],
      widgetIds: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setActiveView("session");
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
      handleStartLumenSession(existing.id, `Study Session: ${existing.code}`);
      return;
    }
    handleStartLumenSession(null, `Study Session: ${courseCode}`);
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
        onResetDemo={handleResetDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
            </div>
          </div>
        )}

        {/* Content Container */}
        <div
          className="notion-content-container"
          style={{
            height: activeView === "session" ? "100vh" : "auto",
            maxHeight: activeView === "session" ? "100vh" : "none",
            display: activeView === "session" ? "flex" : undefined,
            flexDirection: activeView === "session" ? "column" : undefined,
            padding: activeView === "session" ? 0 : activeView === "four-year-plan" ? "24px 32px 60px" : undefined,
            maxWidth: activeView === "session" || activeView === "four-year-plan" || activeView === "alumni-pathways" ? "100%" : undefined,
            width: activeView === "session" || activeView === "four-year-plan" ? "100%" : undefined,
            boxSizing: "border-box",
            overflowX: "hidden"
          }}
        >
          {activeView === "four-year-plan" && (
            <FourYearPlanView onStartSessionFromCourse={handleStartSessionFromCourse} />
          )}

          {activeView === "alumni-pathways" && (
            <AlumniPathwaysView onSelectCredentialOrSkill={handleStartSessionFromCourse} />
          )}

          {activeView === "widgets" && (
            <VisualArchive
              widgets={widgets}
              onOpenVisualizer={handleOpenVisualizer}
              onDeleteWidget={(id) => setWidgets((prev) => prev.filter((w) => w.id !== id))}
            />
          )}

          {activeView === "session" && (
            <ChatSessionView
              session={currentSession}
              track={currentTrack}
              tracks={tracks}
              model={model}
              onOpenVisualizer={handleOpenVisualizer}
              onAddWidget={(newWidget) => setWidgets((prev) => [newWidget, ...prev])}
              onUpdateSession={handleUpdateSession}
            />
          )}
        </div>
      </main>

      {/* Floating Yellow Mascot Orb: Fades out in session view; directly opens session chat window on click */}
      <LumenOrb
        onClick={() => {
          if (sessions.length === 0) {
            handleStartLumenSession();
          } else {
            if (!selectedSessionId) {
              setSelectedSessionId(sessions[0].id);
            }
            setActiveView("session");
          }
        }}
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
        initialType={newSessionModalConfig.initialType}
        initialTrackId={newSessionModalConfig.initialTrackId}
        onCreateSession={handleCreateSession}
      />

      {/* Pane: Settings (model chooser) */}
      <SettingsPane
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        model={model}
        onModelChange={setModel}
      />
    </div>
  );
}
