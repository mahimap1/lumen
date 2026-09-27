import React, { useState, useEffect } from "react";
import MessageScroller from "./MessageScroller";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Database, Code2, RotateCcw } from "lucide-react";
import { sendSessionMessage } from "@/services/api";

export default function ChatSessionView({
  session,
  track,
  onOpenVisualizer,
  onAddWidget
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize or restore session messages
  useEffect(() => {
    if (!session) return;
    if (session.messages && session.messages.length > 0) {
      setMessages(session.messages);
    } else {
      // Clean welcoming prompt tailored to this session / track
      const initialGreeting = session.description
        ? `Welcome to your study session on **${session.title}**!\n\nI have access to the UMBC campus dataset and can query course requirements, analyze alumni salaries, or generate interactive widgets for you. How can I help you today?`
        : `Hello! I'm Lumen, your academic copilot for **${session.title || "this study session"}**.\n\nAsk me any question about course concepts, prerequisites, or alumni career outcomes.`;

      setMessages([
        {
          id: `init-${session.id}`,
          role: "assistant",
          content: initialGreeting,
          engine: "backboard",
          tool_executions: [],
          widgets: []
        }
      ]);
    }
  }, [session?.id]);

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `u-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      role: "user",
      content: textToSend
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const threadId = session.thread_id || session.id;
      const courseContext = track ? `${track.code} ${track.name}` : session.title;

      const replyData = await sendSessionMessage(threadId, textToSend, courseContext);

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: replyData.content || "I have analyzed your query.",
        tool_executions: replyData.tool_executions || [],
        widgets: replyData.widgets || [],
        engine: replyData.engine || "backboard"
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If any widget was generated, sync it to the workspace widgets list
      if (replyData.widgets && replyData.widgets.length > 0 && onAddWidget) {
        replyData.widgets.forEach((w) => {
          onAddWidget({
            id: w.id,
            title: w.title,
            desc: w.explanation || w.concept,
            trackId: session.trackId,
            trackCode: track?.code || "CMSC",
            trackTag: track?.tagColor || "blue",
            engine: "Interactive HTML"
          });
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into an error connecting to the server. Please check that the backend is running.",
          tool_executions: [],
          widgets: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reinit-${Date.now()}`,
        role: "assistant",
        content: `Conversation cleared. Ready for your questions on **${session?.title || "your studies"}**!`,
        tool_executions: [],
        widgets: []
      }
    ]);
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Select a session or click the yellow orb in the bottom right to start a new Lumen session.
      </div>
    );
  }

  const showStarterPrompts = messages.length <= 1;

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 relative overflow-hidden">
      {/* Session Top Header Bar */}
      <header className="flex-none px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl">{session.icon || "⚡"}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
                {session.title}
              </h1>
              {track && (
                <Badge variant="outline" className="text-[11px] py-0 px-1.5 text-blue-400 border-blue-500/30 bg-blue-500/10">
                  {track.code}
                </Badge>
              )}
            </div>
            <p className="text-[11.5px] text-zinc-400 truncate max-w-md">
              {session.description || "Active conversational study thread with Backboard persistent memory"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearHistory}
            className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 gap-1.5 h-7 px-2.5 rounded-lg"
            title="Reset conversation thread"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      {/* Main Conversation Scroller */}
      <MessageScroller className="flex-1">
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            onOpenVisualizer={onOpenVisualizer}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0"
              style={{
                background: "radial-gradient(circle at 35% 30%, #fef08a 0%, #facc15 35%, #eab308 70%, #ca8a04 100%)",
              }}
            >
              <Sparkles className="w-4 h-4 text-zinc-950 stroke-[2.2] animate-spin" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2 shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span>Lumen is consulting campus data & reasoning...</span>
            </div>
          </div>
        )}
      </MessageScroller>

      {/* Fixed Bottom Input Bar (ChatGPT / Gemini dock) */}
      <div className="flex-none bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-3">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          showQuickPrompts={showStarterPrompts}
        />
      </div>
    </div>
  );
}
