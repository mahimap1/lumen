import React, { useEffect, useState } from "react";

const TAG_BASE =
  "inline-flex items-center rounded-[3px] px-[7px] py-[2px] text-[10.5px] font-medium leading-[1.3]";

const TAG_CLASSES = {
  blue: "bg-[color:var(--tag-blue-bg)] text-[color:var(--tag-blue-text)]",
  green: "bg-[color:var(--tag-green-bg)] text-[color:var(--tag-green-text)]",
  orange: "bg-[color:var(--tag-orange-bg)] text-[color:var(--tag-orange-text)]",
  red: "bg-[color:var(--tag-red-bg)] text-[color:var(--tag-red-text)]",
  purple: "bg-[color:var(--tag-purple-bg)] text-[color:var(--tag-purple-text)]",
  gray: "bg-white/[0.08] text-[color:var(--text-secondary)]"
};

/**
 * WidgetSandboxModal
 * Opens a clean, full-screen view of a widget's rendered HTML/CSS/JS.
 * The widget's html content is injected into a sandboxed <iframe> so scripts
 * run in isolation without affecting the parent app.
 */
export default function WidgetSandboxModal({ isOpen, widget, onClose }) {
  const [loadedWidgetKey, setLoadedWidgetKey] = useState(null);
  const htmlContent = widget?.html || widget?.html_code || "";
  const widgetKey = widget?.id || widget?.title || null;
  const isReady = widgetKey !== null && loadedWidgetKey === widgetKey;

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
  const trackTag = TAG_CLASSES[widget.trackTag] || TAG_CLASSES.blue;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-5 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[min(820px,92vh)] w-[min(1100px,96vw)] animate-in flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111113] shadow-[0_32px_80px_rgba(0,0,0,0.7)] fade-in-0 duration-200"
      >
        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.07] bg-white/[0.025] px-[18px] py-3">
          {/* Left: icon + title + tags */}
          <div className="flex min-w-0 items-center gap-[10px]">
            <span className="text-[18px]">⚡</span>
            <div className="min-w-0">
              <div className="max-w-[560px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-[color:var(--text-main)]">
                {widget.title}
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {trackLabel && <span className={`${TAG_BASE} ${trackTag}`}>{trackLabel}</span>}
                {widget.topic && (
                  <span className={`${TAG_BASE} ${TAG_CLASSES.gray}`}>{widget.topic}</span>
                )}
                <span className={`${TAG_BASE} ${TAG_CLASSES.gray}`}>HTML / CSS / JS</span>
              </div>
            </div>
          </div>

          {/* Right: close */}
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-[15px] text-[color:var(--text-secondary)] transition-colors hover:bg-white/[0.12]"
          >
            ✕
          </button>
        </div>

        {/* ── Sandbox iframe ── */}
        <div className="relative flex-1 overflow-hidden">
          {/* Loading shimmer shown until iframe is ready */}
          {!isReady && (
            <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 bg-[#111113]">
              <div className="animate-spin text-[28px]">⚙️</div>
              <div className="text-[13px] text-[color:var(--text-secondary)]">Rendering widget…</div>
            </div>
          )}

          <iframe
            title={widget.title}
            srcDoc={htmlContent}
            onLoad={() => setLoadedWidgetKey(widgetKey)}
            sandbox="allow-scripts"
            className={`block h-full w-full border-0 transition-opacity duration-[250ms] ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-[18px] py-2 text-[11.5px] text-[color:var(--text-tertiary)]">
          <div className="flex items-center gap-1.5">
            <span>🧩</span>
            <span>{widget.desc || "Interactive visualization"}</span>
          </div>
          <span className="text-white/20">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
