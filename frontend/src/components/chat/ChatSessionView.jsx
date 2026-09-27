import React, { useState, useEffect } from "react";
import MessageScroller from "./MessageScroller";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { sendSessionMessage, streamSessionMessage } from "@/services/api";
import { LumenOrbSphere } from "../LumenOrb";

export default function ChatSessionView({
  session,
  track,
  onOpenVisualizer,
  onAddWidget
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Strip leading emoji from title if any
  const cleanTitle = (session?.title || "Study Session")
    .replace(/^[\p{Emoji}\u2000-\u3300\s]+/gu, "")
    .trim() || session?.title || "Study Session";

  // Initialize or restore session messages
  useEffect(() => {
    if (!session) return;
    if (session.messages && session.messages.length > 0) {
      setMessages(session.messages);
    } else {
      // Clean welcoming prompt tailored to this session / track
      const initialGreeting = session.description
        ? `Welcome to your study session on **${cleanTitle}**!\n\nI have access to the UMBC campus dataset and can query course requirements, analyze alumni salaries, or generate interactive widgets for you. How can I help you today?`
        : `Hello! I'm Lumen, your academic copilot for **${cleanTitle}**.\n\nAsk me any question about course concepts, prerequisites, or alumni career outcomes.`;

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

    const assistantMessageId = `a-${Date.now()}`;
    const initialAssistantMsg = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      toolStatus: null,
      tool_executions: [],
      widgets: [],
      engine: "backboard"
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const threadId = session.thread_id || session.id;
      const courseContext = track ? `${track.code} ${track.name}` : cleanTitle;

      await streamSessionMessage({
        threadId,
        message: textToSend,
        courseContext,
        onMeta: ({ thread_id, engine }) => {
          if (thread_id) {
            session.thread_id = thread_id;
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId ? { ...m, engine: engine || "backboard" } : m
            )
          );
        },
        onToolStart: ({ status }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId ? { ...m, toolStatus: status } : m
            )
          );
        },
        onToolResult: ({ execution }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    toolStatus: null,
                    tool_executions: [...(m.tool_executions || []), execution]
                  }
                : m
            )
          );
        },
        onWidget: (widget) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    toolStatus: null,
                    widgets: [...(m.widgets || []), widget]
                  }
                : m
            )
          );
          if (onAddWidget) {
            onAddWidget({
              id: widget.id,
              title: widget.title,
              desc: widget.explanation || widget.concept,
              trackId: session.trackId,
              trackCode: track?.code || "CMSC",
              trackTag: track?.tagColor || "blue",
              engine: "Interactive HTML"
            });
          }
        },
        onDelta: (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    toolStatus: null,
                    content: (m.content || "") + delta
                  }
                : m
            )
          );
        },
        onDone: (doneEvt) => {
          if (doneEvt.thread_id) {
            session.thread_id = doneEvt.thread_id;
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    toolStatus: null,
                    content: doneEvt.content || m.content,
                    tool_executions: doneEvt.tool_executions || m.tool_executions,
                    widgets: doneEvt.widgets || m.widgets
                  }
                : m
            )
          );
        },
        onError: (err) => {
          console.error("Stream handling error:", err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    toolStatus: null,
                    content:
                      m.content ||
                      "Sorry, I ran into an error connecting to the server. Please check that the backend is running."
                  }
                : m
            )
          );
        }
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                isStreaming: false,
                toolStatus: null,
                content:
                  m.content ||
                  "Sorry, I ran into an error connecting to the server. Please check that the backend is running."
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reinit-${Date.now()}`,
        role: "assistant",
        content: `Conversation cleared. Ready for your questions on **${cleanTitle}**!`,
        tool_executions: [],
        widgets: []
      }
    ]);
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Select a session or start a new Lumen session.
      </div>
    );
  }

  const showStarterPrompts = messages.length <= 1;

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 relative overflow-hidden">
      {/* Centered Top Header Bar (No emojis, no subtitle, centered title & tag) */}
      <header className="flex-none px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="w-16" /> {/* Balance spacer */}

        <div className="flex items-center gap-2.5 mx-auto">
          <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
            {cleanTitle}
          </h1>
          {track && (
            <Badge
              variant="outline"
              className="text-[11px] py-0.5 px-2 text-blue-400 border-blue-500/30 bg-blue-500/10 font-medium tracking-wide"
            >
              {track.code}
            </Badge>
          )}
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

      {/* Main Conversation Scroller with glowing Lumen Orb anchored to the left */}
      <MessageScroller className="flex-1">
        <div className="flex gap-4 sm:gap-6 items-start w-full">
          {/* Glowing 3D Lumen Orb on the left of the messages */}
          <div className="sticky top-2 pt-1 flex-shrink-0 hidden sm:block animate-in fade-in duration-500">
            <LumenOrbSphere size={44} />
          </div>

          {/* Messages Column */}
          <div className="flex-1 min-w-0 space-y-6">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                onOpenVisualizer={onOpenVisualizer}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3 py-2 px-1 animate-in fade-in">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                <span className="text-zinc-400 text-xs font-medium">
                  Lumen is querying campus data & reasoning...
                </span>
              </div>
            )}
          </div>
        </div>
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
