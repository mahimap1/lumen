import React, { useEffect, useRef, useState } from "react";

/**
 * WidgetSandboxModal
 * Opens a clean, full-screen view of a widget's rendered HTML/CSS/JS.
 * The widget's html content is injected into a sandboxed <iframe> so scripts
 * run in isolation without affecting the parent app.
 */
export default function WidgetSandboxModal({ isOpen, widget, onClose }) {
  const iframeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Inject the widget HTML into the iframe when the modal opens
  useEffect(() => {
    if (!isOpen || !widget) {
      setIsReady(false);
      return;
    }

    setIsReady(false);
    // Small delay so the iframe has time to mount
    const t = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const htmlContent = widget.html || widget.html_code || "";

      // Write directly into the iframe document so scripts execute correctly
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
      setIsReady(true);
    }, 60);

    return () => clearTimeout(t);
  }, [isOpen, widget]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !widget) return null;

  const trackLabel = widget.trackCode || widget.course || "";
  const trackTag = widget.trackTag || "blue";

  return (
    <div
      className="notion-modal-overlay"
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "min(1100px, 96vw)",
          height: "min(820px, 92vh)",
          background: "var(--bg-primary, #111113)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
          animation: "modalFadeIn 0.18s ease"
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.025)",
            flexShrink: 0
          }}
        >
          {/* Left: icon + title + tags */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <span style={{ fontSize: "18px" }}>⚡</span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "var(--text-main, #f4f4f5)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "560px"
                }}
              >
                {widget.title}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                {trackLabel && (
                  <span className={`notion-tag ${trackTag}`} style={{ fontSize: "10.5px" }}>
                    {trackLabel}
                  </span>
                )}
                {widget.topic && (
                  <span className="notion-tag gray" style={{ fontSize: "10.5px" }}>
                    {widget.topic}
                  </span>
                )}
                <span className="notion-tag gray" style={{ fontSize: "10.5px" }}>
                  HTML / CSS / JS
                </span>
              </div>
            </div>
          </div>

          {/* Right: close */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              color: "var(--text-secondary, #a1a1aa)",
              cursor: "pointer",
              fontSize: "15px",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
              flexShrink: 0
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            ✕
          </button>
        </div>

        {/* ── Sandbox iframe ── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Loading shimmer shown until iframe is ready */}
          {!isReady && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                background: "var(--bg-primary, #111113)",
                zIndex: 2
              }}
            >
              <div style={{ fontSize: "28px", animation: "spin 1.2s linear infinite" }}>⚙️</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary, #a1a1aa)" }}>
                Rendering widget…
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            title={widget.title}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              opacity: isReady ? 1 : 0,
              transition: "opacity 0.25s"
            }}
          />
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.015)",
            flexShrink: 0,
            fontSize: "11.5px",
            color: "var(--text-tertiary, #71717a)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🧩</span>
            <span>{widget.desc || "Interactive visualization"}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
