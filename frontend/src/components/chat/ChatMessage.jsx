import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Sparkles,
  Maximize2,
  ExternalLink,
  Layers
} from "lucide-react";

export default function ChatMessage({ message, onOpenVisualizer }) {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [expandedQueryIdx, setExpandedQueryIdx] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleQuery = (idx) => {
    setExpandedQueryIdx(expandedQueryIdx === idx ? null : idx);
  };

  return (
    <div
      className={`group flex gap-3.5 sm:gap-4 transition-opacity ${
        isAssistant ? "items-start" : "items-start justify-end"
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 mt-0.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md relative overflow-hidden"
            style={{
              background: "radial-gradient(circle at 35% 30%, #fef08a 0%, #facc15 35%, #eab308 70%, #ca8a04 100%)",
              boxShadow: "0 0 10px rgba(250, 204, 21, 0.35)",
            }}
          >
            <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.2]" />
          </div>
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[82%] ${isAssistant ? "items-start" : "items-end"}`}>
        {/* Role & Name Header */}
        <div className="flex items-center gap-2 mb-1.5 px-0.5 text-xs text-zinc-400 font-medium">
          <span>{isAssistant ? "Lumen" : "You"}</span>
          {isAssistant && message.engine && (
            <span className="text-[10px] text-zinc-500 bg-zinc-800/80 px-1.5 py-0.2 rounded border border-zinc-700/50">
              {message.engine === "backboard" ? "Backboard Thread" : "Gemini AI"}
            </span>
          )}
        </div>

        {/* Message Bubble / Body */}
        <div
          className={`relative rounded-2xl px-4 py-3.5 text-sm leading-relaxed transition-all shadow-sm ${
            isAssistant
              ? "bg-zinc-900/90 text-zinc-100 border border-zinc-800/80"
              : "bg-blue-600 text-white rounded-br-sm"
          }`}
        >
          {/* Formatted Content */}
          <div className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap leading-relaxed">
            {formatContent(message.content)}
          </div>

          {/* Tool Executions (e.g. SQLite queries on campus dataset) */}
          {message.tool_executions && message.tool_executions.length > 0 && (
            <div className="mt-3.5 space-y-2.5 pt-2.5 border-t border-zinc-800/80">
              {message.tool_executions.map((tool, idx) => {
                if (tool.tool === "query_campus_database") {
                  const isExpanded = expandedQueryIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden text-xs"
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleQuery(idx)}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-800/40 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                          <Database className="w-3.5 h-3.5 text-amber-400" />
                          <span>Campus Database Query</span>
                          {tool.row_count !== undefined && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-300 border-amber-500/30 bg-amber-500/10">
                              {tool.row_count} rows
                            </Badge>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>

                      {/* Expanded SQL & Results Table */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-zinc-800/60 bg-zinc-950/90">
                          {tool.rationale && (
                            <p className="text-[11px] text-zinc-400 italic">
                              "{tool.rationale}"
                            </p>
                          )}
                          <div className="rounded-lg bg-zinc-900 p-2 font-mono text-[11px] text-yellow-300/90 overflow-x-auto border border-zinc-800">
                            <code>{tool.query}</code>
                          </div>

                          {tool.rows && tool.rows.length > 0 && (
                            <div className="overflow-x-auto max-h-48 border border-zinc-800/80 rounded-lg">
                              <table className="w-full text-[11px] text-left">
                                <thead className="bg-zinc-800/80 text-zinc-400 sticky top-0">
                                  <tr>
                                    {tool.columns?.map((col) => (
                                      <th key={col} className="px-2 py-1 font-semibold border-b border-zinc-700">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                  {tool.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-zinc-800/30">
                                      {tool.columns?.map((col) => (
                                        <td key={col} className="px-2 py-1 truncate max-w-xs">
                                          {String(row[col] ?? "-")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Interactive Widgets generated by tool call */}
          {message.widgets && message.widgets.length > 0 && (
            <div className="mt-3.5 space-y-3 pt-2.5 border-t border-zinc-800/80">
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Generated Interactive Visuals</span>
              </div>
              {message.widgets.map((widget, wIdx) => (
                <div
                  key={widget.id || wIdx}
                  className="rounded-xl border border-zinc-700/80 bg-zinc-950 p-3 shadow-md space-y-2 hover:border-yellow-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-yellow-400" />
                      {widget.title}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenVisualizer?.(widget.concept || widget.title, "CMSC")}
                      className="h-6 px-2 text-[11px] text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 gap-1 rounded-md"
                    >
                      <span>Launch Visualizer</span>
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {widget.explanation && (
                    <p className="text-[11.5px] text-zinc-400 leading-normal">
                      {widget.explanation}
                    </p>
                  )}
                  {/* Inline preview iframe sandbox */}
                  {widget.html_code && (
                    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/60 h-44 w-full">
                      <iframe
                        srcDoc={widget.html_code}
                        title={widget.title}
                        className="w-full h-full border-none pointer-events-auto"
                        sandbox="allow-scripts"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar (Copy) */}
        {isAssistant && (
          <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-zinc-800 transition-colors"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <Avatar className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 flex-shrink-0 mt-0.5">
          <AvatarFallback className="text-xs font-semibold text-zinc-300 bg-zinc-800">
            ME
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// Minimal text formatting helper for clean Markdown paragraphs and code snippets
function formatContent(text = "") {
  if (!text) return null;
  // If text has markdown code blocks, render cleanly
  return text;
}
