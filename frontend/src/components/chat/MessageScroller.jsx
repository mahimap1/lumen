import React, { useRef, useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessageScroller({ children, className = "" }) {
  const containerRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const checkIfNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom < 120;
  };

  const scrollToBottom = (behavior = "smooth") => {
    bottomAnchorRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceToBottom > 160);
  };

  useEffect(() => {
    if (checkIfNearBottom()) {
      scrollToBottom("smooth");
    }
  }, [children]);

  return (
    <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`w-full h-full overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth ${className}`}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {children}
          <div ref={bottomAnchorRef} className="h-4" />
        </div>
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => scrollToBottom("smooth")}
            className="rounded-full shadow-lg border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-xs text-zinc-300 gap-1.5 px-3 py-1.5 backdrop-blur-sm transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Scroll to bottom</span>
          </Button>
        </div>
      )}
    </div>
  );
}
