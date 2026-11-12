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
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-5 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex w-[780px] max-w-[95vw] flex-col overflow-hidden rounded-lg border border-white/[0.09] bg-[#202020] shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.09] px-[18px] py-3 text-[13px] font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-[#f5a623]">⚡</span>
            <span>Lumen Visualizer: {concept}</span>
            <span className="ml-1 inline-flex items-center rounded-[3px] bg-[color:var(--tag-blue-bg)] px-[7px] py-[2px] text-[11px] font-medium leading-[1.3] text-[color:var(--tag-blue-text)]">
              {courseCode}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent text-base text-[color:var(--text-tertiary)] transition-colors hover:text-[color:var(--text-main)]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {isLoading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-white/[0.09] bg-[color:var(--bg-main)] p-5">
              <div className="mb-3 animate-spin text-[32px]">⚙️</div>
              <div className="text-[13.5px] text-[color:var(--text-main)]">
                Generating visual explanation for {concept}...
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-[280px] flex-col items-center justify-center rounded-md border border-white/[0.09] bg-[color:var(--bg-main)] p-5">
              {htmlContent ? (
                <iframe
                  title={`Visualizer: ${concept}`}
                  srcDoc={htmlContent}
                  sandbox="allow-scripts"
                  className="block h-[320px] w-full border-0"
                />
              ) : (
                <div className="text-[13px] text-[color:var(--text-secondary)]">
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
