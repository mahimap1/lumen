import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";

export default function ChatSidebar({
  isOpen,
  onClose,
  courses,
  onExecuteAction
}) {
  const [messages, setMessages] = useState([
    {
      id: "m_welcome",
      role: "assistant",
      content:
        "Hello! I'm Lumen, your academic co-pilot. I can answer conceptual questions about your courses or execute actions directly in your workspace—like adding deadlines, creating tasks, or starting a focus study session.",
      action: null
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: "m_" + Date.now(),
      role: "user",
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(text, courses, messages);
      const assistantMsg = {
        id: "m_ai_" + Date.now(),
        role: "assistant",
        content: response.reply,
        action: response.action
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If Gemini returned an executable action, trigger the app handler
      if (response.action && onExecuteAction) {
        onExecuteAction(response.action);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "m_err_" + Date.now(),
          role: "assistant",
          content: "Sorry, I ran into an issue connecting to the reasoning service. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    handleSend(preset);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "390px",
        maxWidth: "92vw",
        height: "100vh",
        background: "var(--bg-sidebar)",
        borderLeft: "1px solid var(--border-subtle)",
        boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.5)",
        zIndex: 95,
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="workspace-avatar" style={{ background: "#2EAADC" }}>L</div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-main)" }}>
              Lumen Assistant
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-tertiary)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4DAB9A" }}></span>
              <span>Gemini 3.5 Flash Lite • Action Agent</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px"
          }}
          title="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginBottom: "3px",
                padding: "0 4px"
              }}
            >
              {m.role === "user" ? "You" : "Lumen"}
            </div>

            <div
              style={{
                maxWidth: "88%",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                lineHeight: "1.5",
                background:
                  m.role === "user"
                    ? "rgba(46, 170, 220, 0.15)"
                    : "rgba(255, 255, 255, 0.04)",
                border:
                  m.role === "user"
                    ? "1px solid rgba(46, 170, 220, 0.3)"
                    : "1px solid var(--border-subtle)",
                color: "var(--text-main)",
                whiteSpace: "pre-wrap"
              }}
            >
              {m.content}
            </div>

            {/* Render Executed Action Card if present */}
            {m.action && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "rgba(77, 171, 154, 0.1)",
                  border: "1px solid rgba(77, 171, 154, 0.3)",
                  maxWidth: "88%",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--tag-green-text)", fontWeight: 600 }}>
                  <span>✓</span>
                  <span>
                    Action Executed:{" "}
                    {m.action.type === "ADD_DEADLINE" && "Deadline Created"}
                    {m.action.type === "ADD_TODO" && "Task Added"}
                    {m.action.type === "START_STUDY" && "Study Session Started"}
                    {m.action.type === "VISUALIZE" && "Visualizer Launched"}
                  </span>
                </div>

                {m.action.title && (
                  <div style={{ color: "var(--text-main)", fontWeight: 500 }}>
                    "{m.action.title}"
                  </div>
                )}
                {m.action.due && (
                  <div style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
                    Due: {m.action.due}
                  </div>
                )}
                {m.action.concept && (
                  <div style={{ color: "var(--text-main)", fontWeight: 500 }}>
                    Concept: {m.action.concept}
                  </div>
                )}
                {m.action.course_id && (
                  <div style={{ marginTop: "4px" }}>
                    <span className="notion-tag blue" style={{ fontSize: "10px" }}>
                      {m.action.course_id.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "12px", padding: "8px" }}>
            <span style={{ animation: "spin 1s linear infinite" }}>⚙️</span>
            <span>Lumen is reasoning with Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Action Quick Pills */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(255, 255, 255, 0.01)",
          display: "flex",
          gap: "6px",
          overflowX: "auto"
        }}
      >
        <button
          className="notion-btn"
          style={{ fontSize: "11px", whiteSpace: "nowrap", padding: "3px 8px" }}
          onClick={() => handlePresetClick("Add deadline to CMSC 341: Project 3 due Oct 15 at 11:59pm")}
        >
          🗓️ + Deadline
        </button>
        <button
          className="notion-btn"
          style={{ fontSize: "11px", whiteSpace: "nowrap", padding: "3px 8px" }}
          onClick={() => handlePresetClick("Start study session for MATH 221")}
        >
          ⏱️ Study Session
        </button>
        <button
          className="notion-btn"
          style={{ fontSize: "11px", whiteSpace: "nowrap", padding: "3px 8px" }}
          onClick={() => handlePresetClick("Visualize AVL Tree Left-Right Rotation")}
        >
          ⚡ Visualize
        </button>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: "12px 14px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-sidebar)",
          display: "flex",
          gap: "8px"
        }}
      >
        <input
          type="text"
          className="study-prompt-input"
          placeholder="Ask Lumen or command an action..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          style={{ fontSize: "12.5px" }}
        />
        <button
          type="submit"
          className="notion-btn primary"
          disabled={isLoading || !inputText.trim()}
          style={{ fontSize: "12px", padding: "6px 12px" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
