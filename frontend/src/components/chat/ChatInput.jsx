import React, { useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Database, BarChart2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_PROMPTS = [
  {
    icon: <Database className="w-3 h-3 text-amber-400" />,
    label: "CMSC Course Prerequisites",
    query: "What are the core 300-level CMSC courses and their prerequisite chains?",
  },
  {
    icon: <BarChart2 className="w-3 h-3 text-emerald-400" />,
    label: "Alumni Salary Outlook",
    query: "What is the median starting salary for UMBC Computer Science alumni in the Baltimore-DC area?",
  },
  {
    icon: <Sparkles className="w-3 h-3 text-yellow-400" />,
    label: "Interactive RAM Visualizer",
    query: "Explain SRAM vs DRAM cell architecture with an interactive visual widget.",
  },
  {
    icon: <BookOpen className="w-3 h-3 text-blue-400" />,
    label: "AVL Tree Balance Factors",
    query: "How does an AVL Tree maintain balance, and can you build an interactive visualizer for it?",
  },
];

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  showQuickPrompts = false,
  placeholder = "Ask Lumen about courses, alumni career data, or build an interactive widget..."
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2 flex flex-col gap-2.5">
      {/* Quick Prompt Starter Chips */}
      {showQuickPrompts && (
        <div className="flex flex-wrap items-center gap-2 mb-1 justify-center sm:justify-start">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSend(qp.query)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {qp.icon}
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Floating Pill Input Bar */}
      <div className="relative flex items-end w-full rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-xl focus-within:border-yellow-400/60 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all p-1.5 pl-4">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 resize-none outline-none py-2 max-h-[180px] leading-relaxed"
        />

        {/* Send Button */}
        <div className="flex-shrink-0 ml-2 mb-0.5">
          <Button
            size="icon"
            onClick={() => onSend()}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-sm"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </Button>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[11px] text-zinc-500 text-center">
        Lumen AI Copilot • Powered by Backboard.io persistent memory & UMBC campus intelligence dataset
      </p>
    </div>
  );
}
