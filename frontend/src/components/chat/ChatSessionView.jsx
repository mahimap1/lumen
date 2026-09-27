import React, { useState, useEffect } from "react";
import MessageScroller from "./MessageScroller";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { sendSessionMessage } from "@/services/api";
import { LumenOrbSphere } from "../LumenOrb";

export default function ChatSessionView({
  session,
  track,
  tracks = [],
  onOpenVisualizer,
  onAddWidget,
  onUpdateSession
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Strip leading emoji from title if any
  const cleanTitle = (session?.title || "Study Session")
    .replace(/^[\p{Emoji}\u2000-\u3300\s]+/gu, "")
    .trim() || session?.title || "Study Session";

  // Restore session messages (no auto-greeting — start fresh)
  useEffect(() => {
    if (!session) return;
    setMessages(session.messages && session.messages.length > 0 ? session.messages : []);
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

    if (onUpdateSession) {
      onUpdateSession(session.id, { messages: newMessages });
    }

    try {
      const threadId = session.thread_id || session.id;
      const courseContext = track ? `${track.code} ${track.name}` : cleanTitle;

      const replyData = await sendSessionMessage(threadId, textToSend, courseContext);

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: replyData.content || "I have analyzed your query.",
        tool_executions: replyData.tool_executions || [],
        widgets: replyData.widgets || [],
        engine: replyData.engine || "backboard"
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      if (onUpdateSession) {
        onUpdateSession(session.id, {
          messages: finalMessages,
          thread_id: replyData.thread_id || session.thread_id
        });
      }

      // If any widget was generated, sync it to the workspace widgets list
      if (replyData.widgets && replyData.widgets.length > 0 && onAddWidget) {
        replyData.widgets.forEach((w) => {
          onAddWidget({
            id: w.id,
            title: w.title,
            desc: w.explanation || w.concept,
            topic: w.concept,
            html: w.html_code || w.html || "",       // full HTML for sandbox rendering
            html_code: w.html_code || w.html || "",  // alias used by WidgetSandboxModal
            trackId: session.trackId,
            trackCode: track?.code || "CMSC",
            trackTag: track?.tagColor || "blue",
            trackType: track?.type || "course",
            engine: "Interactive HTML/CSS/JS",
            createdAt: Date.now()
          });
        });
      }
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I ran into an error connecting to the server. Please check that the backend is running.",
        tool_executions: [],
        widgets: []
      };
      const finalErrMessages = [...newMessages, errMsg];
      setMessages(finalErrMessages);
      if (onUpdateSession) {
        onUpdateSession(session.id, { messages: finalErrMessages });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const cleared = [
      {
        id: `reinit-${Date.now()}`,
        role: "assistant",
        content: `Conversation cleared. Ready for your questions on **${cleanTitle}**!`,
        tool_executions: [],
        widgets: []
      }
    ];
    setMessages(cleared);
    if (onUpdateSession) {
      onUpdateSession(session.id, { messages: cleared });
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Select a session or start a new Lumen session.
      </div>
    );
  }

  const currentCategory = track?.type === "career"
    ? "career"
    : track?.type === "skill" || track?.type === "credential"
    ? "skills"
    : "classes";

  const handleSelectTrack = (trackId) => {
    if (!onUpdateSession || !session) return;
    const selected = tracks.find((t) => t.id === trackId);
    if (!selected) return;

    const newTitle = `${selected.code} · ${selected.name}`;
    const newGreeting = `Welcome! Topic updated to **${newTitle}**.\n\nAsk me any question about concepts, requirements, or career outcomes for this topic.`;

    const updatedMessages = (messages.length <= 1)
      ? [
          {
            id: `init-${Date.now()}`,
            role: "assistant",
            content: newGreeting,
            engine: "backboard",
            tool_executions: [],
            widgets: []
          }
        ]
      : messages;

    onUpdateSession(session.id, {
      trackId: selected.id,
      title: newTitle,
      messages: updatedMessages
    });

    if (messages.length <= 1) {
      setMessages(updatedMessages);
    }
  };

  const handleSelectCategory = (catKey) => {
    // Pick first track belonging to this category
    const catTrack = tracks.find((t) => {
      if (catKey === "classes") return (t.type || "course") === "course";
      if (catKey === "career") return t.type === "career";
      if (catKey === "skills") return t.type === "skill" || t.type === "credential";
      return false;
    });
    if (catTrack) {
      handleSelectTrack(catTrack.id);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 relative overflow-hidden">
      {/* Centered Top Header Bar with Direct Topic Category Tabs (Classes / Career / Skills) */}
      <header className="flex-none px-4 sm:px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between gap-3 relative z-10">
        {/* Left: Topic Selector Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/90 shadow-inner">
          <span className="text-[11px] font-semibold text-zinc-400 px-2 uppercase tracking-wider hidden md:inline">
            Topic:
          </span>
          {[
            { key: "classes", label: "Classes", icon: "📘" },
            { key: "career", label: "Career", icon: "💼" },
            { key: "skills", label: "Skills", icon: "🛠️" }
          ].map((cat) => {
            const isCatActive = currentCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleSelectCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isCatActive
                    ? "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Current active topic & code badge */}
        <div className="flex items-center gap-2 max-w-[40%] truncate mx-auto">
          <h1 className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight truncate">
            {cleanTitle}
          </h1>
          {track && (
            <Badge
              variant="outline"
              className="text-[10px] sm:text-[11px] py-0.5 px-2 text-yellow-400 border-yellow-400/30 bg-yellow-400/10 font-medium tracking-wide flex-shrink-0"
            >
              {track.code}
            </Badge>
          )}
        </div>

        {/* Right: Reset Action */}
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
            {/* Empty state — fresh session */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-500">
                <p className="text-zinc-300 text-lg font-semibold">What would you like to explore?</p>
                <p className="text-zinc-500 text-sm max-w-xs">
                  Ask me about courses, prerequisites, career outcomes, or anything else on your mind.
                </p>
              </div>
            )}

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
          showQuickPrompts={messages.length <= 2}
          tracks={tracks}
          selectedTrackId={session?.trackId}
          onSelectTrack={handleSelectTrack}
        />
      </div>
    </div>
  );
}
