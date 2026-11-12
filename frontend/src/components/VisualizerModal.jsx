import React, { useState, useEffect } from "react";
import { generateHtmlWidget } from "../services/api";

export default function VisualizerModal({
  isOpen,
  onClose,
  concept = "AVL Tree Left-Right Double Rotation",
  courseCode = "CMSC 341"
}) {
  const [htmlContent, setHtmlContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (isOpen && concept) {
      setIsLoading(true);
      generateHtmlWidget(concept, courseCode).then((html) => {
        if (cancelled) return;
        setHtmlContent(html);
        setIsLoading(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, concept, courseCode]);

  if (!isOpen) return null;

  return (
    <div className="notion-modal-overlay" onClick={onClose}>
      <div className="notion-modal-card" style={{ width: "780px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notion-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#F5A623" }}>⚡</span>
            <span>Lumen Visualizer: {concept}</span>
            <span className="notion-tag blue" style={{ fontSize: "11px", marginLeft: "4px" }}>
              {courseCode}
            </span>
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
          {isLoading ? (
            <div className="modal-stage-frame">
              <div style={{ fontSize: "32px", marginBottom: "12px", animation: "spin 1.5s linear infinite" }}>
                ⚙️
              </div>
              <div style={{ fontSize: "13.5px", color: "var(--text-main)" }}>
                Generating visual explanation for {concept}...
              </div>
            </div>
          ) : (
            <div className="modal-stage-frame" style={{ minHeight: "280px", position: "relative" }}>
              {htmlContent ? (
                <div
                  style={{ width: "100%", height: "100%" }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  No visualization available for {concept}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
